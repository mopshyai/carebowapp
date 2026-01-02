import { ArrowLeft, Sparkles, MessageSquare, Activity, Heart, Clock, Mic, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ProfileContextSelector } from './ProfileContextSelector';
import { useState } from 'react';
import type { HealthProfile, HealthSession } from '../App';

interface ProfileContext {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  conditions?: string[];
}

interface AskCareBowProps {
  onBack: () => void;
  onStartConversation: () => void;
  onStartEnhanced?: () => void;
  onViewHistory: () => void;
  userProfile: HealthProfile;
  recentSessions?: HealthSession[];
}

export function AskCareBow({ onBack, onStartConversation, onStartEnhanced, onViewHistory, userProfile, recentSessions }: AskCareBowProps) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileContext>({
    id: 'self',
    name: 'Sarah Johnson',
    relationship: 'Me',
    age: 38,
    conditions: ['Seasonal allergies', 'Occasional migraines']
  });

  const profileCompleteness = 80;
  const hasMedications = true;
  const hasAllergies = true;
  const hasConditions = true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Ask CareBow</h1>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Tell me what's going on. I'll help you figure out what to do next.
        </p>
      </div>

      {/* Profile Context Selector */}
      <div className="px-6 mb-6">
        <ProfileContextSelector
          selectedProfile={selectedProfile}
          onSelectProfile={setSelectedProfile}
        />
      </div>

      {/* Profile Awareness Indicators */}
      <div className="px-6 mb-8">
        {profileCompleteness >= 80 ? (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-green-900 mb-1">CareBow knows your health context</div>
                <div className="text-xs text-green-700 leading-relaxed mb-2">
                  {selectedProfile.conditions && selectedProfile.conditions.length > 0 ? (
                    <>Because you have {selectedProfile.conditions.join(' and ')}, I'll be extra cautious with my recommendations.</>
                  ) : (
                    <>Your complete profile helps me give safer, more personalized guidance.</>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasMedications && (
                    <div className="bg-white border border-green-200 px-2 py-1 rounded-lg text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Medications checked
                    </div>
                  )}
                  {hasAllergies && (
                    <div className="bg-white border border-green-200 px-2 py-1 rounded-lg text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Allergies noted
                    </div>
                  )}
                  {hasConditions && (
                    <div className="bg-white border border-green-200 px-2 py-1 rounded-lg text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Conditions tracked
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-yellow-900 mb-1">Help me give safer guidance</div>
                <div className="text-xs text-yellow-700 leading-relaxed mb-3">
                  Adding medications and allergies helps me avoid unsafe recommendations. Your profile is {profileCompleteness}% complete.
                </div>
                <button className="text-xs text-yellow-800 hover:underline">
                  Complete your profile →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Input */}
      <div className="px-6 mb-8">
        <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-sm">
          <textarea
            placeholder="Describe your symptoms, concerns, or how you're feeling…"
            className="w-full bg-transparent border-none resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            rows={4}
          />
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Mic className="w-5 h-5 text-purple-600" />
            </button>
            <button 
              onClick={onStartConversation}
              className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors"
            >
              Start Care Conversation
            </button>
          </div>
        </div>

        {/* Reassurance */}
        <div className="mt-3 px-2">
          <p className="text-xs text-gray-500 leading-relaxed">
            CareBow uses your health profile to give personalized guidance. 
            This is not a diagnosis, but a safe starting point.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <h3 className="text-sm text-gray-700 mb-3">Common concerns</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onStartConversation}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <div className="text-2xl mb-2">🤒</div>
            <div className="text-sm text-gray-900 mb-1">Fever & cold</div>
            <div className="text-xs text-gray-500">Assess symptoms</div>
          </button>
          <button 
            onClick={onStartConversation}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <div className="text-2xl mb-2">🤕</div>
            <div className="text-sm text-gray-900 mb-1">Pain & aches</div>
            <div className="text-xs text-gray-500">Get guidance</div>
          </button>
          <button 
            onClick={onStartConversation}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <div className="text-2xl mb-2">😰</div>
            <div className="text-sm text-gray-900 mb-1">Stress & anxiety</div>
            <div className="text-xs text-gray-500">Talk it through</div>
          </button>
          <button 
            onClick={onStartConversation}
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <div className="text-2xl mb-2">💊</div>
            <div className="text-sm text-gray-900 mb-1">Medication</div>
            <div className="text-xs text-gray-500">Questions & refills</div>
          </button>
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions && recentSessions.length > 0 && (
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-gray-700">Recent conversations</h3>
            <button 
              onClick={onViewHistory}
              className="text-xs text-purple-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const riskColors = {
                low: 'bg-green-50 border-green-200 text-green-700',
                medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                high: 'bg-red-50 border-red-200 text-red-700'
              };

              return (
                <div
                  key={session.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm text-gray-900">{session.summary}</div>
                    <div className={`px-2 py-1 rounded-lg text-xs ${riskColors[session.riskLevel]} border`}>
                      {session.riskLevel}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {session.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-purple-600">
                    {session.recommendation}
                  </div>
                  {session.outcome && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      ✓ {session.outcome}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergency Banner */}
      <div className="px-6 mb-8">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-red-900 mb-1">Medical Emergency?</div>
              <div className="text-xs text-red-700 mb-3">
                For chest pain, severe bleeding, difficulty breathing, or life-threatening situations
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs hover:bg-red-700 transition-colors">
                Call Emergency Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}