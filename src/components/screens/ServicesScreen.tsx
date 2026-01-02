import { useState } from 'react';
import { Search, SlidersHorizontal, Heart, ChevronRight, Clock, MapPin, CheckCircle, Zap, TrendingUp } from 'lucide-react';

interface ServicesScreenProps {
  onOpenFilter: () => void;
  onNavigateToDetail: (serviceId: string) => void;
  onNavigateToCategoryAll: (category: string) => void;
}

export function ServicesScreen({ onOpenFilter, onNavigateToDetail, onNavigateToCategoryAll }: ServicesScreenProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'care', label: 'Care' },
    { id: 'devices', label: 'Devices' },
    { id: 'labs', label: 'Labs' },
    { id: 'packages', label: 'Packages' },
    { id: 'transport', label: 'Transport' }
  ];

  const recommendedServices = [
    {
      id: 'r1',
      name: 'Doctor Home Visit',
      subtext: 'Available in 2–4 hrs',
      priceRange: '₹800–1200',
      tags: ['Verified', 'Fast']
    },
    {
      id: 'r2',
      name: 'ECG at Home',
      subtext: 'Report in 6 hrs',
      priceRange: '₹500',
      tags: ['Popular']
    },
    {
      id: 'r3',
      name: 'Nurse Care (8hrs)',
      subtext: 'Trained professionals',
      priceRange: '₹1500–2000',
      tags: ['Verified']
    }
  ];

  const coreCareServices = [
    { id: 'c1', icon: '👨‍⚕️', title: 'Doctor Visit', description: 'General & specialist consultations', emoji: true },
    { id: 'c2', icon: '👩‍⚕️', title: 'Nurse at Home', description: 'Daily care & medical procedures', emoji: true },
    { id: 'c3', icon: '🧘', title: 'Physiotherapy', description: 'Home rehabilitation sessions', emoji: true },
    { id: 'c4', icon: '🩺', title: 'Health Check Visit', description: 'Comprehensive vitals monitoring', emoji: true },
    { id: 'c5', icon: '💉', title: 'Lab Testing', description: 'Sample collection at home', emoji: true }
  ];

  const medicalDevices = [
    { id: 'd1', name: 'Oxygen Concentrator', subtitle: 'Rental • Setup included' },
    { id: 'd2', name: 'BiPAP Machine', subtitle: 'Rental • Setup included' },
    { id: 'd3', name: 'CPAP Machine', subtitle: 'Rental • Setup included' },
    { id: 'd4', name: 'Medical Bed (2-function)', subtitle: 'Rental • Setup included' }
  ];

  const packages = [
    { id: 'p1', name: 'Cardiac Package', subtitle: 'Includes tests + consult' },
    { id: 'p2', name: 'Oncology Package', subtitle: 'Includes tests + consult' },
    { id: 'p3', name: 'Neuro Package', subtitle: 'Includes tests + consult' },
    { id: 'p4', name: 'Ortho Package', subtitle: 'Includes tests + consult' }
  ];

  const transportServices = [
    { id: 't1', name: 'Medical Transport', subtitle: 'Ambulance & medical vehicles' },
    { id: 't2', name: 'Caregiver Pickup/Drop', subtitle: 'Assisted transport service' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* TOP HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-6 py-6">
          <h1 className="text-2xl text-gray-900 mb-4">Services</h1>
          
          {/* Search Bar + Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, devices, lab tests…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={onOpenFilter}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-colors"
              aria-label="Filter"
            >
              <SlidersHorizontal className="w-5 h-5 text-gray-700" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* STICKY CATEGORY CHIPS (Horizontal Scrollable) */}
        <div className="px-6 pb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* SECTION 1 — RECOMMENDED (SMALL) */}
        <div>
          <h2 className="text-base text-gray-900 mb-4 px-1">Recommended</h2>
          <div className="space-y-3">
            {recommendedServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{service.subtext}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                            tag === 'Verified'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : tag === 'Fast'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {tag === 'Verified' && <CheckCircle className="w-3 h-3" strokeWidth={2} />}
                          {tag === 'Fast' && <Zap className="w-3 h-3" strokeWidth={2} />}
                          {tag === 'Popular' && <TrendingUp className="w-3 h-3" strokeWidth={2} />}
                          {tag}
                        </span>
                      ))}
                    </div>

                    {service.priceRange && (
                      <p className="text-xs text-purple-700 font-medium">{service.priceRange}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onNavigateToDetail(service.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-medium hover:bg-purple-700 transition-colors flex-shrink-0"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2 — CORE CARE (SEE ALL) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base text-gray-900">Core Care</h2>
            <button
              onClick={() => onNavigateToCategoryAll('care')}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {coreCareServices.slice(0, 4).map((service) => (
              <button
                key={service.id}
                onClick={() => onNavigateToDetail(service.id)}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-3">
                  {service.icon}
                </div>
                <h3 className="text-sm text-gray-900 mb-1">{service.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{service.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3 — MEDICAL DEVICES RENTAL (SEE ALL) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base text-gray-900">Medical Devices</h2>
            <button
              onClick={() => onNavigateToCategoryAll('devices')}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-3">
            {medicalDevices.map((device) => (
              <button
                key={device.id}
                onClick={() => onNavigateToDetail(device.id)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-gray-900 mb-1">{device.name}</h3>
                  <p className="text-xs text-gray-600">{device.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 4 — PACKAGES (SEE ALL) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base text-gray-900">Care Packages</h2>
            <button
              onClick={() => onNavigateToCategoryAll('packages')}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => onNavigateToDetail(pkg.id)}
                className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 hover:border-purple-400 hover:shadow-md transition-all text-left"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5 text-purple-600 fill-purple-600" strokeWidth={2} />
                </div>
                <h3 className="text-sm text-gray-900 mb-1">{pkg.name}</h3>
                <p className="text-xs text-purple-700">{pkg.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 5 — TRANSPORT (OPTIONAL MVP) */}
        <div>
          <h2 className="text-base text-gray-900 mb-4 px-1">Medical Transport</h2>
          <div className="space-y-3">
            {transportServices.map((transport) => (
              <button
                key={transport.id}
                onClick={() => onNavigateToDetail(transport.id)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-gray-900 mb-1">{transport.name}</h3>
                  <p className="text-xs text-gray-600">{transport.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>

        {/* LINK TO ASK CAREBOW */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Heart className="w-5 h-5 text-purple-600 fill-purple-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-900 mb-1">Not sure what you need?</p>
              <p className="text-xs text-purple-700 leading-relaxed">
                Ask CareBow to understand your situation and recommend the right care.
              </p>
            </div>
          </div>
          <button className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
            Ask CareBow first
          </button>
        </div>
      </div>
    </div>
  );
}
