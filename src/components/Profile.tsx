import { User, ChevronRight, Heart, MapPin, FileText, Phone, HelpCircle, LogOut, Settings, Users, CreditCard, CheckCircle, AlertTriangle, Plus, Calendar, Video, TestTube2, Shield } from 'lucide-react';

interface ProfileProps {
  onNavigate: (screen: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const careReadiness = 80;

  const careProfiles = [
    {
      id: 'profile-me',
      name: 'Me (Sarah)',
      completeness: 80,
      warning: null,
      age: null
    },
    {
      id: 'profile-dad',
      name: 'Dad',
      age: 68,
      completeness: 60,
      warning: 'Missing medications'
    }
  ];

  const healthInfo = [
    { id: 'allergies', icon: Shield, label: 'Allergies', count: 2 },
    { id: 'conditions', icon: Heart, label: 'Conditions', count: 1 },
    { id: 'medications', icon: FileText, label: 'Medications', count: 3 },
    { id: 'emergency-contact', icon: Phone, label: 'Emergency contact', count: 1 }
  ];

  const careAddresses = [
    { id: 'home', label: 'Home', address: '123 Main Street, Apartment 4B' },
    { id: 'parents', label: "Parents' home", address: '456 Oak Avenue, House 12' }
  ];

  const careHistory = [
    { 
      id: 'h1', 
      type: 'Video consult', 
      date: 'Dec 28', 
      outcome: 'Follow-up recommended',
      icon: Video,
      outcomeColor: 'text-purple-700'
    },
    { 
      id: 'h2', 
      type: 'Lab test', 
      date: 'Dec 20', 
      outcome: 'Completed',
      icon: TestTube2,
      outcomeColor: 'text-green-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* HEADER - With Safe Area Top */}
      <div className="bg-white px-6 pt-[calc(48px+env(safe-area-inset-top,0px))] pb-6 mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">My Account</h1>
        <p className="text-sm text-gray-500 mb-6">Your care profile & family hub</p>

        {/* User Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl text-white">S</span>
            </div>
            <div className="flex-1">
              <div className="text-base text-gray-900 mb-0.5">Sarah Johnson</div>
              <div className="text-xs text-gray-600">sarah.j@email.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT - With Bottom Safe Padding */}
      <div className="px-6 space-y-6 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        
        {/* CARE READINESS CARD */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-purple-900">Care readiness</div>
            <div className="text-sm text-purple-700 font-medium">{careReadiness}%</div>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-600 to-purple-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${careReadiness}%` }}
            />
          </div>
          <p className="text-xs text-purple-700 mb-4 leading-relaxed">
            More details = safer guidance in Ask CareBow.
          </p>
          <button
            onClick={() => onNavigate('finish-setup')}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-md"
          >
            Finish setup
          </button>
        </div>

        {/* SECTION 1: CARE PROFILES (PRIMARY) */}
        <div>
          <h2 className="text-base text-gray-900 mb-2 px-1">Care profiles</h2>
          <p className="text-xs text-gray-600 mb-4 px-1 leading-relaxed">
            CareBow personalizes care for each person.
          </p>

          <div className="space-y-3">
            {careProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => onNavigate(profile.id)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-900">
                        {profile.name}
                        {profile.age && <span className="text-gray-600"> ({profile.age})</span>}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Profile ready: {profile.completeness}%
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      profile.completeness >= 80 ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${profile.completeness}%` }}
                  />
                </div>

                {/* Warning tag if present */}
                {profile.warning && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
                    <span className="text-xs text-amber-700">{profile.warning}</span>
                  </div>
                )}
              </button>
            ))}

            {/* Add family member CTA */}
            <button
              onClick={() => onNavigate('add-family-member')}
              className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-4 hover:border-purple-300 hover:bg-purple-50 transition-all text-left flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 text-purple-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-purple-700 font-medium">Add family member</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: HEALTH INFO (MVP ONLY) */}
        <div>
          <h2 className="text-base text-gray-900 mb-2 px-1">Health info</h2>
          <p className="text-xs text-gray-600 mb-4 px-1 leading-relaxed">
            Used for safer recommendations.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            {healthInfo.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center justify-between hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-purple-600" strokeWidth={2} />
                    </div>
                    <span className="text-sm text-gray-900">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{item.count}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  </div>
                </button>
              );
            })}

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => onNavigate('update-health-info')}
                className="w-full bg-purple-50 text-purple-700 py-2.5 rounded-xl text-xs font-medium hover:bg-purple-100 transition-colors"
              >
                Update health info
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: CARE ADDRESSES */}
        <div>
          <h2 className="text-base text-gray-900 mb-2 px-1">Care addresses</h2>
          <p className="text-xs text-gray-600 mb-4 px-1 leading-relaxed">
            For home visits and device delivery.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            {careAddresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => onNavigate(`address-${addr.id}`)}
                className="w-full flex items-start gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 mb-0.5">{addr.label}</div>
                  <div className="text-xs text-gray-600">{addr.address}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
              </button>
            ))}

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => onNavigate('manage-addresses')}
                className="w-full bg-purple-50 text-purple-700 py-2.5 rounded-xl text-xs font-medium hover:bg-purple-100 transition-colors"
              >
                Manage addresses
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: CARE HISTORY (RECENT ONLY) */}
        <div>
          <h2 className="text-base text-gray-900 mb-4 px-1">Care history</h2>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            {careHistory.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(`history-${item.id}`)}
                  className="w-full flex items-start gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-purple-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-900">{item.type}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">{item.date}</span>
                    </div>
                    <div className={`text-xs ${item.outcomeColor}`}>
                      → {item.outcome}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                </button>
              );
            })}

            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => onNavigate('view-all-history')}
                className="w-full bg-purple-50 text-purple-700 py-2.5 rounded-xl text-xs font-medium hover:bg-purple-100 transition-colors"
              >
                View all history
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: HELP (SECONDARY) */}
        <div>
          <h2 className="text-base text-gray-900 mb-4 px-1">Help</h2>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <button
              onClick={() => onNavigate('contact-support')}
              className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-purple-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-gray-900">Contact support</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" strokeWidth={2} />
            </button>

            <button
              onClick={() => onNavigate('faqs')}
              className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-purple-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-gray-900">FAQs</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" strokeWidth={2} />
            </button>

            <button
              onClick={() => onNavigate('privacy-data')}
              className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors text-left"
            >
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-purple-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-gray-900">Privacy & data</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="space-y-4 pt-4">
          <button
            onClick={() => onNavigate('logout')}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            Log out
          </button>

          <div className="text-center text-xs text-gray-400">
            CareBow v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}