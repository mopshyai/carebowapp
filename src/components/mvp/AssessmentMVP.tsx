import { ArrowLeft, AlertCircle, CheckCircle, Home, Video, Phone } from 'lucide-react';
import { AssessmentData } from './ConversationMVP';

interface AssessmentMVPProps {
  data: AssessmentData;
  onBack: () => void;
  onAction: (action: string) => void;
}

export function AssessmentMVP({ data, onBack, onAction }: AssessmentMVPProps) {
  const isMe = data.context.relationship === 'me';
  const isElder = data.context.age && data.context.age >= 60;
  
  const subject = isMe ? 'you' : 
    data.context.relationship === 'father' ? 'your father' : 
    data.context.relationship === 'mother' ? 'your mother' : 'your family member';

  // STATE 6: EMERGENCY STATE (Full Screen)
  if (data.recommendation === 'emergency') {
    return (
      <div className="fixed inset-0 bg-red-50 z-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Pulsing Alert */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl text-red-900 text-center mb-3">
            This may be serious
          </h1>

          {/* Message */}
          <p className="text-sm text-red-800 text-center leading-relaxed mb-2">
            Based on what you've shared, this could be an emergency.
          </p>
          
          {/* STATE 4: Visible Personalization in Emergency */}
          {isElder && (
            <div className="bg-red-100 border border-red-200 rounded-xl p-3 mb-8">
              <p className="text-xs text-red-900 text-center leading-relaxed">
                Given {subject}'s age ({data.context.age}), these symptoms require immediate attention.
              </p>
            </div>
          )}

          {/* Actions (Big, Stacked) */}
          <div className="space-y-3">
            <button
              onClick={() => onAction('call-emergency')}
              className="w-full bg-red-600 text-white rounded-2xl py-5 hover:bg-red-700 transition-colors flex items-center justify-center gap-3 shadow-lg"
            >
              <Phone className="w-6 h-6" />
              <span className="text-base">Call emergency services</span>
            </button>

            <button
              onClick={() => onAction('seek-care')}
              className="w-full bg-white border-2 border-red-300 text-red-900 rounded-2xl py-4 hover:bg-red-50 transition-colors"
            >
              Seek immediate care
            </button>
          </div>

          {/* No continue option - intentionally missing */}
          <p className="text-xs text-red-700 text-center mt-6 italic">
            Your safety is the priority. Please don't wait.
          </p>
        </div>
      </div>
    );
  }

  // STATE 5: ASSESSMENT SUMMARY SCREEN
  const riskColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const colors = riskColors[data.riskLevel];

  const getRecommendationDetails = () => {
    if (data.recommendation === 'video') {
      return {
        icon: Video,
        title: 'Video consultation',
        description: isElder 
          ? `Given ${subject}'s age and symptoms, a professional should review this.`
          : 'These symptoms should be reviewed by a healthcare provider.',
        action: 'Book video consult'
      };
    }
    
    return {
      icon: Home,
      title: 'Self-care with monitoring',
      description: isMe 
        ? 'Your symptoms appear manageable at home for now.'
        : `${subject}'s symptoms appear manageable at home for now.`,
      action: 'View self-care tips'
    };
  };

  const recommendation = getRecommendationDetails();
  const Icon = recommendation.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-base text-gray-900">Assessment Complete</h1>
            <p className="text-xs text-gray-500">
              For {isMe ? 'you' : `${data.context.relationship} (${data.context.age})`}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Summary */}
      <div className="px-6 py-6">
        <h2 className="text-lg text-gray-900 mb-4">Here's what I understand</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-gray-900 leading-relaxed">
              {isMe ? 'You have' : `${subject} has`} been experiencing {data.symptom.toLowerCase()}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-gray-900 leading-relaxed">
              Duration: {data.duration}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div className="text-sm text-gray-900 leading-relaxed">
              Severity: {data.severity}/10
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Risk Indicator */}
      <div className="px-6 pb-6">
        <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 ${colors.dot} rounded-full`} />
            <div className={`text-sm ${colors.text} capitalize`}>
              {data.riskLevel} risk level
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Based on {isElder ? 'age, ' : ''}symptoms and severity.
          </div>
        </div>
      </div>

      {/* SECTION 3: Recommended Next Step (ONLY ONE) */}
      <div className="px-6 pb-6">
        <h2 className="text-sm text-gray-700 mb-3">Recommended next step</h2>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-lg text-purple-900 mb-2">{recommendation.title}</div>
              <div className="text-sm text-purple-700 leading-relaxed">
                {recommendation.description}
              </div>
            </div>
          </div>

          {/* STATE 4: Visible Personalization */}
          {isElder && data.recommendation === 'video' && (
            <div className="bg-white border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-purple-800 leading-relaxed">
                  <strong>Because this is for an elder:</strong> At age {data.context.age}, 
                  professional assessment provides the most thorough care.
                </div>
              </div>
            </div>
          )}

          {data.recommendation === 'self-care' && isElder && (
            <div className="bg-white border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-purple-800 leading-relaxed">
                  <strong>Age-aware guidance:</strong> While this appears manageable, 
                  please monitor closely given {subject}'s age ({data.context.age}).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6">
        <button
          onClick={() => onAction('primary')}
          className="w-full bg-purple-600 text-white rounded-2xl py-5 hover:bg-purple-700 transition-colors shadow-lg mb-3"
        >
          {recommendation.action}
        </button>

        <button
          onClick={() => onAction('secondary')}
          className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl py-4 hover:border-purple-300 transition-colors"
        >
          Talk to a doctor instead
        </button>
      </div>

      {/* Footer Info */}
      <div className="px-6 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs text-blue-900 leading-relaxed text-center">
            This guidance is based on the information you provided. If symptoms worsen or you have concerns, seek care immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
