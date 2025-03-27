import sharp from "sharp"

interface EmbeddingResponse {
  embeddings: number[][]
}

interface GetEmbeddingParams {
  filePath?: string
  text?: string | string[]
}

export async function getEmbedding({ filePath, text }: GetEmbeddingParams): Promise<number[]> {
  if (!filePath && !text) {
    throw new Error("Either filePath or text must be provided")
  }

  const API_URL = "http://localhost:11435/api/embed"
  const MODEL = "hf-hub:laion/CLIP-ViT-B-32-laion2B-s34B-b79K"

  if (filePath) {
    // Handle image embedding
    // Using sharp, if it's not a jpeg, convert it to a jpeg and resize to be no more than 512px on the longest side
    let image = sharp(filePath)
    image = image.jpeg({ quality: 80, progressive: true })
    image = image.resize(512, 512, { fit: "inside" })
    const imageBuffer = await image.toBuffer()

    const formData = new FormData()
    const fileName = filePath.split("/").pop() || "image.jpg"
    formData.append("image", new Blob([imageBuffer], { type: "application/octet-stream" }), fileName)
    // Create data as an array with one object to match Python's tuple structure
    formData.append("data", new Blob([JSON.stringify([{ model: MODEL }])], { type: "application/json" }), "data")

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to get image embedding: ${response.statusText}`)
    }

    const data = (await response.json()) as EmbeddingResponse
    return data.embeddings[0]
  } else if (text) {
    // Handle text embedding - support both single string and array of strings
    const input = Array.isArray(text) ? text : [text]
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        input: input,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get text embedding: ${response.statusText}`)
    }

    const data = (await response.json()) as EmbeddingResponse
    return data.embeddings[0]
  }

  throw new Error("Unreachable code")
}
