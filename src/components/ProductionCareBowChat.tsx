import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Mic, AlertTriangle, Info, CheckCircle, Send } from 'lucide-react';
import {
  EmergencyStateModal,
  MentalHealthCrisisModal,
  MedicationConflictCard,
  InsufficientInfoCard,
  ContradictionCard,
  RepeatedSymptomCard,
  RefusalWarningCard
} from './EdgeCaseModals';
import {
  detectEmergencyKeywords,
  detectMentalHealthCrisis,
  detectInsufficientInfo,
  detectContradiction,
  detectMedicationConflict,
  detectRepeatedSymptom,
  getElderAdaptation,
  adaptMessageForElder,
  handleRefusedRecommendation
} from '../utils/careBowEdgeCases';

interface ProfileOption {
  id: string;
  label: string;
  name: string;
  age?: number;
  relationship: string;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
}

interface Message {
  id: string;
  type: 'carebow' | 'user' | 'context' | 'warning' | 'emergency';
  content: string;
  reasoning?: string;
  profileInsight?: string;
  options?: string[];
}

interface ConversationData {
  symptoms: string[];
  duration: string;
  severity: number;
  redFlags: string[];
  answers: string[];
}

interface ProductionCareBowChatProps {
  profile: ProfileOption;
  initialSymptom: string;
  onBack: () => void;
  onComplete: (assessment: any) => void;
}

export function ProductionCareBowChat({ profile, initialSymptom, onBack, onComplete }: ProductionCareBowChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ConversationData>({
    symptoms: [initialSymptom],
    duration: '',
    severity: 0,
    redFlags: [],
    answers: []
  });
  const [totalSteps] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // STATE 2: CONTEXT CONFIRMATION (AUTO)
    setTimeout(() => {
      const contextMessage: Message = {
        id: '1',
        type: 'context',
        content: `Got it — this is for ${profile.relationship === 'Me' ? 'you' : `your ${profile.relationship.toLowerCase()} (${profile.age})`}.\n${getContextualNote(profile)}`,
        profileInsight: 'Context locked for this conversation'
      };
      setMessages([contextMessage]);

      // Check for missing profile data (STATE 5)
      setTimeout(() => {
        checkMissingData();
      }, 2000);

      // Start first question
      setTimeout(() => {
        askNextQuestion(0);
      }, 3500);
    }, 500);
  }, [profile]);

  const getContextualNote = (profile: ProfileOption): string => {
    if (profile.age && profile.age >= 60) {
      return `I'll be more cautious and prioritize in-home care if needed.`;
    }
    if (profile.conditions && profile.conditions.length > 0) {
      return `I'll be extra careful because of ${profile.relationship === 'Me' ? 'your' : 'their'} ${profile.conditions.join(' and ')}.`;
    }
    return `I'll use ${profile.relationship === 'Me' ? 'your' : 'their'} health profile to guide you safely.`;
  };

  const checkMissingData = () => {
    const missing: string[] = [];
    if (!profile.medications || profile.medications.length === 0) missing.push('medications');
    if (!profile.allergies || profile.allergies.length === 0) missing.push('allergies');

    if (missing.length > 0) {
      const missingMsg: Message = {
        id: 'missing-data',
        type: 'warning',
        content: `I don't see ${missing.join(' and ')} listed yet. Adding them helps me avoid unsafe advice.`,
        options: ['Add medications', 'Skip for now']
      };
      setMessages(prev => [...prev, missingMsg]);
    }
  };

  const askNextQuestion = (questionStep: number) => {
    setIsTyping(true);
    setTimeout(() => {
      const question = getQuestionForStep(questionStep);
      setMessages(prev => [...prev, question]);
      setIsTyping(false);
      setStep(questionStep + 1);
    }, 1000);
  };

  const getQuestionForStep = (questionStep: number): Message => {
    const isForSelf = profile.relationship === 'Me';
    const subject = isForSelf ? 'you' : profile.name;

    switch (questionStep) {
      case 0:
        return {
          id: `q${questionStep}`,
          type: 'carebow',
          content: `How long has ${subject} been experiencing this?`,
          reasoning: `I'm asking this to understand if this is acute or building over time.`
        };
      case 1:
        return {
          id: `q${questionStep}`,
          type: 'carebow',
          content: `On a scale of 1-10, how severe is this?\n(1 = barely noticeable, 10 = worst imaginable)`,
          reasoning: `This helps me gauge urgency${profile.conditions?.length ? `, and with ${subject === 'you' ? 'your' : 'their'} ${profile.conditions?.join(' and ')}, I need to be more cautious with moderate-to-severe symptoms` : ''}.`,
          options: ['1-3 (Mild)', '4-6 (Moderate)', '7-10 (Severe)']
        };
      case 2:
        return {
          id: `q${questionStep}`,
          type: 'carebow',
          content: `Is ${subject} experiencing any of these:\n• Fever over 102°F\n• Difficulty breathing\n• Severe pain\n• Confusion or dizziness\n• Unable to keep food/water down`,
          reasoning: `I'm checking for warning signs that would change my recommendation.`,
          options: ['Yes', 'No', 'Not sure']
        };
      case 3:
        // Check past sessions (STATE 4: PROFILE-AWARE MESSAGES)
        if (profile.relationship === 'Me') {
          return {
            id: `q${questionStep}`,
            type: 'carebow',
            content: `Last time you reported similar symptoms, a home visit helped within 2 days.\n\nHas anything changed since then?`,
            profileInsight: 'Referencing past CareBow outcome from 2 weeks ago',
            options: ['Yes', 'No', 'Not sure']
          };
        }
        return {
          id: `q${questionStep}`,
          type: 'carebow',
          content: `Is there anything else I should know?`,
          reasoning: `Any additional context helps me give safer guidance.`
        };
      default:
        return {
          id: `q${questionStep}`,
          type: 'carebow',
          content: `Let me analyze what you've told me...`
        };
    }
  };

  const handleSend = (selectedOption?: string) => {
    const responseText = selectedOption || input.trim();
    if (!responseText) return;

    // Check for emergency keywords
    if (detectEmergencyKeywords(responseText)) {
      showEmergencyState();
      return;
    }

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: responseText
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Store answer
    setData(prev => ({
      ...prev,
      answers: [...prev.answers, responseText]
    }));

    // Process based on step
    if (step === 1) {
      setData(prev => ({ ...prev, duration: responseText }));
      askNextQuestion(1);
    } else if (step === 2) {
      const severity = extractSeverity(responseText);
      setData(prev => ({ ...prev, severity }));
      askNextQuestion(2);
    } else if (step === 3) {
      const hasRedFlags = responseText.toLowerCase().includes('yes');
      setData(prev => ({ ...prev, redFlags: hasRedFlags ? ['Warning signs present'] : [] }));
      askNextQuestion(3);
    } else if (step === 4) {
      // Complete - move to assessment
      setTimeout(() => {
        completeAssessment();
      }, 1000);
    }
  };

  const extractSeverity = (text: string): number => {
    if (text.includes('1-3') || text.toLowerCase().includes('mild')) return 2;
    if (text.includes('4-6') || text.toLowerCase().includes('moderate')) return 5;
    if (text.includes('7-10') || text.toLowerCase().includes('severe')) return 8;
    const num = parseInt(text);
    return isNaN(num) ? 5 : num;
  };

  const detectEmergency = (text: string): boolean => {
    const emergencyKeywords = [
      'chest pain', 'can\'t breathe', 'difficulty breathing', 
      'severe bleeding', 'unconscious', 'stroke', 'heart attack'
    ];
    return emergencyKeywords.some(keyword => text.toLowerCase().includes(keyword));
  };

  const showEmergencyState = () => {
    const emergencyMsg: Message = {
      id: 'emergency',
      type: 'emergency',
      content: `This may be serious.\n\nBased on what you've shared, this needs immediate attention.`
    };
    setMessages(prev => [...prev, emergencyMsg]);
  };

  const completeAssessment = () => {
    // Calculate risk
    let riskScore = 0;
    if (data.severity >= 7) riskScore += 2;
    else if (data.severity >= 4) riskScore += 1;
    if (data.redFlags.length > 0) riskScore += 2;
    if (profile.age && profile.age >= 60) riskScore += 1;
    if (profile.conditions && profile.conditions.length > 0) riskScore += 1;

    const riskLevel: 'low' | 'medium' | 'high' = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';

    // Generate recommendation
    let careType = '';
    let reasoning = '';

    if (riskLevel === 'high' && profile.age && profile.age >= 60) {
      careType = 'Home visit';
      reasoning = `Because this is for an elder and symptoms haven't improved.`;
    } else if (riskLevel === 'high') {
      careType = 'Video consultation';
      reasoning = `These symptoms need professional evaluation soon.`;
    } else if (riskLevel === 'medium') {
      careType = 'Video consultation';
      reasoning = `A provider should review these symptoms to adjust care if needed.`;
    } else {
      careType = 'Self-care with monitoring';
      reasoning = `These symptoms appear manageable at home for now.`;
    }

    const assessment = {
      profile,
      symptoms: data.symptoms,
      duration: data.duration,
      severity: data.severity,
      riskLevel,
      careType,
      reasoning,
      factors: [
        profile.age ? `Age: ${profile.age}` : null,
        profile.conditions?.length ? `Conditions: ${profile.conditions.join(', ')}` : null,
        `Severity: ${data.severity}/10`
      ].filter(Boolean)
    };

    onComplete(assessment);
  };

  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h1 className="text-sm text-gray-900">CareBow</h1>
            </div>
            <p className="text-xs text-gray-500">
              For {profile.relationship === 'Me' ? 'you' : profile.name}
            </p>
          </div>
        </div>

        {/* Progress Indicator (STATE 3) */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 whitespace-nowrap">
            Understanding your situation ({step} of {totalSteps})
          </div>
        </div>
      </div>

      {/* Messages (STATE 3 & 4) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === 'context' && (
              <div className="mb-4">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-purple-900 leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                      {message.profileInsight && (
                        <div className="mt-2 text-xs text-purple-700">{message.profileInsight}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message.type === 'carebow' && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 max-w-[90%]">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                    
                    {/* Inline reasoning (STATE 3) */}
                    {message.reasoning && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 italic">
                          {message.reasoning}
                        </div>
                      </div>
                    )}

                    {message.profileInsight && (
                      <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                        <div className="text-xs text-purple-700">{message.profileInsight}</div>
                      </div>
                    )}
                  </div>

                  {/* Quick chips */}
                  {message.options && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(option)}
                          className="bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-full text-xs hover:bg-purple-50 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {message.type === 'user' && (
              <div className="flex items-start gap-3 justify-end mb-4">
                <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%]">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            )}

            {/* STATE 5: MISSING DATA NUDGE */}
            {message.type === 'warning' && (
              <div className="mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-900 leading-relaxed mb-3">
                        {message.content}
                      </p>
                      {message.options && (
                        <div className="flex gap-2">
                          {message.options.map((option, idx) => (
                            <button
                              key={idx}
                              className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                                idx === 0
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-white border border-yellow-300 text-yellow-800 hover:bg-yellow-50'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 10: EMERGENCY STATE */}
            {message.type === 'emergency' && (
              <div className="mb-4">
                <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1">
                      <div className="text-sm text-red-900 mb-1">⚠️ URGENT</div>
                      <p className="text-sm text-red-900 leading-relaxed whitespace-pre-line mb-4">
                        {message.content}
                      </p>
                      <div className="space-y-2">
                        <button className="w-full bg-red-600 text-white px-4 py-3 rounded-xl text-sm hover:bg-red-700 transition-colors">
                          Call emergency services
                        </button>
                        <button className="w-full bg-white border border-red-300 text-red-700 px-4 py-2 rounded-xl text-xs hover:bg-red-50 transition-colors">
                          Share location
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isTyping}
          />
          <button className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}