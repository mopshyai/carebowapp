import { AlertTriangle, Heart, Shield, Clock, MessageCircle, Phone } from 'lucide-react';

// EDGE 7: EMERGENCY STATE (FULL SCREEN LOCK)
export function EmergencyStateModal({ onCallEmergency, onShareLocation, onNotifyFamily }: {
  onCallEmergency: () => void;
  onShareLocation: () => void;
  onNotifyFamily: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-red-50 z-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Pulsing Alert */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl text-red-900 text-center mb-3">
          This may be serious
        </h1>

        {/* Message */}
        <p className="text-sm text-red-800 text-center leading-relaxed mb-8">
          Based on what you've shared, this could be an emergency. Please don't wait.
        </p>

        {/* Actions (Big, Stacked) */}
        <div className="space-y-3">
          <button
            onClick={onCallEmergency}
            className="w-full bg-red-600 text-white rounded-2xl py-5 hover:bg-red-700 transition-colors flex items-center justify-center gap-3 text-base shadow-lg"
          >
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              🚑
            </div>
            <span>Call emergency services</span>
          </button>

          <button
            onClick={onShareLocation}
            className="w-full bg-white border-2 border-red-300 text-red-900 rounded-2xl py-4 hover:bg-red-50 transition-colors flex items-center justify-center gap-3"
          >
            <span>📍</span>
            <span className="text-sm">Share location</span>
          </button>

          <button
            onClick={onNotifyFamily}
            className="w-full bg-white border-2 border-red-300 text-red-900 rounded-2xl py-4 hover:bg-red-50 transition-colors flex items-center justify-center gap-3"
          >
            <span>👨‍👩‍👧</span>
            <span className="text-sm">Notify family member</span>
          </button>
        </div>

        {/* No continue option */}
        <p className="text-xs text-red-700 text-center mt-6">
          Your safety is the priority. I'll be here when you're ready.
        </p>
      </div>
    </div>
  );
}

// EDGE 6: MENTAL HEALTH CRISIS (IMMEDIATE REDIRECT)
export function MentalHealthCrisisModal({ onTalkProfessional, onCallSupport, onCrisisHelp, onDismiss }: {
  onTalkProfessional: () => void;
  onCallSupport: () => void;
  onCrisisHelp: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-md w-full p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg text-gray-900 text-center mb-3">
          I'm really glad you reached out
        </h2>

        {/* Message */}
        <p className="text-sm text-gray-700 text-center leading-relaxed mb-6">
          You don't have to handle this alone. There are people who want to help and support you right now.
        </p>

        {/* Actions */}
        <div className="space-y-3 mb-4">
          <button
            onClick={onCrisisHelp}
            className="w-full bg-blue-600 text-white rounded-xl py-4 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            <span className="text-sm">Reach crisis help (988)</span>
          </button>

          <button
            onClick={onTalkProfessional}
            className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Talk to a professional</span>
          </button>

          <button
            onClick={onCallSupport}
            className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">Call support line</span>
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-900 leading-relaxed">
            <strong>National Suicide Prevention Lifeline:</strong> 988
            <br />
            <strong>Crisis Text Line:</strong> Text HOME to 741741
          </p>
        </div>
      </div>
    </div>
  );
}

// EDGE 4: MEDICATION CONFLICT (BLOCKER)
export function MedicationConflictCard({ 
  medication, 
  message, 
  onConsultDoctor, 
  onHomeVisit 
}: {
  medication: string;
  message: string;
  onConsultDoctor: () => void;
  onHomeVisit: () => void;
}) {
  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-5 shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-yellow-900 mb-1">⚠️ Medication Safety Alert</div>
          <p className="text-sm text-yellow-900 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="bg-white border border-yellow-200 rounded-xl p-3 mb-4">
        <p className="text-xs text-yellow-800 leading-relaxed">
          I've detected a potential interaction with <strong>{medication}</strong>. For your safety, I cannot recommend this without medical review.
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={onConsultDoctor}
          className="w-full bg-yellow-600 text-white rounded-xl py-3 hover:bg-yellow-700 transition-colors text-sm"
        >
          Consult a doctor
        </button>
        <button
          onClick={onHomeVisit}
          className="w-full bg-white border border-yellow-300 text-yellow-800 rounded-xl py-3 hover:bg-yellow-50 transition-colors text-sm"
        >
          Home visit
        </button>
      </div>
    </div>
  );
}

// EDGE 2: INSUFFICIENT INFO
export function InsufficientInfoCard({ 
  onAnswerQuestions, 
  onBookConsult 
}: {
  onAnswerQuestions: () => void;
  onBookConsult: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-gray-900 leading-relaxed mb-3">
            I don't have enough information to guide you safely yet.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            To help you properly, I need a bit more detail about what's happening.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onAnswerQuestions}
          className="w-full bg-purple-600 text-white rounded-xl py-3 hover:bg-purple-700 transition-colors text-sm"
        >
          Answer questions
        </button>
        <button
          onClick={onBookConsult}
          className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl py-3 hover:border-purple-300 transition-colors text-sm"
        >
          Book a consult instead
        </button>
      </div>
    </div>
  );
}

// EDGE 3: CONTRADICTION CLARIFICATION
export function ContradictionCard({ 
  message, 
  onYes, 
  onNo, 
  onNotSure 
}: {
  message: string;
  onYes: () => void;
  onNo: () => void;
  onNotSure: () => void;
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm text-blue-900 mb-2">Let me clarify</div>
          <p className="text-sm text-blue-800 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onYes}
          className="flex-1 bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-700 transition-colors text-sm"
        >
          Yes
        </button>
        <button
          onClick={onNo}
          className="flex-1 bg-white border border-blue-300 text-blue-800 rounded-xl py-3 hover:bg-blue-50 transition-colors text-sm"
        >
          No
        </button>
        <button
          onClick={onNotSure}
          className="flex-1 bg-white border border-blue-300 text-blue-800 rounded-xl py-3 hover:bg-blue-50 transition-colors text-sm"
        >
          Not sure
        </button>
      </div>
    </div>
  );
}

// EDGE 8: REPEATED SYMPTOM
export function RepeatedSymptomCard({ 
  count, 
  onBookConsult, 
  onHomeVisit 
}: {
  count: number;
  onBookConsult: () => void;
  onHomeVisit: () => void;
}) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm text-orange-900 mb-2">Recurring issue detected</div>
          <p className="text-sm text-orange-800 leading-relaxed">
            This issue has come up <strong>{count} times</strong>. I don't recommend managing this with self-care anymore.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onBookConsult}
          className="w-full bg-orange-600 text-white rounded-xl py-3 hover:bg-orange-700 transition-colors text-sm"
        >
          Book consult
        </button>
        <button
          onClick={onHomeVisit}
          className="w-full bg-white border border-orange-300 text-orange-800 rounded-xl py-3 hover:bg-orange-50 transition-colors text-sm"
        >
          Schedule home visit
        </button>
      </div>
    </div>
  );
}

// EDGE 9: USER REFUSES RECOMMENDATION
export function RefusalWarningCard({ 
  riskMessage, 
  onProceed, 
  onBookConsult 
}: {
  riskMessage: string;
  onProceed: () => void;
  onBookConsult: () => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-300 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm text-gray-900 mb-2">That's your choice</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            I want you to know waiting carries some risk because {riskMessage}.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onBookConsult}
          className="w-full bg-purple-600 text-white rounded-xl py-3 hover:bg-purple-700 transition-colors text-sm"
        >
          Book consult
        </button>
        <button
          onClick={onProceed}
          className="w-full bg-white border border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-100 transition-colors text-sm"
        >
          Proceed anyway
        </button>
      </div>
    </div>
  );
}

// EDGE 10: DATA PRIVACY INFO
export function PrivacyInfoSheet({ onManageSettings, onClose }: {
  onManageSettings: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-base text-gray-900">Your data privacy</h3>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          Your health data is used only to personalize care. It is never sold or shared without consent.
        </p>

        <div className="space-y-3 text-xs text-gray-600 leading-relaxed mb-6">
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div>Data is encrypted and stored securely</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div>Only used to improve your care recommendations</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
            <div>You can export or delete your data anytime</div>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onManageSettings}
            className="w-full bg-purple-600 text-white rounded-xl py-3 hover:bg-purple-700 transition-colors text-sm"
          >
            Manage data settings
          </button>
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
