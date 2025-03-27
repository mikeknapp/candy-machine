import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"

const prisma = new PrismaClient()

const createProjectSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["CHARACTER", "CLOTHING", "OBJECT", "IMAGE_STYLE", "CONCEPT", "OTHER"]),
  slug: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = createProjectSchema.parse(json)

    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [{ name: body.name }, { slug: body.slug }],
      },
    })

    if (existingProject) {
      return NextResponse.json({ error: "A project with this name already exists" }, { status: 409 })
    }

    const project = await prisma.project.create({
      data: {
        name: body.name,
        type: body.type,
        slug: body.slug,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
