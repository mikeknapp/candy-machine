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
}

export type ModifiedImage = {
  image: Image
  frame: ImageSize
  modification: ImageModification
  outputPath: string
  newSize: number
}

// When image fits without scaling down:
const SCORE_WEIGHT_COVERAGE_FIT = 15.0 // Strongly prefer filling space
const SCORE_WEIGHT_ASPECT_FIT = 1.0 // Lesser weight for aspect ratio match

// When image must be scaled down (frame is smaller):
const SCORE_WEIGHT_ASPECT_SCALED = 5.0 // Prioritize aspect ratio to minimize distortion
const SCORE_WEIGHT_COVERAGE_SCALED = 2.0 // Still consider coverage

const ASPECT_DIFF_MULTIPLIER = 10.0 // How much to penalize aspect ratio differences

/**
 * Selects the most suitable predefined frame size for an image, prioritizing coverage
 * when the image fits without scaling, and aspect ratio when scaling down is required.
 *
 * Ensures the image is never scaled up beyond its original dimensions to prevent pixelation.
 *
 * @param {Image} image - The image object with original dimensions and aspect ratio.
 * @returns {ImageSize} The best matching ImageSize object from the predefined `imageSizes`.
 *
 * @remarks
 * Simplified Logic:
 * 1.  **No Upscaling:** Calculates the necessary scale factor to fit the image within
 *     each frame, capped at a maximum of 1.0 (no enlargement).
 * 2.  **Metrics:** For each frame, calculates:
 *     - `coverage`: How much of the frame's area the final rendered image occupies.
 *     - `aspectRatioDiff`: How different the frame's aspect ratio is.
 *     - `needsDownscaling`: Whether the image had to be scaled down (scale factor < 1.0)
 *                            because the frame is smaller than the image dimensions.
 * 3.  **Scoring:**
 *     - **If the image fits without downscaling (`needsDownscaling` is false):**
 *       The score strongly prioritizes `coverage` (minimizing void space). Aspect ratio
 *       match has a minor influence, mainly as a tie-breaker.
 *       `score = coverage * SCORE_WEIGHT_COVERAGE_FIT + (1 / (1 + aspectRatioDiff * ASPECT_DIFF_MULTIPLIER)) * SCORE_WEIGHT_ASPECT_FIT`
 *     - **If the image requires downscaling (`needsDownscaling` is true):**
 *       The score prioritizes a close `aspectRatioDiff` (minimizing distortion/uneven cropping)
 *       while still considering `coverage`.
 *       `score = (1 / (1 + aspectRatioDiff * ASPECT_DIFF_MULTIPLIER)) * SCORE_WEIGHT_ASPECT_SCALED + coverage * SCORE_WEIGHT_COVERAGE_SCALED`
 * 4.  **Selection:** Returns the frame with the highest calculated score.
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

  // Sort by score descending
  framesWithScores.sort((a, b) => b.score - a.score)

  if (framesWithScores.length === 0) {
    console.error("No frames were scored. Returning default or first frame.")
    return Object.values(imageSizes)[0] || { width: 1024, height: 1024, aspectRatio: 1, name: "fallback-square" }
  }

  // Log the winner and maybe top contenders for debugging:
  // console.log(
  //   "Top scoring frames:",
  //   framesWithScores.slice(0, 3).map((f) => ({
  //     name: f.frame.name,
  //     score: f.score,
  //     needsDownscaling: f.needsDownscaling,
  //     coverage: f.coverage,
  //     arDiff: f.aspectRatioDiff,
  //   }))
  // )

  return framesWithScores[0].frame
}

export async function suggestImageModification(
  image: Image,
  imagePath: string,
  // Allow for dependency injection for testing
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

  console.log(originalWidth, originalHeight, image.aspectRatio, targetWidth, targetHeight)

  // Never scale images up beyond their original dimensions
  if (originalWidth >= originalHeight) {
    newHeight = Math.min(originalHeight, targetHeight)
    newWidth = newHeight * originalAspectRatio
  } else {
    newWidth = Math.min(originalWidth, targetWidth)
    newHeight = newWidth / originalAspectRatio
  }

  // Position image in the frame
  const x = Math.floor((targetWidth - newWidth) / 2)
  const y = targetHeight - newHeight

  return {
    x,
    y,
    width: newWidth,
    height: newHeight,
    rotation: 0,
  }
}

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
