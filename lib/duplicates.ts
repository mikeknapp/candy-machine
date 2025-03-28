import { DuplicateStatus, Image, ImageStatus, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Finds potential duplicate images within the same project and records them in the duplicate tracking tables.
 * @param image The image to check for duplicates
 * @returns The created DuplicateGroup if duplicates were found, null otherwise
 */
export async function findAndRecordDuplicates(image: Image, hash: string) {
  if (hash === "") {
    return null
  }

  // Find all images in the same project with the same hash, excluding the current image
  const potentialDuplicates = await prisma.image.findMany({
    where: {
      projectId: image.projectId,
      hash,
      id: {
        not: image.id,
      },
      // Only consider images that haven't been deleted
      status: {
        notIn: [ImageStatus.DELETED_DUPLICATE, ImageStatus.DELETED_OTHER],
      },
    },
  })

  // If no duplicates found, return null
  if (potentialDuplicates.length === 0) {
    return null
  }

  // Check if any of these images are already part of a pending duplicate group
  const existingDuplicateGroup = await prisma.duplicateImage.findFirst({
    where: {
      imageId: {
        in: [...potentialDuplicates.map((d: Image) => d.id), image.id],
      },
      duplicateGroup: {
        status: DuplicateStatus.PENDING_REVIEW,
      },
    },
    include: {
      duplicateGroup: true,
    },
  })

  // If there's already a pending duplicate group, add any new images to it
  if (existingDuplicateGroup) {
    const existingGroupImages = await prisma.duplicateImage.findMany({
      where: {
        duplicateGroupId: existingDuplicateGroup.duplicateGroup.id,
      },
    })

    const existingImageIds = new Set(existingGroupImages.map((d) => d.imageId))
    const allImages = [image, ...potentialDuplicates]

    // Add any images that aren't already in the group
    for (const img of allImages) {
      if (!existingImageIds.has(img.id)) {
        try {
          await prisma.duplicateImage.create({
            data: {
              duplicateGroupId: existingDuplicateGroup.duplicateGroup.id,
              imageId: img.id,
            },
          })
        } catch (error) {
          // If this is a unique constraint violation, we can safely ignore it
          // as it means the image is already in the group
          if (!(error instanceof Error && error.message.includes("Unique constraint failed"))) {
            throw error
          }
        }
      }
    }

    return existingDuplicateGroup.duplicateGroup
  }

  // Create a new duplicate group
  const duplicateGroup = await prisma.duplicateGroup.create({
    data: {
      projectId: image.projectId,
      hash,
      status: DuplicateStatus.PENDING_REVIEW,
      images: {
        create: [
          { imageId: image.id },
          ...potentialDuplicates.map((d: Image) => ({
            imageId: d.id,
          })),
        ],
      },
    },
  })

  return duplicateGroup
}

/**
 * Helper function to get all pending duplicate groups for a project
 * @param projectId The project ID to check
 * @returns Array of duplicate groups with their images
 */
export async function getPendingDuplicatesForProject(projectId: number) {
  return prisma.duplicateGroup.findMany({
    where: {
      status: DuplicateStatus.PENDING_REVIEW,
      images: {
        some: {
          image: {
            projectId: projectId,
          },
        },
      },
    },
    include: {
      images: {
        include: {
          image: true,
        },
      },
    },
  })
}
