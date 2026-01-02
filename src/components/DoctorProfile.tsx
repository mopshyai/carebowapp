import { useState } from 'react';
import { ArrowLeft, Star, MapPin, Award, Users, Heart, Calendar } from 'lucide-react';
import type { Doctor } from '../App';

interface DoctorProfileProps {
  doctor: Doctor;
  onBack: () => void;
  onBookingConfirm: (details: any) => void;
}

export function DoctorProfile({ doctor, onBack, onBookingConfirm }: DoctorProfileProps) {
  const [selectedDate, setSelectedDate] = useState('15');
  const [selectedTime, setSelectedTime] = useState('10:00');

  const dates = [
    { day: 'Mon', date: '12' },
    { day: 'Tue', date: '13' },
    { day: 'Wed', date: '14' },
    { day: 'Thu', date: '15' },
    { day: 'Fri', date: '16' }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const services = [
    { name: 'Live Medical Chat', icon: '💬' },
    { name: 'Urgent Care', icon: '🚑' },
    { name: 'Family Medicine', icon: '👨‍👩‍👧‍👦' },
    { name: 'Care Management', icon: '📋' }
  ];

  const handleBooking = () => {
    onBookingConfirm({
      date: selectedDate,
      time: selectedTime
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg text-gray-900">Doctor's Profile</h1>
      </div>

      {/* Doctor Info */}
      <div className="bg-white px-6 py-6 mb-2">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">👨‍⚕️</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl text-gray-900 mb-1">{doctor.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{doctor.specialty}</p>
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-gray-700">{doctor.rating}</span>
              <span className="text-sm text-gray-400">({doctor.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">New York, USA</span>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-sm text-gray-900">{doctor.experience}</div>
            <div className="text-xs text-gray-600">Experience</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-sm text-gray-900">{doctor.patients}+</div>
            <div className="text-xs text-gray-600">Patients</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <Star className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <div className="text-sm text-gray-900">{doctor.rating}</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white px-6 py-6 mb-2">
        <h3 className="text-sm text-gray-900 mb-3">About</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {doctor.about}
        </p>
      </div>

      {/* Services */}
      <div className="bg-white px-6 py-6 mb-2">
        <h3 className="text-sm text-gray-900 mb-3">Services</h3>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl">
                {service.icon}
              </div>
              <div className="text-xs text-gray-700">{service.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Choose Date */}
      <div className="bg-white px-6 py-6 mb-2">
        <h3 className="text-sm text-gray-900 mb-3">Choose date</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => (
            <button
              key={date.date}
              onClick={() => setSelectedDate(date.date)}
              className={`flex-shrink-0 w-16 py-3 rounded-xl border transition-all ${
                selectedDate === date.date
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-xs mb-1">{date.day}</div>
              <div className="text-sm">{date.date}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Choose Time */}
      <div className="bg-white px-6 py-6 mb-24">
        <h3 className="text-sm text-gray-900 mb-3">Choose time</h3>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`py-3 rounded-xl border text-sm transition-all ${
                selectedTime === time
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Book Button */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">Total</div>
            <div className="text-xl text-purple-600">${doctor.price}</div>
          </div>
          <button
            onClick={handleBooking}
            className="flex-1 bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
