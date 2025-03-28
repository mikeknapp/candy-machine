"use client"

import { projectImagesAtom, selectedImageIdAtom, selectedProjectAtom } from "@/lib/atoms"
import { useAtom, useAtomValue } from "jotai"
import Image from "next/image"
import { useEffect, useRef } from "react"

export const ImagePanel = () => {
  const selectedProject = useAtomValue(selectedProjectAtom)
  const [images, setImages] = useAtom(projectImagesAtom)
  const [selectedImageId, setSelectedImageId] = useAtom(selectedImageIdAtom)
  const buttonRefs = useRef<Record<string, HTMLButtonElement>>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!images.length || selectedImageId === null) return

      const currentIndex = images.findIndex((img) => img.id === selectedImageId)
      if (currentIndex === -1) return

      if (e.key === "ArrowLeft") {
        const newIndex = (currentIndex - 1 + images.length) % images.length
        setSelectedImageId(images[newIndex].id)
        buttonRefs.current[images[newIndex].id]?.focus()
      }
      if (e.key === "ArrowRight") {
        const newIndex = (currentIndex + 1) % images.length
        setSelectedImageId(images[newIndex].id)
        buttonRefs.current[images[newIndex].id]?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImageId, images, setSelectedImageId])

  if (!selectedProject) {
    return null
  }

  return (
    <div className="w-64 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <h2 className="text-lg font-semibold p-4 pb-2">{selectedProject.name} Images</h2>
      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="grid grid-cols-2 gap-4 auto-rows-max">
          {images.length === 0 ? (
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">No images</p>
            </div>
          ) : (
            images.map((image, index) => (
              <button
                key={image.id}
                ref={(el) => {
                  if (el) buttonRefs.current[image.id] = el
                }}
                onClick={() => setSelectedImageId(image.id)}
                className="aspect-square relative bg-gray-200 dark:bg-gray-700 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Image
                  src={`/data/${selectedProject.slug}/${image.id}-original.${image.extension}`}
                  alt={`Image ${image.id}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  draggable={false}
                  priority={index === 0}
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
