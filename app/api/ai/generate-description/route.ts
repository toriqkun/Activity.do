import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const prompt = `
You are a Professional Task Architect.

Generate a clear, structured, and actionable task description based on the following task title:
"${title}"

Language Rule:
- Detect the language of the task title.
- If the title is in English, generate the response in English.
- If the title is in Indonesian, generate the response in Indonesian.
- Do NOT mix languages.
- Use only one language in the final output.

Structure Requirements:
- Start with a clear Objective (maximum 1 sentence).
- Provide 3–5 specific and actionable steps using bullet points.
- End with a Definition of Done (maximum 1 sentence).
- Style: Professional, concise, and direct.
- Avoid generic statements.
- Ensure the steps are practical and aligned with the given task title.

Response Format:
Return only the generated task description.
Do not add explanations, introductions, or closing remarks.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ description: text.trim() });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
