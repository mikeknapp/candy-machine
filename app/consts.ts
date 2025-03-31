import { join } from "path"

// Image sizes
const shortestSize = 1024

export const imageSizes = {
  square: {
    width: shortestSize,
    height: shortestSize,
    aspectRatio: 1,
    name: "square (1:1)",
  },
  vertical: {
    width: shortestSize,
    height: Math.round((shortestSize * 16) / 9),
    aspectRatio: 9 / 16,
    name: "vertical (9:16)",
  },
  portrait: {
    width: shortestSize,
    height: Math.round((shortestSize * 5) / 4),
    aspectRatio: 4 / 5,
    name: "portrait (4:5)",
  },
  photo: {
    width: Math.round((shortestSize * 4) / 3),
    height: shortestSize,
    aspectRatio: 3 / 4,
    name: "photo (3:4)",
  },
  photo_landscape: {
    width: Math.round((shortestSize * 3) / 4),
    height: shortestSize,
    aspectRatio: 4 / 3,
    name: "photo landscape (4:3)",
  },
  landscape: {
    width: Math.round((shortestSize * 3) / 2),
    height: shortestSize,
    aspectRatio: 3 / 2,
    name: "landscape (3:2)",
  },
  widescreen: {
    width: Math.round((shortestSize * 16) / 9),
    height: shortestSize,
    aspectRatio: 16 / 9,
    name: "widescreen (16:9)",
  },
  cinematic: {
    width: Math.round((shortestSize * 21) / 9),
    height: shortestSize,
    aspectRatio: 21 / 9,
    name: "cinematic (21:9)",
  },
}

// Database path
let dbRawPath = process.env.DATABASE_URL ?? ":memory:"

if (dbRawPath === ":memory:") {
  console.warn("DATABASE_URL is not set, using in-memory database")
} else {
  dbRawPath = join(process.cwd(), "prisma", dbRawPath.replace("file:", ""))
}

export const dbPath = dbRawPath
