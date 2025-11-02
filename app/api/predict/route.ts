import { NextRequest, NextResponse } from "next/server";
import { analyzeCaseWithGemini } from "@/lib/gemini";
import { buildLegalContext } from "@/lib/legal-data/pakistan-laws";
import { CaseDetails } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const caseDetails: CaseDetails = await request.json();

    // Validate required fields
    if (!caseDetails.caseType || !caseDetails.description) {
      return NextResponse.json(
        { error: "Case type and description are required" },
        { status: 400 }
      );
    }

    // Build legal context from Pakistan law database
    const legalContext = buildLegalContext(
      caseDetails.caseType,
      caseDetails.description
    );

    // Analyze case with Gemini AI
    const prediction = await analyzeCaseWithGemini(caseDetails, legalContext);

    return NextResponse.json({
      success: true,
      prediction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Prediction error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to analyze case. Please check your input and try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Pakistan Court Case Predictor API",
    version: "1.0.0",
    endpoints: {
      predict: "POST /api/predict - Analyze case and get prediction",
      voice: "POST /api/voice - Process voice input",
    },
  });
}
