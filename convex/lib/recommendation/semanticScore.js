import { cosineSimilarity } from "../embeddings/cosineSimilarity.js";

/**
 * Semantic score: cosine similarity between user embedding and event embedding.
 * Returns a value in [0, 1].
 */
export function computeSemanticScore(userEmbedding, eventEmbedding, user = null, event = null) {
  if (userEmbedding && eventEmbedding && userEmbedding.length > 0 && eventEmbedding.length > 0 && userEmbedding.length === eventEmbedding.length) {
    const rawSim = cosineSimilarity(userEmbedding, eventEmbedding);
    
    // Contrast stretching: Gemini text-embedding-004 vectors are highly clustered (typically 0.60 to 0.78).
    // Mapping the range [0.58, 0.78] to [0.0, 1.0] dynamically stretches the scores for rich visual feedback.
    const minSim = 0.58;
    const maxSim = 0.78;
    
    let stretched = (rawSim - minSim) / (maxSim - minSim);
    stretched = Math.max(0, Math.min(1, stretched)); // Clamp to [0, 1]
    
    // Scale stretched similarity into a healthy display range of [0.15, 0.98]
    return 0.15 + stretched * (0.98 - 0.15);
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
  let totalWeights = 0;

  // 1. Check user interests in event tags, title, description, category (robust substring matches)
  if (userInterests.length > 0) {
    totalWeights += 1.0;
    let interestMatches = 0;
    for (const interest of userInterests) {
      if (eventTags.some(tag => tag.includes(interest) || interest.includes(tag))) {
        interestMatches += 1.0;
      } else if (title.includes(interest) || desc.includes(interest)) {
        interestMatches += 0.7;
      } else if (category.includes(interest) || interest.includes(category)) {
        interestMatches += 0.6;
      }
      // Add soft category mapping for interests
      else if (category === "technology" && (interest.includes("intel") || interest.includes("learn") || interest.includes("web") || interest.includes("app") || interest.includes("cyber") || interest.includes("cloud") || interest.includes("block") || interest.includes("game") || interest.includes("robot") || interest.includes("iot") || interest.includes("source"))) {
        interestMatches += 0.55;
      } else if (category === "design" && (interest.includes("design") || interest.includes("art") || interest.includes("photo") || interest.includes("film") || interest.includes("media"))) {
        interestMatches += 0.55;
      } else if (category === "sports" && (interest.includes("sport") || interest.includes("fit") || interest.includes("yoga") || interest.includes("dance"))) {
        interestMatches += 0.55;
      } else if (category === "business" && (interest.includes("business") || interest.includes("entrepreneur") || interest.includes("finance") || interest.includes("market"))) {
        interestMatches += 0.55;
      }
    }
    matches += (interestMatches / userInterests.length) * 1.0;
  }

  // 2. Check user skills in event tags, title, description (robust substring matches)
  if (userSkills.length > 0) {
    totalWeights += 1.0;
    let skillMatches = 0;
    for (const skill of userSkills) {
      if (eventTags.some(tag => tag.includes(skill) || skill.includes(tag))) {
        skillMatches += 0.8;
      } else if (desc.includes(skill) || title.includes(skill)) {
        skillMatches += 0.6;
      }
      // Add soft category mapping for tech skills
      else if (category === "technology" && (skill.includes("python") || skill.includes("java") || skill.includes("react") || skill.includes("node") || skill.includes("ml") || skill.includes("data") || skill.includes("design") || skill.includes("model"))) {
        skillMatches += 0.5;
      }
    }
    matches += (skillMatches / userSkills.length) * 1.0;
  }

  // 3. Department Soft Alignment Matching
  if (user.department && event.category) {
    totalWeights += 0.5; // Department has a 0.5 weight in fallback matches
    const dept = user.department.toLowerCase();
    const cat = event.category.toLowerCase();
    const eventTagsStr = eventTags.join(" ");
    
    let deptMatch = 0.2; // Base fallback match
    
    // Tech / Engineering Departments
    if (dept.includes("computer") || dept.includes("cse") || dept.includes("tech") || dept.includes("it") || dept.includes("electro") || dept.includes("ece") || dept.includes("math") || dept.includes("physics")) {
      if (cat.includes("hackathon") || cat.includes("workshop") || eventTagsStr.includes("ai") || eventTagsStr.includes("ml") || eventTagsStr.includes("cyber") || eventTagsStr.includes("code")) {
        deptMatch = 0.9;
      } else if (cat.includes("design") || eventTagsStr.includes("ui") || eventTagsStr.includes("ux")) {
        deptMatch = 0.5;
      } else {
        deptMatch = 0.3;
      }
    }
    // Business / Econ Departments
    else if (dept.includes("business") || dept.includes("admin") || dept.includes("econ") || dept.includes("finance") || dept.includes("market")) {
      if (cat.includes("entrepreneur") || cat.includes("startup") || eventTagsStr.includes("business") || eventTagsStr.includes("pitch")) {
        deptMatch = 0.9;
      } else if (cat.includes("workshop")) {
        deptMatch = 0.5;
      } else {
        deptMatch = 0.3;
      }
    }
    // Arts / Design Departments
    else if (dept.includes("art") || dept.includes("design") || dept.includes("psych") || dept.includes("media") || dept.includes("write")) {
      if (cat.includes("design") || eventTagsStr.includes("ui") || eventTagsStr.includes("ux") || eventTagsStr.includes("art") || eventTagsStr.includes("media")) {
        deptMatch = 0.9;
      } else if (cat.includes("entrepreneur") || eventTagsStr.includes("startup")) {
        deptMatch = 0.5;
      } else {
        deptMatch = 0.3;
      }
    }
    
    matches += deptMatch * 0.5;
  }

  let score = 0; // start from zero; will be set if matches exist
  if (totalWeights > 0) {
    score = matches / totalWeights;
  }

  // 4. Deterministic fuzzer based on event ID to create natural variation [0% to 6%]
  let fuzzer = 0;
  if (event._id) {
    const idStr = String(event._id);
    let charSum = 0;
    for (let i = 0; i < idStr.length; i++) {
      charSum += idStr.charCodeAt(i);
    }
    fuzzer = (charSum % 7) / 100;
  }

  score += fuzzer;
  
  // Linear scaling instead of minimum clamp to prevent identical locked scores: [0.12, 0.95]
  return 0.12 + score * (0.95 - 0.12);
}
