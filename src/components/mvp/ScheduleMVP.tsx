import { Calendar, Clock, Video, UserCircle, ChevronRight, CalendarCheck } from 'lucide-react';

interface ScheduleMVPProps {
  onProfileClick: () => void;
}

export function ScheduleMVP({ onProfileClick }: ScheduleMVPProps) {
  const upcomingAppointments = [
    {
      id: '1',
      doctor: 'Dr. Sarah Chen',
      specialty: 'General Practitioner',
      date: 'Jan 5, 2026',
      time: '2:00 PM',
      type: 'Video Consultation',
      status: 'upcoming',
      avatar: '👩‍⚕️'
    },
    {
      id: '2',
      doctor: 'Dr. James Wilson',
      specialty: 'Cardiologist',
      date: 'Jan 8, 2026',
      time: '10:30 AM',
      type: 'Video Consultation',
      status: 'upcoming',
      avatar: '👨‍⚕️'
    }
  ];

  const pastAppointments = [
    {
      id: '3',
      doctor: 'Dr. Emily Rodriguez',
      specialty: 'General Practitioner',
      date: 'Dec 28, 2025',
      time: '3:00 PM',
      type: 'Video Consultation',
      status: 'completed',
      avatar: '👩‍⚕️'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header with Profile Access */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl text-gray-900">Schedule</h1>
          
          {/* Profile Access - Top Right UserCircle Icon */}
          <button
            onClick={onProfileClick}
            className="p-2 hover:bg-purple-50 rounded-full transition-colors group"
            aria-label="Profile"
          >
            <UserCircle className="w-7 h-7 text-gray-600 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-gray-600">Your upcoming and past consultations</p>
      </div>

      {/* No New Booking Here */}
      <div className="px-6 py-6">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-5 h-5 text-purple-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-900 mb-1">Need care?</p>
              <p className="text-xs text-purple-700 leading-relaxed">
                Start by describing your symptoms in Ask CareBow. I'll help you determine the right next step.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="px-6 pb-6">
        <h2 className="text-base text-gray-900 mb-4">Upcoming</h2>
        <div className="space-y-3">
          {upcomingAppointments.map((appointment) => (
            <button
              key={appointment.id}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {appointment.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm text-gray-900">{appointment.doctor}</div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="text-xs text-gray-600 mb-3">{appointment.specialty}</div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-purple-700">{appointment.type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Past Appointments */}
      <div className="px-6 pb-6">
        <h2 className="text-base text-gray-900 mb-4">Past</h2>
        <div className="space-y-3">
          {pastAppointments.map((appointment) => (
            <button
              key={appointment.id}
              className="w-full bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all text-left opacity-75"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {appointment.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm text-gray-900">{appointment.doctor}</div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                  <div className="text-xs text-gray-600 mb-3">{appointment.specialty}</div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}