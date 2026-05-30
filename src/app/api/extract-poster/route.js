import { NextResponse } from "next/server";
import { extractEventFromPoster } from "../../../lib/gemini/extractEventFromPoster";

export async function POST(request) {
  try {
    const { base64, mimeType } = await request.json();

    if (!base64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    const extracted = await extractEventFromPoster(base64, mimeType ?? "image/jpeg");
    return NextResponse.json(extracted);
  } catch (err) {
    console.error("Poster extraction error:", err);
    return NextResponse.json(
      { error: "Failed to extract event data from poster" },
      { status: 500 }
    );
  }
}
