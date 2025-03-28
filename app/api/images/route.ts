"use server"

import { findAndRecordDuplicates } from "@/lib/duplicates"
import { getEmbedding } from "@/lib/embedding"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs"
import { mkdir } from "fs/promises"
import { NextRequest, NextResponse } from "next/server"
import { join } from "path"
import sharp from "sharp"
import phash from "sharp-phash"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const projectId = formData.get("projectId")
    const file = formData.get("file")

    if (!projectId || !file || typeof projectId !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const projectSlug = project.slug
    const buffer = await file.arrayBuffer()
    const metadata = await sharp(Buffer.from(buffer)).metadata()

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 })
    }

    const aspectRatio = metadata.width / metadata.height
    const extension = file.type.split("/")[1]

    // Create image record
    const image = await prisma.image.create({
      data: {
        extension: extension,
        width: metadata.width,
        height: metadata.height,
        fileSize: file.size,
        originalAspectRatio: aspectRatio,
        aspectRatio,
        hash: "", // Will calculate hash after writing to file system
        embedding: Buffer.from([]), // Empty buffer for now, will be populated later
        project: {
          connect: {
            id: parseInt(projectId),
          },
        },
      },
    })

    // Write to file system
    const dirPath = join(process.cwd(), "public", "data", projectSlug)
    const filePath = join(dirPath, `${image.id}-original.${file.type.split("/")[1]}`)

    try {
      // Ensure directory exists
      await mkdir(dirPath, { recursive: true })

      // Write file to disk
      await new Promise<void>((resolve, reject) => {
        writeFile(filePath, Buffer.from(buffer), (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    } catch (error) {
      console.error("Error writing file:", error)
      return NextResponse.json({ error: "Failed to save image file" }, { status: 500 })
    }

    // Get perceptual hash
    const hash = await phash(filePath)

    // Get embedding
    const embedding = await getEmbedding({ filePath })

    // Update image record with hash
    await prisma.image.update({
      where: { id: image.id },
      data: { hash, embedding: Buffer.from(embedding) },
    })

    // Find and record duplicates
    await findAndRecordDuplicates(image, hash)

    return NextResponse.json({ data: image })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    )
  }
}
