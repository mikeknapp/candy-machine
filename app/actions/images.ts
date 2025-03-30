"use server"

import { standarizeImage } from "@/lib/image"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { join } from "path"
import sharp from "sharp"
import { imageSizes } from "../consts"

export async function getProjectImages(projectId: number) {
  try {
    const images = await prisma.image.findMany({
      where: {
        projectId,
        status: {
          not: {
            in: ["DELETED_DUPLICATE", "DELETED_OTHER"],
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // See what we should crop everything to.
    for (const image of images) {
      // Find the closest image size
      const imageSize = Object.values(imageSizes).reduce((prev, curr) => {
        return Math.abs(curr.aspectRatio - image.originalAspectRatio) <
          Math.abs(prev.aspectRatio - image.originalAspectRatio)
          ? curr
          : prev
      })

      // Crop the image to the closest image size
      //console.log(image.originalAspectRatio, imageSize.aspectRatio)

      if (image.originalAspectRatio == 0.8136752136752137) {
        //console.log(image)
        await standarizeImage(
          image,
          join(process.cwd(), "public", "data", "hello", `${image.id}-original.${image.extension}`)
        )
      }
    }

    return { data: images ?? [] }
  } catch (error) {
    console.error("Error fetching images:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to fetch images",
    }
  }
}

// TODO: Revisit.
export async function saveTransformedImage(
  imageId: number,
  projectSlug: string,
  transformData: {
    position: { x: number; y: number }
    scale: number
    rotation: number
  }
) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      return { error: "Image not found" }
    }

    // Get the image's path
    const originalImagePath = join(
      process.cwd(),
      "public",
      "data",
      projectSlug,
      `${image.id}-original.${image.extension}`
    )

    // Load the image with sharp
    let imageProcessor = sharp(originalImagePath)

    // Apply rotation
    if (transformData.rotation !== 0) {
      imageProcessor = imageProcessor.rotate(transformData.rotation)
    }

    // Get image dimensions after rotation
    const metadata = await imageProcessor.metadata()
    if (!metadata.width || !metadata.height) {
      return { error: "Failed to get image dimensions" }
    }

    // Note: transformData.scale already includes the frame scale factor from the UI
    // so we can use it directly to calculate the crop dimensions

    // Calculate the crop area based on position and scale
    const cropWidth = image.width / transformData.scale
    const cropHeight = image.height / transformData.scale

    // Calculate the crop position
    // We need to convert the position from the UI coordinate system to the image coordinate system
    const centerX = metadata.width / 2
    const centerY = metadata.height / 2

    // Position is relative to the center of the frame
    const left = centerX - cropWidth / 2 - transformData.position.x / transformData.scale
    const top = centerY - cropHeight / 2 - transformData.position.y / transformData.scale

    // Apply the crop
    try {
      imageProcessor = imageProcessor.extract({
        left: Math.max(0, Math.round(left)),
        top: Math.max(0, Math.round(top)),
        width: Math.min(metadata.width, Math.round(cropWidth)),
        height: Math.min(metadata.height, Math.round(cropHeight)),
      })
    } catch (error) {
      console.error("Extraction error:", error)
      return { error: "Failed to extract region from image. Crop parameters may be invalid." }
    }

    // Resize to the target dimensions
    imageProcessor = imageProcessor.resize(image.width, image.height, {
      fit: "fill",
    })

    // Save the transformed image
    const transformedImagePath = join(process.cwd(), "public", "data", projectSlug, `${image.id}.${image.extension}`)

    await imageProcessor.toFile(transformedImagePath)

    // Update the image in the database with the transformation data
    await prisma.image.update({
      where: { id: image.id },
      data: {
        cropData: transformData,
        rotation: Math.round(transformData.rotation),
      },
    })

    revalidatePath(`/projects/${projectSlug}`)

    return { success: true }
  } catch (error) {
    console.error("Error saving transformed image:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to save transformed image",
    }
  }
}
