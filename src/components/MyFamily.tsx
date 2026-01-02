import { ArrowLeft, Plus, ChevronRight, User } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  relationship: string;
  conditions?: string[];
  medications?: string[];
  avatar?: string;
}

interface MyFamilyProps {
  onBack: () => void;
}

export function MyFamily({ onBack }: MyFamilyProps) {
  const familyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Robert Johnson',
      age: 65,
      relationship: 'Father',
      conditions: ['Hypertension', 'Type 2 Diabetes'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg']
    },
    {
      id: '2',
      name: 'Emma Johnson',
      age: 8,
      relationship: 'Daughter',
      conditions: ['Asthma'],
      medications: ['Albuterol inhaler (as needed)']
    },
    {
      id: '3',
      name: 'Michael Johnson',
      age: 42,
      relationship: 'Spouse',
      conditions: [],
      medications: []
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-orange-400 to-orange-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg text-gray-900">My Family</h1>
            <p className="text-xs text-gray-500">Manage care for your loved ones</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👨‍👩‍👧</span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-900 mb-1">One account, whole family</div>
              <div className="text-xs text-gray-600 leading-relaxed">
                CareBow can manage care for your loved ones from one account. Add family members to book appointments, track health, and get personalized guidance for each person.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Family Member */}
      <div className="px-6 mb-6">
        <button className="w-full bg-gradient-to-br from-purple-600 to-purple-500 text-white rounded-2xl p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-sm">Add Family Member</div>
          </div>
        </button>
      </div>

      {/* Family Members List */}
      <div className="px-6">
        <h3 className="text-sm text-gray-700 mb-3">Family Members ({familyMembers.length})</h3>
        <div className="space-y-3">
          {familyMembers.map((member, idx) => (
            <button
              key={member.id}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${getAvatarColor(idx)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-lg">{getInitials(member.name)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-900">{member.name}</div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    {member.relationship} • {member.age} years old
                  </div>
                  
                  {/* Conditions */}
                  {member.conditions && member.conditions.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">Conditions:</div>
                      <div className="flex flex-wrap gap-1">
                        {member.conditions.map((condition, condIdx) => (
                          <div key={condIdx} className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-2 py-1 rounded-lg text-xs">
                            {condition}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {member.medications && member.medications.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Medications:</div>
                      <div className="flex flex-wrap gap-1">
                        {member.medications.map((medication, medIdx) => (
                          <div key={medIdx} className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-1 rounded-lg text-xs">
                            {medication}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.conditions?.length === 0 && member.medications?.length === 0 && (
                    <div className="text-xs text-gray-500">
                      No medical information added
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="px-6 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="text-xs text-blue-900 mb-1">Family care made simple</div>
          <div className="text-xs text-blue-700 leading-relaxed">
            When you book care or talk to CareBow, you can choose which family member needs help. Their medical history will be used for personalized recommendations.
          </div>
        </div>
      </div>
    </div>
  );
}
