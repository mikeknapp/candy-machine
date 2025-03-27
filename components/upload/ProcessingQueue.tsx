"use client"

import { cn } from "@/lib/utils"
import { useAtom } from "jotai"
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
}

export const processingQueueAtom = atomWithStorage<QueuedFile[]>("processingQueue", [])
export const isQueueMinimizedAtom = atomWithStorage("isQueueMinimized", false)

export const ProcessingQueue = () => {
  const [queue, setQueue] = useAtom(processingQueueAtom)
  const [isMinimized, setIsMinimized] = useAtom(isQueueMinimizedAtom)

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized)
  }, [isMinimized, setIsMinimized])

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
                  {file.status === "error" && <span className="text-xs text-red-500">{file.error || "Failed"}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
