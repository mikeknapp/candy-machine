"use client"

import { ImageEditData, SaveImageEditData } from "@/app/actions/images"
import { imageSizes } from "@/app/consts"
import { GridOverlay } from "@/components/images/GridOverlay"
import { grabberCorners, GrabberPosition, ResizeGrabber, RotateGrabber } from "@/components/images/ImageGrabbers"
import { ImageInfoPanel } from "@/components/images/ImageInfoPanel"
import { useImageTransform } from "@/hooks/useImageTransform"
import { getFittedFrameSize, getFrameSizeKeyByDimensions } from "@/lib/utils"
import { Image as ImageType } from "@prisma/client"
import { Check, Edit, Loader2, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { MouseEvent, RefObject, TouchEvent, useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface ImageEditorProps {
  image: ImageType
  projectSlug: string
  onSave?: (transformData: SaveImageEditData) => void
}

export const ImageEditor = ({ image, projectSlug, onSave }: ImageEditorProps) => {
  const initialFrameSizeKey = getFrameSizeKeyByDimensions(image.width, image.height) || "square"

  const [isLoading, setIsLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [selectedFrameSize, setSelectedFrameSize] = useState<keyof typeof imageSizes>(initialFrameSizeKey)
  const [renderedFrameSize, setRenderedFrameSize] = useState<{ width: number; height: number } | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState(Date.now())

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  const {
    renderedImageData,
    newImageData,
    handleDragStart,
    handleResizeStart,
    handleRotateStart,
    handleMouseMove,
    handleTouchMove,
    handleMouseUp,
    handleZoomIn,
    handleZoomOut,
  } = useImageTransform({
    initImg: image,
    renderedFrameSize: renderedFrameSize || undefined,
    editMode,
    imageRef: imageRef as RefObject<HTMLDivElement>,
  })

  // Track the actual rendered frame size
  useEffect(() => {
    if (!frameRef.current) return
    const updateSize = () => {
      if (frameRef.current) {
        setRenderedFrameSize({
          width: frameRef.current.offsetWidth,
          height: frameRef.current.offsetHeight,
        })
      }
    }
    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(frameRef.current)
    return () => resizeObserver.disconnect()
  }, [selectedFrameSize, editMode])

  const renderData = renderedImageData.editData as ImageEditData

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
    if (onSave && renderedFrameSize) {
      const saveImageData = newImageData.editData as ImageEditData

      console.log({
        position: saveImageData?.position,
        scale: saveImageData?.scale,
        rotation: saveImageData?.rotation,
        flippedY: false, // TODO: Add flippedY and flippedX
        flippedX: false,
        frameSize: selectedFrameSize,
      })

      onSave({
        position: saveImageData?.position,
        scale: saveImageData?.scale,
        rotation: saveImageData?.rotation,
        flippedY: false, // TODO: Add flippedY and flippedX
        flippedX: false,
        frameSize: selectedFrameSize,
      })
      setLastSavedAt(Date.now())
    }
    setEditMode(false)
  }

  console.log("scale", renderData?.scale)
  console.log("position", renderData?.position)

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
  }

  const handleFrameSizeChange = (value: string) => {
    const newFrameSize = value as keyof typeof imageSizes
    setSelectedFrameSize(newFrameSize)

    // Center the image when frame size changes
    if (containerRef.current) {
      // TODO: FIX THIS
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerCenterX = containerRect.width / 2
      const containerCenterY = containerRect.height / 2

      // Apply the current frameScaleFactor for proper positioning
      // setPosition({
      //   x: containerCenterX - (imageSizes[newFrameSize].width * scale) / 2,
      //   y: containerCenterY - (imageSizes[newFrameSize].height * scale) / 2,
      // })
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
            ref={frameRef}
            className="relative border-2 border-black bg-white z-0 overflow-hidden"
            style={(function () {
              const containerWidth = containerRef.current?.offsetWidth ?? 0
              const containerHeight = containerRef.current?.offsetHeight ?? 0
              const frameAspect = imageSizes[selectedFrameSize].width / imageSizes[selectedFrameSize].height
              const { width: frameWidth, height: frameHeight } = getFittedFrameSize(
                containerWidth,
                containerHeight,
                frameAspect
              )
              return {
                width: frameWidth,
                height: frameHeight,
                boxShadow: "0 0 0 9999px rgba(23, 23, 23, 0.4)",
              }
            })()}
          >
            <div
              ref={imageRef}
              className="absolute z-10 select-none"
              style={{
                transform: `translate(${renderData?.position.x}px, ${renderData?.position.y}px) rotate(${renderData?.rotation}deg) scale(${renderData?.scale})`,
                transformOrigin: "top left",
                willChange: "transform",
                overflow: "visible",
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
            <GridOverlay />
            {/* Transparent center of the frame */}
            <div className="absolute inset-0 bg-transparent"></div>
          </div>
        </>
      ) : (
        <>
          {/* Simple view mode - just the image without editing controls */}
          <div className="relative max-h-[70%] max-w-[70%] flex items-center justify-center">
            <Image
              src={`/data/${projectSlug}/${image.id}-export.png?t=${lastSavedAt}`}
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
        </>
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
