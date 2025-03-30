"use client"

import { TooltipButton } from "@/components/ui/tooltip-button"
import { projectImagesAtom, selectedImageIdAtom, selectedProjectAtom } from "@/lib/atoms"
import { useAtom, useAtomValue } from "jotai"
import { ArrowLeft, ArrowRight, Copy, RotateCcw, Trash2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ProcessingQueue } from "./upload/ProcessingQueue"

export const MainPanel = () => {
  const [isLoading, setIsLoading] = useState(true)
  const selectedProject = useAtomValue(selectedProjectAtom)
  const images = useAtomValue(projectImagesAtom)
  const [selectedImageId, setSelectedImageId] = useAtom(selectedImageIdAtom)

  useEffect(() => {
    setIsLoading(true)
  }, [selectedImageId])

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
    <div className="flex-1 relative bg-white dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <TooltipButton onClick={handlePrevImage} tooltip="Previous image" aria-label="Previous image">
            <ArrowLeft className="w-5 h-5" />
          </TooltipButton>

          <TooltipButton onClick={handleNextImage} tooltip="Next image" aria-label="Next image">
            <ArrowRight className="w-5 h-5" />
          </TooltipButton>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          <TooltipButton tooltip="Repost image" aria-label="Repost">
            <RotateCcw className="w-5 h-5" />
          </TooltipButton>

          <TooltipButton tooltip="Copy to clipboard" aria-label="Copy">
            <Copy className="w-5 h-5" />
          </TooltipButton>

          <TooltipButton tooltip="Delete image" aria-label="Delete">
            <Trash2 className="w-5 h-5" />
          </TooltipButton>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {images.findIndex((img) => img.id === selectedImageId) + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-full pt-12">
        {/* Image Display */}
        <div className="flex-1 relative flex items-center justify-center bg-gray-100 dark:bg-gray-800 [background-image:linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(to_right,#e5e7eb_1px,transparent_1px)] dark:[background-image:linear-gradient(#374151_1px,transparent_1px),linear-gradient(to_right,#374151_1px,transparent_1px)] [background-size:20px_20px]">
          <Image
            src={`/data/${selectedProject.slug}/${selectedImage.id}-original.${selectedImage.extension}`}
            alt={`Image ${selectedImage.id}`}
            className="max-h-[70%] max-w-full w-auto h-auto object-contain"
            width={2000}
            height={2000}
            priority
            draggable={false}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Right Sidebar - Tags Panel (Placeholder) */}
        <div className="w-80 border-l dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Image Quality</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">HD</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">Low quality</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Image Type</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">Photo</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">Drawing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
