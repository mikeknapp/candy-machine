"use client"

import { projectImagesAtom, selectedImageIdAtom, selectedProjectAtom } from "@/lib/atoms"
import { useAtom, useAtomValue } from "jotai"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { ProcessingQueue } from "./upload/ProcessingQueue"
import { useState } from "react"

export const MainPanel = () => {
  const [isLoading, setIsLoading] = useState(true)
  const selectedProject = useAtomValue(selectedProjectAtom)
  const images = useAtomValue(projectImagesAtom)
  const [selectedImageId, setSelectedImageId] = useAtom(selectedImageIdAtom)

  const handlePrevImage = () => {
    if (!images.length || selectedImageId === null) return
    const currentIndex = images.findIndex((img) => img.id === selectedImageId)
    if (currentIndex === -1) return
    const newIndex = (currentIndex - 1 + images.length) % images.length
    setSelectedImageId(images[newIndex].id)
  }

  const handleNextImage = () => {
    if (!images.length || selectedImageId === null) return
    const currentIndex = images.findIndex((img) => img.id === selectedImageId)
    if (currentIndex === -1) return
    const newIndex = (currentIndex + 1) % images.length
    setSelectedImageId(images[newIndex].id)
  }

  // Show welcome message if no project is selected or no image is selected
  if (!selectedProject || selectedImageId === null) {
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

  const selectedImage = images.find((img) => img.id === selectedImageId)
  if (!selectedImage) return null

  return (
    <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={`/data/${selectedProject.slug}/${selectedImage.id}-original.${selectedImage.extension}`}
            alt={`Image ${selectedImage.id}`}
            className="max-h-full max-w-full w-auto h-auto object-contain"
            width={2000}
            height={2000}
            priority
            draggable={false}
            onLoad={() => setIsLoading(false)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
          )}
        </div>
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
          {images.findIndex((img) => img.id === selectedImageId) + 1} / {images.length}
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
