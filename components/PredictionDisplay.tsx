"use client";

import { useState } from "react";
import { CaseDetails, PredictionResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Clock, DollarSign, Scale, FileText } from "lucide-react";

interface PredictionDisplayProps {
  prediction: PredictionResult;
  caseDetails: CaseDetails;
}

export function PredictionDisplay({ prediction, caseDetails }: PredictionDisplayProps) {
  const [showUrdu, setShowUrdu] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateToUrdu = async () => {
    if (translatedContent) {
      setShowUrdu(true);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prediction })
      });
      const data = await response.json();
      setTranslatedContent(data.translated);
      setShowUrdu(true);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggleLanguage = () => {
    if (!showUrdu) {
      translateToUrdu();
    } else {
      setShowUrdu(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSuccessColor = (prob: number) => {
    if (prob >= 70) return 'text-green-600';
    if (prob >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const t = (en: string, ur: string) => showUrdu ? ur : en;
  
  const getCaseTypeUrdu = (type: string) => {
    const types: Record<string, string> = {
      'criminal': 'فوجداری',
      'civil': 'دیوانی',
      'property': 'جائیداد',
      'family': 'خاندانی',
      'commercial': 'تجارتی'
    };
    return types[type] || type;
  };

  const getRiskUrdu = (risk: string) => {
    const risks: Record<string, string> = {
      'low': 'کم خطرہ',
      'medium': 'درمیانی خطرہ',
      'high': 'زیادہ خطرہ'
    };
    return risks[risk] || risk;
  };

  const getUrgencyUrdu = (urgency: string) => {
    const urgencies: Record<string, string> = {
      'critical': 'انتہائی فوری',
      'high': 'بہت فوری',
      'medium': 'فوری',
      'low': 'کم فوری'
    };
    return urgencies[urgency] || urgency;
  };

  const getImpactUrdu = (impact: string) => {
    const impacts: Record<string, string> = {
      'positive': 'مثبت',
      'negative': 'منفی',
      'neutral': 'غیر جانبدار'
    };
    return impacts[impact] || impact;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{caseDetails.title}</CardTitle>
              <CardDescription className="mt-2">
                {t('Case Type', 'کیس کی قسم')}: {showUrdu ? getCaseTypeUrdu(caseDetails.caseType) : caseDetails.caseType.toUpperCase()} | {t('Status', 'حیثیت')}: {t('Analysis Complete', 'تجزیہ مکمل')}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleLanguage}
              disabled={isTranslating}
            >
              {isTranslating ? 'ترجمہ ہو رہا ہے...' : showUrdu ? 'Show English' : 'اردو میں دیکھیں'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Success Probability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('Success Probability', 'کامیابی کا امکان')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold ${getSuccessColor(prediction.successProbability)}`}>
              {prediction.successProbability}%
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    prediction.successProbability >= 70 ? 'bg-green-500' :
                    prediction.successProbability >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${prediction.successProbability}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {prediction.successProbability >= 70 && t('Strong case with high chances of success', 'مضبوط کیس، کامیابی کے زیادہ امکانات')}
                {prediction.successProbability >= 50 && prediction.successProbability < 70 && t('Moderate case requiring solid evidence', 'درمیانہ کیس، مضبوط ثبوت کی ضرورت ہے')}
                {prediction.successProbability < 50 && t('Challenging case, consider strengthening evidence', 'مشکل کیس، ثبوت مضبوط کرنے پر غور کریں')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration & Cost */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              {t('Estimated Duration', 'تخمینہ شدہ مدت')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {prediction.estimatedDuration.min} - {prediction.estimatedDuration.max} {t(prediction.estimatedDuration.unit, prediction.estimatedDuration.unit === 'months' ? 'ماہ' : 'سال')}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {t('Based on current Pakistani court timelines', 'پاکستانی عدالتوں کے موجودہ وقت کی بنیاد پر')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              {t('Estimated Cost', 'تخمینہ شدہ لاگت')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {t('Rs.', 'روپے')} {prediction.estimatedCost.min.toLocaleString()} - {prediction.estimatedCost.max.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {t('Includes legal fees, court charges, and documentation', 'قانونی فیس، عدالتی چارجز اور دستاویزات شامل ہیں')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t('Risk Assessment', 'خطرے کی تشخیص')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-2 rounded-full font-semibold ${getRiskColor(prediction.riskAssessment)}`}>
              {showUrdu ? getRiskUrdu(prediction.riskAssessment) : prediction.riskAssessment.toUpperCase() + ' RISK'}
            </span>
            <span className={`px-4 py-2 rounded-full font-semibold ${
              prediction.urgencyLevel === 'critical' ? 'bg-red-100 text-red-700' :
              prediction.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-700' :
              prediction.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {showUrdu ? getUrgencyUrdu(prediction.urgencyLevel) : prediction.urgencyLevel.toUpperCase() + ' URGENCY'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Key Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            {t('Key Factors', 'اہم عوامل')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(showUrdu && translatedContent ? translatedContent.keyFactors : prediction.keyFactors).map((factor: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  prediction.keyFactors[index].impact === 'positive' ? 'bg-green-500' :
                  prediction.keyFactors[index].impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1">
                  <p className="font-semibold">{factor.factor}</p>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  prediction.keyFactors[index].impact === 'positive' ? 'bg-green-100 text-green-700' :
                  prediction.keyFactors[index].impact === 'negative' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {showUrdu ? getImpactUrdu(prediction.keyFactors[index].impact) : prediction.keyFactors[index].impact}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Recommendations', 'سفارشات')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(showUrdu && translatedContent ? translatedContent.recommendations : prediction.recommendations).map((rec: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Relevant Laws */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('Relevant Pakistani Laws', 'متعلقہ پاکستانی قوانین')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(showUrdu && translatedContent ? translatedContent.relevantLaws : prediction.relevantLaws).map((law: any, index: number) => (
              <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <p className="font-semibold text-blue-900">{law.title} - {law.section}</p>
                <p className="text-sm text-blue-700 mt-1">{law.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Similar Cases */}
      {prediction.similarCases && prediction.similarCases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('Similar Precedent Cases', 'ملتے جلتے نظیری کیسز')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(showUrdu && translatedContent?.similarCases ? translatedContent.similarCases : prediction.similarCases).map((caseItem: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{caseItem.title}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{t('Court', 'عدالت')}: {prediction.similarCases[index].court}</span>
                    <span>{t('Year', 'سال')}: {prediction.similarCases[index].year}</span>
                    <span className="font-semibold text-blue-600">{t('Outcome', 'نتیجہ')}: {caseItem.outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
