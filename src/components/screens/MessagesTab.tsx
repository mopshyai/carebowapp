import { MessagesSquare, ChevronRight, Clock, MessageCircleHeart } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface MessagesTabProps {
  onOpenThread: (threadId: string) => void;
}

export function MessagesTab({ onOpenThread }: MessagesTabProps) {
  const conversations = [
    {
      id: '1',
      name: 'Dr. Sarah Chen',
      initials: 'SC',
      role: 'General Practitioner',
      lastMessage: 'Your test results look good. Continue with the prescribed medication.',
      timestamp: '10 min ago',
      unread: 2,
      online: true
    },
    {
      id: '2',
      name: 'Dr. James Wilson',
      initials: 'JW',
      role: 'Cardiologist',
      lastMessage: 'Please schedule a follow-up in 2 weeks.',
      timestamp: '2 hours ago',
      unread: 0,
      online: false
    },
    {
      id: '3',
      name: 'CareBow Support',
      initials: 'CB',
      role: 'Care Team',
      lastMessage: 'How can we help you today?',
      timestamp: 'Yesterday',
      unread: 0,
      online: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* HEADER - With Safe Area Top */}
      <div className="bg-white border-b border-gray-200 px-6 pt-[calc(48px+env(safe-area-inset-top,0px))] pb-6">
        <div className="mb-1">
          <h1 className="text-2xl text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600 mt-0.5">Chat with your care team</p>
        </div>
      </div>

      {/* SCROLLABLE CONTENT - With Bottom Safe Padding */}
      <div className="px-6 py-6 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        {/* INFO BANNER */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <MessageCircleHeart className="w-5 h-5 text-purple-600" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-purple-900 mb-1 font-medium">New symptoms?</p>
              <p className="text-xs text-purple-700 leading-relaxed">
                Use Ask CareBow to describe what you're experiencing. I'll guide you to the right care.
              </p>
            </div>
          </div>
        </div>

        {/* CONVERSATIONS LIST */}
        <div>
          <h2 className="text-sm text-gray-900 mb-3 px-1 font-medium">Conversations</h2>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onOpenThread(conv.id)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    initials={conv.initials}
                    name={conv.name}
                    size="md"
                    online={conv.online}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="text-sm text-gray-900 mb-0.5 font-medium">{conv.name}</div>
                        <div className="text-xs text-gray-500">{conv.role}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {conv.unread > 0 && (
                          <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{conv.unread}</span>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
                      </div>
                    </div>
                    
                    <p className={`text-xs leading-relaxed mb-2 line-clamp-2 ${
                      conv.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {conv.lastMessage}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      <span>{conv.timestamp}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* EMPTY STATE (if no conversations) */}
        {conversations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessagesSquare className="w-10 h-10 text-gray-400" strokeWidth={2} />
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
        )}
      </div>
    </div>
  );
}