import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { prediction } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Translate the following legal case analysis to Urdu. Keep numbers, percentages, and proper nouns in English. Translate naturally for Pakistani audience:

Key Factors:
${prediction.keyFactors.map((f: any) => `- ${f.factor}: ${f.description}`).join('\n')}

Recommendations:
${prediction.recommendations.join('\n')}

Relevant Laws:
${prediction.relevantLaws.map((l: any) => `${l.title} - ${l.section}: ${l.description}`).join('\n')}

${prediction.similarCases ? `Similar Cases:\n${prediction.similarCases.map((c: any) => `${c.title} - ${c.outcome}`).join('\n')}` : ''}

Return ONLY a JSON object with this structure (no markdown, no code blocks):
{
  "keyFactors": [{"factor": "Urdu translation", "description": "Urdu translation"}],
  "recommendations": ["Urdu translation"],
  "relevantLaws": [{"title": "keep same", "section": "keep same", "description": "Urdu translation"}],
  "similarCases": [{"title": "keep same", "outcome": "Urdu translation"}]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const translated = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      translated
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
