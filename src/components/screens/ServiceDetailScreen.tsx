import { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, MapPin, Calendar, Heart, ChevronDown } from 'lucide-react';

interface ServiceDetailScreenProps {
  serviceId: string;
  onBack: () => void;
  onBook: () => void;
  onAskCareBow: () => void;
}

export function ServiceDetailScreen({ serviceId, onBack, onBook, onAskCareBow }: ServiceDetailScreenProps) {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Mock service data - in real app would fetch based on serviceId
  const service = {
    id: serviceId,
    title: 'Doctor Home Visit',
    tag: 'Verified',
    category: 'Core Care',
    priceRange: '₹800–1200',
    whatsIncluded: [
      'Professional doctor visit at your home',
      'Complete physical examination',
      'Prescription & medical advice',
      'Follow-up consultation (if needed)',
      'Digital health records'
    ],
    duration: '30–45 minutes',
    availability: 'Available in 2–4 hours',
    description: 'Get expert medical care at home with our verified doctors. Perfect for general consultations, health monitoring, and minor illness management.'
  };

  const addresses = [
    { id: '1', label: 'Home', address: '123 Main Street, Apartment 4B' },
    { id: '2', label: 'Parents', address: '456 Oak Avenue, House 12' }
  ];

  const dates = [
    { id: '1', label: 'Today', date: 'Jan 2' },
    { id: '2', label: 'Tomorrow', date: 'Jan 3' },
    { id: '3', label: 'Jan 4', date: 'Jan 4' }
  ];

  const times = [
    { id: '1', time: '10:00 AM - 11:00 AM' },
    { id: '2', time: '2:00 PM - 3:00 PM' },
    { id: '3', time: '4:00 PM - 5:00 PM' },
    { id: '4', time: '6:00 PM - 7:00 PM' }
  ];

  const canBook = selectedAddress && selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" strokeWidth={2} />
          </button>
          <h1 className="text-xl text-gray-900">Service Details</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* HERO SECTION */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl text-gray-900">{service.title}</h2>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-medium flex-shrink-0">
              <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
              {service.tag}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {service.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-700 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600" strokeWidth={2} />
              <span>{service.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span>{service.availability}</span>
            </div>
          </div>
        </div>

        {/* WHAT'S INCLUDED */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-base text-gray-900 mb-4">What's included</h3>
          <ul className="space-y-3">
            {service.whatsIncluded.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* PRICING */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 mb-1">Service fee</p>
              <p className="text-2xl text-purple-900 font-medium">{service.priceRange}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-700">Final price after consultation</p>
            </div>
          </div>
        </div>

        {/* ADDRESS SELECTOR */}
        <div>
          <label className="text-sm text-gray-900 mb-3 block">Select address</label>
          <div className="space-y-2">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddress(addr.id)}
                className={`w-full border-2 rounded-2xl p-4 text-left transition-all ${
                  selectedAddress === addr.id
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    selectedAddress === addr.id ? 'text-purple-600' : 'text-gray-400'
                  }`} strokeWidth={2} />
                  <div className="flex-1">
                    <div className={`text-sm font-medium mb-1 ${
                      selectedAddress === addr.id ? 'text-purple-900' : 'text-gray-900'
                    }`}>
                      {addr.label}
                    </div>
                    <div className="text-xs text-gray-600">{addr.address}</div>
                  </div>
                </div>
              </button>
            ))}
            
            <button className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-4 text-sm text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all">
              + Add new address
            </button>
          </div>
        </div>

        {/* DATE SELECTOR */}
        <div>
          <label className="text-sm text-gray-900 mb-3 block">Select date</label>
          <div className="grid grid-cols-3 gap-2">
            {dates.map((dateOption) => (
              <button
                key={dateOption.id}
                onClick={() => setSelectedDate(dateOption.id)}
                className={`border-2 rounded-xl p-4 text-center transition-all ${
                  selectedDate === dateOption.id
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className={`text-xs mb-1 ${
                  selectedDate === dateOption.id ? 'text-purple-700' : 'text-gray-600'
                }`}>
                  {dateOption.label}
                </div>
                <div className={`text-sm font-medium ${
                  selectedDate === dateOption.id ? 'text-purple-900' : 'text-gray-900'
                }`}>
                  {dateOption.date}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* TIME SELECTOR */}
        <div>
          <label className="text-sm text-gray-900 mb-3 block">Select time</label>
          <div className="grid grid-cols-2 gap-2">
            {times.map((timeOption) => (
              <button
                key={timeOption.id}
                onClick={() => setSelectedTime(timeOption.id)}
                className={`border-2 rounded-xl p-3 text-center text-sm transition-all ${
                  selectedTime === timeOption.id
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-md font-medium'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                {timeOption.time}
              </button>
            ))}
          </div>
        </div>

        {/* ASK CAREBOW FIRST BANNER */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Heart className="w-5 h-5 text-purple-600 fill-purple-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-900 mb-1">Not sure if this is right?</p>
              <p className="text-xs text-purple-700 leading-relaxed">
                Ask CareBow to understand your situation first and get personalized guidance.
              </p>
            </div>
          </div>
          <button
            onClick={onAskCareBow}
            className="w-full bg-white border border-purple-300 text-purple-700 py-3 rounded-xl text-sm font-medium hover:bg-purple-50 transition-colors"
          >
            Ask CareBow first
          </button>
        </div>

        {/* PRIMARY CTA */}
        <div className="sticky bottom-24 bg-white border-t border-gray-200 pt-4 -mx-6 px-6">
          <button
            onClick={onBook}
            disabled={!canBook}
            className={`w-full py-4 rounded-2xl font-medium text-base transition-all ${
              canBook
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canBook ? 'Book now' : 'Select address, date & time'}
          </button>

          {!canBook && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Please fill all details to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
