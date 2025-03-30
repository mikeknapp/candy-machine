"use server"

import { standarizeImage } from "@/lib/image"
import { prisma } from "@/lib/prisma"
import { join } from "path"
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
      console.log(image.originalAspectRatio, imageSize.aspectRatio)

      if (image.originalAspectRatio == 0.8136752136752137) {
        console.log(image)
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
