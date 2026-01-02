import { ArrowLeft, Home, Video, Heart, MessageSquare, Clock, Info } from 'lucide-react';

interface AssessmentData {
  profile: {
    name: string;
    age?: number;
    relationship: string;
  };
  symptoms: string[];
  duration: string;
  severity: number;
  riskLevel: 'low' | 'medium' | 'high';
  careType: string;
  reasoning: string;
  factors: string[];
}

interface CareBowAssessmentProps {
  assessment: AssessmentData;
  onBack: () => void;
  onBookCare: () => void;
  onMessageDoctor: () => void;
  onMonitor: () => void;
}

export function CareBowAssessment({ 
  assessment, 
  onBack, 
  onBookCare, 
  onMessageDoctor, 
  onMonitor 
}: CareBowAssessmentProps) {
  const riskColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const colors = riskColors[assessment.riskLevel];

  const getCareIcon = () => {
    if (assessment.careType.toLowerCase().includes('home')) return Home;
    if (assessment.careType.toLowerCase().includes('video')) return Video;
    return Heart;
  };

  const CareIcon = getCareIcon();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm text-gray-900">Assessment Complete</h1>
            <p className="text-xs text-gray-500">
              For {assessment.profile.relationship === 'Me' ? 'you' : assessment.profile.name}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Summary */}
      <div className="px-6 py-6">
        <h2 className="text-lg text-gray-900 mb-4">Here's what I understand</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-gray-900">
              {assessment.profile.relationship === 'Me' ? 'You have' : `${assessment.profile.name} has`} been experiencing {assessment.symptoms.join(', ')}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-gray-900">
              Duration: {assessment.duration}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-gray-900">
              Severity level: {assessment.severity}/10
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Risk Indicator */}
      <div className="px-6 pb-6">
        <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 ${colors.dot} rounded-full`} />
            <div className={`text-sm ${colors.text} capitalize`}>
              {assessment.riskLevel} risk level
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Based on {assessment.factors.join(', ').toLowerCase()}.
          </div>
        </div>
      </div>

      {/* Section 3: Recommendation */}
      <div className="px-6 pb-6">
        <h2 className="text-sm text-gray-700 mb-3">Recommended next step</h2>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CareIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-lg text-purple-900 mb-2">{assessment.careType}</div>
              <div className="text-sm text-purple-700 leading-relaxed">
                {assessment.reasoning}
              </div>
            </div>
          </div>

          {/* Additional context based on profile */}
          {assessment.profile.age && assessment.profile.age >= 60 && (
            <div className="bg-white border border-purple-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-purple-800">
                  At age {assessment.profile.age}, in-person assessment provides the most thorough care.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATE 7: SMART HANDOFF */}
      <div className="px-6 pb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <div className="text-sm text-gray-900 mb-4 text-center">
            I can help you take the next step.
          </div>

          <div className="space-y-3">
            {/* Primary action based on recommendation */}
            {assessment.careType.toLowerCase().includes('home') && (
              <button 
                onClick={onBookCare}
                className="w-full bg-purple-600 text-white rounded-xl py-4 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Book home visit</span>
              </button>
            )}

            {assessment.careType.toLowerCase().includes('video') && (
              <button 
                onClick={onBookCare}
                className="w-full bg-purple-600 text-white rounded-xl py-4 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                <span className="text-sm">Book video consultation</span>
              </button>
            )}

            {assessment.careType.toLowerCase().includes('self-care') && (
              <button 
                onClick={onMonitor}
                className="w-full bg-purple-600 text-white rounded-xl py-4 hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5" />
                <span className="text-sm">Continue monitoring</span>
              </button>
            )}

            {/* Secondary actions */}
            <button 
              onClick={onMessageDoctor}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 hover:border-purple-300 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Message a doctor</span>
            </button>

            {!assessment.careType.toLowerCase().includes('self-care') && (
              <button 
                onClick={onMonitor}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 hover:border-purple-300 transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm">I'll wait and monitor</span>
              </button>
            )}
          </div>
        </div>

        {/* STATE 8: FOLLOW-UP LOOP PREVIEW */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-blue-900 mb-1">Follow-up scheduled</div>
              <div className="text-xs text-blue-700 leading-relaxed">
                I'll check in tomorrow to see how {assessment.profile.relationship === 'Me' ? 'you\'re' : `${assessment.profile.name} is`} feeling.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
