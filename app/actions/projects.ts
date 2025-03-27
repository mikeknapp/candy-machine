"use server"

import { prisma } from "@/lib/prisma"
import { ProjectType } from "@prisma/client"
import { z } from "zod"

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
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type CreateProjectInput = z.infer<typeof createProjectSchema>

export async function createProject(input: CreateProjectInput) {
  try {
    const body = createProjectSchema.parse(input)
    const slug = generateSlug(body.name)

    const existingProject = await prisma.project.findFirst({
      where: {
        OR: [{ name: body.name }, { slug }],
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
        slug,
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

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        name: "asc",
      },
    })
    return { data: projects }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch projects",
      status: 500,
    }
  }
}

export async function checkProjectNameAvailability(name: string) {
  if (!name) {
    return { available: false }
  }

  const slug = generateSlug(name)

  const existingProject = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  })

  return { available: !existingProject }
}
