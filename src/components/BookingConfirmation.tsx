import { ArrowLeft, Calendar, Clock, Video, MapPin, User, CheckCircle } from 'lucide-react';
import type { Doctor } from '../App';

interface BookingConfirmationProps {
  doctor: Doctor;
  bookingDetails: any;
  onBack: () => void;
  onConfirm: () => void;
}

export function BookingConfirmation({ doctor, bookingDetails, onBack, onConfirm }: BookingConfirmationProps) {
  const bookingData = {
    date: 'Jan 15, 2026',
    time: '10:00 AM',
    duration: '30 minutes',
    type: 'Video Consultation',
    patientName: 'You',
    age: 32,
    problem: 'Regular checkup and health consultation'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg text-gray-900">Confirmation</h1>
      </div>

      <div className="px-6 py-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Doctor Card */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-sm text-gray-900 mb-1">{doctor.name}</h2>
              <p className="text-xs text-gray-600">{doctor.specialty}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{bookingData.date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{bookingData.time} ({bookingData.duration})</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Video className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">{bookingData.type}</span>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-200">
          <h3 className="text-sm text-gray-900 mb-4">Patient Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-xs text-gray-600">Name</div>
                <div className="text-sm text-gray-900">{bookingData.patientName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="text-xs text-gray-600">Age</div>
                <div className="text-sm text-gray-900">{bookingData.age} years</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div className="flex-1">
                <div className="text-xs text-gray-600 mb-1">Health Issue</div>
                <div className="text-sm text-gray-900">{bookingData.problem}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200">
          <h3 className="text-sm text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Consultation fee</span>
              <span className="text-gray-900">${doctor.price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Admin fee</span>
              <span className="text-gray-900">$2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount (10%)</span>
              <span className="text-green-600">-${(doctor.price * 0.1).toFixed(0)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-900">Total</span>
                <span className="text-lg text-purple-600">${(doctor.price + 2 - doctor.price * 0.1).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          className="w-full bg-purple-600 text-white px-6 py-4 rounded-full hover:bg-purple-700 transition-colors mb-4"
        >
          Confirm & Pay
        </button>

        <p className="text-xs text-gray-500 text-center">
          You will receive a confirmation email and meeting link shortly
        </p>
      </div>
    </div>
  );
}
