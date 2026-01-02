import { useState, useEffect } from 'react';
import { Heart, User, Users, ArrowRight, Info } from 'lucide-react';

interface FamilyContext {
  relationship: 'me' | 'father' | 'mother' | 'other';
  age?: number;
}

interface AskCareBowMVPProps {
  onStartConversation: (context: FamilyContext, symptom: string) => void;
}

export function AskCareBowMVP({ onStartConversation }: AskCareBowMVPProps) {
  const [contextType, setContextType] = useState<'me' | 'family' | null>(null);
  const [familyContext, setFamilyContext] = useState<FamilyContext>({
    relationship: 'father',
    age: undefined
  });
  const [symptom, setSymptom] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Check first-time use
  useEffect(() => {
    const accepted = localStorage.getItem('carebow_mvp_disclaimer');
    if (!accepted) {
      setShowDisclaimer(true);
    } else {
      setHasAccepted(true);
    }
  }, []);

  const handleStart = () => {
    if (!symptom.trim()) return;
    
    const context: FamilyContext = contextType === 'me' 
      ? { relationship: 'me' }
      : familyContext;
    
    onStartConversation(context, symptom);
  };

  const canStart = contextType !== null && symptom.trim().length > 0 && 
    (contextType === 'me' || (familyContext.relationship && familyContext.age));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-7 h-7 text-white fill-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Ask CareBow</h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          I'll use your health information to guide you safely.
        </p>
      </div>

      {/* Context Selector (REQUIRED) */}
      <div className="px-6 mb-6">
        <label className="text-sm text-gray-700 mb-3 block">
          Who is this for? <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setContextType('me')}
            className={`flex-1 border-2 rounded-2xl p-5 transition-all ${
              contextType === 'me'
                ? 'border-purple-600 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <User className={`w-6 h-6 ${contextType === 'me' ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2} />
              <div className={`text-sm ${contextType === 'me' ? 'text-purple-900' : 'text-gray-700'}`}>
                For me
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setContextType('family')}
            className={`flex-1 border-2 rounded-2xl p-5 transition-all ${
              contextType === 'family'
                ? 'border-purple-600 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Users className={`w-6 h-6 ${contextType === 'family' ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2} />
              <div className={`text-sm ${contextType === 'family' ? 'text-purple-900' : 'text-gray-700'}`}>
                For a family member
              </div>
            </div>
          </button>
        </div>

        {/* Family Member Fields (Inline) */}
        {contextType === 'family' && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-4 animate-fadeIn">
            <div>
              <label className="text-xs text-purple-900 mb-2 block">
                Relationship <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {(['father', 'mother', 'other'] as const).map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setFamilyContext({ ...familyContext, relationship: rel })}
                    className={`flex-1 px-4 py-3 rounded-xl text-xs capitalize transition-all ${
                      familyContext.relationship === rel
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white border border-purple-200 text-purple-700 hover:border-purple-400'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="age" className="text-xs text-purple-900 mb-2 block">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                id="age"
                type="number"
                value={familyContext.age || ''}
                onChange={(e) => setFamilyContext({ ...familyContext, age: parseInt(e.target.value) || undefined })}
                placeholder="Enter age"
                className="w-full bg-white border border-purple-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
                max="120"
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary Input */}
      <div className="px-6 mb-8">
        <label className="text-sm text-gray-700 mb-3 block">
          Describe symptoms or concerns <span className="text-red-500">*</span>
        </label>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm focus-within:border-purple-500 transition-colors">
          <textarea
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="Describe symptoms or concerns…"
            className="w-full bg-transparent border-none resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            rows={5}
            disabled={!contextType}
          />
        </div>
        {!contextType && (
          <p className="text-xs text-gray-500 mt-2 px-2">
            Select who this is for to continue
          </p>
        )}
      </div>

      {/* Primary CTA */}
      <div className="px-6">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full bg-purple-600 text-white rounded-2xl py-5 hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
        >
          <span className="text-base">Start care conversation</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {!canStart && (
          <p className="text-xs text-gray-500 text-center mt-3">
            {!contextType && 'Please select who this is for'}
            {contextType === 'family' && !familyContext.age && 'Please enter age'}
            {contextType && (!symptom.trim()) && 'Please describe symptoms'}
          </p>
        )}
      </div>

      {/* Disclaimer Sheet */}
      {showDisclaimer && (
        <DisclaimerSheet
          onAccept={() => {
            localStorage.setItem('carebow_mvp_disclaimer', 'true');
            setHasAccepted(true);
            setShowDisclaimer(false);
          }}
        />
      )}
    </div>
  );
}

// STATE 7: Soft Disclaimer (One-Time)
function DisclaimerSheet({ onAccept }: { onAccept: () => void }) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end animate-fadeIn">
      <div className="bg-white rounded-t-3xl w-full p-6 pb-8 animate-slideUp shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Info className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        
        <h2 className="text-lg text-gray-900 text-center mb-2">Before we begin</h2>
        
        <p className="text-sm text-gray-700 text-center leading-relaxed mb-6 px-4">
          CareBow provides guidance, not a medical diagnosis.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6">
          <p className="text-xs text-purple-900 leading-relaxed">
            This tool helps you understand your symptoms and next steps, but it does not replace professional medical advice. 
            Always seek immediate care for emergencies.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 bg-gray-50 rounded-xl">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-gray-900">
            I understand
          </span>
        </label>

        <button
          onClick={onAccept}
          disabled={!understood}
          className="w-full bg-purple-600 text-white rounded-2xl py-4 hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}