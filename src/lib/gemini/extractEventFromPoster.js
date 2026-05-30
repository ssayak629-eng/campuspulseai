import { getGeminiModel } from "./client";

/**
 * Extract event details from a poster image using Gemini Vision.
 * @param {string} base64Image - Base64-encoded image data
 * @param {string} mimeType - MIME type (e.g., "image/jpeg")
 * @returns {Object} Extracted event fields
 */
export async function extractEventFromPoster(base64Image, mimeType = "image/jpeg") {
  const model = getGeminiModel("gemini-1.5-flash");

  const prompt = `You are an event information extractor. Analyze this campus event poster image and extract the following information in JSON format:

{
  "title": "Event title",
  "description": "Brief description of the event (2-3 sentences)",
  "venue": "Location/venue of the event",
  "date": "Date in ISO format (YYYY-MM-DD) if visible, else null",
  "time": "Time (HH:MM) if visible, else null",
  "category": "One of: Technology, Sports, Arts, Academic, Cultural, Career, Social, Health, Other",
  "tags": ["array", "of", "relevant", "tags", "max 5"],
  "registrationDeadline": "Registration deadline date in ISO format if visible, else null",
  "maxParticipants": "Maximum participants as number if mentioned, else null"
}

Only extract information that is clearly visible in the poster. Use null for missing fields.
Return only valid JSON, no markdown or code blocks.`;

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
  ]);

  const text = result.response.text().trim();

  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response:", text);
    return {
      title: "",
      description: "",
      venue: "",
      date: null,
      time: null,
      category: "Other",
      tags: [],
      registrationDeadline: null,
      maxParticipants: null,
    };
  }
}
