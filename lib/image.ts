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

export function getBestImageSize(image: Image) {
  const bestImageSize = Object.values(imageSizes).reduce((prev, curr) => {
    return Math.abs(curr.aspectRatio - image.originalAspectRatio) <
      Math.abs(prev.aspectRatio - image.originalAspectRatio)
      ? curr
      : prev
  })
  return bestImageSize
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

  // Calculate scaling factors for width and height
  const widthScale = targetWidth / originalWidth
  const heightScale = targetHeight / originalHeight

  // Use the smaller scaling factor to ensure the image fits entirely within the frame
  // without exceeding its original dimensions
  const scale = Math.min(widthScale, heightScale, 1) // Never scale up beyond original size

  // Calculate new dimensions
  const newWidth = Math.round(originalWidth * scale)
  const newHeight = Math.round(originalHeight * scale)

  // Calculate position
  // Center horizontally if there's space
  const x = Math.floor((targetWidth - newWidth) / 2)

  // Align to bottom of frame if it doesn't fit exactly
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
