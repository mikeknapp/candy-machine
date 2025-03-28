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
