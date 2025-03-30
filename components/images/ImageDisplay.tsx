"use client"

import { Image as ImageType } from "@prisma/client"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface ImageDisplayProps {
  image: ImageType
  projectSlug: string
}

export const ImageDisplay = ({ image, projectSlug }: ImageDisplayProps) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <Image
        src={`/data/${projectSlug}/${image.id}-original.${image.extension}`}
        alt={`Image ${image.id}`}
        className={`max-h-[70%] max-w-full w-auto h-auto object-contain transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        width={2000}
        height={2000}
        priority
        draggable={false}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  )
}
