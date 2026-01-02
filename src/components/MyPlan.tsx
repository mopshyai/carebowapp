import { ArrowLeft, Heart, Video, Home, MessageSquare, Calendar, CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface MyPlanProps {
  onBack: () => void;
}

export function MyPlan({ onBack }: MyPlanProps) {
  const currentPlan = {
    name: 'CareBow Plus',
    status: 'Active',
    renewalDate: 'March 15, 2026',
    features: [
      { name: 'Unlimited Ask CareBow conversations', included: true },
      { name: 'Video consultations', included: true, detail: '5 per month' },
      { name: 'Home visits', included: true, detail: '2 per month' },
      { name: 'Priority support & follow-ups', included: true },
      { name: 'Family profiles', included: true, detail: 'Up to 5 members' },
      { name: 'Care timeline & insights', included: true },
      { name: 'Prescription management', included: true }
    ]
  };

  const plans = [
    {
      id: 'basic',
      name: 'CareBow Basic',
      price: 'Free',
      description: 'Essential AI care guidance',
      isCurrent: false
    },
    {
      id: 'plus',
      name: 'CareBow Plus',
      price: '$29/month',
      description: 'Complete care for you and your family',
      isCurrent: true
    },
    {
      id: 'family',
      name: 'CareBow Family',
      price: '$49/month',
      description: 'Unlimited care for the whole family',
      isCurrent: false
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
            <h1 className="text-lg text-gray-900">My Plan</h1>
            <p className="text-xs text-gray-500">Your CareBow membership</p>
          </div>
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-purple-600 text-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-purple-100 mb-1">Current Plan</div>
              <div className="text-2xl mb-1">{currentPlan.name}</div>
              <div className="text-sm text-purple-100">
                {currentPlan.status} • Renews {currentPlan.renewalDate}
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl px-4 py-3 text-sm transition-colors">
            Manage Plan
          </button>
        </div>
      </div>

      {/* What's Included */}
      <div className="px-6 mb-6">
        <h3 className="text-sm text-gray-700 mb-3">What's included</h3>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {currentPlan.features.map((feature, idx) => (
            <div key={idx} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-gray-900 mb-0.5">{feature.name}</div>
                  {feature.detail && (
                    <div className="text-xs text-gray-600">{feature.detail}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage This Month */}
      <div className="px-6 mb-6">
        <h3 className="text-sm text-gray-700 mb-3">Usage this month</h3>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-4 h-4 text-purple-600" />
                <div className="text-xs text-gray-600">Video Consults</div>
              </div>
              <div className="text-2xl text-gray-900 mb-0.5">2</div>
              <div className="text-xs text-gray-500">of 5 used</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Home className="w-4 h-4 text-green-600" />
                <div className="text-xs text-gray-600">Home Visits</div>
              </div>
              <div className="text-2xl text-gray-900 mb-0.5">0</div>
              <div className="text-xs text-gray-500">of 2 used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Plans */}
      <div className="px-6 mb-6">
        <h3 className="text-sm text-gray-700 mb-3">Other plans</h3>
        <div className="space-y-3">
          {plans.filter(p => !p.isCurrent).map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-sm text-gray-900 mb-1">{plan.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{plan.description}</div>
                  <div className="text-lg text-purple-600">{plan.price}</div>
                </div>
              </div>
              <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 rounded-xl px-4 py-2 text-sm transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Care-Focused Message */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-900 mb-1">Care that grows with you</div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Your plan adapts to your needs. If you need more visits or consultations, we'll let you know and suggest the right upgrade — no surprises.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
