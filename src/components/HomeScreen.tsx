import { Bell, Sparkles, Calendar, Home as HomeIcon, User, Users, Heart, ArrowRight } from 'lucide-react';
import type { Doctor } from '../App';

interface HomeScreenProps {
  doctors: Doctor[];
  onDoctorSelect: (doctor: Doctor, service?: string) => void;
  onAskCareBow: () => void;
}

export function HomeScreen({ doctors, onDoctorSelect, onAskCareBow }: HomeScreenProps) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl text-gray-900 mb-1">CareBow</h1>
            <p className="text-sm text-gray-500">{currentDate}</p>
          </div>
          <button className="w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-6 mb-8">
        <h2 className="text-xl text-gray-900 mb-2">Hello, Sarah</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          How are you feeling today?
        </p>
      </div>

      {/* Primary CTA - Talk to CareBow */}
      <div className="px-6 mb-8">
        <button
          onClick={onAskCareBow}
          className="w-full bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600 text-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-9 h-9" />
            </div>
            <div className="text-2xl mb-3">Talk to CareBow</div>
            <div className="text-sm text-purple-100 leading-relaxed max-w-xs">
              Tell me what's going on. I'll help you figure out next steps.
            </div>
          </div>
        </button>

        {/* Reassurance */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-purple-400" />
            You're not alone. CareBow is here with you.
          </p>
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="px-6 mb-8">
        <h3 className="text-sm text-gray-700 mb-4">Quick actions</h3>
        <div className="space-y-3">
          {/* Book Doctor */}
          <button
            onClick={() => onDoctorSelect(doctors[0])}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900 mb-1">Book a Doctor</div>
                <div className="text-xs text-gray-600">
                  Schedule a video or in-person consultation
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Home Care */}
          <button className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <HomeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900 mb-1">Home Care</div>
                <div className="text-xs text-gray-600">
                  Nurses, caregivers, and at-home services
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* My Health Profile */}
          <button className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900 mb-1">My Health Profile</div>
                <div className="text-xs text-gray-600">
                  Conditions, medications, and health history
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Family Profiles */}
          <button className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-900 mb-1">Family Profiles</div>
                <div className="text-xs text-gray-600">
                  Manage care for parents, children, and loved ones
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Care Continuity Section */}
      <div className="px-6 mb-8">
        <h3 className="text-sm text-gray-700 mb-4">Ongoing care</h3>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">✨</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-900 mb-1">Your care journey</div>
              <div className="text-xs text-gray-600 leading-relaxed">
                CareBow remembers your health context and follows up with you — 
                so you never feel lost or forgotten.
              </div>
            </div>
          </div>
          <button 
            onClick={onAskCareBow}
            className="text-xs text-purple-600 hover:underline"
          >
            View your timeline →
          </button>
        </div>
      </div>

      {/* Trust Message */}
      <div className="px-6 pb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-gray-900 mb-2">
                Personalized, continuous care
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                CareBow learns from your health profile and past conversations to give you 
                guidance that's actually relevant to you — not generic advice.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
