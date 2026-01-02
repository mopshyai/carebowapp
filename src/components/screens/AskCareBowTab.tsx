import { useState } from 'react';
import { MessageCircleHeart, User, Users, Mic, Info } from 'lucide-react';

interface AskCareBowTabProps {
  onStartConversation: (context: any, symptom: string) => void;
}

export function AskCareBowTab({ onStartConversation }: AskCareBowTabProps) {
  const [contextType, setContextType] = useState<'me' | 'family'>('me');
  const [familyRelation, setFamilyRelation] = useState('');
  const [familyAge, setFamilyAge] = useState('');
  const [symptomInput, setSymptomInput] = useState('');

  const handleStart = () => {
    if (!symptomInput.trim()) return;
    
    const context = contextType === 'me' 
      ? { relationship: 'me' }
      : { relationship: familyRelation, age: parseInt(familyAge) };
    
    onStartConversation(context, symptomInput);
  };

  const canStart = symptomInput.trim().length > 0 && 
    (contextType === 'me' || (familyRelation && familyAge));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* HEADER - With Safe Area Top */}
      <div className="px-6 pt-[calc(48px+env(safe-area-inset-top,0px))] pb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircleHeart className="w-7 h-7 text-white fill-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Ask CareBow</h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          I'll use your health info to guide you safely.
        </p>
      </div>

      {/* SCROLLABLE CONTENT - With Bottom Safe Padding */}
      <div className="px-6 space-y-6 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        {/* CONTEXT SELECTOR */}
        <div>
          <label className="text-sm text-gray-700 mb-3 block">
            Who is this for? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setContextType('me')}
              className={`border-2 rounded-2xl p-5 transition-all ${
                contextType === 'me'
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <User className={`w-7 h-7 ${contextType === 'me' ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2} />
                <div className={`text-sm font-medium ${contextType === 'me' ? 'text-purple-900' : 'text-gray-700'}`}>
                  For me
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setContextType('family')}
              className={`border-2 rounded-2xl p-5 transition-all ${
                contextType === 'family'
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <Users className={`w-7 h-7 ${contextType === 'family' ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2} />
                <div className={`text-sm font-medium ${contextType === 'family' ? 'text-purple-900' : 'text-gray-700'}`}>
                  For a family member
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* FAMILY CONTEXT FIELDS */}
        {contextType === 'family' && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-sm text-purple-900 mb-2 block">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                value={familyRelation}
                onChange={(e) => setFamilyRelation(e.target.value)}
                className="w-full bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select relationship...</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other family member</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-purple-900 mb-2 block">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={familyAge}
                onChange={(e) => setFamilyAge(e.target.value)}
                placeholder="Enter their age"
                min="0"
                max="120"
                className="w-full bg-white border-2 border-purple-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="bg-white border border-purple-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-purple-800 leading-relaxed">
                  Age helps me provide safer guidance, especially for children and older adults.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LARGER INPUT BOX */}
        <div>
          <label className="text-sm text-gray-700 mb-3 block">
            What's going on? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder={
                contextType === 'me' 
                  ? "Describe what you're experiencing..." 
                  : "Describe what they're experiencing..."
              }
              rows={6}
              className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
            <button 
              className="absolute bottom-4 right-4 p-3 hover:bg-purple-50 rounded-xl transition-colors"
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Be as specific as possible. Include when it started, how severe it is, and anything you've tried.
          </p>
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full py-4 rounded-2xl font-medium text-base transition-all ${
            canStart
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Start care conversation
        </button>

        {/* DISCLAIMER */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-800 leading-relaxed text-center">
            For emergencies, call <strong>911</strong> immediately. CareBow is not a substitute for emergency services.
          </p>
        </div>
      </div>
    </div>
  );
}