"use client"

export const ImagePanel = () => {
  return (
    <div className="w-64 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-lg font-semibold mb-4">Images</h2>
      <div className="grid grid-cols-2 gap-2">
        {/* Image thumbnails will be rendered here */}
        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No images</p>
        </div>
      </div>
    </div>
  )
}
