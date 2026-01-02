import { ArrowLeft, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';

interface TimelineSession {
  id: string;
  date: Date;
  forWho: string;
  relationship: string;
  summary: string;
  outcome: 'self-care' | 'video' | 'home-visit' | 'emergency';
  status: 'improved' | 'unresolved' | 'monitoring';
  riskLevel: 'low' | 'medium' | 'high';
  resolution?: string;
}

interface CareTimelineProps {
  sessions: TimelineSession[];
  onBack: () => void;
  onSessionClick: (session: TimelineSession) => void;
}

export function CareTimeline({ sessions, onBack, onSessionClick }: CareTimelineProps) {
  const outcomeLabels = {
    'self-care': 'Self-care guidance',
    'video': 'Video consultation',
    'home-visit': 'Home visit',
    'emergency': 'Emergency care'
  };

  const statusColors = {
    'improved': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle },
    'unresolved': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle },
    'monitoring': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Clock }
  };

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group by month
  const groupedSessions = sessions.reduce((acc, session) => {
    const monthYear = session.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(session);
    return acc;
  }, {} as Record<string, TimelineSession[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg text-gray-900">Care Timeline</h1>
            <p className="text-xs text-gray-500">Your medical memory, not just messages</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl text-purple-600 mb-1">{sessions.length}</div>
            <div className="text-xs text-gray-600">Total sessions</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl text-green-600 mb-1">
              {sessions.filter(s => s.status === 'improved').length}
            </div>
            <div className="text-xs text-gray-600">Improved</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl text-blue-600 mb-1">
              {sessions.filter(s => s.status === 'monitoring').length}
            </div>
            <div className="text-xs text-gray-600">Monitoring</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6">
        {Object.entries(groupedSessions).map(([monthYear, monthSessions]) => (
          <div key={monthYear} className="mb-6">
            <div className="text-xs text-gray-500 mb-3 px-2">{monthYear}</div>
            <div className="space-y-3">
              {monthSessions.map((session) => {
                const statusStyle = statusColors[session.status];
                const StatusIcon = statusStyle.icon;

                return (
                  <button
                    key={session.id}
                    onClick={() => onSessionClick(session)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">{session.forWho}</div>
                          <div className="text-xs text-gray-500">{formatDate(session.date)}</div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text} border flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {session.status}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="text-sm text-gray-900 mb-3 leading-relaxed">
                      {session.summary}
                    </div>

                    {/* Outcome */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-xs text-purple-600">
                        → {outcomeLabels[session.outcome]}
                      </div>
                      <div className={`text-xs capitalize ${riskColors[session.riskLevel]}`}>
                        {session.riskLevel} risk
                      </div>
                    </div>

                    {/* Resolution */}
                    {session.resolution && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-gray-600 leading-relaxed">
                            {session.resolution}
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🩺</div>
            <div className="text-sm text-gray-900 mb-2">No care sessions yet</div>
            <div className="text-xs text-gray-500">
              Your care timeline will appear here as you use Ask CareBow
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-6 mt-6">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <div className="text-xs text-purple-900 mb-2">What is Care Timeline?</div>
          <div className="text-xs text-purple-700 leading-relaxed">
            This is your medical memory. Every assessment includes who it was for, what happened, and how it was resolved. 
            CareBow references this history to give you better, more continuous care.
          </div>
        </div>
      </div>
    </div>
  );
}
