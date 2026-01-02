import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, CheckCircle, Sparkles } from 'lucide-react';

interface FamilyContext {
  relationship: 'me' | 'father' | 'mother' | 'other';
  age?: number;
}

interface Message {
  id: string;
  type: 'carebow' | 'user' | 'context';
  content: string;
  reasoning?: string;
  personalization?: string;
}

interface ConversationMVPProps {
  context: FamilyContext;
  initialSymptom: string;
  onBack: () => void;
  onComplete: (data: AssessmentData) => void;
}

export interface AssessmentData {
  context: FamilyContext;
  symptom: string;
  severity: number;
  duration: string;
  hasRedFlags: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'self-care' | 'video' | 'emergency';
}

export function ConversationMVP({ context, initialSymptom, onBack, onComplete }: ConversationMVPProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalSteps = 5;
  const isElder = context.age && context.age >= 60;
  const isMe = context.relationship === 'me';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // STATE 2: CONTEXT CONFIRMATION
    setTimeout(() => {
      const confirmationMsg: Message = {
        id: 'context',
        type: 'context',
        content: getContextConfirmation(),
        personalization: getPersonalizationNote()
      };
      setMessages([confirmationMsg]);

      // Start first question
      setTimeout(() => {
        askQuestion(0);
      }, 2000);
    }, 500);
  }, []);

  const getContextConfirmation = () => {
    if (isMe) {
      return `Got it — this is for you.`;
    }
    
    const rel = context.relationship === 'father' ? 'your father' : 
                context.relationship === 'mother' ? 'your mother' : 'your family member';
    return `Got it — this is for ${rel} (${context.age}).`;
  };

  const getPersonalizationNote = () => {
    if (isMe) {
      return `I'll guide you based on your profile.`;
    }
    
    if (isElder) {
      return `I'll be more cautious and consider in-person care if needed.`;
    }
    
    return `I'll use this context to guide you safely.`;
  };

  const askQuestion = (questionNum: number) => {
    const question = getQuestion(questionNum);
    setMessages(prev => [...prev, question]);
    setStep(questionNum + 1);
  };

  const getQuestion = (num: number): Message => {
    const subject = isMe ? 'you' : (context.relationship === 'father' ? 'he' : 
                   context.relationship === 'mother' ? 'she' : 'they');
    const possessive = isMe ? 'your' : (context.relationship === 'father' ? 'his' : 
                      context.relationship === 'mother' ? 'her' : 'their');

    switch (num) {
      case 0:
        return {
          id: `q${num}`,
          type: 'carebow',
          content: `How long has ${subject} been experiencing this?`,
          reasoning: `I'm asking this to understand whether this could be urgent.`
        };
      
      case 1:
        return {
          id: `q${num}`,
          type: 'carebow',
          content: `On a scale of 1-10, how would ${subject} rate the severity?\n\n1 = barely noticeable\n10 = worst imaginable`,
          reasoning: isElder 
            ? `Given ${possessive} age, I need to be extra careful with moderate-to-severe symptoms.`
            : `This helps me gauge how urgent this is.`
        };
      
      case 2:
        return {
          id: `q${num}`,
          type: 'carebow',
          content: `Is ${subject} experiencing any of these:\n\n• Fever over 102°F\n• Difficulty breathing\n• Severe pain\n• Confusion`,
          reasoning: `I'm checking for warning signs that would change my recommendation.`,
          personalization: isElder ? `Because this is for an elder, any of these would require immediate attention.` : undefined
        };
      
      case 3:
        return {
          id: `q${num}`,
          type: 'carebow',
          content: `Has ${subject} tried anything to help with this?`,
          reasoning: `Understanding what's been tried helps me give better guidance.`
        };
      
      default:
        return {
          id: `q${num}`,
          type: 'carebow',
          content: `Thank you. Let me assess this...`
        };
    }
  };

  const handleAnswer = (answer: string, questionNum: number) => {
    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: answer
    };
    setMessages(prev => [...prev, userMsg]);

    // Store answer
    const newAnswers = { ...answers, [questionNum]: answer };
    setAnswers(newAnswers);

    // Move to next question or complete
    if (questionNum < 3) {
      setTimeout(() => {
        askQuestion(questionNum + 1);
      }, 1000);
    } else {
      // Complete assessment
      setTimeout(() => {
        completeAssessment(newAnswers);
      }, 1500);
    }
  };

  const completeAssessment = (finalAnswers: any) => {
    // Calculate severity
    const severityAnswer = finalAnswers[1] || '5';
    const severity = extractSeverity(severityAnswer);
    
    // Check red flags
    const redFlagAnswer = finalAnswers[2] || 'no';
    const hasRedFlags = redFlagAnswer.toLowerCase().includes('yes');

    // Calculate risk
    let riskScore = 0;
    if (severity >= 7) riskScore += 2;
    else if (severity >= 4) riskScore += 1;
    if (hasRedFlags) riskScore += 2;
    if (isElder) riskScore += 1;

    const riskLevel: 'low' | 'medium' | 'high' = 
      riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';

    // Determine recommendation
    let recommendation: 'self-care' | 'video' | 'emergency' = 'self-care';
    if (hasRedFlags && (severity >= 7 || isElder)) {
      recommendation = 'emergency';
    } else if (riskLevel === 'high' || (isElder && riskLevel === 'medium')) {
      recommendation = 'video';
    }

    onComplete({
      context,
      symptom: initialSymptom,
      severity,
      duration: finalAnswers[0] || 'Unknown',
      hasRedFlags,
      riskLevel,
      recommendation
    });
  };

  const extractSeverity = (text: string): number => {
    const num = parseInt(text);
    if (!isNaN(num)) return Math.max(1, Math.min(10, num));
    
    if (text.toLowerCase().includes('mild') || text.includes('1-3')) return 2;
    if (text.toLowerCase().includes('moderate') || text.includes('4-6')) return 5;
    if (text.toLowerCase().includes('severe') || text.includes('7-10')) return 8;
    return 5;
  };

  const currentQuestion = step - 1;

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
              <Heart className="w-4 h-4 text-purple-600" />
              <h1 className="text-sm text-gray-900">CareBow</h1>
            </div>
            <p className="text-xs text-gray-500">
              For {isMe ? 'you' : `${context.relationship} (${context.age})`}
            </p>
          </div>
        </div>

        {/* STATE 3: Progress Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 whitespace-nowrap">
            Understanding your situation ({step} of {totalSteps})
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {/* STATE 2: Context Confirmation */}
            {message.type === 'context' && (
              <div className="mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-purple-900 leading-relaxed mb-2">
                        {message.content}
                      </p>
                      {/* STATE 4: VISIBLE PERSONALIZATION */}
                      {message.personalization && (
                        <div className="bg-white border border-purple-200 rounded-xl p-3">
                          <p className="text-xs text-purple-800 leading-relaxed">
                            {message.personalization}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 3: CareBow Questions */}
            {message.type === 'carebow' && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 max-w-[85%]">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-5">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                    
                    {/* Reasoning explanation */}
                    {message.reasoning && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                          {message.reasoning}
                        </p>
                      </div>
                    )}

                    {/* STATE 4: Visible Personalization */}
                    {message.personalization && (
                      <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-800 leading-relaxed">
                          {message.personalization}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick Response Options */}
                  {message.id === `q${currentQuestion}` && currentQuestion === 2 && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAnswer('Yes', currentQuestion)}
                        className="flex-1 bg-white border border-purple-200 text-purple-700 px-4 py-3 rounded-xl text-sm hover:bg-purple-50 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleAnswer('No', currentQuestion)}
                        className="flex-1 bg-white border border-purple-200 text-purple-700 px-4 py-3 rounded-xl text-sm hover:bg-purple-50 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Messages */}
            {message.type === 'user' && (
              <div className="flex items-start gap-3 justify-end mb-4">
                <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%]">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {step > 0 && step <= 4 && currentQuestion !== 2 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex-shrink-0">
          <form onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).answer;
            if (input.value.trim()) {
              handleAnswer(input.value, currentQuestion);
              input.value = '';
            }
          }}>
            <div className="flex gap-3">
              <input
                name="answer"
                type="text"
                placeholder="Type your response..."
                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}