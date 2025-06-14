import { ImageEditData } from "@/app/actions/images"
import { imageSizes } from "@/app/consts"
import { GrabberPosition } from "@/components/images/ImageGrabbers"
import { getFrameSizeKeyByDimensions } from "@/lib/utils"
import { type Image as ImageType } from "@prisma/client"

import {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from "react"

interface UseImageTransformProps {
  initImg: ImageType
  renderedFrameSize?: { width: number; height: number }
  editMode: boolean
  imageRef: RefObject<HTMLDivElement>
}

export interface UseImageTransformReturn {
  renderedImageData: ImageType // For display.
  newImageData: ImageType // For saving.
  isDragging: boolean
  isResizing: boolean
  isRotating: boolean
  handleDragStart: (clientX: number, clientY: number) => void
  handleResizeStart: (clientX: number, clientY: number, corner: GrabberPosition) => void
  handleRotateStart: (clientX: number, clientY: number) => void
  handleMouseMove: (e: MouseEvent | ReactMouseEvent) => void
  handleTouchMove: (e: TouchEvent | ReactTouchEvent) => void
  handleMouseUp: () => void
  handleZoomIn: () => void
  handleZoomOut: () => void
}

export const useImageTransform = ({
  initImg,
  renderedFrameSize,
  editMode,
  imageRef,
}: UseImageTransformProps): UseImageTransformReturn => {
  const editData = initImg.editData as ImageEditData
  const currentFrame = imageSizes[getFrameSizeKeyByDimensions(initImg.width, initImg.height) as keyof typeof imageSizes]

  const [position, setPosition] = useState(editData?.position ?? { x: 0, y: 0 })
  const [scale, setScale] = useState(editData?.scale ?? 1)
  const [rotation, setRotation] = useState(editData?.rotation ?? 0)

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [startScale, setStartScale] = useState(1)
  const [startRotation, setStartRotation] = useState(0)
  const [resizingCorner, setResizingCorner] = useState<GrabberPosition | null>(null)

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!editMode) return
      setIsDragging(true)
      setDragStart({ x: clientX, y: clientY })
      setStartPosition({ ...position })
      setResizingCorner(null)
      setIsRotating(false)
    },
    [editMode, position]
  )

  const handleResizeStart = useCallback(
    (clientX: number, clientY: number, corner: GrabberPosition) => {
      if (!editMode) return
      setIsResizing(true)
      setDragStart({ x: clientX, y: clientY })
      setStartScale(scale)
      setResizingCorner(corner)
      setIsDragging(false)
      setIsRotating(false)
    },
    [editMode, scale]
  )

  const handleRotateStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!editMode || !imageRef.current) return
      setIsRotating(true)
      setDragStart({ x: clientX, y: clientY }) // Store initial grab point
      setStartRotation(rotation)
      setResizingCorner(null)
      setIsDragging(false)
    },
    [editMode, rotation, imageRef]
  )

  const renderScale = renderedFrameSize ? renderedFrameSize.width / currentFrame.width : 1

  /**
   * Handles all mouse movement during transformations
   * - For dragging: Updates position based on cursor movement
   * - For resizing: Updates scale based on distance from the image's top-left
   * - For rotation: Updates rotation based on angle from the image's top-left
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent | ReactMouseEvent) => {
      if (!editMode || (!isDragging && !isResizing && !isRotating)) return // Only process if in edit mode and an action is active

      if (isDragging) {
        // Adjust delta by renderScale so logical position is correct
        const deltaX = (e.clientX - dragStart.x) / renderScale
        const deltaY = (e.clientY - dragStart.y) / renderScale
        setPosition({
          x: startPosition.x + deltaX,
          y: startPosition.y + deltaY,
        })
      } else if (isResizing && resizingCorner) {
        if (!imageRef.current) return
        const rect = imageRef.current.getBoundingClientRect()
        const centerX = rect.left
        const centerY = rect.top
        const startDist = Math.sqrt(
          Math.pow((dragStart.x - centerX) / renderScale, 2) + Math.pow((dragStart.y - centerY) / renderScale, 2)
        )
        const currentDist = Math.sqrt(
          Math.pow((e.clientX - centerX) / renderScale, 2) + Math.pow((e.clientY - centerY) / renderScale, 2)
        )
        if (startDist === 0) return // Avoid division by zero
        const scaleRatio = currentDist / startDist
        // New scale is always relative to the original image size
        const newScale = Math.max(0.1, Math.min(1, startScale * scaleRatio))
        setScale(newScale)
      } else if (isRotating) {
        if (!imageRef.current) return
        const rect = imageRef.current.getBoundingClientRect()
        const originX = rect.left
        const originY = rect.top
        const startAngle = Math.atan2(dragStart.y - originY, dragStart.x - originX)
        const currentAngle = Math.atan2(e.clientY - originY, e.clientX - originX)
        let angleDiff = (currentAngle - startAngle) * (180 / Math.PI)
        setRotation(startRotation + angleDiff)
      }
    },
    [
      editMode,
      imageRef,
      isDragging,
      isResizing,
      isRotating,
      dragStart,
      startPosition,
      startScale,
      startRotation,
      resizingCorner,
      renderScale,
    ]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent | ReactTouchEvent) => {
      if (!editMode) return
      const touches = "touches" in e ? e.touches : undefined
      if (!touches || touches.length !== 1) return
      const touch = touches[0]
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as any)
    },
    [editMode, handleMouseMove]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false)
    if (isResizing) setIsResizing(false)
    if (isRotating) setIsRotating(false)
    setResizingCorner(null)
  }, [isDragging, isResizing, isRotating])

  const handleZoomIn = useCallback(() => {
    if (!editMode) return
    setScale((prev) => Math.min(prev * 1.1, 1))
  }, [editMode])

  const handleZoomOut = useCallback(() => {
    if (!editMode) return
    setScale((prev) => Math.max(prev / 1.1, 0.1))
  }, [editMode])

  useEffect(() => {
    if (!editMode) {
      handleMouseUp() // Ensure interactions stop
    }
  }, [editMode, handleMouseUp])

  return {
    renderedImageData: {
      ...initImg,
      editData: {
        ...editData,
        position,
        scale: scale,
        rotation,
      },
      width: renderedFrameSize?.width || 0,
      height: renderedFrameSize?.height || 0,
    },
    newImageData: {
      ...initImg,
      editData: {
        ...editData,
        position: {
          x: position.x / (renderedFrameSize?.width || 0),
          y: position.y / (renderedFrameSize?.height || 0),
        },
        scale: (scale * (renderedFrameSize?.width || 0)) / (initImg.width || 0),
        rotation,
      },
      width: currentFrame?.width || 0,
      height: currentFrame?.height || 0,
    },
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
  }
}
