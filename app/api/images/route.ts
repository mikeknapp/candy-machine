import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const projectId = formData.get("projectId")
    const file = formData.get("file")

    if (!projectId || !file || typeof projectId !== "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const metadata = await sharp(Buffer.from(buffer)).metadata()

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Invalid image file" }, { status: 400 })
    }

    const aspectRatio = metadata.width / metadata.height

    // Create image record
    const image = await prisma.image.create({
      data: {
        width: metadata.width,
        height: metadata.height,
        fileSize: file.size,
        originalAspectRatio: aspectRatio,
        aspectRatio,
        hash: "", // TODO: Implement image hashing
        embedding: Buffer.from([]), // Empty buffer for now, will be populated later
        projects: {
          create: {
            projectId: parseInt(projectId),
          },
        },
      },
    })

    return NextResponse.json({ data: image })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    )
  }
}
