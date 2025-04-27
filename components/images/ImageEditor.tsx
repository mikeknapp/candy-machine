"use client"

import { imageSizes } from "@/app/consts"
import { GridOverlay } from "@/components/images/GridOverlay"
import { grabberCorners, GrabberPosition, ResizeGrabber, RotateGrabber } from "@/components/images/ImageGrabbers"
import { ImageInfoPanel } from "@/components/images/ImageInfoPanel"
import { useImageTransform } from "@/hooks/useImageTransform"
import { Image as ImageType } from "@prisma/client"
import { Check, Edit, Loader2, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { MouseEvent, RefObject, TouchEvent, useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface ImageEditorProps {
  image: ImageType
  projectSlug: string
  onSave?: (transformData: {
    position: { x: number; y: number }
    scale: number
    rotation: number
    flippedY: boolean
    flippedX: boolean
    frameSize: keyof typeof imageSizes
  }) => void
}

export const ImageEditor = ({ image, projectSlug, onSave }: ImageEditorProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [selectedFrameSize, setSelectedFrameSize] = useState<keyof typeof imageSizes>("square")
  const [frameScaleFactor, setFrameScaleFactor] = useState(1)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  console.log(image)

  // Use editData for initial transform if present
  const editData = image.editData as {
    x?: number
    y?: number
    rotation?: number
    width?: number
    height?: number
    frameWidth?: number
    frameHeight?: number
  } | null

  // Determine the frame size used when editData was saved
  const savedFrameWidth = editData?.frameWidth ?? image.width
  const savedFrameHeight = editData?.frameHeight ?? image.height
  const currentFrameWidth = imageSizes[selectedFrameSize].width
  const currentFrameHeight = imageSizes[selectedFrameSize].height
  const frameScaleX = currentFrameWidth / savedFrameWidth
  const frameScaleY = currentFrameHeight / savedFrameHeight

  const initialPosition = editData
    ? {
        x: (editData.x ?? 0) * frameScaleX * frameScaleFactor,
        y: (editData.y ?? 0) * frameScaleY * frameScaleFactor,
      }
    : { x: 0, y: 0 }
  const initialRotation = editData?.rotation ?? 0
  const initialScale = editData && editData.width && image.originalWidth ? editData.width / image.originalWidth : 1

  const {
    position,
    scale,
    rotation,
    displayScale,
    isDragging,
    isResizing,
    isRotating,
    handleDragStart,
    handleResizeStart,
    handleRotateStart,
    handleMouseMove,
    handleTouchMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
    setScale,
    setPosition,
  } = useImageTransform({
    initialPosition,
    initialScale,
    initialRotation,
    originalImageSize: { width: image.originalWidth, height: image.originalHeight },
    frameSize: {
      width: imageSizes[selectedFrameSize].width * frameScaleFactor,
      height: imageSizes[selectedFrameSize].height * frameScaleFactor,
    },
    frameScaleFactor,
    editMode,
    imageRef: imageRef as RefObject<HTMLDivElement>,
  })

  // Shared utility to calculate maximum container dimensions
  const getContainerDimensions = (containerElement: HTMLElement) => {
    const containerWidth = containerElement.clientWidth
    const containerHeight = containerElement.clientHeight

    // We consistently use 70% of container size as our maximum bounds
    return {
      maxWidth: containerWidth * 0.7,
      maxHeight: containerHeight * 0.7,
      containerWidth,
      containerHeight,
    }
  }

  // Combined resize effect to handle both image and frame scaling
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (!containerRef.current) return

      const { maxWidth, maxHeight } = getContainerDimensions(containerRef.current)

      // 1. Update image scale
      // Calculate initial dimensions based on the height constraint
      let imageWidth = maxHeight * image.aspectRatio
      let imageHeight = maxHeight

      // Check if width exceeds the max width constraint
      if (imageWidth > maxWidth) {
        // Recalculate based on width constraint
        imageWidth = maxWidth
        imageHeight = maxWidth / image.aspectRatio
      }

      // Update image scale
      setScale(Math.min(imageWidth / image.width, imageHeight / image.height))

      // 2. Update frame scale (only in edit mode)
      if (editMode && frameRef.current) {
        const selectedSize = imageSizes[selectedFrameSize]

        // Calculate frame scaling factor
        let newFrameScaleFactor = 1

        // Scale down frame if it exceeds container bounds
        if (selectedSize.width > maxWidth || selectedSize.height > maxHeight) {
          const widthRatio = maxWidth / selectedSize.width
          const heightRatio = maxHeight / selectedSize.height
          newFrameScaleFactor = Math.min(widthRatio, heightRatio)
        }

        // Update frame scale factor and dimensions
        setFrameScaleFactor(newFrameScaleFactor)

        const scaledWidth = selectedSize.width * newFrameScaleFactor
        const scaledHeight = selectedSize.height * newFrameScaleFactor

        frameRef.current.style.width = `${scaledWidth}px`
        frameRef.current.style.height = `${scaledHeight}px`
      }
    }

    // Initial update
    updateDimensions()

    // Use ResizeObserver for efficient resize handling
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [image.aspectRatio, image.width, selectedFrameSize, editMode, setScale, setFrameScaleFactor])

  // Set initial scale when image loads
  const handleImageLoad = () => {
    setIsLoading(false)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "e") {
        setEditMode((prev) => !prev)
      } else if (e.key === "Escape" && editMode) {
        setEditMode(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [editMode])

  const handleSave = () => {
    if (onSave) {
      // When saving, adjust the scale by the frameScaleFactor
      // to account for the visual scaling in the UI
      onSave({
        position,
        scale: scale,
        rotation,
        flippedY: false, // TODO: Add flippedY and flippedX
        flippedX: false,
        frameSize: selectedFrameSize,
      })
    }
    setEditMode(false)
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
  }

  const handleFrameSizeChange = (value: string) => {
    const newFrameSize = value as keyof typeof imageSizes
    setSelectedFrameSize(newFrameSize)

    // Center the image when frame size changes
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerCenterX = containerRect.width / 2
      const containerCenterY = containerRect.height / 2

      // Apply the current frameScaleFactor for proper positioning
      setPosition({
        x: containerCenterX - (imageSizes[newFrameSize].width * frameScaleFactor * scale) / 2,
        y: containerCenterY - (imageSizes[newFrameSize].height * frameScaleFactor * scale) / 2,
      })
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {editMode ? (
        <>
          <div className="absolute top-4 left-4 z-100 bg-white rounded-md p-2">
            <Select onValueChange={handleFrameSizeChange} value={selectedFrameSize}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select an image size" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(imageSizes).map(([key, size]) => (
                  <SelectItem key={key} value={key}>
                    {size.name} - {size.width}x{size.height}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div
            ref={imageRef}
            className="absolute z-10 select-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${displayScale})`,
              transformOrigin: "center",
              willChange: "transform",
            }}
          >
            <Image
              src={`/data/${projectSlug}/${image.id}-original.${image.extension}`}
              alt={`Image ${image.id}`}
              className={`transition-opacity duration-200 ${isLoading ? "opacity-0" : "opacity-100"}`}
              width={image.originalWidth}
              height={image.originalHeight}
              priority
              draggable={false}
              onLoad={handleImageLoad}
              onMouseDown={(e) => editMode && handleDragStart(e.clientX, e.clientY)}
              onTouchStart={(e) => {
                if (editMode && e.touches.length === 1) {
                  handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
                }
              }}
            />

            {/* Render all four corner resize grabbers */}
            {!isLoading &&
              editMode &&
              grabberCorners.map((corner: GrabberPosition) => (
                <ResizeGrabber
                  key={corner}
                  position={corner}
                  onGrab={(e: MouseEvent | TouchEvent) => {
                    if ("clientX" in e) {
                      handleResizeStart(e.clientX, e.clientY, corner)
                    } else if (e.touches.length === 1) {
                      handleResizeStart(e.touches[0].clientX, e.touches[0].clientY, corner)
                    }
                  }}
                />
              ))}

            {/* Rotate grabber - on the right center */}
            {!isLoading && editMode && <RotateGrabber handleRotateStart={handleRotateStart} />}
          </div>

          {/* Frame that represents the final image dimensions - moved AFTER the image */}
          <div
            ref={frameRef}
            className="relative border-2 border-black z-20 overflow-hidden pointer-events-none"
            style={{
              width: imageSizes[selectedFrameSize].width,
              height: imageSizes[selectedFrameSize].height,
              boxShadow: "0 0 0 9999px rgba(23, 23, 23, 0.4)",
            }}
          >
            <GridOverlay />

            {/* Transparent center of the frame */}
            <div className="absolute inset-0 bg-transparent"></div>
          </div>
        </>
      ) : (
        // Simple view mode - just the image without editing controls
        <div className="relative max-h-[70%] max-w-[70%] flex items-center justify-center">
          <Image
            src={`/data/${projectSlug}/${image.id}-export.png`}
            alt={`Image ${image.id}`}
            className={`transition-opacity duration-200 ${
              isLoading ? "opacity-0" : "opacity-100"
            } max-h-full w-auto h-auto`}
            width={image.originalWidth}
            height={image.originalHeight}
            style={{
              objectFit: "contain",
              maxHeight: "70vh",
            }}
            priority
            draggable={false}
            onLoad={handleImageLoad}
          />
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
        {editMode && (
          <>
            <button
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            <button
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Edit/Save button */}
      <div className="absolute bottom-4 right-4 z-40">
        <button
          className={`px-4 py-2 rounded-md shadow-md flex items-center gap-2 ${
            editMode ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={editMode ? handleSave : toggleEditMode}
        >
          {editMode ? (
            <>
              <Check className="w-4 h-4" />
              Save
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit
            </>
          )}
        </button>
      </div>

      <ImageInfoPanel image={image} className="z-40" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  )
}
