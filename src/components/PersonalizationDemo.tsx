import { ArrowLeft, User, Sparkles, AlertTriangle, Home, Video, Heart } from 'lucide-react';
import { getPersonalizationRules, type ProfileContext } from '../utils/careBowPersonalization';

interface PersonalizationDemoProps {
  onBack: () => void;
  onStartPersonalized: () => void;
}

export function PersonalizationDemo({ onBack, onStartPersonalized }: PersonalizationDemoProps) {
  const profiles: ProfileContext[] = [
    {
      id: 'self',
      name: 'Sarah Johnson',
      relationship: 'Me',
      age: 38,
      conditions: ['Seasonal allergies', 'Occasional migraines'],
      medications: ['Cetirizine 10mg', 'Sumatriptan 50mg'],
      allergies: ['Penicillin', 'Shellfish'],
      bloodGroup: 'O+'
    },
    {
      id: 'father',
      name: 'Robert Johnson',
      relationship: 'Father',
      age: 65,
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg'],
      allergies: [],
      bloodGroup: 'A+'
    },
    {
      id: 'daughter',
      name: 'Emma Johnson',
      relationship: 'Daughter',
      age: 8,
      conditions: ['Asthma'],
      medications: ['Albuterol inhaler'],
      allergies: [],
      bloodGroup: 'O+'
    },
    {
      id: 'spouse',
      name: 'Michael Johnson',
      relationship: 'Spouse',
      age: 42,
      conditions: [],
      medications: [],
      allergies: [],
      bloodGroup: 'B+'
    }
  ];

  const getRiskColor = (tolerance: string) => {
    switch (tolerance) {
      case 'low': return 'red';
      case 'medium': return 'yellow';
      case 'high': return 'green';
      default: return 'gray';
    }
  };

  const getCareIcon = (method: string) => {
    switch (method) {
      case 'home-visit': return Home;
      case 'video': return Video;
      default: return Heart;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg text-gray-900">How CareBow Personalizes Care</h1>
            <p className="text-xs text-gray-500">See how profile data changes AI behavior</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-purple-900 mb-2">CareBow is never generic</div>
              <div className="text-xs text-purple-700 leading-relaxed">
                Every response is personalized using age, conditions, medications, and past outcomes. 
                Below you can see how CareBow's behavior changes for each family member.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Comparison */}
      <div className="px-6">
        <h3 className="text-sm text-gray-700 mb-3">Personalization Rules by Profile</h3>
        <div className="space-y-4">
          {profiles.map((profile) => {
            const rules = getPersonalizationRules(profile);
            const CareIcon = getCareIcon(rules.preferredCareMethod);
            const riskColor = getRiskColor(rules.riskTolerance);

            return (
              <div key={profile.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                {/* Profile Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{profile.name}</div>
                    <div className="text-xs text-gray-600">{profile.relationship} • {profile.age} years old</div>
                  </div>
                </div>

                {/* Health Context */}
                <div className="mb-4">
                  <div className="text-xs text-gray-600 mb-2">Health Profile:</div>
                  {profile.conditions && profile.conditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {profile.conditions.map((condition, idx) => (
                        <div key={idx} className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-2 py-1 rounded-lg text-xs">
                          {condition}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mb-2">No chronic conditions</div>
                  )}
                  {profile.medications && profile.medications.length > 0 && (
                    <div className="text-xs text-gray-600">
                      Taking: {profile.medications.join(', ')}
                    </div>
                  )}
                </div>

                {/* Personalization Rules */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="text-xs text-purple-900 mb-3">CareBow's Personalization:</div>
                  
                  <div className="space-y-3">
                    {/* Risk Tolerance */}
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 bg-${riskColor}-500 rounded-full mt-1.5 flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="text-xs text-gray-900 mb-0.5">Risk Tolerance: <strong className="capitalize">{rules.riskTolerance}</strong></div>
                        <div className="text-xs text-gray-600">
                          {rules.riskTolerance === 'low' && 
                            `Because of ${profile.age && profile.age >= 60 ? 'age and ' : ''}${profile.conditions?.length ? 'chronic conditions' : 'profile factors'}, I'm extra cautious`}
                          {rules.riskTolerance === 'medium' && 
                            `Standard medical caution for a ${profile.age}-year-old`}
                          {rules.riskTolerance === 'high' && 
                            `Healthy profile allows for self-care when appropriate`}
                        </div>
                      </div>
                    </div>

                    {/* Preferred Care */}
                    <div className="flex items-start gap-2">
                      <CareIcon className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-900 mb-0.5">Preferred Care: <strong className="capitalize">{rules.preferredCareMethod.replace('-', ' ')}</strong></div>
                        <div className="text-xs text-gray-600">
                          {rules.preferredCareMethod === 'home-visit' && 
                            `At age ${profile.age}, in-home care is prioritized for thorough assessment`}
                          {rules.preferredCareMethod === 'video' && 
                            `Video consultations balance convenience and professional care`}
                          {rules.preferredCareMethod === 'self-care' && 
                            `Self-care guidance with professional backup when needed`}
                        </div>
                      </div>
                    </div>

                    {/* Urgency */}
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-900 mb-0.5">Urgency Factor: <strong>{rules.urgencyMultiplier.toFixed(1)}x</strong></div>
                        <div className="text-xs text-gray-600">
                          {rules.urgencyMultiplier > 1 
                            ? `Escalates faster due to age/conditions`
                            : `Standard escalation timeline`}
                        </div>
                      </div>
                    </div>

                    {/* Medication Checking */}
                    <div className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${rules.shouldCheckMedications ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {rules.shouldCheckMedications && <div className="w-2 h-2 bg-green-600 rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-900 mb-0.5">Medication Safety Checks: <strong>{rules.shouldCheckMedications ? 'Active' : 'N/A'}</strong></div>
                        <div className="text-xs text-gray-600">
                          {rules.shouldCheckMedications 
                            ? `All recommendations checked against ${profile.medications?.length} medication(s)`
                            : `No medications on file - reduced safety checking`}
                        </div>
                      </div>
                    </div>

                    {/* Tone */}
                    <div className="pt-3 border-t border-purple-200">
                      <div className="text-xs text-purple-900 mb-1">Communication Tone:</div>
                      <div className="text-xs text-gray-600 italic">
                        {rules.tone === 'cautious' && 
                          `"I'm being extra careful because of your health history..."`}
                        {rules.tone === 'reassuring' && 
                          `"This appears manageable, but let me help you monitor it..."`}
                        {rules.tone === 'urgent' && 
                          `"Based on your symptoms, immediate care is important..."`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 mt-8">
        <button
          onClick={onStartPersonalized}
          className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-2xl p-5 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5" />
            <div className="text-sm">Try Personalized CareBow</div>
          </div>
        </button>
      </div>

      {/* Rules Summary */}
      <div className="px-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="text-xs text-gray-900 mb-3">CareBow Personalization Rules:</div>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <div>If chronic conditions exist → lower risk tolerance</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <div>If elder (&gt;60) → prefer home visit over self-care</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <div>If medications conflict → block unsafe advice</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <div>If similar issue occurred before → reference past outcome</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <div>If profile data is missing → ask to complete it</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
