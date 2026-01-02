import { ArrowLeft, Calendar, Clock, Video, MapPin, MoreVertical } from 'lucide-react';
import type { Appointment } from '../App';

interface AppointmentsListProps {
  appointments: Appointment[];
  onBack: () => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function AppointmentsList({ appointments, onBack, onAppointmentClick }: AppointmentsListProps) {
  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');
  const pastAppointments = appointments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg text-gray-900">Appointments</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-full text-sm">
            Upcoming
          </button>
          <button className="flex-1 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full text-sm hover:border-purple-300 transition-colors">
            Past
          </button>
        </div>

        {/* Appointments */}
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <button
              key={appointment.id}
              onClick={() => onAppointmentClick(appointment)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">👨‍⚕️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm text-gray-900 mb-1">{appointment.doctor.name}</h3>
                      <p className="text-xs text-gray-600">{appointment.doctor.specialty}</p>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {appointment.time}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                      {appointment.type}
                    </div>
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                      Confirmed
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
