export type ImageSize = {
  width: number
  height: number
  aspectRatio: number
  name: string
}

export const imageSizes: Record<string, ImageSize> = {
  square: {
    width: 1024,
    height: 1024,
    aspectRatio: 1,
    name: "square (1:1)",
  },
  vertical: {
    width: 1024,
    height: 1820,
    aspectRatio: 0.5625,
    name: "vertical (9:16)",
  },
  portrait: {
    width: 1024,
    height: 1280,
    aspectRatio: 0.8,
    name: "portrait (4:5)",
  },
  photo: {
    width: 1024,
    height: 1365,
    aspectRatio: 0.75,
    name: "photo (3:4)",
  },
  photo_landscape: {
    width: 1365,
    height: 1024,
    aspectRatio: 1.3333333333333333,
    name: "photo landscape (4:3)",
  },
  landscape: {
    width: 1536,
    height: 1024,
    aspectRatio: 1.5,
    name: "landscape (3:2)",
  },
  widescreen: {
    width: 1820,
    height: 1024,
    aspectRatio: 1.7777777777777777,
    name: "widescreen (16:9)",
  },
  cinematic: {
    width: 2389,
    height: 1024,
    aspectRatio: 2.3333333333333335,
    name: "cinematic (21:9)",
  },
}
