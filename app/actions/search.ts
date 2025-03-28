"use server"

import { getEmbedding } from "@/lib/embedding"
import { prisma } from "@/lib/prisma"
import { bufferToArray, dot } from "@/lib/utils"
import { Image } from "@prisma/client"

export async function searchImages(projectId: number, query: string): Promise<Image[]> {
  // Get the embedding for the search query
  const queryEmbedding = await getEmbedding({ text: query })

  // Get all images for the project with their embeddings
  const images = await prisma.image.findMany({
    where: {
      projectId,
    },
    select: {
      id: true,
      embedding: true,
    },
  })

  // Calculate similarity scores
  const scores = images.map((image) => ({
    id: image.id,
    score: dot(queryEmbedding, bufferToArray(Buffer.from(image.embedding))),
  }))

  // Sort by score and get top results (cosine similarity typically ranges from -1 to 1)
  const results = scores.filter((score) => score.score > 0.19).sort((a, b) => b.score - a.score)

  const imageResults = await prisma.image.findMany({
    where: {
      id: { in: results.map((result) => result.id) },
    },
  })

  return imageResults
}
