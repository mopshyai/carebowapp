import { ArrowLeft, CheckCircle, AlertTriangle, AlertCircle, Calendar, MessageSquare, Phone } from 'lucide-react';

interface AssessmentSummaryScreenProps {
  assessmentData: any;
  onBack: () => void;
  onBookCare: () => void;
  onMessageSupport: () => void;
}

export function AssessmentSummaryScreen({ assessmentData, onBack, onBookCare, onMessageSupport }: AssessmentSummaryScreenProps) {
  const { context, symptom, severity, hasRedFlags, riskLevel, recommendation } = assessmentData;
  const isMe = context.relationship === 'me';
  const isEmergency = recommendation === 'emergency';

  const getRiskBadge = () => {
    switch (riskLevel) {
      case 'low':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: CheckCircle,
          label: 'Low risk'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          icon: AlertTriangle,
          label: 'Moderate risk'
        };
      case 'high':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: AlertCircle,
          label: 'Higher risk'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: CheckCircle,
          label: 'Assessed'
        };
    }
  };

  const badge = getRiskBadge();
  const BadgeIcon = badge.icon;

  if (isEmergency) {
    // EMERGENCY STATE - Full screen alert with safe areas
    return (
      <div className="min-h-screen bg-red-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12 pt-[calc(48px+env(safe-area-inset-top,0px))] pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
          <div className="max-w-sm w-full">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" strokeWidth={2} />
            </div>
            
            <h1 className="text-2xl text-gray-900 text-center mb-3">
              This may be serious
            </h1>
            
            <p className="text-sm text-gray-700 text-center mb-8 leading-relaxed">
              Based on the symptoms described, this situation requires immediate medical attention.
            </p>

            <div className="space-y-3">
              <a
                href="tel:911"
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-medium text-base hover:bg-red-700 transition-colors flex items-center justify-center gap-2 min-h-[56px]"
              >
                <Phone className="w-5 h-5" strokeWidth={2} />
                Call emergency services (911)
              </a>

              <button
                onClick={onMessageSupport}
                className="w-full bg-white border-2 border-red-200 text-red-700 py-4 rounded-2xl font-medium text-base hover:bg-red-50 transition-colors min-h-[56px]"
              >
                Message CareBow support
              </button>
            </div>

            <div className="mt-8 bg-white border border-red-200 rounded-xl p-4">
              <p className="text-xs text-red-800 leading-relaxed text-center">
                If you're experiencing a medical emergency, do not wait. Call 911 or go to your nearest emergency room immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NORMAL ASSESSMENT SUMMARY
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* HEADER - With Safe Area Top */}
      <div className="bg-white border-b border-gray-200 px-6 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-xl text-gray-900">Assessment Summary</h1>
        </div>
      </div>

      {/* SCROLLABLE CONTENT - With Bottom Safe Padding */}
      <div className="px-6 py-6 space-y-6 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        {/* SUMMARY CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base text-gray-900 mb-4">Here's what I understand</h2>
          
          {/* Risk Level Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${badge.bg} ${badge.text} ${badge.border} mb-4`}>
            <BadgeIcon className="w-4 h-4" strokeWidth={2} />
            <span className="text-sm font-medium">{badge.label}</span>
          </div>

          {/* Summary Details */}
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Who</div>
              <div className="text-sm text-gray-900">
                {isMe ? 'You' : `${context.relationship} (${context.age} years old)`}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Symptom</div>
              <div className="text-sm text-gray-900">{symptom}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Severity rating</div>
              <div className="text-sm text-gray-900">{severity} out of 10</div>
            </div>

            {hasRedFlags && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="text-xs text-red-800 font-medium mb-1">Warning signs noted</div>
                <div className="text-xs text-red-700 leading-relaxed">
                  I detected symptoms that require medical attention.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECOMMENDED NEXT STEP */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-6">
          <h3 className="text-base text-purple-900 mb-3">Recommended next step</h3>
          
          {recommendation === 'self-care' && (
            <>
              <p className="text-sm text-purple-800 leading-relaxed mb-4">
                Based on your symptoms, you can likely manage this at home with self-care. However, if symptoms worsen or you have concerns, consult with a healthcare provider.
              </p>
              <div className="space-y-2">
                <button
                  onClick={onMessageSupport}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" strokeWidth={2} />
                  Message support for guidance
                </button>
                <button
                  onClick={onBookCare}
                  className="w-full bg-white border border-purple-300 text-purple-700 py-3 rounded-xl font-medium text-sm hover:bg-purple-50 transition-colors"
                >
                  Book a consultation anyway
                </button>
              </div>
            </>
          )}

          {recommendation === 'video' && (
            <>
              <p className="text-sm text-purple-800 leading-relaxed mb-4">
                I recommend speaking with a healthcare provider soon. A video consultation would be a safe next step.
              </p>
              {context.age >= 60 && (
                <div className="bg-white border border-purple-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-purple-800 leading-relaxed">
                    Given their age, I'm being more cautious with this recommendation.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <button
                  onClick={onBookCare}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                  Book recommended care
                </button>
                <button
                  onClick={onMessageSupport}
                  className="w-full bg-white border border-purple-300 text-purple-700 py-3 rounded-xl font-medium text-sm hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" strokeWidth={2} />
                  Message support first
                </button>
              </div>
            </>
          )}
        </div>

        {/* DISCLAIMER */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-800 leading-relaxed text-center">
            This assessment is for guidance only and is not a medical diagnosis. If you're concerned or symptoms worsen, seek professional medical care.
          </p>
        </div>
      </div>
    </div>
  );
}