import { ArrowLeft, Star, Search } from 'lucide-react';
import type { Doctor } from '../App';

interface DoctorListProps {
  doctors: Doctor[];
  onDoctorSelect: (doctor: Doctor) => void;
  onBack: () => void;
}

export function DoctorList({ doctors, onDoctorSelect, onBack }: DoctorListProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg text-gray-900">Choose Your Doctor</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctor..."
            className="w-full bg-gray-100 border-none rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Doctors List */}
      <div className="px-6 py-6 space-y-4">
        {doctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => onDoctorSelect(doctor)}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{doctor.specialty}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-700">{doctor.rating}</span>
                      <span className="text-xs text-gray-400">({doctor.reviews})</span>
                    </div>
                  </div>
                  <div className="bg-yellow-100 rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                    <span className="text-xs text-yellow-700">{doctor.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600">{doctor.experience} experience</div>
                  <div className="text-sm text-purple-600">${doctor.price}</div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
