#!/usr/bin/env ts-node
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { runImageTests } from "../lib/imageTest"

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

async function findTestFiles(dir: string, filePattern = /Test\.ts$/): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)

      // Skip node_modules, .next, and other build directories
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules" &&
        entry.name !== ".next"
      ) {
        return findTestFiles(fullPath, filePattern)
      } else if (entry.isFile() && filePattern.test(entry.name)) {
        return [fullPath]
      }
      return []
    })
  )

  return files.flat()
}

async function runTests() {
  try {
    const testFiles = await findTestFiles(rootDir)
    console.log(`Found ${testFiles.length} test files to run:`)

    let passedCount = 0
    let failedCount = 0

    for (const file of testFiles) {
      console.log(`\n📋 Running tests in ${path.relative(rootDir, file)}`)
      try {
        // Dynamic import of the test file
        const module = await import(`file://${file}`)

        // If the file exports a runTests function, call it
        if (typeof module.runTests === "function") {
          await module.runTests()
          console.log(`✅ Tests in ${path.relative(rootDir, file)} completed successfully`)
          passedCount++
        } else {
          console.log(`⚠️ No runTests function exported from ${path.relative(rootDir, file)}`)
          // If the file runs tests directly, consider it passed if no errors thrown
          if (path.basename(file).endsWith("Test.ts")) {
            passedCount++
          }
        }
      } catch (error) {
        console.error(`❌ Error running tests in ${path.relative(rootDir, file)}:`, error)
        failedCount++
      }
    }

    console.log(`\n📊 Test Summary: ${passedCount} passed, ${failedCount} failed`)

    if (failedCount > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error("Error running tests:", error)
    process.exit(1)
  }
}

// Run all tests
async function main() {
  try {
    console.log("Running image tests...")
    await runImageTests()
    console.log("All tests completed")
  } catch (error) {
    console.error("Error running tests:", error)
    process.exit(1)
  }
}

main()
