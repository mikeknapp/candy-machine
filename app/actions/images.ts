"use server"

import { prisma } from "@/lib/prisma"

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
