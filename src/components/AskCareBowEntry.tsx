import { useState, useEffect } from 'react';
import { Sparkles, Mic, User, Users, Info } from 'lucide-react';
import { MedicalDisclaimerSheet } from './MedicalDisclaimerSheet';
import { PrivacyInfoSheet } from './EdgeCaseModals';

interface ProfileOption {
  id: string;
  label: string;
  name: string;
  age?: number;
  relationship: string;
  conditions?: string[];
  medications?: string[];
}

interface AskCareBowEntryProps {
  onStartConversation: (profile: ProfileOption) => void;
  onViewHistory: () => void;
}

export function AskCareBowEntry({ onStartConversation, onViewHistory }: AskCareBowEntryProps) {
  const [selectedContext, setSelectedContext] = useState<ProfileOption | null>(null);
  const [symptomInput, setSymptomInput] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  // EDGE 1: Check if first-time use
  useEffect(() => {
    const hasAccepted = localStorage.getItem('careBow_disclaimer_accepted');
    if (!hasAccepted) {
      setShowDisclaimer(true);
    } else {
      setHasAcceptedDisclaimer(true);
    }
  }, []);

  const profileOptions: ProfileOption[] = [
    {
      id: 'me',
      label: 'For me',
      name: 'Sarah Johnson',
      age: 38,
      relationship: 'Me',
      conditions: ['Seasonal allergies', 'Occasional migraines'],
      medications: ['Cetirizine 10mg', 'Sumatriptan 50mg']
    },
    {
      id: 'father',
      label: 'For my father',
      name: 'Robert Johnson',
      age: 68,
      relationship: 'Father',
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg']
    },
    {
      id: 'other',
      label: 'For someone else',
      name: 'Family Member',
      relationship: 'Other'
    }
  ];

  const handleStart = () => {
    if (!selectedContext || !symptomInput.trim()) return;
    onStartConversation(selectedContext);
  };

  const canStart = selectedContext !== null && symptomInput.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Ask CareBow</h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          I'll use your health profile to guide you safely.
        </p>
      </div>

      {/* Context Selector (MANDATORY) */}
      <div className="px-6 mb-6">
        <div className="text-xs text-gray-700 mb-3">Who is this for?</div>
        <div className="flex gap-3">
          {profileOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedContext(option)}
              className={`flex-1 border-2 rounded-2xl p-4 transition-all ${
                selectedContext?.id === option.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {option.id === 'me' ? (
                  <User className={`w-5 h-5 ${selectedContext?.id === option.id ? 'text-purple-600' : 'text-gray-400'}`} />
                ) : (
                  <Users className={`w-5 h-5 ${selectedContext?.id === option.id ? 'text-purple-600' : 'text-gray-400'}`} />
                )}
                <div className={`text-xs ${selectedContext?.id === option.id ? 'text-purple-900' : 'text-gray-700'}`}>
                  {option.label}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Context Info */}
        {selectedContext && selectedContext.id !== 'other' && (
          <div className="mt-3 bg-purple-50 border border-purple-200 rounded-xl p-3">
            <div className="text-xs text-purple-900 mb-1">
              {selectedContext.name}, {selectedContext.age}
            </div>
            {selectedContext.conditions && selectedContext.conditions.length > 0 && (
              <div className="text-xs text-purple-700">
                • {selectedContext.conditions.join(' • ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 mb-6">
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-sm">
          <textarea
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="Describe symptoms, concerns, or how you're feeling…"
            className="w-full bg-transparent border-none resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            rows={4}
            disabled={!selectedContext}
          />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <button 
              className={`p-2 rounded-lg transition-colors ${
                selectedContext ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'
              }`}
              disabled={!selectedContext}
            >
              <Mic className="w-5 h-5 text-purple-600" />
            </button>
            <button 
              onClick={handleStart}
              disabled={!canStart}
              className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start care conversation
            </button>
          </div>
        </div>

        {/* Reassurance */}
        <div className="mt-3 px-2">
          <p className="text-xs text-gray-500 leading-relaxed">
            This is not a diagnosis, but a safe starting point based on your health context.
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="px-6 mb-6">
        <button
          onClick={onViewHistory}
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-900 mb-1">Care Timeline</div>
              <div className="text-xs text-gray-500">View past assessments and outcomes</div>
            </div>
            <div className="text-xs text-purple-600">View →</div>
          </div>
        </button>
      </div>

      {/* Common Concerns */}
      <div className="px-6">
        <h3 className="text-xs text-gray-700 mb-3">Common concerns</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { emoji: '🤒', title: 'Fever & cold', desc: 'Assess symptoms' },
            { emoji: '🤕', title: 'Pain & aches', desc: 'Get guidance' },
            { emoji: '😰', title: 'Stress & anxiety', desc: 'Talk it through' },
            { emoji: '💊', title: 'Medication', desc: 'Questions & refills' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSymptomInput(item.title.toLowerCase());
              }}
              disabled={!selectedContext}
              className={`bg-white border border-gray-200 rounded-2xl p-4 text-left transition-all ${
                selectedContext 
                  ? 'hover:border-purple-300 hover:shadow-md' 
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="text-2xl mb-2">{item.emoji}</div>
              <div className="text-sm text-gray-900 mb-1">{item.title}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Medical Disclaimer Sheet */}
      {showDisclaimer && (
        <MedicalDisclaimerSheet
          onAccept={() => {
            localStorage.setItem('careBow_disclaimer_accepted', 'true');
            setHasAcceptedDisclaimer(true);
            setShowDisclaimer(false);
          }}
          onDecline={() => {
            setShowDisclaimer(false);
            // Optionally disable Ask CareBow if declined
          }}
        />
      )}

      {/* Privacy Info Sheet */}
      {showPrivacy && (
        <PrivacyInfoSheet
          onManageSettings={() => {
            alert('Navigate to privacy settings');
          }}
          onClose={() => setShowPrivacy(false)}
        />
      )}
    </div>
  );
}