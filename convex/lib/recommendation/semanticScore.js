import { cosineSimilarity } from "../embeddings/cosineSimilarity.js";

/**
 * Semantic score: cosine similarity between user embedding and event embedding.
 * Returns a value in [0, 1].
 */
export function computeSemanticScore(userEmbedding, eventEmbedding) {
  if (!userEmbedding || !eventEmbedding) return 0.3; // default neutral score
  return cosineSimilarity(userEmbedding, eventEmbedding);
}
