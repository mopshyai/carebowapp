import { Home, Calendar, MessageSquare, User, Sparkles } from 'lucide-react';
import type { NavTab } from '../App';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as NavTab, icon: Home, label: 'Home' },
    { id: 'schedule' as NavTab, icon: Calendar, label: 'Schedule' },
    { id: 'ask' as NavTab, icon: Sparkles, label: 'Ask CareBow', isCenter: true },
    { id: 'messages' as NavTab, icon: MessageSquare, label: 'Messages' },
    { id: 'profile' as NavTab, icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            const isCenter = tab.isCenter;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 flex-1 relative ${
                  isCenter ? 'mx-2' : ''
                }`}
              >
                {isCenter ? (
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center -mt-8 shadow-lg transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-purple-600 to-purple-500' 
                      : 'bg-gradient-to-br from-purple-500 to-purple-400'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <>
                    <div className={`relative ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                      <Icon className="w-6 h-6" />
                      {tab.id === 'messages' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">2</span>
                        </div>
                      )}
                    </div>
                    <span className={`text-xs ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                      {tab.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
