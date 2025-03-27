import { Image, Project } from "@prisma/client"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { getProjectImages } from "@/app/actions/images"

export const selectedProjectAtom = atom<Project | null>(null)

export const projectImagesAtom = atom<Image[]>([])

export const refreshProjectImages = async (projectId: number) => {
  try {
    const result = await getProjectImages(projectId)

    if ("error" in result) {
      throw new Error(result.error)
    }

    return result.data
  } catch (error) {
    console.error("Error refreshing images:", error)
    throw error
  }
}
