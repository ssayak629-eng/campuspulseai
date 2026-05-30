import { cosineSimilarity } from "../embeddings/cosineSimilarity.js";

/**
 * Semantic score: cosine similarity between user embedding and event embedding.
 * Returns a value in [0, 1].
 */
export function computeSemanticScore(userEmbedding, eventEmbedding, user = null, event = null) {
  if (userEmbedding && eventEmbedding && userEmbedding.length > 0 && eventEmbedding.length > 0) {
    return cosineSimilarity(userEmbedding, eventEmbedding);
  }

  // Fallback to keyword-based semantic overlap score
  if (!user || !event) return 0.3; // default neutral fallback

  const userInterests = (user.interests ?? []).map((x) => x.toLowerCase());
  const userSkills = (user.skills ?? []).map((x) => x.toLowerCase());
  const eventTags = (event.tags ?? []).map((x) => x.toLowerCase());
  const title = (event.title ?? "").toLowerCase();
  const desc = (event.description ?? "").toLowerCase();
  const category = (event.category ?? "").toLowerCase();

  let matches = 0;
  const totalKeywords = userInterests.length + userSkills.length;

  if (totalKeywords === 0) return 0.5; // neutral fallback

  // 1. Check user interests in event tags, title, description, category
  for (const interest of userInterests) {
    if (eventTags.includes(interest)) {
      matches += 1.0;
    } else if (title.includes(interest) || desc.includes(interest)) {
      matches += 0.7;
    } else if (category.includes(interest)) {
      matches += 0.5;
    }
  }

  // 2. Check user skills in event tags, title, description
  for (const skill of userSkills) {
    if (eventTags.includes(skill)) {
      matches += 0.8;
    } else if (desc.includes(skill) || title.includes(skill)) {
      matches += 0.6;
    }
  }

  // Normalize
  const score = matches / totalKeywords;
  
  // Scale score to have a healthy base (e.g., minimum 0.25, max 0.95)
  return Math.min(0.95, Math.max(0.25, score));
}
