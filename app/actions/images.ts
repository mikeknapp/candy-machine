"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { join } from "path"
import sharp from "sharp"

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
export async function saveTransformedImage(
  imageId: number,
  projectSlug: string,
  // Note: This 'scale' is the visual scale factor from the editor state.
  transformData: {
    position: { x: number; y: number }
    scale: number
    rotation: number
  }
) {
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

    // 2. Create the transformed overlay buffer (rotate, then scale)
    // We scale relative to the original dimensions using the transformData.scale
    const scaledWidth = Math.round(originalMeta.width * transformData.scale)
    const scaledHeight = Math.round(originalMeta.height * transformData.scale)

    const transformedOverlayBuffer = await originalSharp
      .rotate(transformData.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } }) // Use transparent background for rotation
      .resize(scaledWidth, scaledHeight)
      .toBuffer()

    // Get metadata of the actual rotated and scaled overlay
    const overlayMeta = await sharp(transformedOverlayBuffer).metadata()
    if (!overlayMeta.width || !overlayMeta.height) {
      return { error: "Could not read transformed overlay metadata." }
    }

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
    // Position data is the offset of the overlay's center from the background's center
    const compositeLeft = Math.round(image.width / 2 + transformData.position.x - overlayMeta.width / 2)
    const compositeTop = Math.round(image.height / 2 + transformData.position.y - overlayMeta.height / 2)

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
