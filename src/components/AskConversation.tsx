import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Volume2, Loader2, Sparkles } from 'lucide-react';
import { ProfileContextSelector } from './ProfileContextSelector';
import type { HealthProfile, ConversationMessage, HealthSession } from '../App';

interface ProfileContext {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  conditions?: string[];
}

interface AskConversationProps {
  userProfile: HealthProfile;
  onComplete: (session: HealthSession) => void;
  onBack: () => void;
}

export function AskConversation({ userProfile, onComplete, onBack }: AskConversationProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileContext>({
    id: 'self',
    name: 'Sarah Johnson',
    relationship: 'Me',
    age: 38,
    conditions: ['Seasonal allergies', 'Occasional migraines']
  });
  const [showProfileSelector, setShowProfileSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationFlow = [
    {
      question: "What are you feeling right now?",
      explanation: null,
      placeholder: "Describe how you're feeling in your own words..."
    },
    {
      question: "When did this start?",
      explanation: "I'm asking this to understand how urgent your situation might be.",
      placeholder: "For example: this morning, 2 days ago..."
    },
    {
      question: "On a scale from 1 to 10, how would you rate the intensity right now?",
      explanation: "This helps me understand the severity of what you're experiencing.",
      placeholder: "1 being very mild, 10 being the worst imaginable..."
    },
    {
      question: "Is this something you've experienced before?",
      explanation: "Your medical history helps me give you more personalized guidance.",
      placeholder: "Yes, no, or describe if it's similar..."
    },
    {
      question: "Have you taken anything or tried anything to help?",
      explanation: "This helps me understand what's already been tried and what might help next.",
      placeholder: "Medication, rest, home remedies..."
    },
    {
      question: "Are you experiencing anything else alongside this? Any other symptoms?",
      explanation: "Understanding the full picture helps me give you safer, more accurate guidance.",
      placeholder: "Other symptoms, pain, or concerns..."
    }
  ];

  useEffect(() => {
    // Initial greeting with delay for natural feel
    setTimeout(() => {
      setIsTyping(true);
    }, 500);

    setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        role: 'carebow',
        content: conversationFlow[0].question,
        timestamp: new Date()
      }]);
    }, 1500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: ConversationMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setUserResponses(prev => [...prev, messageText]);
    setInput('');

    // Check if we're done
    if (currentStep >= conversationFlow.length - 1) {
      // Show final acknowledgment
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const finalMessage: ConversationMessage = {
          role: 'carebow',
          content: "Thank you for sharing all of this with me. I have a clear picture now. Let me analyze what you've told me and provide you with guidance based on your health profile and clinical guidelines.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, finalMessage]);

        // Complete conversation and show assessment
        setTimeout(() => {
          const session: HealthSession = {
            id: Date.now().toString(),
            date: new Date(),
            summary: userResponses[0] || 'Health concern discussed',
            riskLevel: 'medium',
            recommendation: 'Video consultation recommended'
          };
          onComplete(session);
        }, 2500);
      }, 1000);
      return;
    }

    // Move to next question
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    setTimeout(() => {
      setIsTyping(true);
    }, 800);

    setTimeout(() => {
      setIsTyping(false);
      const nextQuestion = conversationFlow[nextStep];
      
      const messages: ConversationMessage[] = [];
      
      // Add explanation if exists
      if (nextQuestion.explanation) {
        messages.push({
          role: 'carebow',
          content: nextQuestion.explanation,
          timestamp: new Date()
        });
      }
      
      // Add main question
      messages.push({
        role: 'carebow',
        content: nextQuestion.question,
        timestamp: new Date()
      });

      setMessages(prev => [...prev, ...messages]);
    }, 2000);
  };

  const progressPercentage = ((currentStep + 1) / conversationFlow.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-sm text-gray-900">CareBow</h1>
              <p className="text-xs text-gray-500">AI Care Assistant</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Volume2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Understanding your situation...</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-purple-600 to-purple-500 h-1 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((message, idx) => (
            <div key={idx} className="animate-fadeIn">
              {message.role === 'carebow' ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-white">CB</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                      <p className="text-sm text-gray-900 leading-relaxed">{message.content}</p>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 ml-1">
                      {message.timestamp.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[80%]">
                    <div className="bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 mr-1 text-right">
                      {message.timestamp.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-4 animate-fadeIn">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-white">CB</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {!isTyping && currentStep < conversationFlow.length && (
        <div className="bg-white border-t border-gray-200 px-6 py-5">
          <div className="max-w-2xl mx-auto">
            {/* Placeholder hint */}
            {input.length === 0 && (
              <div className="text-xs text-gray-500 mb-3 px-1">
                {conversationFlow[currentStep].placeholder}
              </div>
            )}
            
            <div className="flex items-end gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                <Mic className="w-5 h-5 text-purple-600" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your response..."
                className="flex-1 bg-gray-100 border-none rounded-2xl px-5 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[48px] max-h-32"
                rows={1}
                style={{ 
                  height: 'auto',
                  minHeight: '48px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                className="bg-gradient-to-br from-purple-600 to-purple-500 text-white px-6 py-3 rounded-full text-sm hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                Send
              </button>
            </div>

            {/* Help text */}
            <div className="text-xs text-gray-400 mt-3 text-center">
              Take your time. There's no rush.
            </div>
          </div>
        </div>
      )}

      {/* Completion state */}
      {currentStep >= conversationFlow.length && !isTyping && (
        <div className="bg-white border-t border-gray-200 px-6 py-5">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
            <div className="text-sm text-gray-600">
              Analyzing your symptoms and preparing guidance...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}