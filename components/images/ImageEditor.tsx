"use client"

import { Image as ImageType } from "@prisma/client"
import { Check, Edit, Loader2, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { MouseEvent, TouchEvent, useEffect, useRef, useState } from "react"
import { grabberCorners, GrabberPosition, ResizeGrabber, RotateGrabber } from "./ImageGrabbers"
import { ImageInfoPanel } from "./ImageInfoPanel"

interface ImageEditorProps {
  image: ImageType
  projectSlug: string
  onSave?: (transformData: { position: { x: number; y: number }; scale: number; rotation: number }) => void
}

export const ImageEditor = ({ image, projectSlug, onSave }: ImageEditorProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [startScale, setStartScale] = useState(1)
  const [startRotation, setStartRotation] = useState(0)
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 })
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 })
  const [frameScaleFactor, setFrameScaleFactor] = useState(1)
  const [editMode, setEditMode] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  // Calculate and set the frame size based on container dimensions
  useEffect(() => {
    const updateFrameSize = () => {
      if (!containerRef.current) return

      const containerHeight = containerRef.current.clientHeight
      const maxHeight = containerHeight * 0.7 // 70% of container height

      // Calculate width based on the aspect ratio
      const width = maxHeight * image.aspectRatio
      const height = maxHeight

      // If width exceeds container width, recalculate dimensions
      const containerWidth = containerRef.current.clientWidth
      if (width > containerWidth * 0.9) {
        const newWidth = containerWidth * 0.9
        const newHeight = newWidth / image.aspectRatio
        setFrameSize({ width: newWidth, height: newHeight })
      } else {
        setFrameSize({ width, height })
      }

      // Calculate the scale factor between frame and actual image dimensions
      const factor = width / image.width
      setFrameScaleFactor(factor)
    }

    updateFrameSize()
    window.addEventListener("resize", updateFrameSize)

    return () => {
      window.removeEventListener("resize", updateFrameSize)
    }
  }, [image.aspectRatio, image.width])

  // Set initial scale when image loads
  const handleImageLoad = () => {
    setIsLoading(false)
    setOriginalImageSize({
      width: image.originalWidth,
      height: image.originalHeight,
    })

    // Calculate initial scale to make the image fit nicely in the frame
    // We want to fit the original image into the frame properly
    const widthRatio = frameSize.width / image.originalWidth
    const heightRatio = frameSize.height / image.originalHeight

    // Use the smaller ratio to ensure the image fits within the frame
    const initialScale = Math.min(widthRatio, heightRatio) * 0.9
    setScale(initialScale / frameScaleFactor) // Adjust for frameScaleFactor
  }

  // Handle mouse/touch events for dragging the image
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
    setStartPosition({ ...position })
  }

  const handleResizeStart = (clientX: number, clientY: number, corner: GrabberPosition) => {
    setIsResizing(true)
    setDragStart({ x: clientX, y: clientY })
    setStartScale(scale)
  }

  const handleRotateStart = (clientX: number, clientY: number) => {
    setIsRotating(true)
    setDragStart({ x: clientX, y: clientY })
    setStartRotation(rotation)
  }

  // Calculate the maximum scale based on original image size
  const calculateMaxScale = () => {
    if (originalImageSize.width === 0 || frameSize.width === 0) return 3 // Default max if dimensions not available

    // Calculate the ratio between original image size and frame size
    const maxScaleFactor = originalImageSize.width / (frameSize.width / frameScaleFactor)

    // Return the max scale, accounting for frameScaleFactor
    return maxScaleFactor
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

  const handleMouseMove = (e: MouseEvent) => {
    if (!editMode) return

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setPosition({
        x: startPosition.x + deltaX,
        y: startPosition.y + deltaY,
      })
    } else if (isResizing) {
      const deltaY = dragStart.y - e.clientY
      // Apply different resize behavior depending on which corner is being dragged
      // For simplicity, we're just using a common scaling factor for now
      // A more advanced implementation would resize from the specific corner
      const maxScale = calculateMaxScale()
      const newScale = Math.max(0.1, Math.min(maxScale, startScale + deltaY * 0.01))
      setScale(newScale)
    } else if (isRotating) {
      if (!imageRef.current) return

      // Get the center of the image
      const rect = imageRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate angles
      const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX)
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      const angleDiff = (currentAngle - startAngle) * (180 / Math.PI)

      setRotation(startRotation + angleDiff)
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!editMode) return
    if (e.touches.length !== 1) return

    const touch = e.touches[0]

    if (isDragging) {
      const deltaX = touch.clientX - dragStart.x
      const deltaY = touch.clientY - dragStart.y
      setPosition({
        x: startPosition.x + deltaX,
        y: startPosition.y + deltaY,
      })
    } else if (isResizing) {
      const deltaY = dragStart.y - touch.clientY
      const maxScale = calculateMaxScale()
      const newScale = Math.max(0.1, Math.min(maxScale, startScale + deltaY * 0.01))
      setScale(newScale)
    } else if (isRotating) {
      if (!imageRef.current) return

      // Get the center of the image
      const rect = imageRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate angles
      const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX)
      const currentAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX)
      const angleDiff = (currentAngle - startAngle) * (180 / Math.PI)

      setRotation(startRotation + angleDiff)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setIsRotating(false)
  }

  const handleZoomIn = () => {
    const maxScale = calculateMaxScale()
    setScale((prev) => Math.min(prev + 0.1, maxScale))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.1))
  }

  const handleSave = () => {
    if (onSave) {
      // When saving, adjust the scale by the frameScaleFactor
      // to account for the visual scaling in the UI
      onSave({
        position,
        scale: scale * frameScaleFactor,
        rotation,
      })
    }
    setEditMode(false)
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
  }

  // Display scale is used for the UI rendering
  const displayScale = scale * frameScaleFactor

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
          {/* Actual image that can be manipulated - Moved BEFORE the frame to ensure it's accessible */}
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
              width: frameSize.width,
              height: frameSize.height,
              boxShadow: "0 0 0 9999px rgba(23, 23, 23, 0.4)",
            }}
          >
            {/* Transparent center of the frame */}
            <div className="absolute inset-0 bg-transparent"></div>

            {/* Grid lines for better visualization */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white border-opacity-30"></div>
              <div className="border-r border-b border-white border-opacity-30"></div>
              <div className="border-b border-white border-opacity-30"></div>
              <div className="border-r border-b border-white border-opacity-30"></div>
              <div className="border-r border-b border-white border-opacity-30"></div>
              <div className="border-b border-white border-opacity-30"></div>
              <div className="border-r border-white border-opacity-30"></div>
              <div className="border-r border-white border-opacity-30"></div>
              <div className="border-white border-opacity-30"></div>
            </div>
          </div>
        </>
      ) : (
        // Simple view mode - just the image without editing controls
        <div className="relative max-w-full max-h-[70%] flex items-center justify-center">
          <Image
            src={`/data/${projectSlug}/${image.id}-original.${image.extension}`}
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
