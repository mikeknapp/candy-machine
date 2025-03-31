import { Image, ImageStatus } from "@prisma/client"
import sharp from "sharp"
import { suggestImageModification } from "./image"

// Save original sharp module
const originalSharp = sharp

// Create a mock sharp function to avoid file system access
// @ts-ignore - We need to override this for testing
global.sharp = function () {
  return {
    metadata: async () => {
      return {
        width: 1600,
        height: 999,
      }
    },
  }
}

// Create a mock Image object
const mockImage: Image = {
  id: 1,
  projectId: 1,
  extension: "jpg",
  originalWidth: 1600,
  originalHeight: 999,
  originalFileSize: 0,
  originalAspectRatio: 1600 / 999,
  width: 1600,
  height: 999,
  fileSize: 0,
  aspectRatio: 1600 / 999,
  hash: "",
  embedding: Buffer.from([]),
  editData: null,
  rating: null,
  status: ImageStatus.INDEXED,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export async function runTests() {
  console.log("Running tests for getSuggestedImageModification")

  try {
    // Test the example case (1600x999 image in 1536x1024 frame)
    const result = await suggestImageModification(mockImage, "test-image-path", async () => ({
      width: 1600,
      height: 999,
    }))

    console.log("Test result:", result)

    // Expected values based on the example
    const expectedWidth = 1536
    const expectedHeight = 959 // (999 / 1600) * 1536 = ~959.4, rounded down
    const expectedX = 0 // Based on your example
    const expectedY = 65 // 1024 - 959 = 65 (bottom-aligned)

    // Verify results
    console.assert(result.width === expectedWidth, `Width mismatch: expected ${expectedWidth}, got ${result.width}`)

    console.assert(
      result.height === expectedHeight,
      `Height mismatch: expected ${expectedHeight}, got ${result.height}`
    )

    console.assert(result.x === expectedX, `X position mismatch: expected ${expectedX}, got ${result.x}`)

    console.assert(result.y === expectedY, `Y position mismatch: expected ${expectedY}, got ${result.y}`)

    console.assert(result.rotation === 0, `Rotation mismatch: expected 0, got ${result.rotation}`)

    if (
      result.width === expectedWidth &&
      result.height === expectedHeight &&
      result.x === expectedX &&
      result.y === expectedY &&
      result.rotation === 0
    ) {
      console.log("✅ Test passed!")
    } else {
      console.log("❌ Test failed!")
    }

    // Test smaller image that shouldn't be scaled up
    const smallerResult = await suggestImageModification(mockImage, "smaller-image", async () => ({
      width: 800,
      height: 500,
    }))

    console.log("Smaller image test result:", smallerResult)

    // Small image should maintain its original dimensions
    console.assert(
      smallerResult.width === 800,
      `Small image width should be original: expected 800, got ${smallerResult.width}`
    )

    console.assert(
      smallerResult.height === 500,
      `Small image height should be original: expected 500, got ${smallerResult.height}`
    )

    // Should be aligned to the bottom
    console.assert(smallerResult.y === 524, `Small image Y position: expected 524 (1024-500), got ${smallerResult.y}`)
  } catch (error) {
    console.error("Test failed with error:", error)
    throw error // Re-throw to signal test failure
  } finally {
    // Restore original sharp implementation
    // @ts-ignore
    global.sharp = originalSharp
  }
}

// The tests will be run by the test runner
// runTests().catch(console.error)

// Export a function that can be called to run the tests
export const runImageTests = runTests
