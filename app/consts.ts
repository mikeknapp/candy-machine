import { join } from "path"

let dbRawPath = process.env.DATABASE_URL ?? ":memory:"

if (dbRawPath === ":memory:") {
  console.warn("DATABASE_URL is not set, using in-memory database")
} else {
  dbRawPath = join(process.cwd(), "prisma", dbRawPath.replace("file:", ""))
}

export const dbPath = dbRawPath

console.log("dbPath", dbPath)
