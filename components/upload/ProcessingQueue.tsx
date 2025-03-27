"use client"

import { projectImagesAtom, refreshProjectImages } from "@/lib/atoms"
import { cn } from "@/lib/utils"
import { useAtom, useSetAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { X } from "lucide-react"
import { useCallback, useEffect } from "react"

export interface QueuedFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "processing" | "completed" | "error"
  error?: string
  progress?: number
  originalFile?: File // Store the original File object for retries
  projectId?: number // Store the project ID for retries
}

export const processingQueueAtom = atomWithStorage<QueuedFile[]>("processingQueue", [])
export const isQueueMinimizedAtom = atomWithStorage("isQueueMinimized", false)

export const ProcessingQueue = () => {
  const [queue, setQueue] = useAtom(processingQueueAtom)
  const [isMinimized, setIsMinimized] = useAtom(isQueueMinimizedAtom)
  const setImages = useSetAtom(projectImagesAtom)

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized)
  }, [isMinimized, setIsMinimized])

  const handleRetry = useCallback(
    async (fileId: string) => {
      // Find the original file in the queue
      const queuedFile = queue.find((f) => f.id === fileId)
      if (!queuedFile?.originalFile || !queuedFile.projectId) return

      try {
        // Update status to processing
        setQueue((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 0, error: undefined } : f))
        )

        // Create form data
        const formData = new FormData()
        formData.append("projectId", queuedFile.projectId.toString())
        formData.append("file", queuedFile.originalFile)

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

        // Refresh images list
        const newImages = await refreshProjectImages(queuedFile.projectId)
        setImages(newImages)
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
    [queue, setQueue, setImages]
  )

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    queue.forEach((file) => {
      if (file.status === "completed") {
        const timeout = setTimeout(() => {
          setQueue((currentQueue) => currentQueue.filter((f) => f.id !== file.id))
        }, 5000) // 5 seconds
        timeouts.push(timeout)
      } else if (file.status === "error") {
        const timeout = setTimeout(() => {
          setQueue((currentQueue) => currentQueue.filter((f) => f.id !== file.id))
        }, 120000) // 2 minutes
        timeouts.push(timeout)
      }
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [queue, setQueue])

  if (queue.length === 0) {
    return null
  }

  const pendingCount = queue.filter((file) => file.status === "pending").length
  const processingCount = queue.filter((file) => file.status === "processing").length
  const completedCount = queue.filter((file) => file.status === "completed").length
  const errorCount = queue.filter((file) => file.status === "error").length

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-200 ease-in-out",
        isMinimized && "h-12",
        !isMinimized && "h-96"
      )}
    >
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={handleMinimize}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold">Processing Queue</h3>
          <div className="flex items-center space-x-1 text-sm">
            {pendingCount > 0 && <span className="text-gray-500 dark:text-gray-400">{pendingCount} pending</span>}
            {processingCount > 0 && <span className="text-blue-500">{processingCount} processing</span>}
            {completedCount > 0 && <span className="text-green-500">{completedCount} completed</span>}
            {errorCount > 0 && <span className="text-red-500">{errorCount} failed</span>}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setQueue([])
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-2 h-[calc(100%-4rem)] overflow-y-auto">
          {queue.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center space-x-2">
                  {file.status === "pending" && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Waiting...</span>
                  )}
                  {file.status === "processing" && (
                    <>
                      <div className="h-1 flex-1 bg-gray-200 dark:bg-gray-600 rounded">
                        <div
                          className="h-1 bg-blue-500 rounded transition-all duration-200"
                          style={{ width: `${file.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-blue-500">{file.progress}%</span>
                    </>
                  )}
                  {file.status === "completed" && <span className="text-xs text-green-500">Completed</span>}
                  {file.status === "error" && (
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-xs text-red-500 flex-1">{file.error || "Failed"}</span>
                      {file.originalFile && file.projectId && (
                        <button
                          onClick={() => handleRetry(file.id)}
                          className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
