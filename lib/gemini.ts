import { GoogleGenerativeAI } from "@google/generative-ai";
import { CaseDetails, PredictionResult } from "@/types";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt for legal analysis
const LEGAL_SYSTEM_PROMPT = `You are an expert AI legal analyst specializing in Pakistani law. 
You have deep knowledge of:
- Constitution of Pakistan 1973
- Pakistan Penal Code (PPC) 1860
- Code of Criminal Procedure (CrPC) 1898
- Code of Civil Procedure (CPC) 1908
- Pakistani court precedents and case law
- All provincial and federal ordinances

Your role is to analyze legal cases and provide accurate predictions based on:
1. Statutory provisions
2. Judicial precedents
3. Evidence quality
4. Procedural compliance
5. Historical case outcomes

Always provide:
- Success probability (0-100%)
- Estimated duration (realistic timeframes for Pakistani courts)
- Estimated costs (in PKR)
- Key legal factors
- Relevant laws and sections
- Practical recommendations
- Similar precedent cases

Be honest about challenges in the Pakistani legal system including:
- Court backlogs
- Procedural delays
- Documentation requirements
- Regional variations in implementation`;

export async function analyzeCaseWithGemini(
  caseDetails: CaseDetails,
  legalContext?: string
): Promise<PredictionResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `${LEGAL_SYSTEM_PROMPT}

${legalContext ? `\nRELEVANT PAKISTANI LAW CONTEXT:\n${legalContext}\n` : ''}

CASE DETAILS TO ANALYZE:
Case Type: ${caseDetails.caseType}
Title: ${caseDetails.title}
Description: ${caseDetails.description}
${caseDetails.plaintiff ? `Plaintiff: ${caseDetails.plaintiff}` : ''}
${caseDetails.defendant ? `Defendant: ${caseDetails.defendant}` : ''}
Evidence Provided: ${caseDetails.evidenceProvided ? 'Yes' : 'No'}
Witness Count: ${caseDetails.witnessCount}
${caseDetails.policeReportFiled !== undefined ? `Police Report Filed: ${caseDetails.policeReportFiled ? 'Yes' : 'No'}` : ''}
Legal Representation: ${caseDetails.legalRepresentation ? 'Yes' : 'No'}
${caseDetails.location ? `Location: ${caseDetails.location}` : ''}

Analyze this case under Pakistani law and provide a comprehensive prediction in the following JSON format:
{
  "successProbability": <number 0-100>,
  "estimatedDuration": {
    "min": <number>,
    "max": <number>,
    "unit": "months" or "years"
  },
  "estimatedCost": {
    "min": <number in PKR>,
    "max": <number in PKR>,
    "currency": "PKR"
  },
  "keyFactors": [
    {
      "factor": "<factor name>",
      "impact": "positive" or "negative" or "neutral",
      "description": "<detailed explanation>"
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "relevantLaws": [
    {
      "title": "<law name>",
      "section": "<section number>",
      "description": "<how it applies>"
    }
  ],
  "similarCases": [
    {
      "title": "<case name>",
      "outcome": "<outcome>",
      "year": <year>,
      "court": "<court name>"
    }
  ],
  "riskAssessment": "low" or "medium" or "high",
  "urgencyLevel": "low" or "medium" or "high" or "critical"
}

Respond ONLY with valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const prediction: PredictionResult = JSON.parse(jsonText);
    return prediction;
  } catch (error) {
    console.error('Error analyzing case with Gemini:', error);
    throw new Error('Failed to analyze case. Please try again.');
  }
}

// Voice translation helper
export async function translateToUrdu(text: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Translate the following legal text to Urdu (اردو). 
Maintain legal terminology accuracy and use formal language appropriate for Pakistani legal context.

English text:
${text}

Provide ONLY the Urdu translation, nothing else.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
}

// Extract case details from voice/text input
export async function extractCaseDetailsFromNarrative(
  narrative: string,
  language: string = 'ur-PK'
): Promise<Partial<CaseDetails>> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Extract structured case information from the following narrative.
The narrative is in ${language === 'ur-PK' ? 'Urdu' : 'English'}.

Narrative:
${narrative}

Extract and return ONLY valid JSON in this format:
{
  "caseType": "criminal" | "civil" | "family" | "property" | "commercial" | "constitutional",
  "title": "<brief case title>",
  "description": "<detailed description in English>",
  "plaintiff": "<name if mentioned>",
  "defendant": "<name if mentioned>",
  "evidenceProvided": <true/false>,
  "witnessCount": <number>,
  "policeReportFiled": <true/false if mentioned>,
  "legalRepresentation": <true/false>,
  "location": "<city/area if mentioned>"
}

If information is not provided, use reasonable defaults. Respond ONLY with valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    let jsonText = response;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error extracting case details:', error);
    throw new Error('Failed to process narrative');
  }
}
