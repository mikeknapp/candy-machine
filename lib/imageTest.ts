import { Image, ImageStatus } from "@prisma/client"
import sharp from "sharp"
import { suggestImageModification } from "./image"

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

// Run a single test case
async function runTestCase(testCase: TestCase) {
  console.log(`Running test: ${testCase.name}`)

  const mockImage = createMockImage(testCase.imageWidth, testCase.imageHeight)
  const metadataMock = createMetadataMock(testCase.imageWidth, testCase.imageHeight)

  // Override the getBestImageSize function for testing
  mockImage.width = testCase.frameWidth
  mockImage.height = testCase.frameHeight
  mockImage.aspectRatio = testCase.frameWidth / testCase.frameHeight

  const result = await suggestImageModification(mockImage, "test-image-path", metadataMock)

  console.log(`${testCase.name} result:`, result)

  // Verify results
  const passed =
    result.width === testCase.expectedWidth &&
    result.height === testCase.expectedHeight &&
    result.x === testCase.expectedX &&
    result.y === testCase.expectedY &&
    result.rotation === testCase.expectedRotation

  // Log individual assertions
  console.assert(
    result.width === testCase.expectedWidth,
    `Width mismatch: expected ${testCase.expectedWidth}, got ${result.width}`
  )
  console.assert(
    result.height === testCase.expectedHeight,
    `Height mismatch: expected ${testCase.expectedHeight}, got ${result.height}`
  )
  console.assert(
    result.x === testCase.expectedX,
    `X position mismatch: expected ${testCase.expectedX}, got ${result.x}`
  )
  console.assert(
    result.y === testCase.expectedY,
    `Y position mismatch: expected ${testCase.expectedY}, got ${result.y}`
  )
  console.assert(
    result.rotation === testCase.expectedRotation,
    `Rotation mismatch: expected ${testCase.expectedRotation}, got ${result.rotation}`
  )

  console.log(passed ? "✅ Test passed!" : "❌ Test failed!")

  return passed
}

export async function runTests() {
  console.log("Running tests for getSuggestedImageModification")

  try {
    // Define test cases
    const testCases: TestCase[] = [
      {
        name: "Large image (1600x999 in 1536x1024 frame)",
        imageWidth: 1600,
        imageHeight: 999,
        frameWidth: 1536,
        frameHeight: 1024,
        expectedWidth: 1536,
        expectedHeight: 959, // (999 / 1600) * 1536 ≈ 959.4, rounded down
        expectedX: 0, // centered: (1536 - 1536) / 2 = 0
        expectedY: 65, // 1024 - 959 = 65 (bottom-aligned)
        expectedRotation: 0,
      },
      {
        name: "Small square image (400x400 in 1024x1024 frame)",
        imageWidth: 400,
        imageHeight: 400,
        frameWidth: 1024,
        frameHeight: 1024,
        expectedWidth: 400, // Small, no scaling
        expectedHeight: 400, // Small, no scaling
        expectedX: 312, // centered: (1024 - 400) / 2 = 312
        expectedY: 624, // 1024 - 400 = 624 (bottom-aligned)
        expectedRotation: 0,
      },
      {
        name: "Smaller image (800x500 in 1536x1024 frame)",
        imageWidth: 800,
        imageHeight: 500,
        frameWidth: 1536,
        frameHeight: 1024,
        expectedWidth: 800, // Small, no scaling
        expectedHeight: 500, // Small, no scaling
        expectedX: 368, // centered: (1536 - 800) / 2 = 368
        expectedY: 524, // 1024 - 500 = 524 (bottom-aligned)
        expectedRotation: 0,
      },
    ]

    // Run all test cases
    let allPassed = true
    for (const testCase of testCases) {
      const passed = await runTestCase(testCase)
      allPassed = allPassed && passed
    }

    console.log(allPassed ? "🎉 All tests passed!" : "❌ Some tests failed!")
  } catch (error) {
    console.error("Tests failed with error:", error)
    throw error // Re-throw to signal test failure
  } finally {
    // Restore original sharp implementation
    // @ts-ignore
    global.sharp = originalSharp
  }
}

// Export a function that can be called to run the tests
export const runImageTests = runTests
