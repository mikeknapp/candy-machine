"use client"

import { projectImagesAtom, selectedImageIndexAtom, selectedProjectAtom } from "@/lib/atoms"
import { useAtom, useAtomValue } from "jotai"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProcessingQueue } from "./upload/ProcessingQueue"

export const MainPanel = () => {
  const selectedProject = useAtomValue(selectedProjectAtom)
  const images = useAtomValue(projectImagesAtom)
  const [selectedImageIndex, setSelectedImageIndex] = useAtom(selectedImageIndexAtom)

  const handlePrevImage = () => {
    if (selectedImageIndex === null || !images.length) return
    setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)
  }

  const handleNextImage = () => {
    if (selectedImageIndex === null || !images.length) return
    setSelectedImageIndex((selectedImageIndex + 1) % images.length)
  }

  // Show welcome message if no project is selected or no image is selected
  if (!selectedProject || selectedImageIndex === null) {
    return (
      <div className="relative flex-1 h-full bg-white dark:bg-gray-900 p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Candy Machine</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedProject
                ? "Select an image from the sidebar or drag and drop images anywhere to add them to your project"
                : "Select or create a project to get started"}
            </p>
          </div>
        </div>
        <ProcessingQueue />
      </div>
    )
  }

  return (
    <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={`/data/${selectedProject.slug}/${images[selectedImageIndex].id}-original.${images[selectedImageIndex].extension}`}
          alt={`Image ${images[selectedImageIndex].id}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
          draggable={false}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 text-white px-4 py-2 rounded-full">
        <button
          onClick={handlePrevImage}
          className="p-2 hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm">
          {selectedImageIndex + 1} / {images.length}
        </span>
        <button
          onClick={handleNextImage}
          className="p-2 hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
