import { useState } from 'react';
import { X, User, Users } from 'lucide-react';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
}

export function FilterBottomSheet({ isOpen, onClose, onApplyFilters }: FilterBottomSheetProps) {
  const [serviceType, setServiceType] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [visitType, setVisitType] = useState('');
  const [forWhom, setForWhom] = useState<'me' | 'family'>('me');

  const handleApply = () => {
    onApplyFilters({
      serviceType,
      availability,
      priceRange,
      visitType,
      forWhom
    });
    onClose();
  };

  const handleReset = () => {
    setServiceType([]);
    setAvailability('');
    setPriceRange('');
    setVisitType('');
    setForWhom('me');
  };

  const toggleServiceType = (type: string) => {
    if (serviceType.includes(type)) {
      setServiceType(serviceType.filter(t => t !== type));
    } else {
      setServiceType([...serviceType, type]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-700" strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-6">
            
            {/* Service Type */}
            <div>
              <label className="text-sm text-gray-900 mb-3 block">Service Type</label>
              <div className="flex flex-wrap gap-2">
                {['Care', 'Devices', 'Labs', 'Packages', 'Transport'].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleServiceType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      serviceType.includes(type)
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="text-sm text-gray-900 mb-3 block">Availability</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAvailability('today')}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    availability === 'today'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setAvailability('this-week')}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    availability === 'this-week'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  This week
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm text-gray-900 mb-3 block">Price Range</label>
              <div className="space-y-2">
                {['Under ₹500', '₹500–₹1000', '₹1000–₹2000', 'Above ₹2000'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setPriceRange(range)}
                    className={`w-full py-3 rounded-xl text-sm font-medium text-left px-4 transition-all ${
                      priceRange === range
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Visit Type */}
            <div>
              <label className="text-sm text-gray-900 mb-3 block">Visit Type</label>
              <div className="space-y-2">
                {['Home visit', 'Clinic visit', 'Delivery'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setVisitType(type)}
                    className={`w-full py-3 rounded-xl text-sm font-medium text-left px-4 transition-all ${
                      visitType === type
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* For Me / For Family Toggle */}
            <div>
              <label className="text-sm text-gray-900 mb-3 block">For whom?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setForWhom('me')}
                  className={`border-2 rounded-2xl p-4 transition-all ${
                    forWhom === 'me'
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <User className={`w-6 h-6 ${forWhom === 'me' ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2} />
                    <div className={`text-sm font-medium ${forWhom === 'me' ? 'text-purple-900' : 'text-gray-700'}`}>
                      For me
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setForWhom('family')}
                  className={`border-2 rounded-2xl p-4 transition-all ${
                    forWhom === 'family'
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className={`w-6 h-6 ${forWhom === 'family' ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2} />
                    <div className={`text-sm font-medium ${forWhom === 'family' ? 'text-purple-900' : 'text-gray-700'}`}>
                      For family
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
