"use client"

import { selectedProjectAtom } from "@/lib/atoms"
import { useAtomValue } from "jotai"
import { ProcessingQueue } from "./upload/ProcessingQueue"

export const MainPanel = () => {
  const selectedProject = useAtomValue(selectedProjectAtom)

  return (
    <div className="relative flex-1 h-full bg-white dark:bg-gray-900 p-8">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Candy Machine</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedProject
              ? "Drag and drop images anywhere to add them to your project"
              : "Select or create a project to get started"}
          </p>
        </div>
      </div>

      <ProcessingQueue />
    </div>
  )
}
