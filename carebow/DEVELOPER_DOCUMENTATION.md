# CareBow Mobile App - Developer Documentation

> **Version:** 1.0.0
> **Platform:** React Native 0.76.6
> **Last Updated:** January 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Getting Started](#4-getting-started)
5. [Navigation Architecture](#5-navigation-architecture)
6. [Screen Reference](#6-screen-reference)
7. [State Management](#7-state-management)
8. [Design System](#8-design-system)
9. [Component Library](#9-component-library)
10. [API & Services](#10-api--services)
11. [Key Features](#11-key-features)
12. [App Flow Diagrams](#12-app-flow-diagrams)

---

## 1. Project Overview

CareBow is a healthcare mobile application that provides:
- **AI Health Assistant** - Conversational health triage with symptom assessment
- **Safety Features** - SOS, daily check-ins, emergency contacts
- **Services Marketplace** - Book healthcare services (nursing, doctor visits, lab tests, etc.)
- **Family Management** - Manage health profiles for family members
- **Health Memory** - Persistent health information from conversations

### Target Users
- Primary caregivers managing elderly family members
- Users seeking health guidance and service bookings
- Families needing emergency/safety features

---

## 2. Tech Stack

### Core
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI Framework |
| React Native | 0.76.6 | Mobile Framework |
| TypeScript | 5.0.4 | Type Safety |

### Navigation
| Package | Version |
|---------|---------|
| @react-navigation/native | ^7.1.8 |
| @react-navigation/native-stack | ^7.3.2 |
| @react-navigation/bottom-tabs | ^7.4.0 |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| Zustand | ^5.0.9 | Global State |
| AsyncStorage | ^1.23.1 | Persistence |

### UI & Animation
| Package | Purpose |
|---------|---------|
| react-native-reanimated | Animations |
| react-native-gesture-handler | Touch handling |
| react-native-vector-icons | Icon library |
| react-native-svg | SVG support |

### Media & Input
| Package | Purpose |
|---------|---------|
| react-native-image-picker | Photo selection |
| react-native-audio-recorder-player | Voice recording |
| @react-native-community/datetimepicker | Date/time selection |
| @react-native-community/geolocation | GPS location |

---

## 3. Project Structure

```
carebow/
├── android/                    # Android native code
├── ios/                        # iOS native code
├── src/
│   ├── screens/               # Screen components
│   │   ├── tabs/              # Main tab screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── AskScreen.tsx
│   │   │   └── MessagesScreen.tsx
│   │   ├── profile/           # Profile stack screens (14 screens)
│   │   ├── ConversationScreen.tsx
│   │   ├── AssessmentScreen.tsx
│   │   ├── ServicesScreen.tsx
│   │   ├── ServiceDetailsScreen.tsx
│   │   ├── CheckoutScreen.tsx
│   │   └── ... (39 total screens)
│   │
│   ├── navigation/            # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   ├── ProfileStackNavigator.tsx
│   │   └── SafetyStackNavigator.tsx
│   │
│   ├── components/            # Reusable components
│   │   ├── askCarebow/        # AI chat components
│   │   ├── episodes/          # Episode/thread components
│   │   ├── icons/             # Custom icon system (95+ icons)
│   │   ├── ui/                # Generic UI components
│   │   └── safety/            # Safety feature components
│   │
│   ├── store/                 # Zustand state stores
│   │   ├── useAskCarebowStore.ts
│   │   ├── useCartStore.ts
│   │   ├── useProfileStore.ts
│   │   ├── useSafetyStore.ts
│   │   └── ... (11 total stores)
│   │
│   ├── lib/                   # Business logic
│   │   └── askCarebow/        # AI/LLM services
│   │       ├── apiClient.ts
│   │       ├── conversationEngine.ts
│   │       ├── safetyClassifier.ts
│   │       └── serviceRouter.ts
│   │
│   ├── features/              # Feature modules
│   │   └── safety/            # Safety feature
│   │       └── services/
│   │
│   ├── types/                 # TypeScript definitions
│   ├── constants/             # Design tokens
│   ├── theme/                 # Theme configuration
│   ├── utils/                 # Utility functions
│   └── data/                  # Mock data & catalogs
│
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

---

## 4. Getting Started

### Prerequisites
- Node.js >= 18
- Xcode (for iOS)
- Android Studio (for Android)
- CocoaPods (iOS)

### Installation

```bash
# Clone and navigate
cd carebow

# Install dependencies
npm install

# iOS only - install pods
npm run pod-install

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Metro bundler |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run pod-install` | Install iOS CocoaPods |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Run Jest tests |
| `npm run start:reset` | Start with cache reset |

---

## 5. Navigation Architecture

### Structure Overview

```
RootNavigator (Native Stack)
├── MainTabs (Bottom Tabs)
│   ├── Home Tab → HomeScreen
│   ├── Ask Tab → AskScreen
│   └── Messages Tab → MessagesScreen
│
├── Stack Screens (from MainTabs)
│   ├── Conversation
│   ├── Assessment
│   ├── Schedule
│   ├── Services
│   ├── ServiceDetails
│   ├── Checkout
│   ├── OrderSuccess
│   ├── Orders
│   ├── OrderDetails
│   ├── Requests
│   ├── RequestDetails
│   ├── Thread
│   ├── HealthMemory
│   ├── EpisodeSummary
│   └── PlanDetails
│
├── ProfileStack (14 screens)
│   ├── ProfileIndex
│   ├── PersonalInfo
│   ├── FamilyMembers
│   ├── MemberDetails
│   ├── Addresses
│   ├── CareHistory
│   ├── HealthRecords
│   ├── Insurance
│   ├── Notifications
│   ├── Privacy
│   ├── Help
│   ├── Settings
│   ├── EmergencyContacts
│   └── HealthInfo
│
└── SafetyStack (3 screens)
    ├── SafetyIndex
    ├── SafetySettings
    └── SafetyContacts
```

### Navigation Types

```typescript
// src/navigation/types.ts

export type RootStackParamList = {
  MainTabs: undefined;
  Conversation: { entryContext?: string; memberId?: string };
  Assessment: { sessionId: string };
  Services: { category?: string };
  ServiceDetails: { serviceId: string };
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  Orders: undefined;
  OrderDetails: { orderId: string };
  ProfileStack: undefined;
  SafetyStack: undefined;
  // ... more screens
};

export type TabParamList = {
  Home: undefined;
  Ask: undefined;
  Messages: undefined;
};
```

---

## 6. Screen Reference

### Main Tabs

| Screen | File | Description |
|--------|------|-------------|
| HomeScreen | `screens/tabs/HomeScreen.tsx` | Dashboard with quick services, appointments, promotions |
| AskScreen | `screens/tabs/AskScreen.tsx` | Ask CareBow entry point |
| MessagesScreen | `screens/tabs/MessagesScreen.tsx` | Message threads |

### Core Screens

| Screen | File | Description |
|--------|------|-------------|
| ConversationScreen | `screens/ConversationScreen.tsx` | AI health chat interface |
| AssessmentScreen | `screens/AssessmentScreen.tsx` | Health assessment flow |
| ScheduleScreen | `screens/ScheduleScreen.tsx` | Booking scheduler |
| ServicesScreen | `screens/ServicesScreen.tsx` | Services catalog |
| ServiceDetailsScreen | `screens/ServiceDetailsScreen.tsx` | Service info & booking |
| CheckoutScreen | `screens/CheckoutScreen.tsx` | Order checkout |
| OrdersScreen | `screens/OrdersScreen.tsx` | Order history |

### Profile Screens (14)

| Screen | Description |
|--------|-------------|
| ProfileIndexScreen | Profile menu |
| PersonalInfoScreen | Edit personal details |
| FamilyMembersScreen | Manage family members |
| MemberDetailsScreen | Individual member profile |
| AddressesScreen | Manage addresses |
| CareHistoryScreen | Care service history |
| HealthRecordsScreen | Health documents |
| InsuranceScreen | Insurance information |
| NotificationsScreen | Notification settings |
| PrivacyScreen | Privacy settings |
| HelpScreen | Help & FAQ |
| SettingsScreen | App settings |
| EmergencyContactsScreen | Emergency contacts |
| HealthInfoScreen | Health details |

### Safety Screens (3)

| Screen | Description |
|--------|-------------|
| SafetyIndexScreen | Safety dashboard |
| SafetySettingsScreen | Check-in settings |
| SafetyContactsScreen | Manage safety contacts |

---

## 7. State Management

### Zustand Stores

CareBow uses **Zustand** for state management with AsyncStorage persistence.

#### Store Files Location: `src/store/`

### 1. useAskCarebowStore
**Purpose:** AI chat session state

```typescript
interface AskCarebowState {
  // Session
  currentSession: Session | null;
  sessionHistory: Session[];
  messages: Message[];

  // Trial/Subscription
  isTrialActive: boolean;
  trialStartDate: string | null;
  remainingTrialDays: number;
  freeQuestionsUsed: number;

  // Context
  selectedMember: Member | null;
  healthContext: HealthContext | null;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';

  // Actions
  startNewSession: (context?: EntryContext) => void;
  addMessage: (message: Message) => void;
  setTriageLevel: (level: TriageLevel) => void;
  endSession: () => void;
}
```

### 2. useCartStore
**Purpose:** Shopping cart & bookings

```typescript
interface CartState {
  items: CartItem[];
  bookingDraft: BookingDraft | null;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setBookingDraft: (draft: BookingDraft) => void;
  clearCart: () => void;
  getTotal: () => number;
}
```

### 3. useProfileStore
**Purpose:** User & family profiles

```typescript
interface ProfileState {
  user: UserProfile | null;
  familyMembers: FamilyMember[];
  addresses: Address[];

  // Actions
  updateUser: (data: Partial<UserProfile>) => void;
  addFamilyMember: (member: FamilyMember) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  addAddress: (address: Address) => void;
}
```

### 4. useSafetyStore
**Purpose:** Emergency & safety features

```typescript
interface SafetyState {
  contacts: SafetyContact[];
  checkInEnabled: boolean;
  checkInTime: string;
  lastCheckIn: string | null;
  sosEvents: SOSEvent[];

  // Actions
  addContact: (contact: SafetyContact) => void;
  triggerSOS: () => void;
  completeCheckIn: () => void;
  updateCheckInSettings: (settings: CheckInSettings) => void;
}
```

### 5. useOrdersStore
**Purpose:** Order management

### 6. useServiceRequestStore
**Purpose:** Custom service requests

### 7. useHealthMemoryStore
**Purpose:** Health information persistence

### 8. useEpisodeStore
**Purpose:** Conversation episodes/threads

### 9. useFollowUpStore
**Purpose:** Follow-up scheduling

### 10. useFeedbackStore
**Purpose:** Session feedback

### 11. useRequestsStore
**Purpose:** Service request list

---

## 8. Design System

### Color Palette

```typescript
// src/constants/colors.ts

export const colors = {
  // Primary - Healthcare Teal (Trust, Calm)
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',  // ← Main Primary
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Secondary - Warm Coral (Approachable)
  secondary: {
    500: '#F97316',  // ← Main Secondary
    // ...variants
  },

  // Accent - Purple (Ask AI Feature)
  purple: {
    500: '#8B5CF6',
    600: '#7C3AED',
    // ...variants
  },

  // Text Colors
  text: {
    primary: '#0F172A',    // Dark slate
    secondary: '#475569',  // Medium slate
    tertiary: '#94A3B8',   // Light slate
    inverse: '#FFFFFF',
  },

  // Status Colors
  status: {
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },

  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
  },

  // Category Accents
  category: {
    medical: '#0D9488',   // Teal
    lab: '#2563EB',       // Blue
    nursing: '#EC4899',   // Pink
    equipment: '#8B5CF6', // Purple
    packages: '#F97316',  // Orange
  },
};
```

### Typography

```typescript
// src/constants/typography.ts

export const typography = {
  // Display
  displayLarge: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  displayMedium: { fontSize: 28, fontWeight: '700', lineHeight: 36 },

  // Headings
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  h4: { fontSize: 16, fontWeight: '600', lineHeight: 24 },

  // Body
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },

  // Labels
  labelLarge: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  labelMedium: { fontSize: 14, fontWeight: '500', lineHeight: 18 },
  labelSmall: { fontSize: 13, fontWeight: '500', lineHeight: 16 },

  // Caption
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600', lineHeight: 16 },

  // Tiny
  tiny: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
};
```

### Spacing

```typescript
// src/constants/spacing.ts

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const layout = {
  screenPadding: 20,
  cardGap: 12,
  sectionGap: 32,
  touchTarget: 44,
};
```

### Border Radius

```typescript
export const borderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};
```

### Shadows

```typescript
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
};
```

### Icon Sizes

```typescript
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};
```

---

## 9. Component Library

### Location: `src/components/`

### Ask CareBow Components (`askCarebow/`)

| Component | Props | Description |
|-----------|-------|-------------|
| `ChatBubble` | `message`, `isUser`, `timestamp` | Message bubble |
| `ChatInput` | `onSend`, `onVoice`, `onImage` | Input with actions |
| `VoiceInput` | `onTranscription`, `onCancel` | Voice recording |
| `ImageUploadBottomSheet` | `visible`, `onSelect` | Photo picker |
| `GuidanceCard` | `guidance`, `onAction` | Clinical guidance |
| `ServiceRecommendationCard` | `service`, `triageLevel`, `onBook` | Service suggestion |
| `TriageActionBar` | `level`, `actions` | Severity-based actions |
| `TriageResultCard` | `result`, `onAction` | Triage result display |
| `RedFlagWarning` | `warning`, `onDismiss` | Emergency warning |
| `QuickOptionButtons` | `options`, `onSelect` | Quick reply buttons |
| `MemoryCandidateCard` | `candidate`, `onSave`, `onDismiss` | Save to memory |
| `SessionFeedbackCard` | `onSubmit` | Feedback collection |
| `FollowUpCheckIn` | `followUp`, `onRespond` | Follow-up prompt |
| `EmergencyAlert` | `onCallEmergency`, `onDismiss` | Crisis alert |

### Safety Components (`safety/`)

| Component | Description |
|-----------|-------------|
| `SOSButton` | Large SOS trigger button |
| `SOSConfirmationSheet` | SOS confirmation dialog |
| `CheckInModule` | Daily check-in UI |
| `MissedCheckInModal` | Missed check-in alert |
| `SafetyContactCard` | Contact display card |
| `SafetyEventItem` | Event log item |

### UI Components (`ui/`)

| Component | Description |
|-----------|-------------|
| `PressableCard` | Card with press feedback |
| `StatusBadge` | Status indicator badge |
| `PopularBadge` | "Popular" label |
| `StarRating` | Rating display |
| `TimePicker` | Time selection |
| `QuantityStepper` | Quantity +/- control |
| `HorizontalDatePicker` | Date picker |
| `MemberPicker` | Family member selector |
| `StickyCheckoutBar` | Sticky checkout button |
| `PriceText` | Formatted price |
| `Collapsible` | Expandable section |

### Icon System (`icons/AppIcon.tsx`)

**95+ Custom Icons** including:

```typescript
// Usage
<AppIcon name="doctor" size={24} color={colors.primary[600]} />

// Available icons
const iconNames = [
  'companionship', 'nurse', 'doctor', 'lab', 'healthcheck',
  'oxygen_concentrator', 'bpap', 'cpap', 'cardiac_monitor',
  'hospital_bed', 'wheelchair', 'infusion_pump', 'nebulizer',
  'physiotherapy', 'yoga', 'cleaning', 'food', 'transport',
  'home', 'calendar', 'clock', 'location', 'phone', 'chat',
  'heart', 'pill', 'syringe', 'stethoscope', 'ambulance',
  // ... 65+ more
];
```

---

## 10. API & Services

### Location: `src/lib/askCarebow/`

### API Client (`apiClient.ts`)

```typescript
// Core API communication with LLM backend

interface APIClient {
  sendMessage(message: string, context: ConversationContext): Promise<AIResponse>;
  transcribeAudio(audioFile: File): Promise<TranscriptionResult>;
  getServiceRecommendations(symptoms: string[]): Promise<Service[]>;
}
```

### Conversation Engine (`conversationEngine.ts`)

```typescript
// Core conversation processing

interface ConversationEngine {
  processUserInput(input: UserInput): Promise<ProcessedInput>;
  generateResponse(context: ConversationContext): Promise<AIResponse>;
  extractSymptoms(text: string): string[];
  determineUrgency(symptoms: string[]): UrgencyLevel;
}
```

### Safety Classifier (`safetyClassifier.ts`)

```typescript
// Emergency detection

interface SafetyClassifier {
  detectEmergency(text: string): EmergencyResult;
  classifyCrisis(text: string): CrisisType | null;
  getRedFlags(symptoms: string[]): RedFlag[];
}

// Emergency keywords
const emergencyKeywords = [
  'chest pain', 'difficulty breathing', 'severe bleeding',
  'unconscious', 'stroke symptoms', 'heart attack',
  'suicidal', 'overdose', 'seizure', 'choking'
];
```

### Service Router (`serviceRouter.ts`)

```typescript
// Map symptoms to services

interface ServiceRouter {
  getRecommendedServices(symptoms: string[], urgency: UrgencyLevel): Service[];
  mapSymptomToCategory(symptom: string): ServiceCategory;
  getTriageLevel(symptoms: string[]): TriageLevel;
}
```

### Triage Levels

```typescript
enum TriageLevel {
  P1 = 'emergency',  // Red - Immediate ER
  P2 = 'urgent',     // Orange - Urgent attention needed
  P3 = 'moderate',   // Yellow - Within 24 hours
  P4 = 'mild',       // Green - Home management
}
```

### Safety Services (`src/features/safety/services/`)

| Service | Description |
|---------|-------------|
| `checkInService.ts` | Daily check-in logic |
| `notificationService.ts` | Push notifications |
| `locationService.ts` | GPS tracking |
| `sosService.ts` | Emergency SOS handling |

---

## 11. Key Features

### Feature 1: Ask CareBow (AI Health Assistant)

**Entry Points:**
- Bottom tab "Ask AI"
- Home screen CTA
- Service context
- Pre-booking questions

**Flow:**
```
User enters symptom
    ↓
Emergency detection check
    ↓
Context loading (member, history)
    ↓
Symptom assessment
    ↓
Smart follow-up questions (1-3)
    ↓
Generate clinical guidance
    ↓
Service recommendations
    ↓
Action buttons (Book, Connect, Save)
    ↓
Session summary
    ↓
Health memory capture
```

**Components Used:**
- `ConversationScreen`
- `ChatBubble`, `ChatInput`
- `GuidanceCard`, `TriageResultCard`
- `ServiceRecommendationCard`
- `QuickOptionButtons`

### Feature 2: Safety & Emergency

**Components:**
- `SOSButton` - One-tap emergency
- `CheckInModule` - Daily check-ins
- `SafetyContactCard` - Emergency contacts

**Flow:**
```
SOS Trigger
    ↓
Confirmation sheet
    ↓
Location capture
    ↓
Notify contacts
    ↓
Emergency services (if configured)
```

### Feature 3: Services Marketplace

**Categories:**
- Doctor Visit (Video/Home)
- Lab Tests
- Nursing Care
- Physiotherapy
- Medical Equipment Rental
- Companionship
- Transportation
- Cleaning
- Food Services

**Booking Flow:**
```
Browse Services
    ↓
Service Details
    ↓
Select options (date, time, member)
    ↓
Add to Cart
    ↓
Checkout
    ↓
Order Confirmation
```

### Feature 4: Family Management

**Features:**
- Add family members
- Individual health profiles
- Member-specific bookings
- Context-aware AI conversations

---

## 12. App Flow Diagrams

### Main App Flow

```
┌─────────────────────────────────────────────────────────┐
│                      App Launch                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    MainTabs (Home)                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐            │
│  │  Home   │    │ Ask AI  │    │Messages │            │
│  └────┬────┘    └────┬────┘    └────┬────┘            │
└───────┼──────────────┼──────────────┼───────────────────┘
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │Services │   │Conversa- │   │ Thread   │
   │ Screen  │   │  tion    │   │ Screen   │
   └────┬────┘   └────┬─────┘   └──────────┘
        │              │
        ▼              ▼
   ┌─────────┐   ┌──────────┐
   │Service  │   │Assessment│
   │Details  │   │ Screen   │
   └────┬────┘   └──────────┘
        │
        ▼
   ┌─────────┐
   │Checkout │
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ Order   │
   │Success  │
   └─────────┘
```

### Ask CareBow Conversation Flow

```
┌──────────────────────────────────────────────────────────┐
│                    AskScreen (Entry)                      │
│  • New conversation button                                │
│  • Session history list                                   │
│  • Trial status                                           │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  ConversationScreen                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Message Thread                         │ │
│  │  • User messages                                    │ │
│  │  • AI responses                                     │ │
│  │  • Guidance cards                                   │ │
│  │  • Service recommendations                          │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Chat Input                             │ │
│  │  [Text Input] [Voice] [Image] [Send]               │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │Assessment│   │ Service  │   │  Health  │
     │  Screen  │   │ Booking  │   │  Memory  │
     └──────────┘   └──────────┘   └──────────┘
```

### Profile Navigation

```
┌──────────────────────────────────────────────────────────┐
│                    ProfileIndex                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │Personal Info │  │Family Members│  │  Addresses   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │Care History  │  │Health Records│  │  Insurance   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │Notifications │  │   Privacy    │  │    Help      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │   Settings   │  │  Emergency   │                     │
│  │              │  │  Contacts    │                     │
│  └──────────────┘  └──────────────┘                     │
└──────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Important File Paths

| Purpose | Path |
|---------|------|
| App Entry | `src/App.tsx` |
| Navigation | `src/navigation/RootNavigator.tsx` |
| Tab Navigator | `src/navigation/TabNavigator.tsx` |
| Theme | `src/theme/index.ts` |
| Colors | `src/constants/colors.ts` |
| Typography | `src/constants/typography.ts` |
| Main Store | `src/store/useAskCarebowStore.ts` |
| AI Engine | `src/lib/askCarebow/conversationEngine.ts` |
| Icons | `src/components/icons/AppIcon.tsx` |

### Common Patterns

**Navigate to screen:**
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('ServiceDetails', { serviceId: '123' });
```

**Use store:**
```typescript
import { useAskCarebowStore } from '../store/useAskCarebowStore';

const { messages, addMessage } = useAskCarebowStore();
```

**Apply theme:**
```typescript
import { colors, typography, spacing } from '../constants';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
});
```

---

## Support

For questions or issues, contact the CareBow development team.

---

*Documentation generated January 2026*
