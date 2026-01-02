import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Sparkles, Send } from 'lucide-react';

interface Message {
  id: string;
  type: 'carebow' | 'user';
  content: string;
  whyAsking?: string;
}

interface ConversationScreenProps {
  context: any;
  initialSymptom: string;
  onBack: () => void;
  onComplete: (assessmentData: any) => void;
}

export function ConversationScreen({ context, initialSymptom, onBack, onComplete }: ConversationScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const totalSteps = 5;
  const isMe = context.relationship === 'me';
  const isElder = context.age && context.age >= 60;
  const subject = isMe ? 'you' : (context.relationship === 'father' ? 'he' : context.relationship === 'mother' ? 'she' : 'they');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Start first question
    setTimeout(() => {
      askQuestion(0);
    }, 500);
  }, []);

  const questions = [
    {
      content: `How long has ${subject} been experiencing this?`,
      whyAsking: `I'm asking this to understand whether this could be urgent.`
    },
    {
      content: `On a scale of 1-10, how would ${subject} rate the severity?\n\n1 = barely noticeable\n10 = worst imaginable`,
      whyAsking: isElder 
        ? `Given their age, I need to be extra careful with moderate-to-severe symptoms.`
        : `This helps me gauge how urgent this is.`
    },
    {
      content: `Is ${subject} experiencing any of these:\n\n• Fever over 102°F\n• Difficulty breathing\n• Severe pain\n• Confusion`,
      whyAsking: `I'm checking for warning signs that would change my recommendation.`,
      quickReplies: ['Yes', 'No']
    },
    {
      content: `Has ${subject} tried anything to help with this?`,
      whyAsking: `Understanding what's been tried helps me give better guidance.`
    },
    {
      content: `Thank you. Let me assess this...`,
      whyAsking: undefined
    }
  ];

  const askQuestion = (questionNum: number) => {
    const question = questions[questionNum];
    const newMessage: Message = {
      id: `q${questionNum}`,
      type: 'carebow',
      content: question.content,
      whyAsking: question.whyAsking
    };
    setMessages(prev => [...prev, newMessage]);
    setCurrentStep(questionNum + 1);
  };

  const handleSendMessage = (answer?: string) => {
    const messageText = answer || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText
    };
    setMessages(prev => [...prev, userMessage]);

    // Store answer
    const newAnswers = { ...answers, [currentStep - 1]: messageText };
    setAnswers(newAnswers);

    setInputValue('');

    // Move to next question or complete
    if (currentStep < 4) {
      setTimeout(() => {
        askQuestion(currentStep);
      }, 1000);
    } else {
      // Complete assessment
      setTimeout(() => {
        completeAssessment(newAnswers);
      }, 1500);
    }
  };

  const completeAssessment = (finalAnswers: any) => {
    // Calculate assessment
    const severityAnswer = finalAnswers[1] || '5';
    const severity = parseInt(severityAnswer) || 5;
    const hasRedFlags = (finalAnswers[2] || '').toLowerCase().includes('yes');

    let riskScore = 0;
    if (severity >= 7) riskScore += 2;
    else if (severity >= 4) riskScore += 1;
    if (hasRedFlags) riskScore += 2;
    if (isElder) riskScore += 1;

    const riskLevel = riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';

    let recommendation = 'self-care';
    if (hasRedFlags && (severity >= 7 || isElder)) {
      recommendation = 'emergency';
    } else if (riskLevel === 'high' || (isElder && riskLevel === 'medium')) {
      recommendation = 'video';
    }

    onComplete({
      context,
      symptom: initialSymptom,
      severity,
      hasRedFlags,
      riskLevel,
      recommendation,
      answers: finalAnswers
    });
  };

  const currentQuestion = questions[currentStep - 1];
  const showQuickReplies = currentQuestion && currentQuestion.quickReplies && messages[messages.length - 1]?.id === `q${currentStep - 1}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* HEADER - With Safe Area Top */}
      <div className="bg-white border-b border-gray-200 px-6 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-600 fill-purple-600" strokeWidth={2} />
              <h1 className="text-sm text-gray-900">CareBow</h1>
            </div>
            <p className="text-xs text-gray-500">
              For {isMe ? 'you' : `${context.relationship} (${context.age})`}
            </p>
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 whitespace-nowrap">
            {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      {/* MESSAGES - With proper bottom padding */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 pb-[calc(144px+env(safe-area-inset-bottom,0px))]">
        {messages.map((message) => (
          <div key={message.id}>
            {/* CAREBOW MESSAGES */}
            {message.type === 'carebow' && (
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1 max-w-[85%]">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-5">
                    <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                    
                    {/* "Why I'm asking" line */}
                    {message.whyAsking && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                          {message.whyAsking}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* USER MESSAGES */}
            {message.type === 'user' && (
              <div className="flex items-start gap-3 justify-end mb-4">
                <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%]">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* QUICK REPLY CHIPS */}
        {showQuickReplies && currentQuestion.quickReplies && (
          <div className="flex gap-2 pl-14">
            {currentQuestion.quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSendMessage(reply)}
                className="bg-white border-2 border-purple-200 text-purple-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      {currentStep > 0 && currentStep <= 4 && (!currentQuestion?.quickReplies || !showQuickReplies) && (
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex-shrink-0">
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}>
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-3 rounded-xl transition-colors ${
                  inputValue.trim()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}