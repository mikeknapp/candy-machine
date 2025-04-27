import { GrabberPosition } from "@/components/images/ImageGrabbers"
import {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from "react"

/**
 * A custom React hook that manages image transformations including drag, resize, rotate, and zoom operations.
 * This hook is designed to work with an image editor interface where users can manipulate images within a frame.
 *
 * Key Concepts:
 * - Scale vs FrameScale:
 *   - scale: The logical zoom level of the image (1.0 = 100% of frame size)
 *   - frameScaleFactor: A scaling factor applied by the frame component for display purposes
 *   - displayScale: The actual rendered scale (scale * frameScaleFactor) used in CSS transforms
 *
 * - Coordinate Systems:
 *   - position: Represents the image's offset from the frame's center in pixels
 *   - All transformations (drag, resize, rotate) are performed relative to the frame's center
 */

interface UseImageTransformProps {
  initialPosition?: { x: number; y: number }
  initialScale?: number
  initialRotation?: number
  originalImageSize: { width: number; height: number }
  frameSize: { width: number; height: number } // virtual frame size
  renderedFrameSize?: { width: number; height: number } // actual rendered size
  editMode: boolean
  imageRef: RefObject<HTMLDivElement>
}

/**
 * Return type containing all transformation state and handlers
 */
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
  renderedFrameSize,
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

  /**
   * Calculates the maximum allowed scale based on the original image resolution
   * This ensures users can zoom in until they see the image at its native resolution
   * but prevents excessive zooming that would only show pixelation
   */
  const calculateMaxScale = useCallback(() => {
    if (originalImageSize.width === 0 || frameSize.width === 0 || frameSize.width / frameSize.height > 1) return 3 // Default max

    // Max scale allows zooming until the original image pixel density matches the frame pixel density
    const maxScaleFactor = originalImageSize.width / (frameSize.width / frameSize.height)
    return Math.max(3, maxScaleFactor) // Ensure max scale is at least 3x, but allow zooming to original resolution
  }, [originalImageSize.width, frameSize.width, frameSize.height])

  /**
   * Initiates image dragging operation
   * Stores initial cursor position and image position for delta calculations
   */
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

  /**
   * Initiates image resizing operation from a corner grabber
   * Stores initial cursor position and scale for transformation calculations
   */
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

  /**
   * Initiates image rotation operation
   * Stores initial cursor position and rotation angle for angular calculations
   */
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

  // Calculate the scale factor between virtual and rendered frame sizes
  const renderScaleX = renderedFrameSize ? renderedFrameSize.width / frameSize.width : 1
  const renderScaleY = renderedFrameSize ? renderedFrameSize.height / frameSize.height : 1
  // Use the smaller scale to maintain aspect ratio
  const renderScale = Math.min(renderScaleX, renderScaleY)

  /**
   * Handles all mouse movement during transformations
   * - For dragging: Updates position based on cursor movement
   * - For resizing: Updates scale based on distance from center
   * - For rotation: Updates rotation based on angle from center
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
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        // Adjust distances by renderScale so logical scale is correct
        const startDist = Math.sqrt(
          Math.pow((dragStart.x - centerX) / renderScale, 2) + Math.pow((dragStart.y - centerY) / renderScale, 2)
        )
        const currentDist = Math.sqrt(
          Math.pow((e.clientX - centerX) / renderScale, 2) + Math.pow((e.clientY - centerY) / renderScale, 2)
        )

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
      renderScale,
    ]
  )

  /**
   * Adapts touch events to use the same transformation logic as mouse events
   * Only handles single-touch gestures
   */
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

  /**
   * Resets all transformation states when mouse/touch interaction ends
   */
  const handleMouseUp = useCallback(() => {
    // Always reset flags on mouse up, regardless of editMode
    if (isDragging) setIsDragging(false)
    if (isResizing) setIsResizing(false)
    if (isRotating) setIsRotating(false)
    setResizingCorner(null)
  }, [isDragging, isResizing, isRotating]) // Dependencies are the state flags

  /**
   * Increases image scale by 10%, up to the maximum allowed scale
   */
  const handleZoomIn = useCallback(() => {
    if (!editMode) return
    const maxScale = calculateMaxScale()
    setScale((prev) => Math.min(prev * 1.1, maxScale)) // Multiplicative zoom
  }, [editMode, calculateMaxScale])

  /**
   * Decreases image scale by 10%, down to a minimum of 0.1
   */
  const handleZoomOut = useCallback(() => {
    if (!editMode) return
    setScale((prev) => Math.max(prev / 1.1, 0.1)) // Multiplicative zoom
  }, [editMode])

  // Calculate the actual scale used for rendering, which includes the frame's scaling factor
  const displayScale = scale * renderScale

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
