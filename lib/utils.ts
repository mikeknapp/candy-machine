import { imageSizes } from "@/app/consts"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dot(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0)
}

export function arrayToBuffer(arr: number[], size = Float64Array.BYTES_PER_ELEMENT) {
  const buffer = Buffer.allocUnsafe(size * arr.length)
  arr.map((val, index) => buffer.writeDoubleLE(val, size * index))
  return buffer
}

export function bufferToArray(buffer: Buffer, size = Float64Array.BYTES_PER_ELEMENT) {
  let arr = []
  for (let i = 0; i < buffer.length / size; i++) arr.push(buffer.readDoubleLE(i * size))
  return arr
}

export function getFrameSizeKeyByDimensions(width: number, height: number): keyof typeof imageSizes | undefined {
  return (
    (Object.entries(imageSizes).find(
      ([_key, size]) => size.width === width && size.height === height
    )?.[0] as keyof typeof imageSizes) || undefined
  )
}

// Helper to fit frame inside container at 70% max, preserving aspect ratio
export function getFittedFrameSize(
  containerWidth: number,
  containerHeight: number,
  frameAspect: number,
  maxPercent: number = 0.7
) {
  const maxWidth = containerWidth * maxPercent
  const maxHeight = containerHeight * maxPercent

  if (maxWidth / frameAspect <= maxHeight) {
    // Width is the limiting factor
    return { width: maxWidth, height: maxWidth / frameAspect }
  } else {
    // Height is the limiting factor
    return { width: maxHeight * frameAspect, height: maxHeight }
  }
}
