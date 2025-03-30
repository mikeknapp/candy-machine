"use client"

import { Image } from "@prisma/client"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export const ImageInfoPanel = ({ image }: { image: Image }) => {
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true)

  return (
    <div className="absolute left-4 bottom-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border dark:border-gray-800">
        <button
          onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
          className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium border-b dark:border-gray-800"
        >
          Image Info
          {isInfoPanelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
        {isInfoPanelOpen && (
          <div className="p-3 space-y-2 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Original Size</div>
              <div>
                {image.originalWidth} × {image.originalHeight}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Original Aspect Ratio</div>
              <div>{image.originalAspectRatio.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">New Size</div>
              <div>
                {image.width} × {image.height}
              </div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">New Aspect Ratio</div>
              <div>{image.aspectRatio.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
