"use server"

import { imageSizes } from "@/app/consts"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { join } from "path"
import sharp from "sharp"

export type ImageEditData = {
  position: { x: number; y: number }
  scale: number
  rotation: number
  flippedY: boolean
  flippedX: boolean
}

export type SaveImageEditData = ImageEditData & { frameSize: keyof typeof imageSizes }

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

    return { data: images ?? [] }
  } catch (error) {
    console.error("Error fetching images:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to fetch images",
    }
  }
}

/**
 * Saves a transformed version of an image based on user edits.
 * Creates/updates an export file (<id>-export.png) compositing the transformed
 * original onto a white background matching the target image dimensions.
 * Updates the Image record with edit data and new metadata.
 */
export async function saveTransformedImage(imageId: number, projectSlug: string, transformData: SaveImageEditData) {
  try {
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: { project: true }, // Include project to get slug if needed, though passed
    })

    if (!image) {
      return { error: "Image not found" }
    }
    if (image.project.slug !== projectSlug) {
      return { error: "Project slug mismatch." }
    }

    const publicDataDir = join(process.cwd(), "public", "data", projectSlug)
    const originalImagePath = join(publicDataDir, `${image.id}-original.${image.extension}`) // Use original extension here
    const exportImagePath = join(publicDataDir, `${image.id}-export.png`) // Export is always PNG

    // 1. Load the original image
    const originalSharp = sharp(originalImagePath)
    const originalMeta = await originalSharp.metadata()
    if (!originalMeta.width || !originalMeta.height) {
      return { error: "Could not read original image metadata." }
    }

    // 2. Create the transformed overlay buffer (resize, then rotate)
    const scaledWidth = Math.round(originalMeta.width * transformData.scale)
    const scaledHeight = Math.round(originalMeta.height * transformData.scale)

    const resizedOverlayBuffer = await originalSharp.resize(scaledWidth, scaledHeight).toBuffer()
    const rotatedOverlay = sharp(resizedOverlayBuffer).rotate(transformData.rotation, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      // No center option in sharp, always rotates around center
    })
    const transformedOverlayBuffer = await rotatedOverlay.toBuffer()
    const overlayMeta = await rotatedOverlay.metadata()
    if (!overlayMeta.width || !overlayMeta.height) {
      return { error: "Could not read transformed overlay metadata." }
    }

    // Calculate the offset of the original top-left after rotation
    const rad = (transformData.rotation * Math.PI) / 180
    const sin = Math.sin(rad)
    const cos = Math.cos(rad)
    // The four corners of the original image after rotation
    const corners = [
      { x: 0, y: 0 },
      { x: scaledWidth, y: 0 },
      { x: scaledWidth, y: scaledHeight },
      { x: 0, y: scaledHeight },
    ].map(({ x, y }) => ({
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    }))
    // Find the min x and y (top-left of the rotated bounding box)
    const minX = Math.min(...corners.map((c) => c.x))
    const minY = Math.min(...corners.map((c) => c.y))
    // The offset of the original top-left in the rotated image
    const offsetX = -minX
    const offsetY = -minY

    // 3. Create the white background canvas matching target dimensions
    const backgroundSharp = sharp({
      create: {
        width: image.width, // Target width from DB
        height: image.height, // Target height from DB
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
      },
    })

    // 4. Calculate the compositing position (top-left corner)
    // Adjust so the original top-left is at the desired position
    const compositeLeft = Math.round(transformData.position.x - offsetX)
    const compositeTop = Math.round(transformData.position.y - offsetY)

    // Debug: Log overlay buffer size and composite position
    console.log("Overlay buffer size:", overlayMeta.width, overlayMeta.height)
    console.log("Composite position:", { left: compositeLeft, top: compositeTop })

    // 5. Composite the overlay onto the background
    const exportSharp = backgroundSharp
      .composite([
        {
          input: transformedOverlayBuffer,
          top: compositeTop,
          left: compositeLeft,
        },
      ])
      .png() // Ensure output is PNG

    // 6. Save the final exported image
    const exportInfo = await exportSharp.toFile(exportImagePath)

    // 7. Update the image record in the database
    await prisma.image.update({
      where: { id: image.id },
      data: {
        editData: transformData,
        width: image.width,
        height: image.height,
        fileSize: exportInfo.size,
        aspectRatio: image.width / image.height,
        updatedAt: new Date(),
      },
    })

    revalidatePath(`/projects/${projectSlug}`)
    console.log(`Image ${imageId} saved successfully to ${exportImagePath}`)

    return { success: true }
  } catch (error) {
    console.error(`Error saving transformed image ${imageId}:`, error)
    return {
      error: error instanceof Error ? error.message : "Failed to save transformed image",
    }
  }
}
