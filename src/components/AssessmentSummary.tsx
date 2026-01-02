import { ArrowLeft, AlertCircle, CheckCircle, Info, Calendar, Video, Home, MessageSquare, Sparkles } from 'lucide-react';
import type { HealthSession, HealthProfile, Doctor } from '../App';

interface AssessmentSummaryProps {
  session: HealthSession;
  userProfile: HealthProfile;
  doctors: Doctor[];
  onBookCare: (doctor: Doctor) => void;
  onBack: () => void;
}

export function AssessmentSummary({ session, userProfile, doctors, onBookCare, onBack }: AssessmentSummaryProps) {
  const riskConfig = {
    low: {
      color: 'green',
      icon: CheckCircle,
      title: 'Low Concern',
      description: 'Your symptoms appear manageable with self-care'
    },
    medium: {
      color: 'yellow',
      icon: AlertCircle,
      title: 'Moderate Concern',
      description: 'Professional guidance recommended'
    },
    high: {
      color: 'red',
      icon: AlertCircle,
      title: 'High Concern',
      description: 'Immediate medical attention recommended'
    }
  };

  const config = riskConfig[session.riskLevel];
  const RiskIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-sm text-gray-900">Assessment Complete</h1>
            <p className="text-xs text-gray-500">Here's what I understand</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Analysis Section */}
        <div className="px-6 mb-6">
          <h3 className="text-sm text-gray-700 mb-3">My analysis</h3>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-900 leading-relaxed mb-4">
              Based on what you've shared, you're experiencing moderate symptoms that have been present for 2 days. 
              The headache combined with mild nausea suggests this could be tension-related or a migraine episode.
            </p>
            
            {/* Profile-Based Considerations */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900">Based on your profile</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-purple-800 leading-relaxed">
                  • I see you have a history of <strong>occasional migraines</strong>, which makes this presentation consistent with your past episodes.
                </div>
                <div className="text-xs text-purple-800 leading-relaxed">
                  • You're currently taking <strong>Sumatriptan</strong> for migraines — this is appropriate to use if the headache worsens.
                </div>
                <div className="text-xs text-purple-800 leading-relaxed">
                  • Because of your <strong>Penicillin allergy</strong>, I won't recommend any medications in that family.
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-900 leading-relaxed">
              While this doesn't appear to be an emergency, getting a video consultation would help rule out other causes 
              and adjust your treatment plan if needed.
            </p>
          </div>
        </div>

        {/* Risk Level */}
        <div className={`bg-${config.color}-50 border border-${config.color}-200 rounded-2xl p-5 mb-4`}>
          <div className="flex items-start gap-3 mb-3">
            <RiskIcon className={`w-6 h-6 text-${config.color}-600 flex-shrink-0`} />
            <div className="flex-1">
              <h3 className={`text-sm text-${config.color}-900 mb-1`}>{config.title}</h3>
              <p className={`text-xs text-${config.color}-700`}>
                {config.description}
              </p>
            </div>
          </div>
          <div className={`bg-${config.color}-100/50 border border-${config.color}-200 rounded-xl px-3 py-2 text-xs text-${config.color}-800`}>
            Based on your symptoms and health history
          </div>
        </div>

        {/* Clinical Context */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <h3 className="text-sm text-blue-900">Why this recommendation?</h3>
          </div>
          <div className="space-y-2 text-xs text-blue-800">
            <p>• Symptoms align with migraine patterns in your history</p>
            <p>• Severity level suggests professional evaluation</p>
            <p>• Current medications may need adjustment</p>
          </div>
        </div>

        {/* Recommended Next Step */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-900 mb-3">Recommended Next Step</h3>
          
          {session.riskLevel === 'medium' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-2xl p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm text-gray-900 mb-1">Video Consultation</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Speak with a healthcare provider who can evaluate your symptoms and provide treatment
                    </p>
                    <div className="text-xs text-purple-600 mb-1">Recommended doctor:</div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-sm">👨‍⚕️</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-900">{doctors[0].name}</div>
                        <div className="text-xs text-gray-600">{doctors[0].specialty}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onBookCare(doctors[0])}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  Book Video Consultation
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm text-gray-900 mb-1">Home Visit</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      A registered nurse can visit you at home for assessment
                    </p>
                    <button className="text-xs text-purple-600 hover:underline">
                      Request home visit
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm text-gray-900 mb-1">Message a Doctor</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Get advice through secure messaging (response within 2 hours)
                    </p>
                    <button className="text-xs text-purple-600 hover:underline">
                      Start messaging
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Self-Care Guidance */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h3 className="text-sm text-gray-900 mb-3">In the meantime</h3>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <p>Rest in a quiet, dark room to reduce light sensitivity</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <p>Stay hydrated and avoid triggers</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <p>You may take your prescribed antihistamine if needed</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
              <p>Monitor symptoms - I'll check in with you tomorrow</p>
            </div>
          </div>
        </div>

        {/* Clinical Note */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
          <p className="text-xs text-gray-600 leading-relaxed">
            This recommendation is based on clinical guidelines and your personal health context. 
            This is not a diagnosis. If symptoms worsen or you experience severe pain, vision changes, 
            or difficulty speaking, seek emergency care immediately.
          </p>
        </div>
      </div>
    </div>
  );
}