import { MessagesSquare, UserCircle, ChevronRight, Clock } from 'lucide-react';

interface MessagesMVPProps {
  onProfileClick: () => void;
}

export function MessagesMVP({ onProfileClick }: MessagesMVPProps) {
  const conversations = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      role: 'General Practitioner',
      lastMessage: 'Your test results look good. Continue with the prescribed medication.',
      timestamp: '10 min ago',
      unread: 2,
      avatar: '👩‍⚕️',
      online: true
    },
    {
      id: '2',
      name: 'Dr. James Wilson',
      role: 'Cardiologist',
      lastMessage: 'Please schedule a follow-up in 2 weeks.',
      timestamp: '2 hours ago',
      unread: 0,
      avatar: '👨‍⚕️',
      online: false
    },
    {
      id: '3',
      name: 'CareBow Support',
      role: 'Care Team',
      lastMessage: 'How can we help you today?',
      timestamp: 'Yesterday',
      unread: 0,
      avatar: '💜',
      online: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-24">
      {/* Header with Profile Access */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl text-gray-900">Messages</h1>
          
          {/* Profile Access - Top Right UserCircle Icon */}
          <button
            onClick={onProfileClick}
            className="p-2 hover:bg-purple-50 rounded-full transition-colors group"
            aria-label="Profile"
          >
            <UserCircle className="w-7 h-7 text-gray-600 group-hover:text-purple-600 transition-colors" strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-gray-600">Chat with your care team</p>
      </div>

      {/* No AI Triage Here */}
      <div className="px-6 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessagesSquare className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-900 mb-1">New symptoms?</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Use Ask CareBow to describe what you're experiencing. I'll guide you to the right care.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations */}
      <div className="px-6 pb-6">
        <h2 className="text-base text-gray-900 mb-4">Conversations</h2>
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="text-sm text-gray-900 mb-0.5">{conv.name}</div>
                      <div className="text-xs text-gray-500">{conv.role}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conv.unread > 0 && (
                        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">{conv.unread}</span>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <p className={`text-xs leading-relaxed mb-2 line-clamp-2 ${
                    conv.unread > 0 ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {conv.lastMessage}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{conv.timestamp}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State for New Users */}
      {conversations.length === 0 && (
        <div className="px-6 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-base text-gray-900 mb-2">No messages yet</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              After you connect with a doctor, your conversations will appear here.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-xs text-purple-800 leading-relaxed">
                Start by using <strong>Ask CareBow</strong> to describe your symptoms and get personalized guidance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}