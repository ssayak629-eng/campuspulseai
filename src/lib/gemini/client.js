import { GoogleGenerativeAI } from "@google/generative-ai";

let genAIInstance = null;

export function getGeminiClient() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to your .env.local file."
      );
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

export function getGeminiModel(modelName = "gemini-2.5-flash") {
  return getGeminiClient().getGenerativeModel({ model: modelName });
}

export function getEmbeddingModel() {
  return getGeminiClient().getGenerativeModel({ model: "text-embedding-004" });
}
