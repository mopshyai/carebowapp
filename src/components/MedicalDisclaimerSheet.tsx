import { useState } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';

interface MedicalDisclaimerSheetProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function MedicalDisclaimerSheet({ onAccept, onDecline }: MedicalDisclaimerSheetProps) {
  const [understood, setUnderstood] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 animate-slideUp">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg text-gray-900">Before we begin</h2>
              <p className="text-xs text-gray-500">Important information</p>
            </div>
          </div>
          <button onClick={onDecline} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-900 leading-relaxed">
                  CareBow provides guidance, not a medical diagnosis. For emergencies, always seek immediate care.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              CareBow uses your health profile to provide personalized care recommendations. However:
            </p>
            <ul className="space-y-2 pl-5">
              <li className="list-disc">This is <strong>not a replacement</strong> for professional medical advice</li>
              <li className="list-disc">Always follow your doctor's instructions over AI guidance</li>
              <li className="list-disc">Call emergency services for life-threatening situations</li>
              <li className="list-disc">Your data is private and never shared without consent</li>
            </ul>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-purple-500 mt-0.5"
            />
            <span className="text-sm text-gray-900">
              I understand that CareBow provides guidance, not diagnosis, and I should seek professional care for emergencies.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onAccept}
            disabled={!understood}
            className="w-full bg-purple-600 text-white rounded-xl py-4 hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          <button
            onClick={onDecline}
            className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
