"use client"

import { selectedProjectAtom } from "@/lib/atoms"
import { useAtom, useAtomValue } from "jotai"
import { Upload } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { processingQueueAtom, QueuedFile } from "./upload/ProcessingQueue"

interface DragAndDropProps {
  children: React.ReactNode
}

export const DragAndDrop = ({ children }: DragAndDropProps) => {
  const selectedProject = useAtomValue(selectedProjectAtom)
  const [isDragging, setIsDragging] = useState(false)
  const [queue, setQueue] = useAtom(processingQueueAtom)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const processFile = useCallback(
    async (file: File) => {
      const fileId = uuidv4()
      const queuedFile: QueuedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "pending",
      }

      setQueue((prev) => [...prev, queuedFile])

      try {
        // Update status to processing
        setQueue((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 0 } : f)))

        // Create form data
        const formData = new FormData()
        formData.append("projectId", selectedProject!.id.toString())
        formData.append("file", file)

        // Upload image
        const response = await fetch("/api/images", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (!response.ok || "error" in result) {
          throw new Error(typeof result.error === "string" ? result.error : "Failed to upload image")
        }

        // Update status to completed
        setQueue((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "completed" } : f)))
      } catch (error) {
        // Update status to error
        setQueue((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
              : f
          )
        )
      }
    },
    [selectedProject, setQueue]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (!selectedProject) {
        toast.error("No project selected", {
          description: "Please create or select a project first",
        })
        return
      }

      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

      if (files.length === 0) {
        toast.error("No images found", {
          description: "Please drop image files only",
        })
        return
      }

      toast.success(`Processing ${files.length} images`, {
        description: "Your images will be processed in the background",
      })

      // Process each file
      files.forEach((file) => {
        processFile(file)
      })
    },
    [selectedProject, processFile]
  )

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 dark:bg-white/10 backdrop-blur-sm">
          {!selectedProject ? (
            <div className="p-6 bg-red-100 dark:bg-red-900 rounded-lg text-center">
              <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">No Project Selected</h3>
              <p className="text-red-700 dark:text-red-300">Please create or select a project first</p>
            </div>
          ) : (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg text-center shadow-lg">
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Drop Images Here</h3>
              <p className="text-gray-600 dark:text-gray-400">Drop your images to add them to {selectedProject.name}</p>
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
