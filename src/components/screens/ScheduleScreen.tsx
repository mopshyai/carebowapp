import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Video, ChevronRight, Heart } from 'lucide-react';

interface ScheduleScreenProps {
  onBack: () => void;
  onOpenAskCareBow: () => void;
}

export function ScheduleScreen({ onBack, onOpenAskCareBow }: ScheduleScreenProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcomingAppointments = [
    {
      id: '1',
      doctor: 'Dr. Sarah Chen',
      specialty: 'General Practitioner',
      date: 'Jan 5, 2026',
      time: '2:00 PM',
      type: 'Video Consultation',
      avatar: '👩‍⚕️'
    },
    {
      id: '2',
      doctor: 'Dr. James Wilson',
      specialty: 'Cardiologist',
      date: 'Jan 8, 2026',
      time: '10:30 AM',
      type: 'Video Consultation',
      avatar: '👨‍⚕️'
    },
    {
      id: '3',
      doctor: 'Dr. Emily Rodriguez',
      specialty: 'Dermatologist',
      date: 'Jan 12, 2026',
      time: '4:00 PM',
      type: 'Video Consultation',
      avatar: '👩‍⚕️'
    }
  ];

  const pastAppointments = [
    {
      id: '4',
      doctor: 'Dr. Michael Park',
      specialty: 'General Practitioner',
      date: 'Dec 28, 2025',
      time: '3:00 PM',
      type: 'Video Consultation',
      avatar: '👨‍⚕️'
    },
    {
      id: '5',
      doctor: 'Dr. Lisa Anderson',
      specialty: 'Pediatrician',
      date: 'Dec 20, 2025',
      time: '11:00 AM',
      type: 'Video Consultation',
      avatar: '👩‍⚕️'
    }
  ];

  const appointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-xl text-gray-900">Appointments</h1>
        </div>

        {/* Tabs / Filter Chips */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'upcoming'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'past'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Helper Banner at Top */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Heart className="w-5 h-5 text-purple-600 fill-purple-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-900 mb-1">Need care now?</p>
              <p className="text-xs text-purple-700 leading-relaxed">
                Start with Ask CareBow to choose the safest next step.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAskCareBow}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Open Ask CareBow
          </button>
        </div>

        {/* List of Appointments */}
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <button
              key={appointment.id}
              className={`w-full bg-white border rounded-2xl p-5 hover:shadow-md transition-all text-left ${
                activeTab === 'upcoming' 
                  ? 'border-gray-200 hover:border-purple-300' 
                  : 'border-gray-100 opacity-75'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  activeTab === 'upcoming' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {appointment.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm text-gray-900">{appointment.doctor}</div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                      activeTab === 'upcoming' ? 'text-gray-400' : 'text-gray-300'
                    }`} strokeWidth={2} />
                  </div>
                  <div className="text-xs text-gray-600">{appointment.specialty}</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-4 text-xs mb-4 ${
                activeTab === 'upcoming' ? 'text-gray-700' : 'text-gray-600'
              }`}>
                <div className="flex items-center gap-1.5">
                  <Calendar className={`w-3.5 h-3.5 ${
                    activeTab === 'upcoming' ? 'text-purple-600' : 'text-gray-400'
                  }`} strokeWidth={2} />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3.5 h-3.5 ${
                    activeTab === 'upcoming' ? 'text-purple-600' : 'text-gray-400'
                  }`} strokeWidth={2} />
                  <span>{appointment.time}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                <Video className={`w-4 h-4 ${
                  activeTab === 'upcoming' ? 'text-purple-600' : 'text-gray-400'
                }`} strokeWidth={2} />
                <span className={`text-xs ${
                  activeTab === 'upcoming' ? 'text-purple-700' : 'text-gray-600'
                }`}>
                  {appointment.type}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" strokeWidth={2} />
            </div>
            <h3 className="text-base text-gray-900 mb-2">
              {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {activeTab === 'upcoming' 
                ? 'Use Ask CareBow to get personalized care guidance.'
                : 'Your appointment history will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
