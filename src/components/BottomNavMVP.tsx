import { CalendarCheck, MessagesSquare, Heart } from 'lucide-react';

export type NavTab = 'schedule' | 'ask' | 'messages';

interface BottomNavMVPProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNavMVP({ currentTab, onTabChange }: BottomNavMVPProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-md mx-auto">
        {/* Bottom Navigation - 3 Items Only */}
        <div className="bg-white border-t border-gray-200 shadow-2xl">
          <div className="grid grid-cols-3 relative">
            
            {/* 1. SCHEDULE TAB (Left - Secondary) */}
            <button
              onClick={() => onTabChange('schedule')}
              className="flex flex-col items-center gap-1.5 py-4 transition-colors relative"
            >
              <CalendarCheck 
                className={`w-5 h-5 transition-all ${
                  currentTab === 'schedule' 
                    ? 'text-purple-600 fill-purple-600' 
                    : 'text-gray-400'
                }`}
                strokeWidth={currentTab === 'schedule' ? 2.5 : 2}
              />
              <span 
                className={`text-xs transition-colors ${
                  currentTab === 'schedule' 
                    ? 'text-purple-600 font-medium' 
                    : 'text-gray-500'
                }`}
              >
                Schedule
              </span>
              
              {/* Active indicator */}
              {currentTab === 'schedule' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-600 rounded-t-full" />
              )}
            </button>

            {/* 2. ASK CAREBOW TAB (Center - PRIMARY) */}
            <button
              onClick={() => onTabChange('ask')}
              className="relative flex flex-col items-center"
            >
              {/* Elevated Background with Glow */}
              <div 
                className={`absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl shadow-2xl transition-all ${
                  currentTab === 'ask'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-500 scale-110 ring-4 ring-purple-100'
                    : 'bg-gradient-to-br from-purple-600 to-purple-500 scale-100'
                }`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {/* Ask CareBow Icon - Larger and Dominant */}
                  <Heart 
                    className={`w-8 h-8 text-white transition-all ${
                      currentTab === 'ask' ? 'fill-white drop-shadow-lg' : 'fill-white'
                    }`}
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              {/* Label */}
              <div className="mt-12 mb-3">
                <span 
                  className={`text-xs font-medium transition-colors ${
                    currentTab === 'ask' 
                      ? 'text-purple-600' 
                      : 'text-gray-700'
                  }`}
                >
                  Ask CareBow
                </span>
              </div>

              {/* Active indicator with glow */}
              {currentTab === 'ask' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-purple-600 rounded-t-full shadow-lg shadow-purple-300" />
              )}
            </button>

            {/* 3. MESSAGES TAB (Right - Secondary) */}
            <button
              onClick={() => onTabChange('messages')}
              className="flex flex-col items-center gap-1.5 py-4 transition-colors relative"
            >
              <MessagesSquare 
                className={`w-5 h-5 transition-all ${
                  currentTab === 'messages' 
                    ? 'text-purple-600 fill-purple-600' 
                    : 'text-gray-400'
                }`}
                strokeWidth={currentTab === 'messages' ? 2.5 : 2}
              />
              <span 
                className={`text-xs transition-colors ${
                  currentTab === 'messages' 
                    ? 'text-purple-600 font-medium' 
                    : 'text-gray-500'
                }`}
              >
                Messages
              </span>

              {/* Active indicator */}
              {currentTab === 'messages' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-600 rounded-t-full" />
              )}

              {/* Unread badge (optional) */}
              <div className="absolute top-3 right-8 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}