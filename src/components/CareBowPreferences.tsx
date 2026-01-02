import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CareBowPreferencesProps {
  onBack: () => void;
}

export function CareBowPreferences({ onBack }: CareBowPreferencesProps) {
  const [preferredCare, setPreferredCare] = useState('ai-first');
  const [followUpFrequency, setFollowUpFrequency] = useState('daily');
  const [language, setLanguage] = useState('english');

  const [notifications, setNotifications] = useState({
    symptoms: true,
    appointments: true,
    followUps: true,
    familyUpdates: true,
    careInsights: false
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg text-gray-900">CareBow Preferences</h1>
            <p className="text-xs text-gray-500">Customize your care experience</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <div className="text-sm text-purple-900 mb-1">Help CareBow care for you better</div>
          <div className="text-xs text-purple-700 leading-relaxed">
            These preferences help CareBow provide more personalized guidance and support tailored to how you prefer to receive care.
          </div>
        </div>
      </div>

      {/* Preferred Care Method */}
      <div className="px-6 mb-6">
        <h3 className="text-sm text-gray-700 mb-3">Preferred care method</h3>
        <div className="bg-white border border-gray-200 rounded-2xl p-2">
          <div className="space-y-2">
            <button
              onClick={() => setPreferredCare('ai-first')}
              className={`w-full rounded-xl p-4 text-left transition-all ${
                preferredCare === 'ai-first'
                  ? 'bg-purple-100 border-2 border-purple-500'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-gray-900 mb-1">AI guidance first</div>
                  <div className="text-xs text-gray-600">
                    Start with CareBow AI, escalate to doctor if needed
                  </div>
                </div>
                {preferredCare === 'ai-first' && (
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                )}
              </div>
            </button>
            <button
              onClick={() => setPreferredCare('doctor-direct')}
              className={`w-full rounded-xl p-4 text-left transition-all ${
                preferredCare === 'doctor-direct'
                  ? 'bg-purple-100 border-2 border-purple-500'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-gray-900 mb-1">Book doctor directly</div>
                  <div className="text-xs text-gray-600">
                    Skip AI and schedule consultations directly
                  </div>
                </div>
                {preferredCare === 'doctor-direct' && (
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                )}
              </div>
            </button>
            <button
              onClick={() => setPreferredCare('home-first')}
              className={`w-full rounded-xl p-4 text-left transition-all ${
                preferredCare === 'home-first'
                  ? 'bg-purple-100 border-2 border-purple-500'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm text-gray-900 mb-1">Prefer home visits</div>
                  <div className="text-xs text-gray-600">
                    Default to in-home care when possible
                  </div>
                </div>
                {preferredCare === 'home-first' && (
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Follow-up Frequency */}
      <div className="px-6 mb-6">
        <h3 className="text-sm text-gray-700 mb-3">Follow-up frequency</h3>
        <div className="bg-white border border-gray-200 rounded-2xl p-2">
          <div className="space-y-2">
            {[
              { id: 'daily', label: 'Daily check-ins', description: 'CareBow checks in every day when monitoring symptoms' },
              { id: 'custom', label: 'When needed only', description: 'CareBow follows up based on your condition' },
              { id: 'off', label: 'No automatic follow-ups', description: 'You will initiate conversations when needed' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFollowUpFrequency(option.id)}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  followUpFrequency === option.id
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-white border-2 border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 mb-1">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </div>
                  {followUpFrequency === option.id && (
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="px-6 mb-6">
        <h3 className="text-sm text-gray-700 mb-3">Notifications</h3>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {[
            { key: 'symptoms', label: 'Symptom follow-ups', description: 'When CareBow checks on your health' },
            { key: 'appointments', label: 'Appointment reminders', description: 'Upcoming consultations and visits' },
            { key: 'followUps', label: 'Care follow-ups', description: 'Post-visit check-ins and guidance' },
            { key: 'familyUpdates', label: 'Family care updates', description: 'When family members have appointments' },
            { key: 'careInsights', label: 'Health insights', description: 'Patterns and recommendations from CareBow' }
          ].map((item) => (
            <div key={item.key} className="px-5 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-3">
                  <div className="text-sm text-gray-900 mb-1">{item.label}</div>
                  <div className="text-xs text-gray-600">{item.description}</div>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                  className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'bg-purple-600'
                      : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language Preference */}
      <div className="px-6 mb-6">
        <h3 className="text-sm text-gray-700 mb-3">Language</h3>
        <div className="bg-white border border-gray-200 rounded-2xl p-2">
          <div className="space-y-2">
            {[
              { id: 'english', label: 'English' },
              { id: 'spanish', label: 'Español' },
              { id: 'chinese', label: '中文' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setLanguage(option.id)}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  language === option.id
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-white border-2 border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-sm text-gray-900">{option.label}</div>
                  {language === option.id && (
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}