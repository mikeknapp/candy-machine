import { ImageSize, imageSizes } from "@/app/consts"
import { Image } from "@prisma/client"
import fs from "fs"
import path from "path"
import sharp from "sharp"

export type ImageModification = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  flippedY: boolean
  flippedX: boolean
}

export type ModifiedImage = {
  image: Image
  frame: ImageSize
  modification: ImageModification
  outputPath: string
  newSize: number
}

// Weights for scoring frame fit. Adjust to tune prioritization.
const SCORE_WEIGHT_COVERAGE_FIT = 15.0 // Prefer maximizing frame coverage when no downscaling is needed
const SCORE_WEIGHT_ASPECT_FIT = 1.0 // Minor preference for aspect ratio match in fit scenarios

const SCORE_WEIGHT_ASPECT_SCALED = 5.0 // When downscaling, prioritize aspect ratio to minimize distortion
const SCORE_WEIGHT_COVERAGE_SCALED = 2.0 // Still consider coverage when downscaling

const ASPECT_DIFF_MULTIPLIER = 10.0 // Penalize aspect ratio differences more strongly

/**
 * Selects the optimal predefined frame size for an image, balancing coverage and aspect ratio.
 *
 * - Never upscales images beyond their original size.
 * - If the image fits without downscaling, coverage is prioritized.
 * - If downscaling is required, aspect ratio match is prioritized to reduce distortion.
 *
 * @param image - Prisma Image object with original dimensions and aspect ratio.
 * @returns The best matching ImageSize from `imageSizes`.
 */
export function getBestImageSize(image: Image): ImageSize {
  const framesWithScores = Object.values(imageSizes).map((frame) => {
    // --- Fit Calculation (Respecting No Upscaling) ---
    const scaleToFitWidth = frame.width / image.originalWidth
    const scaleToFitHeight = frame.height / image.originalHeight
    // Use the smaller scale factor to ensure the image fits, max scale is 1.0
    const finalScale = Math.min(scaleToFitWidth, scaleToFitHeight, 1.0)

    const renderedWidth = image.originalWidth * finalScale
    const renderedHeight = image.originalHeight * finalScale
    const needsDownscaling = finalScale < 1.0 // Check if scaling down was needed

    // --- Metric Calculation ---
    const renderedArea = renderedWidth * renderedHeight
    const frameArea = frame.width * frame.height
    const coverage = frameArea > 0 ? renderedArea / frameArea : 0
    const aspectRatioDiff = Math.abs(frame.aspectRatio - image.originalAspectRatio)

    // --- Scoring ---
    let score = 0
    const aspectRatioTerm = 1.0 / (1.0 + aspectRatioDiff * ASPECT_DIFF_MULTIPLIER)

    if (needsDownscaling) {
      // Frame is smaller than image: Prioritize aspect ratio, then coverage
      score = aspectRatioTerm * SCORE_WEIGHT_ASPECT_SCALED + coverage * SCORE_WEIGHT_COVERAGE_SCALED
    } else {
      // Image fits entirely: Prioritize coverage, aspect ratio is minor
      score = coverage * SCORE_WEIGHT_COVERAGE_FIT + aspectRatioTerm * SCORE_WEIGHT_ASPECT_FIT
    }

    return {
      frame,
      score,
      // Optional debug info:
      needsDownscaling,
      coverage,
      aspectRatioDiff,
      finalScale,
    }
  })

  // Sort by score descending; highest score wins
  framesWithScores.sort((a, b) => b.score - a.score)

  if (framesWithScores.length === 0) {
    console.error("No frames were scored. Returning default or first frame.")
    return Object.values(imageSizes)[0] || { width: 1024, height: 1024, aspectRatio: 1, name: "fallback-square" }
  }

  // Uncomment for debug: log top scoring frames
  // console.log(framesWithScores.slice(0, 3))

  return framesWithScores[0].frame
}

/**
 * Suggests how to position and size an image within its best-fit frame.
 *
 * - Never scales up beyond original dimensions.
 * - Centers horizontally; aligns to bottom vertically.
 *
 * @param image - Prisma Image object.
 * @param imagePath - Filesystem path to the image.
 * @param getMetadata - Optional: function to retrieve image metadata (for testing/mocking).
 * @returns ImageModification describing placement and size within the frame.
 */
export async function suggestImageModification(
  image: Image,
  imagePath: string,
  getMetadata = async () => {
    const metadata = await sharp(imagePath).metadata()
    if (!metadata.width || !metadata.height) {
      throw new Error("Could not determine image dimensions")
    }
    return { width: metadata.width, height: metadata.height }
  }
): Promise<ImageModification> {
  const frame = getBestImageSize(image)
  const targetWidth = frame.width
  const targetHeight = frame.height

  const { width: originalWidth, height: originalHeight } = await getMetadata()

  const originalAspectRatio = originalWidth / originalHeight
  let newHeight = originalHeight
  let newWidth = originalWidth

  // Never scale images up beyond their original dimensions
  if (originalWidth >= originalHeight) {
    newHeight = Math.min(originalHeight, targetHeight)
    newWidth = newHeight * originalAspectRatio
  } else {
    newWidth = Math.min(originalWidth, targetWidth)
    newHeight = newWidth / originalAspectRatio
  }

  // Center horizontally, align to bottom vertically
  const x = Math.floor((targetWidth - newWidth) / 2)
  const y = targetHeight - newHeight

  return {
    x,
    y,
    width: newWidth,
    height: newHeight,
    rotation: 0,
    flippedY: false,
    flippedX: false,
  }
}

/**
 * Exports a modified image, compositing it into a new frame with a white background.
 *
 * - Resizes and positions the image according to suggested modifications.
 * - Outputs a PNG file in the same directory as the original image.
 *
 * @param image - Prisma Image object.
 * @param imagePath - Filesystem path to the image.
 * @returns ModifiedImage with details about the export.
 */
export async function exportModifiedImage(image: Image, imagePath: string): Promise<ModifiedImage> {
  // Get the suggested modifications for the image
  const modification = await suggestImageModification(image, imagePath)

  // Get the best image size for the frame
  const frame = getBestImageSize(image)

  // Create the output path using the existing directory
  const existingDir = path.dirname(imagePath)
  const outputPath = path.join(existingDir, `${image.id}-export.png`)
  const outputDir = path.dirname(outputPath)

  // Ensure the output directory exists
  await fs.promises.mkdir(outputDir, { recursive: true })

  // Process the input image according to the modifications
  const resizedImage = await sharp(imagePath).resize(modification.width, modification.height).toBuffer()

  // Create a new image with a white background of the target dimensions
  await sharp({
    create: {
      width: frame.width,
      height: frame.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: resizedImage,
        left: modification.x,
        top: modification.y,
      },
    ])
    .rotate(modification.rotation)
    .png()
    .toFile(outputPath)

  return {
    image,
    frame,
    modification,
    outputPath,
    newSize: resizedImage.length,
  }
}
