import { getBestImageSize, suggestImageModification } from "@/lib/image"
import { describe, expect, it } from "@jest/globals"
import { Image, ImageStatus } from "@prisma/client"
import sharp from "sharp"

// Save original sharp module
const originalSharp = sharp

// Create a mock function factory to generate metadata responses for testing
const createMetadataMock = (width: number, height: number) => async () => ({
  width,
  height,
})

// Create a mock Image object factory
const createMockImage = (width: number, height: number): Image => {
  const aspectRatio = width / height
  return {
    id: 1,
    projectId: 1,
    extension: "jpg",
    originalWidth: width,
    originalHeight: height,
    originalFileSize: 0,
    originalAspectRatio: aspectRatio,
    width: width,
    height: height,
    fileSize: 0,
    aspectRatio: aspectRatio,
    hash: "",
    embedding: Buffer.from([]),
    editData: null,
    rating: null,
    status: ImageStatus.INDEXED,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

describe("Image Modification Tests", () => {
  // Test case definition interface
  interface TestCase {
    name: string
    imageWidth: number
    imageHeight: number
    frameWidth: number
    frameHeight: number
    expectedWidth: number
    expectedHeight: number
    expectedX: number
    expectedY: number
    expectedRotation: number
  }

  // Test case for getBestImageSize
  interface GetBestImageSizeTestCase {
    name: string
    imageWidth: number
    imageHeight: number
    expectedFrameName: string
  }

  // Run a single test case
  async function runTestCase(testCase: TestCase) {
    const mockImage = createMockImage(testCase.imageWidth, testCase.imageHeight)
    const metadataMock = createMetadataMock(testCase.imageWidth, testCase.imageHeight)

    // Override the getBestImageSize function for testing
    mockImage.width = testCase.frameWidth
    mockImage.height = testCase.frameHeight
    mockImage.aspectRatio = testCase.frameWidth / testCase.frameHeight

    const result = await suggestImageModification(mockImage, "test-image-path", metadataMock)

    expect(result.width).toBe(testCase.expectedWidth)
    expect(result.height).toBe(testCase.expectedHeight)
    expect(result.x).toBe(testCase.expectedX)
    expect(result.y).toBe(testCase.expectedY)
    expect(result.rotation).toBe(testCase.expectedRotation)
  }

  // Run a single test case for getBestImageSize
  function runGetBestImageSizeTestCase(testCase: GetBestImageSizeTestCase) {
    const mockImage = createMockImage(testCase.imageWidth, testCase.imageHeight)
    const result = getBestImageSize(mockImage)
    expect(result.name).toBe(testCase.expectedFrameName)
  }

  describe("getBestImageSize", () => {
    const testCases: GetBestImageSizeTestCase[] = [
      {
        name: "Large image with 16:9 aspect ratio",
        imageWidth: 1920,
        imageHeight: 1080,
        expectedFrameName: "widescreen (16:9)",
      },
      {
        name: "Medium image with 4:5 aspect ratio",
        imageWidth: 800,
        imageHeight: 1000,
        expectedFrameName: "square (1:1)",
      },
      {
        name: "Large image that should use a portrait size",
        imageWidth: 1080,
        imageHeight: 1439,
        expectedFrameName: "photo (3:4)",
      },
      {
        name: "Small image (420x560) - should choose frame with minimal whitespace",
        imageWidth: 420,
        imageHeight: 560,
        expectedFrameName: "square (1:1)",
      },
      {
        name: "Small image (300x400) - should choose frame with minimal whitespace",
        imageWidth: 300,
        imageHeight: 400,
        expectedFrameName: "photo (3:4)",
      },
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, () => {
        runGetBestImageSizeTestCase(testCase)
      })
    })
  })

  describe("suggestImageModification", () => {
    const testCases: TestCase[] = [
      {
        name: "Large image (1600x999 in 1820x1024 frame)",
        imageWidth: 1600,
        imageHeight: 999,
        frameWidth: 1820,
        frameHeight: 1024,
        expectedWidth: 1600,
        expectedHeight: 999,
        expectedX: 110,
        expectedY: 25,
        expectedRotation: 0,
      },
      {
        name: "Small square image (400x400 in 1024x1024 frame)",
        imageWidth: 400,
        imageHeight: 400,
        frameWidth: 1024,
        frameHeight: 1024,
        expectedWidth: 400,
        expectedHeight: 400,
        expectedX: 312,
        expectedY: 624,
        expectedRotation: 0,
      },
      {
        name: "Smaller image (800x500 in 1536x1024 frame)",
        imageWidth: 800,
        imageHeight: 500,
        frameWidth: 1536,
        frameHeight: 1024,
        expectedWidth: 800,
        expectedHeight: 500,
        expectedX: 112,
        expectedY: 524,
        expectedRotation: 0,
      },
    ]

    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        await runTestCase(testCase)
      })
    })
  })
})
