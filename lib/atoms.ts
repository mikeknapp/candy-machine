import { Image, Project } from "@prisma/client"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { getProjectImages } from "@/app/actions/images"

export const selectedProjectAtom = atom<Project | null>(null)
export const selectedImageIndexAtom = atom<number | null>(null)
export const projectImagesAtom = atom<Image[]>([])

// Create a derived atom that resets related atoms when selectedProject changes
export const projectStateResetAtom = atom(
  (get) => get(selectedProjectAtom),
  (get, set, newProject: Project | null) => {
    set(selectedProjectAtom, newProject)
    set(selectedImageIndexAtom, null)
    set(projectImagesAtom, [])
  }
)

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
