import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { task, categories } = await req.json();

    if (!task) {
      return NextResponse.json({ error: "Task is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Detect the language of the task.
      If the task is in Indonesian, return the category suggestion in Indonesian.
      If the task is in English, return the category suggestion in English.

      Existing categories: ${categories.join(", ")}
      Task: "${task}"

      Rules:
      - Choose the most suitable category from the list.
      - If none fit, create a new short category name (1–2 words).
      - Return only the category name (no explanation).
    `;

    const result = await model.generateContent(prompt);

    const suggestion = result.response.text().trim();

    return NextResponse.json({ category: suggestion });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
