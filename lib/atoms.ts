import { getProjectImages } from "@/app/actions/images"
import { Image, Project } from "@prisma/client"
import { atom } from "jotai"
import debounce from "lodash/debounce"

export const selectedProjectAtom = atom<Project | null>(null)
export const selectedImageIdAtom = atom<number | null>(null)
export const projectImagesAtom = atom<Image[]>([])

// Create a derived atom that resets related atoms when selectedProject changes
export const projectStateResetAtom = atom(
  (get) => get(selectedProjectAtom),
  async (get, set, newProject: Project | null) => {
    set(selectedProjectAtom, newProject)
    set(selectedImageIdAtom, null)
    set(projectImagesAtom, [])

    if (newProject) {
      try {
        const images = await refreshProjectImagesBase(newProject.id)
        set(projectImagesAtom, images)
      } catch (error) {
        console.error("Failed to fetch project images:", error)
      }
    }
  }
)

const refreshProjectImagesBase = async (projectId: number) => {
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

export const refreshProjectImages = debounce(refreshProjectImagesBase, 3000, {
  leading: true, // Execute on the leading edge of the timeout
  trailing: true, // Also execute on the trailing edge
  maxWait: 1500, // Maximum time to wait before forcing execution
})
