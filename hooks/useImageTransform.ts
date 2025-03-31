import { GrabberPosition } from "@/components/images/ImageGrabbers"
import {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from "react"

interface UseImageTransformProps {
  initialPosition?: { x: number; y: number }
  initialScale?: number
  initialRotation?: number
  originalImageSize: { width: number; height: number }
  frameSize: { width: number; height: number }
  frameScaleFactor: number
  editMode: boolean
  imageRef: RefObject<HTMLDivElement>
}

export interface UseImageTransformReturn {
  position: { x: number; y: number }
  scale: number
  rotation: number
  displayScale: number // Scale adjusted for UI rendering
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
  setScale: (scale: number | ((prevScale: number) => number)) => void // Expose setScale
  setPosition: (
    position: { x: number; y: number } | ((prevPosition: { x: number; y: number }) => { x: number; y: number })
  ) => void // Expose setPosition
}

export const useImageTransform = ({
  initialPosition = { x: 0, y: 0 },
  initialScale = 1,
  initialRotation = 0,
  originalImageSize,
  frameSize,
  frameScaleFactor,
  editMode,
  imageRef,
}: UseImageTransformProps): UseImageTransformReturn => {
  const [position, setPosition] = useState(initialPosition)
  const [scale, setScale] = useState(initialScale)
  const [rotation, setRotation] = useState(initialRotation)

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const [startScale, setStartScale] = useState(1)
  const [startRotation, setStartRotation] = useState(0)
  const [resizingCorner, setResizingCorner] = useState<GrabberPosition | null>(null)

  // Calculate the maximum scale based on original image size
  const calculateMaxScale = useCallback(() => {
    if (originalImageSize.width === 0 || frameSize.width === 0 || frameScaleFactor === 0) return 3 // Default max

    // Max scale allows zooming until the original image pixel density matches the frame pixel density
    const maxScaleFactor = originalImageSize.width / (frameSize.width / frameScaleFactor)
    return Math.max(3, maxScaleFactor) // Ensure max scale is at least 3x, but allow zooming to original resolution
  }, [originalImageSize.width, frameSize.width, frameScaleFactor])

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

  const handleMouseMove = useCallback(
    (e: MouseEvent | ReactMouseEvent) => {
      if (!editMode || (!isDragging && !isResizing && !isRotating)) return // Only process if in edit mode and an action is active

      if (isDragging) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y
        setPosition({
          x: startPosition.x + deltaX,
          y: startPosition.y + deltaY,
        })
      } else if (isResizing && resizingCorner) {
        if (!imageRef.current) return
        const rect = imageRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const startDist = Math.sqrt(Math.pow(dragStart.x - centerX, 2) + Math.pow(dragStart.y - centerY, 2))
        const currentDist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2))

        if (startDist === 0) return // Avoid division by zero

        const scaleRatio = currentDist / startDist
        const maxScale = calculateMaxScale()
        const newScale = Math.max(0.1, Math.min(maxScale, startScale * scaleRatio))
        setScale(newScale)
      } else if (isRotating) {
        if (!imageRef.current) return
        const rect = imageRef.current.getBoundingClientRect()
        // Calculate center based on the *transformed* element's bounding box
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Angle relative to image center
        const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX)
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
        let angleDiff = (currentAngle - startAngle) * (180 / Math.PI)

        setRotation(startRotation + angleDiff)
      }
    },
    [
      editMode,
      isDragging,
      isResizing,
      isRotating,
      dragStart,
      startPosition,
      startScale,
      startRotation,
      resizingCorner,
      imageRef,
      calculateMaxScale,
    ]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent | ReactTouchEvent) => {
      if (!editMode) return
      const touches = "touches" in e ? e.touches : undefined
      if (!touches || touches.length !== 1) return

      const touch = touches[0]

      // Reuse mouse move logic for touch
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as any) // Cast to satisfy type, logic is the same
    },
    [editMode, handleMouseMove] // Dependency on handleMouseMove
  )

  const handleMouseUp = useCallback(() => {
    // Always reset flags on mouse up, regardless of editMode
    if (isDragging) setIsDragging(false)
    if (isResizing) setIsResizing(false)
    if (isRotating) setIsRotating(false)
    setResizingCorner(null)
  }, [isDragging, isResizing, isRotating]) // Dependencies are the state flags

  const handleZoomIn = useCallback(() => {
    if (!editMode) return
    const maxScale = calculateMaxScale()
    setScale((prev) => Math.min(prev * 1.1, maxScale)) // Multiplicative zoom
  }, [editMode, calculateMaxScale])

  const handleZoomOut = useCallback(() => {
    if (!editMode) return
    setScale((prev) => Math.max(prev / 1.1, 0.1)) // Multiplicative zoom
  }, [editMode])

  // Display scale includes frame scaling factor for rendering
  // This scale is applied to the original image dimensions INSIDE the transformed div
  const displayScale = scale * frameScaleFactor

  // Effect to reset interaction state if editMode turns off
  useEffect(() => {
    if (!editMode) {
      handleMouseUp() // Ensure interactions stop
    }
  }, [editMode, handleMouseUp])

  return {
    position,
    scale, // The logical scale factor relative to original image size
    rotation,
    displayScale, // The scale factor used in the CSS transform (includes frameScaleFactor)
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
    setScale, // Expose setScale for parent component (e.g., for initial setting)
    setPosition, // Expose setPosition for parent component
  }
}
