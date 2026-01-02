import { ArrowLeft, Edit2, AlertCircle } from 'lucide-react';

interface AccountDetailsProps {
  onBack: () => void;
}

export function AccountDetails({ onBack }: AccountDetailsProps) {
  const personalInfo = {
    fullName: 'Sarah Johnson',
    dateOfBirth: 'March 15, 1988',
    gender: 'Female',
    phone: '+1 (555) 123-4567',
    email: 'sarah.j@email.com'
  };

  const emergencyContact = {
    name: 'Michael Johnson',
    relationship: 'Spouse',
    phone: '+1 (555) 987-6543'
  };

  const medicalInfo = {
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    conditions: ['Seasonal allergies', 'Occasional migraines'],
    medications: ['Cetirizine 10mg (as needed)', 'Sumatriptan 50mg (for migraines)']
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
            <h1 className="text-lg text-gray-900">Account Details</h1>
            <p className="text-xs text-gray-500">Your personal and medical information</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-blue-900 mb-1">How this improves your care</div>
              <div className="text-xs text-blue-700 leading-relaxed">
                This information helps CareBow make safer recommendations and provide personalized care. Your medications prevent unsafe drug interactions, allergies block risky treatments, and conditions adjust risk sensitivity.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-gray-700">Personal Information</h3>
          <button className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Full Name</div>
            <div className="text-sm text-gray-900">{personalInfo.fullName}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Date of Birth</div>
            <div className="text-sm text-gray-900">{personalInfo.dateOfBirth}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Gender</div>
            <div className="text-sm text-gray-900">{personalInfo.gender}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Phone Number</div>
            <div className="text-sm text-gray-900">{personalInfo.phone}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Email</div>
            <div className="text-sm text-gray-900">{personalInfo.email}</div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-gray-700">Emergency Contact</h3>
          <button className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Name</div>
            <div className="text-sm text-gray-900">{emergencyContact.name}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Relationship</div>
            <div className="text-sm text-gray-900">{emergencyContact.relationship}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Phone Number</div>
            <div className="text-sm text-gray-900">{emergencyContact.phone}</div>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-gray-700">Medical Information</h3>
          <button className="flex items-center gap-1 text-xs text-purple-600 hover:underline">
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-1">Blood Group</div>
            <div className="text-sm text-gray-900">{medicalInfo.bloodGroup}</div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-2">Known Allergies</div>
            <div className="space-y-2">
              {medicalInfo.allergies.map((allergy, idx) => (
                <div key={idx} className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <div className="text-sm text-red-900">{allergy}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-2">Chronic Conditions</div>
            <div className="space-y-2">
              {medicalInfo.conditions.map((condition, idx) => (
                <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                  <div className="text-sm text-yellow-900">{condition}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="text-xs text-gray-500 mb-2">Current Medications</div>
            <div className="space-y-2">
              {medicalInfo.medications.map((medication, idx) => (
                <div key={idx} className="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
                  <div className="text-sm text-purple-900">{medication}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}