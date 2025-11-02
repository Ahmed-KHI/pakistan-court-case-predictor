import { NextRequest, NextResponse } from "next/server";
import { extractCaseDetailsFromNarrative, translateToUrdu } from "@/lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { action, text, language, errorContext } = await request.json();

    if (action === "extract") {
      // Extract case details from voice/text narrative
      const caseDetails = await extractCaseDetailsFromNarrative(text, language);
      return NextResponse.json({ success: true, caseDetails });
    }

    if (action === "translate") {
      // Translate text to Urdu
      const translatedText = await translateToUrdu(text);
      return NextResponse.json({ success: true, translation: translatedText });
    }

    if (action === "handleError") {
      // AI-powered error handling
      const errorResponse = await generateIntelligentErrorMessage(errorContext);
      return NextResponse.json(errorResponse);
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'extract', 'translate', or 'handleError'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Voice processing error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process voice input",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// AI-powered intelligent error message generator
async function generateIntelligentErrorMessage(errorContext: {
  errorType: string;
  userLanguage: string;
  conversationStep: string;
  isInConversation: boolean;
}) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `You are a helpful AI assistant for a Pakistani legal help system. A speech recognition error occurred.

Error Details:
- Error Type: ${errorContext.errorType}
- User Language: ${errorContext.userLanguage}
- Current Step: ${errorContext.conversationStep}
- In Active Conversation: ${errorContext.isInConversation}

Generate a professional, empathetic, and helpful error message in ROMANIZED ${errorContext.userLanguage === 'ur-PK' ? 'Urdu' : errorContext.userLanguage === 'pa-PK' ? 'Punjabi' : errorContext.userLanguage === 'ps-AF' ? 'Pashto' : 'Sindhi'} (use English letters/Latin script) that:

1. Explains what went wrong in simple terms
2. Provides clear, actionable steps to fix it
3. Sounds professional and reassuring (not robotic)
4. Is culturally appropriate for Pakistani users
5. Uses respectful, polite language

Error Type Descriptions:
- "not-allowed": User denied microphone permission or browser blocked access
- "no-speech": No audio detected (user might not have spoken, mic too far, or background noise)
- "audio-capture": Microphone hardware issue (not connected, disabled, or broken)
- "network": Internet connection problem preventing speech recognition
- "aborted": Recording was interrupted or stopped unexpectedly

Also decide:
- Should we automatically retry? (true/false)
- If retry, after how many milliseconds? (suggest 2000-3000ms)

Respond with ONLY a JSON object:
{
  "errorMessage": "Your professional, empathetic message in romanized ${errorContext.userLanguage === 'ur-PK' ? 'Urdu' : errorContext.userLanguage === 'pa-PK' ? 'Punjabi' : errorContext.userLanguage === 'ps-AF' ? 'Pashto' : 'Sindhi'}",
  "shouldRetry": true or false,
  "retryDelay": milliseconds (number)
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResponse = JSON.parse(jsonMatch[0]);
      return parsedResponse;
    }
    
    // Fallback if parsing fails
    return {
      errorMessage: "Koi technical masla hai. Dobara try karein.",
      shouldRetry: errorContext.errorType === 'no-speech',
      retryDelay: 2500
    };
  } catch (error) {
    console.error('AI error message generation failed:', error);
    // Return intelligent fallback
    return {
      errorMessage: "Koi technical masla hai. Dobara try karein.",
      shouldRetry: errorContext.errorType === 'no-speech',
      retryDelay: 2500
    };
  }
}

