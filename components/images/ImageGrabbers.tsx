import { RotateCw } from "lucide-react"
import { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"

export type GrabberPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right"

type GrabberProps = {
  position: GrabberPosition
  onGrab: (e: ReactMouseEvent | ReactTouchEvent) => void
}

export const grabberCorners: GrabberPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"]

export const ResizeGrabber = ({ position, onGrab }: GrabberProps) => {
  // Define cursor style based on position
  const getCursorStyle = () => {
    switch (position) {
      case "top-left":
        return "cursor-nwse-resize"
      case "top-right":
        return "cursor-nesw-resize"
      case "bottom-left":
        return "cursor-nesw-resize"
      case "bottom-right":
        return "cursor-nwse-resize"
    }
  }

  // Define position styles
  const getPositionStyle = () => {
    switch (position) {
      case "top-left":
        return { top: `-25px`, left: `-25px` }
      case "top-right":
        return { top: `-25px`, right: `-25px` }
      case "bottom-left":
        return { bottom: `-25px`, left: `-25px` }
      case "bottom-right":
        return { bottom: `-25px`, right: `-25px` }
    }
  }

  return (
    <div
      className={`absolute w-10 h-10 bg-black flex items-center justify-center z-50 ${getCursorStyle()}`}
      style={getPositionStyle()}
      onMouseDown={(e) => {
        e.stopPropagation()
        onGrab(e)
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        if (e.touches.length === 1) {
          onGrab(e)
        }
      }}
    ></div>
  )
}

export const RotateGrabber = ({ handleRotateStart }: { handleRotateStart: (x: number, y: number) => void }) => {
  return (
    <div
      className={`absolute w-10 h-10 bg-pink-500 flex items-center justify-center cursor-pointer z-30 rounded-full`}
      style={{
        right: `-60px`,
        top: "50%",
        transform: "translateY(-50%)",
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        handleRotateStart(e.clientX, e.clientY)
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        if (e.touches.length === 1) {
          handleRotateStart(e.touches[0].clientX, e.touches[0].clientY)
        }
      }}
    >
      <RotateCw className="w-10 h-10 text-white" />
    </div>
  )
}
