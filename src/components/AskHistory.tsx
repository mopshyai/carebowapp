import { ArrowLeft, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import type { HealthSession } from '../App';

interface AskHistoryProps {
  sessions: HealthSession[];
  onBack: () => void;
  onSessionClick: (session: HealthSession) => void;
}

export function AskHistory({ sessions, onBack, onSessionClick }: AskHistoryProps) {
  const riskColors = {
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: AlertCircle },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertCircle }
  };

  // Group sessions by month
  const groupedSessions = sessions.reduce((acc, session) => {
    const monthYear = session.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(session);
    return acc;
  }, {} as Record<string, HealthSession[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-sm text-gray-900">Care Timeline</h1>
            <p className="text-xs text-gray-500">Your health journey with CareBow</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">{sessions.length}</div>
            <div className="text-xs text-gray-600">Conversations</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">
              {sessions.filter(s => s.outcome).length}
            </div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">
              {sessions.filter(s => s.riskLevel === 'low').length}
            </div>
            <div className="text-xs text-gray-600">Low risk</div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm text-gray-900 mb-1">Health Pattern Detected</h3>
              <p className="text-xs text-gray-600 mb-3">
                You've had 2 migraine episodes in the past month. Consider scheduling a preventive consultation.
              </p>
              <button className="text-xs text-purple-600 hover:underline">
                Learn more about migraine management
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([monthYear, monthSessions]) => (
            <div key={monthYear}>
              <h3 className="text-sm text-gray-700 mb-3">{monthYear}</h3>
              <div className="space-y-3">
                {monthSessions.map((session) => {
                  const config = riskColors[session.riskLevel];
                  const Icon = config.icon;

                  return (
                    <button
                      key={session.id}
                      onClick={() => onSessionClick(session)}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className="relative">
                          <div className={`w-10 h-10 ${config.bg} border ${config.border} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${config.text}`} />
                          </div>
                          {/* Connecting line - could be added with CSS */}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="text-sm text-gray-900 mb-1">{session.summary}</div>
                              <div className="text-xs text-gray-500">
                                {session.date.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div className={`px-2 py-1 ${config.bg} border ${config.border} rounded-lg text-xs ${config.text}`}>
                              {session.riskLevel}
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 mb-2">
                            <div className="text-xs text-purple-700">
                              → {session.recommendation}
                            </div>
                          </div>

                          {session.outcome && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              {session.outcome}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Your care timeline is private and secure.</strong> This information helps CareBow 
            provide better, more personalized guidance over time by understanding patterns in your health.
          </p>
        </div>
      </div>
    </div>
  );
}
