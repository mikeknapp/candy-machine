const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
}

module.exports = createJestConfig(customJestConfig)
