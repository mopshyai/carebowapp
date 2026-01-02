import { User, Users, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

interface ProfileContext {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  conditions?: string[];
}

interface ProfileContextSelectorProps {
  selectedProfile: ProfileContext;
  onSelectProfile: (profile: ProfileContext) => void;
}

export function ProfileContextSelector({ selectedProfile, onSelectProfile }: ProfileContextSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const profiles: ProfileContext[] = [
    {
      id: 'self',
      name: 'Sarah Johnson',
      relationship: 'Me',
      age: 38,
      conditions: ['Seasonal allergies', 'Occasional migraines']
    },
    {
      id: 'father',
      name: 'Robert Johnson',
      relationship: 'Father',
      age: 65,
      conditions: ['Hypertension', 'Type 2 Diabetes']
    },
    {
      id: 'daughter',
      name: 'Emma Johnson',
      relationship: 'Daughter',
      age: 8,
      conditions: ['Asthma']
    },
    {
      id: 'spouse',
      name: 'Michael Johnson',
      relationship: 'Spouse',
      age: 42,
      conditions: []
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getAvatarColor = (id: string) => {
    const colors: { [key: string]: string } = {
      'self': 'from-purple-400 to-purple-600',
      'father': 'from-blue-400 to-blue-600',
      'daughter': 'from-pink-400 to-pink-600',
      'spouse': 'from-green-400 to-green-600'
    };
    return colors[id] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="relative">
      {/* Selected Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-purple-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(selectedProfile.id)} rounded-full flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-sm">{getInitials(selectedProfile.name)}</span>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-900">This is about {selectedProfile.relationship.toLowerCase()}</div>
              <div className="text-xs text-gray-600">{selectedProfile.name}</div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
            <div className="p-2">
              <div className="text-xs text-gray-600 px-3 py-2">Who needs care?</div>
              <div className="space-y-1">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onSelectProfile(profile);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-xl p-3 text-left transition-all ${
                      selectedProfile.id === profile.id
                        ? 'bg-purple-50 border border-purple-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor(profile.id)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-sm">{getInitials(profile.name)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{profile.name}</div>
                          <div className="text-xs text-gray-600">
                            {profile.relationship} • {profile.age} years old
                          </div>
                          {profile.conditions && profile.conditions.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {profile.conditions.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedProfile.id === profile.id && (
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
