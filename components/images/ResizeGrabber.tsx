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
        return { top: "-15px", left: "-15px" }
      case "top-right":
        return { top: "-15px", right: "-15px" }
      case "bottom-left":
        return { bottom: "-15px", left: "-15px" }
      case "bottom-right":
        return { bottom: "-15px", right: "-15px" }
    }
  }

  return (
    <div
      className={`absolute w-10 h-10 bg-black flex items-center justify-center z-30 ${getCursorStyle()}`}
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
