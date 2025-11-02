"use client";

import { useState } from "react";
import { CaseDetails, PredictionResult } from "@/types";
import ConversationalVoice from "@/components/ConversationalVoice";
import { PredictionDisplay } from "@/components/PredictionDisplay";
import { PakistanFlag } from "@/components/PakistanFlag";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Mic, FileText, Loader2 } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<'select' | 'text' | 'voice'>('select');
  const [caseDetails, setCaseDetails] = useState<Partial<CaseDetails>>({
    caseType: 'criminal',
    evidenceProvided: false,
    witnessCount: 0,
    legalRepresentation: false,
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!caseDetails.title || !caseDetails.description) {
      setError('Please provide case title and description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze case');
      }

      setPrediction(data.prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setMode('select');
    setCaseDetails({
      caseType: 'criminal',
      evidenceProvided: false,
      witnessCount: 0,
      legalRepresentation: false,
    });
    setPrediction(null);
    setError(null);
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-green-50 p-4 relative overflow-hidden">
        {/* Pakistan Flag Background - Top Right Corner */}
        <div className="absolute top-0 right-0 w-96 h-64 opacity-10 pointer-events-none">
          <PakistanFlag className="transform rotate-12 scale-150" />
        </div>
        
        {/* Decorative Green Islamic Pattern Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border-4 border-green-700 rounded-full"></div>
          <div className="absolute bottom-40 right-40 w-40 h-40 border-4 border-green-700 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-green-700 transform rotate-45"></div>
        </div>

        <div className="max-w-6xl mx-auto py-12 relative z-10">
          <div className="text-center mb-12">
            {/* Pakistan Flag with Scales - Hero Section */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Left side - Pakistan Flag */}
              <div className="relative group">
                <div className="w-20 h-14 rounded-lg overflow-hidden shadow-2xl border-2 border-green-800 transform transition-transform group-hover:scale-110 group-hover:rotate-2">
                  <PakistanFlag />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🇵🇰</span>
                  </div>
                </div>
              </div>
              
              {/* Center - Scales of Justice */}
              <div className="relative">
                <div className="absolute -inset-4 bg-linear-to-r from-green-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <Scale className="w-16 h-16 text-green-700 relative z-10 drop-shadow-lg" />
              </div>
              
              {/* Right side - Title */}
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
                  Pakistan Court
                </h1>
                <h2 className="text-3xl font-bold bg-linear-to-r from-green-700 to-blue-600 bg-clip-text text-transparent">
                  Case Predictor
                </h2>
              </div>
            </div>
            
            {/* Urdu Title with Flag Colors */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-linear-to-r from-green-100 to-white rounded-lg blur-sm opacity-50"></div>
              <p className="text-2xl font-bold text-green-800 relative px-6 py-2" dir="rtl">
                پاکستان کورٹ کیس پیشن گوئی
              </p>
            </div>
            
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
              AI-powered legal case analysis using Pakistani law. Get instant predictions,
              cost estimates, and recommendations for your legal case.
            </p>
            
            {/* Pakistan Law Badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border-2 border-green-700">
              <div className="w-6 h-4 rounded overflow-hidden">
                <PakistanFlag />
              </div>
              <span className="text-sm font-semibold text-green-800">Based on Pakistani Constitution & Law</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
              onClick={() => setMode('text')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <div>Text Input</div>
                    <div className="text-sm font-normal text-gray-500">متن درج کریں</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Type your case details manually. Best for users comfortable with typing
                  in English or Urdu text.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>✓ Detailed input control</li>
                  <li>✓ Edit as you go</li>
                  <li>✓ Works on all devices</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500"
              onClick={() => setMode('voice')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mic className="w-8 h-8 text-green-600" />
                  <div>
                    <div>Voice Input</div>
                    <div className="text-sm font-normal text-gray-500">آواز سے بتائیں</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Speak your case in Urdu, Punjabi, Pashto, or Sindhi. Perfect for
                  illiterate users or quick input.
                </CardDescription>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>✓ No typing needed</li>
                  <li>✓ Multiple languages</li>
                  <li>✓ Easy for everyone</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-600">
                Powered by Gemini AI | Pakistani Law Database
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (prediction) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 relative overflow-hidden">
        {/* Subtle Pakistan Flag Watermark */}
        <div className="absolute top-10 right-10 w-32 h-24 opacity-5 pointer-events-none">
          <PakistanFlag />
        </div>
        
        <div className="max-w-6xl mx-auto py-8 relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <Button onClick={handleReset} variant="outline" className="gap-2">
              ← Analyze New Case
            </Button>
            
            {/* Pakistan Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-green-200">
              <div className="w-8 h-6 rounded overflow-hidden">
                <PakistanFlag />
              </div>
              <span className="text-xs font-medium text-green-800">Pakistani Law</span>
            </div>
          </div>
          <PredictionDisplay 
            prediction={prediction} 
            caseDetails={caseDetails as CaseDetails} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative overflow-hidden">
      {/* Pakistan Flag Corner Decoration */}
      <div className="absolute top-0 right-0 w-40 h-28 opacity-8 pointer-events-none">
        <PakistanFlag />
      </div>
      
      <div className="max-w-4xl mx-auto py-8 relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={handleReset} variant="outline" className="gap-2">
            ← Back to Mode Selection
          </Button>
          
          {/* Pakistan Law Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-green-200">
            <div className="w-8 h-6 rounded overflow-hidden">
              <PakistanFlag />
            </div>
            <span className="text-xs font-medium text-green-800">🇵🇰 Pakistani Law</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-6 h-6" />
              {mode === 'voice' ? 'Voice Case Input | آواز سے کیس درج کریں' : 'Text Case Input'}
            </CardTitle>
            <CardDescription>
              {mode === 'voice' 
                ? 'Speak clearly in your preferred language. Our AI will extract case details automatically.'
                : 'Fill in the details about your legal case for AI analysis.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'voice' ? (
              <ConversationalVoice
                onCaseExtracted={(data) => {
                  setCaseDetails({ ...caseDetails, ...(data as Partial<CaseDetails>) });
                }}
              />
            ) : (
              <form className="space-y-6">
                {/* Case Type - Bilingual */}
                <div className="bg-linear-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
                  <label className="block text-base font-bold mb-3 text-gray-800">
                    <span className="text-green-700">📋 Case Type</span>
                    <span className="mx-2">|</span>
                    <span className="text-green-700" dir="rtl">کیس کی قسم</span>
                  </label>
                  <select
                    className="w-full p-3 border-2 border-green-300 rounded-lg text-base font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={caseDetails.caseType}
                    onChange={(e) => setCaseDetails({ ...caseDetails, caseType: e.target.value as CaseDetails['caseType'] })}
                  >
                    <option value="criminal">Criminal (مجرمانہ) - قتل، چوری، ڈکیتی</option>
                    <option value="civil">Civil (دیوانی) - معاہدے، نقصان کا دعویٰ</option>
                    <option value="property">Property (جائیداد) - زمین، مکان کا تنازعہ</option>
                    <option value="family">Family (خاندانی) - طلاق، نان نفقہ، وراثت</option>
                    <option value="commercial">Commercial (تجارتی) - کاروباری تنازعہ</option>
                    <option value="constitutional">Constitutional (آئینی) - بنیادی حقوق</option>
                  </select>
                </div>

                {/* Case Title - Bilingual */}
                <div>
                  <label className="block text-base font-bold mb-2 text-gray-800">
                    <span className="text-red-600">* </span>
                    <span>Case Title</span>
                    <span className="mx-2">|</span>
                    <span dir="rtl">کیس کا عنوان</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Land Dispute | مثال: زمین کا جھگڑا"
                    value={caseDetails.title || ''}
                    onChange={(e) => setCaseDetails({ ...caseDetails, title: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Brief title for your case | اپنے کیس کا مختصر عنوان</p>
                </div>

                {/* Case Description - Bilingual */}
                <div>
                  <label className="block text-base font-bold mb-2 text-gray-800">
                    <span className="text-red-600">* </span>
                    <span>Case Description</span>
                    <span className="mx-2">|</span>
                    <span dir="rtl">کیس کی تفصیل</span>
                  </label>
                  <textarea
                    className="w-full p-3 border-2 border-gray-300 rounded-lg min-h-32 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Describe what happened in detail... | تفصیل سے بتائیں کہ کیا ہوا..."
                    value={caseDetails.description || ''}
                    onChange={(e) => setCaseDetails({ ...caseDetails, description: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include: When, where, what happened, who was involved | شامل کریں: کب، کہاں، کیا ہوا، کون ملوث تھا
                  </p>
                </div>

                {/* Plaintiff & Defendant - Bilingual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-800">
                      <span>Plaintiff</span>
                      <span className="mx-2">|</span>
                      <span dir="rtl">مدعی</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500"
                      placeholder="Name | نام"
                      value={caseDetails.plaintiff || ''}
                      onChange={(e) => setCaseDetails({ ...caseDetails, plaintiff: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Person filing case | کیس درج کرنے والا</p>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-800">
                      <span>Defendant</span>
                      <span className="mx-2">|</span>
                      <span dir="rtl">مدعا علیہ</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500"
                      placeholder="Name | نام"
                      value={caseDetails.defendant || ''}
                      onChange={(e) => setCaseDetails({ ...caseDetails, defendant: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Person being sued | جس پر کیس ہے</p>
                  </div>
                </div>

                {/* Witnesses & Location - Bilingual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-800">
                      <span>👥 Witnesses</span>
                      <span className="mx-2">|</span>
                      <span dir="rtl">گواہ</span>
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500"
                      min="0"
                      placeholder="0"
                      value={caseDetails.witnessCount || 0}
                      onChange={(e) => setCaseDetails({ ...caseDetails, witnessCount: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Number of witnesses | گواہوں کی تعداد</p>
                  </div>

                  <div>
                    <label className="block text-base font-bold mb-2 text-gray-800">
                      <span>📍 Location</span>
                      <span className="mx-2">|</span>
                      <span dir="rtl">مقام</span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-green-500"
                      placeholder="City / Area | شہر / علاقہ"
                      value={caseDetails.location || ''}
                      onChange={(e) => setCaseDetails({ ...caseDetails, location: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Where incident occurred | واقعہ کہاں ہوا</p>
                  </div>
                </div>

                {/* Checkboxes - Bilingual */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-3">
                  <p className="font-bold text-gray-800 mb-3">
                    <span>✅ Additional Information</span>
                    <span className="mx-2">|</span>
                    <span dir="rtl">اضافی معلومات</span>
                  </p>
                  
                  <label className="flex items-start gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                      checked={caseDetails.evidenceProvided || false}
                      onChange={(e) => setCaseDetails({ ...caseDetails, evidenceProvided: e.target.checked })}
                    />
                    <div className="flex-1">
                      <span className="font-medium">Evidence/Documents Available</span>
                      <span className="mx-2">|</span>
                      <span className="font-medium" dir="rtl">ثبوت/دستاویزات موجود ہیں</span>
                      <p className="text-xs text-gray-600 mt-1">Photos, contracts, receipts, etc. | تصاویر، معاہدے، رسیدیں وغیرہ</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                      checked={caseDetails.policeReportFiled || false}
                      onChange={(e) => setCaseDetails({ ...caseDetails, policeReportFiled: e.target.checked })}
                    />
                    <div className="flex-1">
                      <span className="font-medium">Police Report (FIR) Filed</span>
                      <span className="mx-2">|</span>
                      <span className="font-medium" dir="rtl">پولیس رپورٹ (ایف آئی آر) درج ہے</span>
                      <p className="text-xs text-gray-600 mt-1">First Information Report filed at police station | تھانے میں رپورٹ درج ہے</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer hover:bg-blue-100 p-2 rounded transition">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                      checked={caseDetails.legalRepresentation || false}
                      onChange={(e) => setCaseDetails({ ...caseDetails, legalRepresentation: e.target.checked })}
                    />
                    <div className="flex-1">
                      <span className="font-medium">Already Have a Lawyer</span>
                      <span className="mx-2">|</span>
                      <span className="font-medium" dir="rtl">وکیل موجود ہے</span>
                      <p className="text-xs text-gray-600 mt-1">Legal representation hired | قانونی نمائندگی حاصل ہے</p>
                    </div>
                  </label>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !caseDetails.title || !caseDetails.description}
            size="lg"
            className="min-w-48"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>Analyze Case</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
