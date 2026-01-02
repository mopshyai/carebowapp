import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, Mic, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { ProfileContextSelector } from './ProfileContextSelector';
import type { ProfileContext } from '../utils/careBowPersonalization';
import type { HealthProfile, HealthSession } from '../App';
import {
  detectEmergency,
  getEmergencyResponse,
  getPersonalizedOpening,
  checkPastSessions,
  getNextQuestion,
  assessRisk,
  getRecommendation,
  checkMissingProfileData,
  type CareBowMessage,
  type ConversationState
} from '../utils/careBowEngine';

interface EnhancedCareBowChatProps {
  onBack: () => void;
  onComplete: (session: HealthSession) => void;
  userProfile: HealthProfile;
}

export function EnhancedCareBowChat({ onBack, onComplete, userProfile }: EnhancedCareBowChatProps) {
  const [messages, setMessages] = useState<CareBowMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileContext>({
    id: 'self',
    name: 'Sarah Johnson',
    relationship: 'Me',
    age: 38,
    conditions: ['Seasonal allergies', 'Occasional migraines'],
    medications: ['Cetirizine 10mg (as needed)', 'Sumatriptan 50mg (for migraines)'],
    allergies: ['Penicillin', 'Shellfish'],
    bloodGroup: 'O+',
    pastSessions: [
      {
        date: '2 weeks ago',
        symptoms: ['headache', 'nausea'],
        outcome: 'It was a migraine episode',
        resolution: 'Resolved in 2 days with Sumatriptan and rest'
      }
    ]
  });

  const [state, setState] = useState<ConversationState>({
    careSubject: null,
    symptoms: [],
    duration: '',
    severity: 0,
    redFlags: [],
    isEmergency: false,
    step: 0
  });

  const [profileSelected, setProfileSelected] = useState(true); // Start with profile selected
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize conversation
    if (profileSelected && messages.length === 0) {
      setState(prev => ({ ...prev, careSubject: selectedProfile }));
      
      setTimeout(() => {
        // Check for missing profile data first
        const missingDataMsg = checkMissingProfileData(selectedProfile);
        if (missingDataMsg) {
          addMessage(missingDataMsg);
          setTimeout(() => {
            addMessage(getPersonalizedOpening(selectedProfile));
          }, 2000);
        } else {
          addMessage(getPersonalizedOpening(selectedProfile));
        }
      }, 500);
    }
  }, [profileSelected, selectedProfile]);

  const addMessage = (message: CareBowMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: CareBowMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    addMessage(userMessage);

    const userInput = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    // STEP 8: EMERGENCY OVERRIDE
    if (detectEmergency(userInput)) {
      setState(prev => ({ ...prev, isEmergency: true }));
      setTimeout(() => {
        addMessage(getEmergencyResponse());
        setIsTyping(false);
      }, 1000);
      return;
    }

    // Process based on current step
    setTimeout(() => {
      processUserInput(input, userInput);
      setIsTyping(false);
    }, 1500);
  };

  const processUserInput = (originalInput: string, lowerInput: string) => {
    const currentStep = state.step;

    if (currentStep === 0) {
      // First symptom collection
      setState(prev => ({ ...prev, symptoms: [originalInput], step: 1 }));

      // STEP 6: Check past sessions
      const pastSessionMsg = checkPastSessions(selectedProfile, [originalInput]);
      if (pastSessionMsg) {
        addMessage(pastSessionMsg);
        setTimeout(() => {
          addMessage(getNextQuestion(
            { ...state, symptoms: [originalInput], step: 1 },
            selectedProfile
          ));
        }, 2000);
      } else {
        addMessage(getNextQuestion(
          { ...state, symptoms: [originalInput], step: 1 },
          selectedProfile
        ));
      }

    } else if (currentStep === 1) {
      // Duration collection
      setState(prev => ({ ...prev, duration: originalInput, step: 2 }));
      
      setTimeout(() => {
        addMessage(getNextQuestion(
          { ...state, duration: originalInput, step: 2 },
          selectedProfile
        ));
      }, 500);

    } else if (currentStep === 2) {
      // Severity collection
      const severity = parseInt(originalInput) || 5;
      setState(prev => ({ ...prev, severity, step: 3 }));

      setTimeout(() => {
        addMessage(getNextQuestion(
          { ...state, severity, step: 3 },
          selectedProfile
        ));
      }, 500);

    } else if (currentStep === 3) {
      // Red flags collection
      const hasRedFlags = lowerInput.includes('yes');
      const redFlags = hasRedFlags ? ['Warning signs present'] : [];
      
      setState(prev => ({ ...prev, redFlags, step: 4 }));

      // Perform analysis
      setTimeout(() => {
        performAnalysis({ ...state, redFlags, step: 4 });
      }, 1000);
    }
  };

  const performAnalysis = (finalState: ConversationState) => {
    // Show thinking message
    const thinkingMsg: CareBowMessage = {
      id: Date.now().toString(),
      type: 'carebow',
      content: `Let me carefully assess what you've told me about ${selectedProfile.relationship === 'Me' ? 'you' : selectedProfile.name}...`,
      reasoning: 'Analyzing symptoms with profile context',
      timestamp: new Date()
    };
    addMessage(thinkingMsg);

    setTimeout(() => {
      // STEP 2: Assess risk with personalization
      const riskAssessment = assessRisk(finalState, selectedProfile);
      
      // Show reasoning
      const reasoningMsg: CareBowMessage = {
        id: Date.now().toString(),
        type: 'carebow',
        content: `Here's my assessment:\n\n${riskAssessment.reasoning.map(r => `• ${r}`).join('\n')}`,
        reasoning: 'Transparent risk analysis',
        profileReference: `Risk level: ${riskAssessment.level}`,
        timestamp: new Date()
      };
      addMessage(reasoningMsg);

      setTimeout(() => {
        // STEP 5: Clear recommendation
        const recommendation = getRecommendation(
          riskAssessment.level,
          selectedProfile,
          finalState
        );
        addMessage(recommendation);

        // Complete session
        const session: HealthSession = {
          id: Date.now().toString(),
          date: new Date(),
          summary: finalState.symptoms.join(', '),
          riskLevel: riskAssessment.level,
          recommendation: recommendation.content.split('\n')[0].replace('**My Recommendation: ', '').replace('**', '')
        };
        onComplete(session);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h1 className="text-sm text-gray-900">CareBow</h1>
            </div>
            <p className="text-xs text-gray-500">Personalized care guidance</p>
          </div>
        </div>
      </div>

      {/* Profile Context */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
        <ProfileContextSelector
          selectedProfile={selectedProfile}
          onSelectProfile={(profile) => {
            setSelectedProfile(profile);
            // Reset conversation when profile changes
            setMessages([]);
            setState({
              careSubject: profile,
              symptoms: [],
              duration: '',
              severity: 0,
              redFlags: [],
              isEmergency: false,
              step: 0
            });
          }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
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
                    
                    {message.reasoning && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-gray-600 leading-relaxed">
                            <strong className="text-purple-600">Why I'm asking: </strong>
                            {message.reasoning}
                          </div>
                        </div>
                      </div>
                    )}

                    {message.profileReference && (
                      <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-purple-700">{message.profileReference}</div>
                        </div>
                      </div>
                    )}
                  </div>
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

            {message.type === 'system' && (
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                      {message.reasoning && (
                        <div className="mt-2 text-xs text-blue-700">{message.reasoning}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message.type === 'emergency' && (
              <div className="mb-4">
                <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div className="flex-1">
                      <div className="text-sm text-red-900 mb-1">⚠️ URGENT</div>
                      <p className="text-sm text-red-900 leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                      <button className="mt-4 bg-red-600 text-white px-6 py-3 rounded-xl text-sm hover:bg-red-700 transition-colors w-full">
                        Call Emergency Services Now
                      </button>
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
        {!state.isEmergency && (
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
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}