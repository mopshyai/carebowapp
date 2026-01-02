import { useState } from 'react';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { TodayScreen } from './components/screens/TodayScreen';
import { ScheduleScreen } from './components/screens/ScheduleScreen';
import { AskCareBowTab } from './components/screens/AskCareBowTab';
import { ConversationScreen } from './components/screens/ConversationScreen';
import { AssessmentSummaryScreen } from './components/screens/AssessmentSummaryScreen';
import { MessagesTab } from './components/screens/MessagesTab';
import { Profile } from './components/Profile';

export type MainTab = 'today' | 'ask' | 'messages';
export type AppScreen = 
  | 'today' 
  | 'schedule' 
  | 'ask' 
  | 'conversation' 
  | 'assessment' 
  | 'messages'
  | 'profile';

function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('today');
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('today');
  const [conversationContext, setConversationContext] = useState<any>(null);
  const [conversationSymptom, setConversationSymptom] = useState('');
  const [assessmentData, setAssessmentData] = useState<any>(null);

  const handleTabChange = (tab: MainTab) => {
    setCurrentTab(tab);
    if (tab === 'today') {
      setCurrentScreen('today');
    } else if (tab === 'ask') {
      setCurrentScreen('ask');
    } else if (tab === 'messages') {
      setCurrentScreen('messages');
    }
  };

  const handleNavigateToSchedule = () => {
    setCurrentScreen('schedule');
  };

  const handleNavigateToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleNavigateToAskCareBow = () => {
    setCurrentTab('ask');
    setCurrentScreen('ask');
  };

  const handleStartSymptomCheck = (context: any, symptom: string) => {
    setConversationContext(context);
    setConversationSymptom(symptom);
    setCurrentScreen('conversation');
  };

  const handleConversationComplete = (data: any) => {
    setAssessmentData(data);
    setCurrentScreen('assessment');
  };

  const handleBackFromConversation = () => {
    setCurrentScreen('ask');
  };

  const handleBackFromAssessment = () => {
    setCurrentScreen('conversation');
  };

  const handleBackFromSchedule = () => {
    setCurrentScreen('today');
  };

  const handleBackFromProfile = () => {
    setCurrentScreen('today');
  };

  const handleProfileNavigation = (screen: string) => {
    console.log('Navigate to:', screen);
    // In a full app, this would navigate to the specific profile sub-screen
    // For now, we'll just log it
  };

  const handleBookCare = () => {
    console.log('Navigate to booking');
  };

  const handleNavigateToServices = () => {
    console.log('Navigate to Services screen');
    // In full app: setCurrentScreen('services');
  };

  const handleNavigateToDevices = () => {
    console.log('Navigate to Devices screen');
    // In full app: setCurrentScreen('devices');
  };

  const handleNavigateToPackages = () => {
    console.log('Navigate to Packages screen');
    // In full app: setCurrentScreen('packages');
  };

  const handleNavigateToPlans = () => {
    console.log('Navigate to Plans screen');
    // In full app: setCurrentScreen('plans');
  };

  const handleNavigateToServiceDetail = (serviceId: string) => {
    console.log('Navigate to service detail:', serviceId);
    // In full app: setCurrentScreen('service-detail'); setSelectedServiceId(serviceId);
  };

  const handleMessageSupport = () => {
    console.log('Navigate to message support');
    // In full app: would open support chat
  };

  const handleOpenThread = (threadId: string) => {
    console.log('Open thread:', threadId);
    // In full app: would open specific message thread
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
        
        {/* SCREENS */}
        
        {currentScreen === 'today' && (
          <TodayScreen
            onNavigateToSchedule={handleNavigateToSchedule}
            onNavigateToProfile={handleNavigateToProfile}
            onNavigateToAskCareBow={handleNavigateToAskCareBow}
            onStartSymptomCheck={handleStartSymptomCheck}
            onNavigateToServices={handleNavigateToServices}
            onNavigateToDevices={handleNavigateToDevices}
            onNavigateToPackages={handleNavigateToPackages}
            onNavigateToPlans={handleNavigateToPlans}
            onNavigateToServiceDetail={handleNavigateToServiceDetail}
          />
        )}

        {currentScreen === 'schedule' && (
          <ScheduleScreen
            onBack={handleBackFromSchedule}
            onOpenAskCareBow={handleNavigateToAskCareBow}
          />
        )}

        {currentScreen === 'ask' && (
          <AskCareBowTab
            onStartConversation={handleStartSymptomCheck}
          />
        )}

        {currentScreen === 'conversation' && conversationContext && (
          <ConversationScreen
            context={conversationContext}
            initialSymptom={conversationSymptom}
            onBack={handleBackFromConversation}
            onComplete={handleConversationComplete}
          />
        )}

        {currentScreen === 'assessment' && assessmentData && (
          <AssessmentSummaryScreen
            assessmentData={assessmentData}
            onBack={handleBackFromAssessment}
            onBookCare={handleBookCare}
            onMessageSupport={handleMessageSupport}
          />
        )}

        {currentScreen === 'messages' && (
          <MessagesTab
            onOpenThread={handleOpenThread}
          />
        )}

        {currentScreen === 'profile' && (
          <Profile
            onNavigate={handleProfileNavigation}
          />
        )}

        {/* BOTTOM NAVIGATION - Always visible */}
        <BottomNavigation
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}

export default App;