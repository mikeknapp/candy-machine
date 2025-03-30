import { imageSizes } from "@/app/consts"
import { Image } from "@prisma/client"
import sharp from "sharp"

export function getBestImageSize(image: Image) {
  const bestImageSize = Object.values(imageSizes).reduce((prev, curr) => {
    return Math.abs(curr.aspectRatio - image.originalAspectRatio) <
      Math.abs(prev.aspectRatio - image.originalAspectRatio)
      ? curr
      : prev
  })
  return bestImageSize
}

export async function standarizeImage(image: Image, imagePath: string) {
  const bestImageSize = getBestImageSize(image)

  const imageData = sharp(imagePath)

  // Calculate target dimensions while maintaining aspect ratio
  const targetWidth = bestImageSize.width
  const targetHeight = bestImageSize.height

  // Resize the image to cover the target dimensions (may overflow)
  const finalImageData = await imageData
    .resize(targetWidth, targetHeight, {
      fit: "cover", // This ensures the image fills the space without black bars
      position: "center", // Center the crop
    })
    .toBuffer()

  // Save the final image to "/sample.png"
  //await sharp(finalImageData).toFile("sample.png")

  return finalImageData
}
