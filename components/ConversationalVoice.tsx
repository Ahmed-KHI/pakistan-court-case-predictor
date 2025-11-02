'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import type { CaseDetails } from '@/types';

interface ConversationalVoiceProps {
  onCaseExtracted: (caseDetails: CaseDetails) => void;
}

const QUESTIONS = [
  'السلام علیکم! میں آپ کا قانونی معاون ہوں۔ کیا آپ تیار ہیں؟',
  'آپ کا نام کیا ہے؟',
  'آپ کی عمر کتنی ہے؟',
  'آپ کا کیس کس قسم کا ہے؟ فوجداری، دیوانی، یا جائیداد؟',
  'اپنے کیس کی تفصیل بتائیں۔ کیا ہوا؟',
  'یہ واقعہ کب ہوا؟',
  'کیا آپ کے پاس ثبوت ہے؟',
  'یہ کہاں ہوا؟ شہر بتائیں',
  'آپ کی ماہانہ آمدنی کتنی ہے؟',
  'شکریہ۔ اب میں تجزیہ کروں گا۔'
];

const KEYS = ['greeting', 'name', 'age', 'caseType', 'description', 'date', 'evidence', 'location', 'income', 'completion'];

export default function ConversationalVoice({ onCaseExtracted }: ConversationalVoiceProps) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Use refs for persistent state
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingAudioRef = useRef(false);
  const speakResolveRef = useRef<(() => void) | null>(null);
  const setupCompleteRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioContextRef.current?.close();
      wsRef.current?.close();
    };
  }, []);

  // Connect to Gemini Live API with Kore voice
  const connectGeminiLive = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    
    console.log('� Connecting to Gemini Live with Kore voice...');
    wsRef.current = new WebSocket(url);
    
    wsRef.current.onopen = () => {
      console.log('✅ Connected to Gemini Live');
      const setupMessage = {
        setup: {
          model: 'models/gemini-2.0-flash-exp',
          generationConfig: {
            responseModalities: 'audio',
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore'
                }
              }
            }
          },
          systemInstruction: {
            parts: [{
              text: `YOU ARE A TEXT-TO-SPEECH SYSTEM. YOUR ONLY JOB IS TO READ TEXT EXACTLY AS GIVEN.

CRITICAL RULES:
1. Read ONLY the exact text provided - word for word, character by character
2. Do NOT respond, reply, or add any words
3. Do NOT greet back or acknowledge greetings
4. Do NOT introduce yourself
5. Do NOT add context or explanations
6. You are NOT conversational - you are a robot that reads text

EXAMPLES:
Input: "السلام علیکم! میں آپ کا قانونی معاون ہوں۔ کیا آپ تیار ہیں؟"
Output: Read EXACTLY "السلام علیکم! میں آپ کا قانونی معاون ہوں۔ کیا آپ تیار ہیں؟"
DO NOT say "Walaikum Assalam" or respond in any way.

Input: "آپ کا نام کیا ہے؟"
Output: Read EXACTLY "آپ کا نام کیا ہے؟"
DO NOT answer the question.

YOU ARE A SPEAKER, NOT A RESPONDER.`
            }]
          }
        }
      };
      console.log('📤 Sending setup message:', JSON.stringify(setupMessage));
      wsRef.current?.send(JSON.stringify(setupMessage));
      console.log('✅ Setup message sent');
    };
    
    wsRef.current.onmessage = async (event) => {
      // Handle Blob data (binary audio)
      if (event.data instanceof Blob) {
        console.log('📨 Received Blob data, size:', event.data.size);
        try {
          const text = await event.data.text();
          const message = JSON.parse(text);
          console.log('📨 Parsed Blob message:', JSON.stringify(message, null, 2));
          
          if (message.setupComplete) {
            console.log('✅ Setup complete, ready to send messages');
            setupCompleteRef.current = true;
          }
          
          if (message.serverContent?.modelTurn?.parts) {
            console.log('📦 Found parts in response:', message.serverContent.modelTurn.parts.length);
            for (const part of message.serverContent.modelTurn.parts) {
              console.log('📦 Part:', part);
              if (part.inlineData?.mimeType?.includes('audio')) {
                console.log('🎵 Audio received, length:', part.inlineData.data.length);
                audioQueueRef.current.push(part.inlineData.data);
                if (!isPlayingAudioRef.current) {
                  playNextAudioChunk();
                }
              } else if (part.text) {
                console.log('📝 Text response:', part.text);
              }
            }
          }
          
          if (message.serverContent?.turnComplete) {
            console.log('🏁 Turn complete');
            if (speakResolveRef.current) {
              speakResolveRef.current();
              speakResolveRef.current = null;
            }
          }
        } catch (error) {
          console.error('❌ Error parsing Blob:', error);
        }
      } 
      // Handle string data (JSON)
      else if (typeof event.data === 'string') {
        const message = JSON.parse(event.data);
        console.log('📨 Received string message:', JSON.stringify(message, null, 2));
        
        if (message.setupComplete) {
          console.log('✅ Setup complete, ready to send messages');
          setupCompleteRef.current = true;
        }
        
        if (message.serverContent?.modelTurn?.parts) {
          console.log('📦 Found parts in response:', message.serverContent.modelTurn.parts.length);
          for (const part of message.serverContent.modelTurn.parts) {
            console.log('📦 Part:', part);
            if (part.inlineData?.mimeType?.includes('audio')) {
              console.log('🎵 Audio received, length:', part.inlineData.data.length);
              audioQueueRef.current.push(part.inlineData.data);
              if (!isPlayingAudioRef.current) {
                playNextAudioChunk();
              }
            } else if (part.text) {
              console.log('📝 Text response:', part.text);
            }
          }
        }
        
        if (message.serverContent?.turnComplete) {
          console.log('🏁 Turn complete');
          if (speakResolveRef.current) {
            speakResolveRef.current();
            speakResolveRef.current = null;
          }
        }
      } else {
        console.log('📨 Received unknown data type:', typeof event.data);
      }
    };
    
    wsRef.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      alert('WebSocket connection error. Check console.');
    };
    
    wsRef.current.onclose = (event) => {
      console.log('🔌 Disconnected from Gemini Live');
      console.log('🔌 Close code:', event.code, 'Reason:', event.reason);
      if (event.code !== 1000) {
        console.error('❌ Abnormal closure! Code:', event.code);
        alert(`WebSocket closed unexpectedly. Code: ${event.code}. Reason: ${event.reason || 'Unknown'}`);
      }
    };
  };

  const playNextAudioChunk = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingAudioRef.current = false;
      setIsSpeaking(false);
      return;
    }
    
    isPlayingAudioRef.current = true;
    const audioData = audioQueueRef.current.shift()!;
    
    try {
      await playAudioChunk(audioData);
      playNextAudioChunk();
    } catch (error) {
      console.error('Error playing audio:', error);
      isPlayingAudioRef.current = false;
      setIsSpeaking(false);
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      try {
        const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer.slice(0));
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        return new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start(0);
        });
      } catch {
        // PCM fallback
        const sampleRate = 24000;
        const audioBuffer = audioContextRef.current.createBuffer(1, bytes.length / 2, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < channelData.length; i++) {
          const sample = (bytes[i * 2] | (bytes[i * 2 + 1] << 8));
          channelData[i] = sample < 0x8000 ? sample / 0x8000 : (sample - 0x10000) / 0x8000;
        }
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        return new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start(0);
        });
      }
    } catch (error) {
      console.error('Audio error:', error);
    }
  };

  const speak = async (text: string): Promise<void> => {
    return new Promise(async (resolve) => {
      console.log('🎤 Speaking:', text);
      console.log('🎤 WebSocket state:', wsRef.current?.readyState);
      console.log('🎤 WebSocket OPEN?', wsRef.current?.readyState === WebSocket.OPEN);
      console.log('🎤 Setup complete?', setupCompleteRef.current);
      
      setIsSpeaking(true);
      speakResolveRef.current = resolve;
      
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('❌ WebSocket not ready! State:', wsRef.current?.readyState);
        alert('WebSocket not connected. Check console for errors.');
        setIsSpeaking(false);
        resolve();
        return;
      }
      
      // Wait for setup to complete
      if (!setupCompleteRef.current) {
        console.log('⏳ Waiting for setup to complete...');
        await new Promise(r => setTimeout(r, 500));
      }
      
      const message = {
        client_content: {
          turns: [{ role: 'user', parts: [{ text }] }],
          turn_complete: true
        }
      };
      
      console.log('📤 Sending message to Gemini Live:', message);
      wsRef.current.send(JSON.stringify(message));
      console.log('✅ Message sent, waiting for audio response...');
    });
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ur-PK';
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = async (event: any) => {
      const answer = event.results[0][0].transcript;
      setIsListening(false);
      const key = KEYS[currentStep];
      setAnswers(prev => ({ ...prev, [key]: answer }));
      await speak('جی شکریہ');
      const nextStep = currentStep + 1;
      if (nextStep < QUESTIONS.length) {
        setCurrentStep(nextStep);
        // Wait 1 second after acknowledgment before next question
        setTimeout(() => askQuestion(nextStep), 1000);
      } else {
        finishConversation();
      }
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Please allow microphone access');
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const askQuestion = async (step: number) => {
    console.log('📢 Asking question:', step);
    await speak(QUESTIONS[step]);
    setTimeout(() => startListening(), 1500);
  };

  const startConversation = async () => {
    console.log('🚀 Starting conversation with Gemini Live (Kore voice)');
    setIsActive(true);
    setCurrentStep(0);
    setAnswers({});
    
    connectGeminiLive();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await askQuestion(0);
  };

  const finishConversation = async () => {
    setIsActive(false);
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extractCase', answers })
      });
      const data = await response.json();
      if (data.caseDetails) {
        onCaseExtracted(data.caseDetails);
      }
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const stopConversation = () => {
    setIsActive(false);
    wsRef.current?.close();
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">🎙️ Voice Assistant</h3>
            <p className="text-sm text-gray-600">Speak in Urdu - اردو میں بولیں</p>
          </div>

          {isActive && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Question {currentStep + 1}/{QUESTIONS.length}</p>
                <p className="text-lg font-medium text-blue-900">{QUESTIONS[currentStep]}</p>
              </div>

              <div className="flex items-center justify-center gap-4">
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Volume2 className="h-6 w-6 animate-pulse" />
                    <span>Speaking...</span>
                  </div>
                )}
                {isListening && (
                  <div className="flex items-center gap-2 text-red-600">
                    <Mic className="h-6 w-6 animate-pulse" />
                    <span>Listening...</span>
                  </div>
                )}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }} />
              </div>
            </>
          )}

          <div className="flex justify-center">
            {!isActive ? (
              <Button onClick={startConversation} size="lg" className="bg-green-600 hover:bg-green-700">
                <Mic className="mr-2 h-5 w-5" />
                Start Conversation
              </Button>
            ) : (
              <Button onClick={stopConversation} size="lg" variant="destructive">
                <MicOff className="mr-2 h-5 w-5" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
