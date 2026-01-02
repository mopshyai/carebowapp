import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ProfileContextSelector } from './ProfileContextSelector';
import {
  getPersonalizationRules,
  getPersonalizedOpening,
  checkMedicationSafety,
  assessRiskLevel,
  getPersonalizedRecommendation,
  getPastSessionReference,
  getMissingProfileData,
  type ProfileContext
} from '../utils/careBowPersonalization';

interface Message {
  id: string;
  type: 'carebow' | 'user' | 'system';
  content: string;
  reasoning?: string;
  profileInsight?: string;
}

interface PersonalizedConversationProps {
  onComplete: () => void;
  onBack: () => void;
}

export function PersonalizedConversation({ onComplete, onBack }: PersonalizedConversationProps) {
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [collectedData, setCollectedData] = useState({
    symptoms: [] as string[],
    duration: '',
    severity: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize conversation with personalized opening
    const rules = getPersonalizationRules(selectedProfile);
    const opening = getPersonalizedOpening(selectedProfile);
    
    // Check for missing profile data
    const missingData = getMissingProfileData(selectedProfile);
    
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        type: 'carebow',
        content: opening,
        profileInsight: `I'm adjusting my approach because this is for ${selectedProfile.relationship === 'Me' ? 'you' : selectedProfile.name}`
      };
      setMessages([welcomeMessage]);

      // Prompt for missing data if needed
      if (missingData.hasMissing) {
        setTimeout(() => {
          const missingDataMessage: Message = {
            id: '1.5',
            type: 'system',
            content: missingData.promptMessage || '',
            profileInsight: 'Missing profile data reduces recommendation safety'
          };
          setMessages(prev => [...prev, missingDataMessage]);
        }, 1500);
      }

      // Ask first question
      setTimeout(() => {
        const firstQuestion: Message = {
          id: '2',
          type: 'carebow',
          content: `What's bringing ${selectedProfile.relationship === 'Me' ? 'you' : selectedProfile.name} to CareBow today?`
        };
        setMessages(prev => [...prev, firstQuestion]);
      }, missingData.hasMissing ? 3000 : 2000);
    }, 500);
  }, [selectedProfile]);

  const addMessage = (content: string, type: 'carebow' | 'user' | 'system', reasoning?: string, profileInsight?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      reasoning,
      profileInsight
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    addMessage(input, 'user');
    const userInput = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    // Simulate CareBow processing with personalization
    setTimeout(() => {
      handleCareBowResponse(userInput);
      setIsTyping(false);
    }, 1500);
  };

  const handleCareBowResponse = (userInput: string) => {
    const rules = getPersonalizationRules(selectedProfile);

    if (currentStep === 0) {
      // Collect initial symptom
      const symptoms = [userInput];
      setCollectedData(prev => ({ ...prev, symptoms }));

      // Check if similar symptoms occurred before
      const pastRef = getPastSessionReference(selectedProfile, symptoms);
      
      if (pastRef.hasSimilar) {
        addMessage(
          pastRef.reference || '',
          'system',
          undefined,
          'Referencing past CareBow outcomes for continuity'
        );
      }

      // Ask about duration
      setTimeout(() => {
        addMessage(
          `How long ${selectedProfile.relationship === 'Me' ? 'have you' : `has ${selectedProfile.name}`} been experiencing this?`,
          'carebow'
        );
        setCurrentStep(1);
      }, pastRef.hasSimilar ? 2000 : 500);

    } else if (currentStep === 1) {
      // Collect duration
      setCollectedData(prev => ({ ...prev, duration: userInput }));

      // Ask about severity with age-appropriate framing
      setTimeout(() => {
        let severityQuestion = '';
        if (selectedProfile.age && selectedProfile.age < 18) {
          severityQuestion = `On a scale of 1-10, how much is this bothering ${selectedProfile.name}? (1 = barely noticeable, 10 = unbearable)`;
        } else {
          severityQuestion = `How would ${selectedProfile.relationship === 'Me' ? 'you' : selectedProfile.name} rate the severity? (1-10, where 10 is the worst)`;
        }
        addMessage(severityQuestion, 'carebow');
        setCurrentStep(2);
      }, 500);

    } else if (currentStep === 2) {
      // Collect severity and perform analysis
      setCollectedData(prev => ({ ...prev, severity: userInput }));

      setTimeout(() => {
        performPersonalizedAnalysis(userInput);
      }, 1000);
    }
  };

  const performPersonalizedAnalysis = (severity: string) => {
    const { symptoms, duration } = collectedData;

    // Assess risk with personalization
    const riskAssessment = assessRiskLevel(symptoms, selectedProfile, duration);
    
    addMessage(
      `Let me analyze this carefully...`,
      'carebow'
    );

    setTimeout(() => {
      // Show profile-based reasoning
      const reasoning = riskAssessment.reasoning.join(' ');
      addMessage(
        `Based on what you've told me and ${selectedProfile.name}'s health profile, here's my assessment:`,
        'carebow',
        reasoning,
        'Using profile data to adjust risk sensitivity'
      );

      setTimeout(() => {
        // Check medication safety
        const medCheck = checkMedicationSafety(selectedProfile, 'ibuprofen');
        
        if (!medCheck.safe) {
          addMessage(
            `⚠️ Important: ${medCheck.reason}. I won't recommend ${medCheck.alternatives ? `that. Instead, consider ${medCheck.alternatives.join(' or ')}.` : 'this treatment.'}`,
            'system',
            undefined,
            'Blocked unsafe recommendation based on profile allergies/medications'
          );
        }

        setTimeout(() => {
          // Get personalized recommendation
          const recommendation = getPersonalizedRecommendation(selectedProfile, riskAssessment.level);
          
          addMessage(
            `I recommend: ${recommendation.careType}`,
            'carebow',
            recommendation.reasoning,
            `Recommendation adjusted for: age ${selectedProfile.age}, ${selectedProfile.conditions?.join(', ')}`
          );

          setTimeout(() => {
            addMessage(
              `${recommendation.reasoning} I suggest scheduling this ${recommendation.urgency}.`,
              'carebow'
            );

            setTimeout(() => {
              addMessage(
                `I'll also check in with you tomorrow to see how ${selectedProfile.relationship === 'Me' ? 'you\'re' : `${selectedProfile.name} is`} doing. Would you like me to book care now?`,
                'carebow',
                undefined,
                'Follow-up frequency based on preferences and risk level'
              );
            }, 1500);
          }, 1500);
        }, medCheck.safe ? 1000 : 2500);
      }, 1500);
    }, 1000);
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
              <h1 className="text-sm text-gray-900">Ask CareBow</h1>
            </div>
            <p className="text-xs text-gray-500">Personalized AI care guidance</p>
          </div>
        </div>
      </div>

      {/* Profile Context */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
        <ProfileContextSelector
          selectedProfile={selectedProfile}
          onSelectProfile={setSelectedProfile}
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
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                    <p className="text-sm text-gray-900 leading-relaxed">{message.content}</p>
                    {message.reasoning && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-gray-600 leading-relaxed">
                            <strong className="text-purple-600">Why: </strong>{message.reasoning}
                          </div>
                        </div>
                      </div>
                    )}
                    {message.profileInsight && (
                      <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-3 h-3 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-purple-700">{message.profileInsight}</div>
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-900 leading-relaxed">{message.content}</p>
                      {message.profileInsight && (
                        <div className="mt-2 text-xs text-yellow-700">{message.profileInsight}</div>
                      )}
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
          />
          <button className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
