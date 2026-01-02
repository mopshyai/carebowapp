import { ArrowLeft, Plus, MapPin, Home, Edit2, Star } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
  address: string;
  instructions?: string;
  isPrimary: boolean;
}

interface ServiceAddressesProps {
  onBack: () => void;
}

export function ServiceAddresses({ onBack }: ServiceAddressesProps) {
  const addresses: Address[] = [
    {
      id: '1',
      label: 'Home',
      type: 'primary',
      address: '1234 Oak Street, Apt 5B, San Francisco, CA 94102',
      instructions: 'Ring doorbell twice. Elevator to 5th floor. Parking available on street.',
      isPrimary: true
    },
    {
      id: '2',
      label: "Dad's House",
      type: 'secondary',
      address: '5678 Maple Avenue, Oakland, CA 94601',
      instructions: 'Side entrance. First floor. Call before arriving.',
      isPrimary: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-lg text-gray-900">Service Addresses</h1>
            <p className="text-xs text-gray-500">Manage locations for care visits</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="px-6 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-yellow-900 mb-1">Why we need this</div>
              <div className="text-xs text-yellow-700 leading-relaxed">
                Used for home visits, caregiver dispatch, and emergency support. Entry instructions help our care team reach you quickly.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address */}
      <div className="px-6 mb-6">
        <button className="w-full bg-white border-2 border-dashed border-purple-300 rounded-2xl p-5 hover:border-purple-400 hover:bg-purple-50 transition-all">
          <div className="flex items-center justify-center gap-3 text-purple-600">
            <Plus className="w-5 h-5" />
            <div className="text-sm">Add New Address</div>
          </div>
        </button>
      </div>

      {/* Addresses List */}
      <div className="px-6">
        <h3 className="text-sm text-gray-700 mb-3">Saved Addresses ({addresses.length})</h3>
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white border rounded-2xl p-5 ${
                address.isPrimary 
                  ? 'border-purple-300 shadow-sm' 
                  : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    address.isPrimary 
                      ? 'bg-purple-100' 
                      : 'bg-gray-100'
                  }`}>
                    <Home className={`w-6 h-6 ${
                      address.isPrimary 
                        ? 'text-purple-600' 
                        : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm text-gray-900">{address.label}</div>
                      {address.isPrimary && (
                        <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg text-xs">
                          <Star className="w-3 h-3 fill-purple-700" />
                          Primary
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{address.type === 'primary' ? 'Primary address' : 'Secondary address'}</div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Address */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Address</div>
                <div className="text-sm text-gray-900 leading-relaxed">
                  {address.address}
                </div>
              </div>

              {/* Instructions */}
              {address.instructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="text-xs text-blue-900 mb-1">Entry Instructions</div>
                  <div className="text-xs text-blue-700 leading-relaxed">
                    {address.instructions}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!address.isPrimary && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-xs text-purple-600 hover:underline">
                    Set as primary address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="px-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs text-gray-900 mb-2">Tips for entry instructions</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• Building entry code or buzzer instructions</div>
            <div>• Floor number and elevator location</div>
            <div>• Parking or drop-off instructions</div>
            <div>• Pet information if applicable</div>
            <div>• Preferred contact method upon arrival</div>
          </div>
        </div>
      </div>
    </div>
  );
}
