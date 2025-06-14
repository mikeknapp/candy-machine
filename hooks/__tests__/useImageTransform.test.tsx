import { ImageEditData } from "@/app/actions/images"
import { beforeAll, describe, expect, it } from "@jest/globals"
import { ImageStatus, Image as ImageType } from "@prisma/client"
import { act, renderHook } from "@testing-library/react"
import { RefObject } from "react"
import { useImageTransform } from "../useImageTransform"

// Need to set up jsdom for createRef to work properly
beforeAll(() => {
  // Mock document.createElement
  global.document = {
    createElement: () => ({
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
      }),
    }),
  } as any
})

describe("useImageTransform", () => {
  const mockImage: ImageType = {
    id: 1,
    projectId: 1,
    extension: "jpg",
    originalWidth: 999,
    originalHeight: 1140,
    originalFileSize: 1000,
    originalAspectRatio: 0.876315789,
    width: 1024,
    height: 1280,
    fileSize: 1000,
    aspectRatio: 0.8,
    hash: "test-hash",
    embedding: Buffer.from([]),
    editData: {
      position: { x: 13, y: 110 },
      scale: 1,
      rotation: 0,
      flippedY: false,
      flippedX: false,
    } as unknown as any, // Need to cast to any since Prisma's Json type is too strict
    rating: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ImageStatus.INDEXED,
  }

  const mockFrameSize = {
    width: 800,
    height: 600,
  }

  // Create a ref with a mocked div that has getBoundingClientRect
  const createDivRef = () => {
    const mockDiv = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
      }),
    } as HTMLDivElement

    return {
      current: mockDiv,
    } as RefObject<HTMLDivElement>
  }

  const defaultProps = {
    initImg: mockImage,
    renderedFrameSize: mockFrameSize,
    editMode: true,
    imageRef: createDivRef(),
  }

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useImageTransform(defaultProps))

    const editData = result.current.renderedImageData.editData as ImageEditData
    expect(editData).toEqual({
      position: { x: 13, y: 110 },
      scale: 1,
      rotation: 0,
      flippedY: false,
      flippedX: false,
    })
    expect(result.current.isDragging).toBe(false)
    expect(result.current.isResizing).toBe(false)
    expect(result.current.isRotating).toBe(false)
  })

  it("should handle drag operations", () => {
    const { result } = renderHook(() => useImageTransform(defaultProps))

    act(() => {
      result.current.handleDragStart(100, 100)
    })

    expect(result.current.isDragging).toBe(true)

    act(() => {
      result.current.handleMouseMove({
        clientX: 150,
        clientY: 150,
      } as MouseEvent)
    })

    const editData = result.current.renderedImageData.editData as ImageEditData
    expect(editData.position).toEqual({
      x: expect.any(Number),
      y: expect.any(Number),
    })

    act(() => {
      result.current.handleMouseUp()
    })

    expect(result.current.isDragging).toBe(false)
  })

  it("should handle resize operations", () => {
    const { result } = renderHook(() => useImageTransform(defaultProps))

    act(() => {
      result.current.handleResizeStart(100, 100, "top-left")
    })

    expect(result.current.isResizing).toBe(true)

    act(() => {
      result.current.handleMouseMove({
        clientX: 50,
        clientY: 50,
      } as MouseEvent)
    })

    const editData = result.current.renderedImageData.editData as ImageEditData
    expect(editData.scale).toBeLessThanOrEqual(1)
    expect(editData.scale).toBeGreaterThan(0)

    act(() => {
      result.current.handleMouseUp()
    })

    expect(result.current.isResizing).toBe(false)
  })

  it("should handle rotation operations", () => {
    const { result } = renderHook(() => useImageTransform(defaultProps))

    act(() => {
      result.current.handleRotateStart(100, 100)
    })

    expect(result.current.isRotating).toBe(true)

    act(() => {
      result.current.handleMouseMove({
        clientX: 150,
        clientY: 150,
      } as MouseEvent)
    })

    const editData = result.current.renderedImageData.editData as ImageEditData
    expect(editData.rotation).not.toBe(0)

    act(() => {
      result.current.handleMouseUp()
    })

    expect(result.current.isRotating).toBe(false)
  })

  it("should handle zoom operations", () => {
    const { result } = renderHook(() => useImageTransform(defaultProps))

    act(() => {
      result.current.handleZoomIn()
    })

    const editData = result.current.renderedImageData.editData as ImageEditData
    const scaleAfterZoomIn = editData.scale
    expect(scaleAfterZoomIn).toBeGreaterThan(1)

    act(() => {
      result.current.handleZoomOut()
    })

    const editDataAfterZoomOut = result.current.renderedImageData.editData as ImageEditData
    expect(editDataAfterZoomOut.scale).toBeLessThan(scaleAfterZoomIn)
  })

  it("should handle touch events", () => {
    const { result } = renderHook(() => useImageTransform(defaultProps))

    act(() => {
      result.current.handleDragStart(100, 100)
    })

    const touchEvent = {
      touches: [{ clientX: 150, clientY: 150 }],
      changedTouches: [],
      targetTouches: [],
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as unknown as TouchEvent

    act(() => {
      result.current.handleTouchMove(touchEvent)
    })

    const editData = result.current.renderedImageData.editData as ImageEditData
    expect(editData.position).toEqual({
      x: expect.any(Number),
      y: expect.any(Number),
    })
  })

  it("should not allow transformations when editMode is false", () => {
    const { result } = renderHook(() =>
      useImageTransform({
        ...defaultProps,
        editMode: false,
      })
    )

    act(() => {
      result.current.handleDragStart(100, 100)
    })

    expect(result.current.isDragging).toBe(false)

    act(() => {
      result.current.handleResizeStart(100, 100, "top-left")
    })

    expect(result.current.isResizing).toBe(false)

    act(() => {
      result.current.handleRotateStart(100, 100)
    })

    expect(result.current.isRotating).toBe(false)

    act(() => {
      result.current.handleZoomIn()
    })

    const editData = result.current.renderedImageData.editData as ImageEditData
    expect(editData.scale).toBe(1)
  })

  it("should calculate correct newImageData values", () => {
    const { result } = renderHook(() => useImageTransform(defaultProps))

    const newImageData = result.current.newImageData
    const editData = newImageData.editData as ImageEditData

    expect(editData.position).toEqual({
      x: 343,
      y: 23,
    })
    expect(editData.scale).toEqual(0.78125)
    expect(newImageData.width).toBe(800)
    expect(newImageData.height).toBe(600)
  })
})
