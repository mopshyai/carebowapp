import { useState } from 'react';
import { User, Users, Mic, Calendar, Clock, Video, MessageCircleHeart, ChevronRight, ArrowRight, Stethoscope, HeartPulse, TestTube, Activity, Package, CheckCircle, Zap, Heart } from 'lucide-react';

interface TodayScreenProps {
  onNavigateToProfile: () => void;
  onStartSymptomCheck: (context: any, symptomInput: string) => void;
  onNavigateToAskCareBow: () => void;
  onNavigateToSchedule: () => void;
  onNavigateToServices: () => void;
  onNavigateToDevices: () => void;
  onNavigateToPackages: () => void;
  onNavigateToPlans: () => void;
  onNavigateToServiceDetail: (serviceId: string) => void;
}

export function TodayScreen({
  onNavigateToProfile,
  onStartSymptomCheck,
  onNavigateToAskCareBow,
  onNavigateToSchedule,
  onNavigateToServices,
  onNavigateToDevices,
  onNavigateToPackages,
  onNavigateToPlans,
  onNavigateToServiceDetail
}: TodayScreenProps) {
  const [contextType, setContextType] = useState<'me' | 'family'>('me');
  const [symptomInput, setSymptomInput] = useState('');
  const [familyRelation, setFamilyRelation] = useState('');
  const [familyAge, setFamilyAge] = useState('');
  const [followUpResponse, setFollowUpResponse] = useState<'better' | 'same' | 'worse' | null>(null);

  const handleStartCare = () => {
    // If input is empty, navigate to Ask CareBow tab and let it handle focus
    if (!symptomInput.trim()) {
      onNavigateToAskCareBow();
      return;
    }
    
    const context = contextType === 'me' 
      ? { relationship: 'me' }
      : { relationship: familyRelation, age: parseInt(familyAge) };
    
    onStartSymptomCheck(context, symptomInput);
  };

  const quickPicks = [
    { id: 'doctor-visit', icon: Stethoscope, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', title: 'Doctor visit', benefit: 'Available today', tag: 'Fast' },
    { id: 'lab-testing', icon: TestTube, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', title: 'Lab testing', benefit: 'Home collection', tag: 'Popular' },
    { id: 'nurse-home', icon: HeartPulse, iconBg: 'bg-pink-50', iconColor: 'text-pink-600', title: 'Nurse at home', benefit: 'Professional care', tag: 'Verified' }
  ];

  const devices = [
    { id: 'd1', icon: Activity, name: 'Oxygen Concentrator', tags: ['Rental', 'Setup included'] },
    { id: 'd2', icon: Activity, name: 'BiPAP Machine', tags: ['Rental', 'Setup included'] },
    { id: 'd3', icon: Activity, name: 'CPAP Machine', tags: ['Rental', 'Setup included'] },
    { id: 'd4', icon: Package, name: 'Medical Bed', tags: ['Rental', 'Setup included'] }
  ];

  const packages = [
    { id: 'p1', name: 'Cardiac Package', subtitle: 'Includes tests + consult', color: 'from-red-50 to-pink-50' },
    { id: 'p2', name: 'Oncology Package', subtitle: 'Includes tests + consult', color: 'from-purple-50 to-blue-50' },
    { id: 'p3', name: 'Neuro Package', subtitle: 'Includes tests + consult', color: 'from-blue-50 to-cyan-50' },
    { id: 'p4', name: 'Ortho Package', subtitle: 'Includes tests + consult', color: 'from-green-50 to-emerald-50' }
  ];

  const plans = [
    { 
      id: 'basic', 
      name: 'Basic', 
      benefits: ['AI symptom guidance', 'Priority support', 'Health records'],
      color: 'bg-gray-50'
    },
    { 
      id: 'plus', 
      name: 'Plus', 
      benefits: ['Everything in Basic', '24/7 consults', 'Free follow-ups'],
      color: 'bg-gradient-to-br from-purple-50 to-blue-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* HEADER - With Safe Area Top */}
      <div className="px-6 pt-[calc(48px+env(safe-area-inset-top,0px))] pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Today</h1>
          <p className="text-sm text-gray-500">Care starts here.</p>
        </div>
        <button
          onClick={onNavigateToProfile}
          className="w-11 h-11 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
          aria-label="Profile"
        >
          <span className="text-sm text-white">S</span>
        </button>
      </div>

      {/* SCROLLABLE CONTENT - With Bottom Safe Padding */}
      <div className="px-6 space-y-6 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        
        {/* SECTION 1 — ASK CAREBOW (HERO) */}
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-base text-gray-900">Ask CareBow</h2>
          </div>
          
          <p className="text-xs text-gray-600 mb-2 leading-relaxed">
            Describe what's going on. I'll guide your next step safely.
          </p>

          {/* Trust line */}
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Not a diagnosis. If this feels urgent, seek emergency care.
          </p>

          {/* Context Selector Chips (Required) */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setContextType('me')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                contextType === 'me'
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <User className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm">For me</span>
            </button>
            
            <button
              onClick={() => setContextType('family')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                contextType === 'family'
                  ? 'border-purple-600 bg-purple-50 text-purple-900'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm">For family</span>
            </button>
          </div>

          {/* If "For family" selected, show inline fields */}
          {contextType === 'family' && (
            <div className="mb-4 space-y-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div>
                <label className="text-xs text-purple-900 mb-2 block">Relationship</label>
                <select
                  value={familyRelation}
                  onChange={(e) => setFamilyRelation(e.target.value)}
                  className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select...</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-purple-900 mb-2 block">Age</label>
                <input
                  type="number"
                  value={familyAge}
                  onChange={(e) => setFamilyAge(e.target.value)}
                  placeholder="Enter age"
                  className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Compact Input Field */}
          <div className="relative mb-2">
            <textarea
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="Describe symptoms or concerns…"
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button 
              className="absolute bottom-3 right-3 p-2 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label="Voice input"
            >
              <Mic className="w-4 h-4 text-gray-400" strokeWidth={2} />
            </button>
          </div>

          {/* Microcopy under input */}
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Type a few words to begin.
          </p>

          {/* Primary CTA - Always active, navigates to Ask CareBow tab if empty */}
          <button
            onClick={handleStartCare}
            className="w-full py-3 rounded-xl font-medium text-sm bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
          >
            Start
          </button>
        </div>

        {/* SECTION 2 — QUICK PICKS (3 CARDS MAX) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base text-gray-900">Quick picks</h3>
            <button
              onClick={onNavigateToServices}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all services
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {quickPicks.map((pick) => {
              const IconComponent = pick.icon;
              return (
                <button
                  key={pick.id}
                  onClick={() => onNavigateToServiceDetail(pick.id)}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-center"
                >
                  <div className={`w-12 h-12 ${pick.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className={`w-5 h-5 ${pick.iconColor}`} strokeWidth={2} />
                  </div>
                  <div className="text-xs text-gray-900 mb-1 font-medium leading-tight">{pick.title}</div>
                  <div className="inline-flex items-center gap-1 mb-2">
                    <Zap className="w-3 h-3 text-purple-600" strokeWidth={2} />
                    <span className="text-xs text-purple-600 leading-tight">{pick.benefit}</span>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                      {pick.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3 — MEDICAL DEVICES AT HOME (CAROUSEL) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base text-gray-900">Devices at home</h3>
            <button
              onClick={onNavigateToDevices}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all devices
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <div className="flex gap-3 min-w-max">
              {devices.map((device) => {
                const DeviceIcon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => onNavigateToServiceDetail(device.id)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all w-40"
                  >
                    {/* Device icon thumbnail */}
                    <div className="w-full h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mb-3">
                      <DeviceIcon className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-sm text-gray-900 mb-2 leading-tight font-medium">{device.name}</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {device.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                      <Package className="w-3 h-3" strokeWidth={2} />
                      <span>Rent now</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4 — CARE PACKAGES (CAROUSEL) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base text-gray-900">Care packages</h3>
            <button
              onClick={onNavigateToPackages}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all packages
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
            <div className="flex gap-3 min-w-max">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => onNavigateToServiceDetail(pkg.id)}
                  className={`bg-gradient-to-br ${pkg.color} border border-purple-200 rounded-2xl p-4 hover:border-purple-400 hover:shadow-md transition-all w-44`}
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3">
                    <Heart className="w-5 h-5 text-purple-600 fill-purple-600" strokeWidth={2} />
                  </div>
                  <div className="text-sm text-gray-900 mb-1 leading-tight">{pkg.name}</div>
                  <div className="text-xs text-purple-700">{pkg.subtitle}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5 — SUBSCRIPTION (SMALL, OPTIONAL MODULE) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base text-gray-900">Plans</h3>
            <button
              onClick={onNavigateToPlans}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Compare plans
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => onNavigateToPlans()}
                className={`${plan.color} border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left`}
              >
                <div className="text-sm text-gray-900 mb-3 font-medium">{plan.name}</div>
                <ul className="space-y-1.5">
                  {plan.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="text-xs text-gray-700 leading-relaxed flex items-start gap-1.5">
                      <span className="text-purple-600 mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 6 — NEXT APPOINTMENT (SINGLE CARD) */}
        <div>
          {/* Header with "See all" link */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm text-gray-900">Next appointment</h3>
            <button
              onClick={onNavigateToSchedule}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                👩‍⚕️
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 mb-0.5">Dr. Sarah Chen</div>
                <div className="text-xs text-gray-600">General Practitioner</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-700 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" strokeWidth={2} />
                <span>Jan 5, 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" strokeWidth={2} />
                <span>2:00 PM</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" strokeWidth={2} />
                <span className="text-xs text-purple-700">Video consult</span>
              </div>
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                Details
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 7 — FOLLOW-UP CHECK-IN (SINGLE CARD) */}
        <div>
          <h3 className="text-sm text-gray-900 mb-3 px-1">Follow-up</h3>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-purple-200 rounded-2xl p-5">
            <p className="text-sm text-gray-900 mb-1">How are you feeling today?</p>
            <p className="text-xs text-gray-600 mb-4">Your answer helps CareBow guide you safely.</p>

            {/* Response buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setFollowUpResponse('better')}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                  followUpResponse === 'better'
                    ? 'bg-green-50 text-green-700 border-2 border-green-500 shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                }`}
              >
                Better
              </button>
              <button
                onClick={() => setFollowUpResponse('same')}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                  followUpResponse === 'same'
                    ? 'bg-yellow-50 text-yellow-700 border-2 border-yellow-500 shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-300'
                }`}
              >
                Same
              </button>
              <button
                onClick={() => setFollowUpResponse('worse')}
                className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                  followUpResponse === 'worse'
                    ? 'bg-red-50 text-red-700 border-2 border-red-500 shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300'
                }`}
              >
                Worse
              </button>
            </div>

            {/* If "Worse" selected, show suggestion */}
            {followUpResponse === 'worse' && (
              <div className="pt-4 border-t border-purple-200">
                <button
                  onClick={onNavigateToAskCareBow}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Ask CareBow now
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}