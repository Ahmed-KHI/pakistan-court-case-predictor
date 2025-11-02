// Case Types
export type CaseType = 'criminal' | 'civil' | 'family' | 'property' | 'commercial' | 'constitutional';
export type CourtLevel = 'district' | 'high' | 'supreme';
export type CaseStatus = 'pending' | 'ongoing' | 'resolved';

// Case Details Interface
export interface CaseDetails {
  id?: string;
  caseType: CaseType;
  title: string;
  description: string;
  plaintiff?: string;
  defendant?: string;
  courtLevel?: CourtLevel;
  location?: string;
  filingDate?: Date;
  evidenceProvided: boolean;
  witnessCount: number;
  policeReportFiled?: boolean;
  legalRepresentation: boolean;
  previousCases?: string[];
}

// Prediction Result Interface
export interface PredictionResult {
  successProbability: number;
  estimatedDuration: {
    min: number;
    max: number;
    unit: 'months' | 'years';
  };
  estimatedCost: {
    min: number;
    max: number;
    currency: 'PKR';
  };
  keyFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  recommendations: string[];
  relevantLaws: {
    title: string;
    section: string;
    description: string;
  }[];
  similarCases: {
    title: string;
    outcome: string;
    year: number;
    court: string;
  }[];
  riskAssessment: 'low' | 'medium' | 'high';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

// Voice Interface
export interface VoiceConfig {
  language: 'ur-PK' | 'pa-PK' | 'ps-AF' | 'sd-PK' | 'en-US';
  enabled: boolean;
  autoSpeak: boolean;
}

// Legal Document
export interface LegalDocument {
  id: string;
  title: string;
  type: 'constitution' | 'statute' | 'case_law' | 'ordinance' | 'regulation';
  content: string;
  sections?: string[];
  court?: string;
  date?: Date;
  citations?: string[];
  keywords: string[];
}

// Conversation State (for voice interface)
export interface ConversationState {
  step: number;
  caseData: Partial<CaseDetails>;
  language: string;
  completed: boolean;
}
