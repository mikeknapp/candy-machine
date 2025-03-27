"use server"

import { PrismaClient, ProjectType } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

const createProjectSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    ProjectType.CHARACTER,
    ProjectType.CLOTHING,
    ProjectType.OBJECT,
    ProjectType.IMAGE_STYLE,
    ProjectType.CONCEPT,
    ProjectType.OTHER,
  ]),
  slug: z.string().min(1),
})

type CreateProjectInput = z.infer<typeof createProjectSchema>

export async function createProject(input: CreateProjectInput) {
  try {
    const body = createProjectSchema.parse(input)

    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [{ name: body.name }, { slug: body.slug }],
      },
    })

    if (existingProject) {
      return {
        error: "A project with this name already exists",
        status: 409,
      }
    }

    const project = await prisma.project.create({
      data: {
        name: body.name,
        type: body.type,
        slug: body.slug,
      },
    })

    return { data: project }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors,
        status: 400,
      }
    }

    return {
      error: "Internal server error",
      status: 500,
    }
  }
}
