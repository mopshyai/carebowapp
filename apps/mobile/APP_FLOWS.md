# CareBow App Flows, Wireframes & Screen Reference

> Source of truth for authentication, onboarding, role-based routing, screen
> inventory, navigation, and text wireframes. Keep this document synchronized
> with `src/navigation/`, `src/screens/`, and `src/App.tsx`.

**Last verified:** July 19, 2026

**Implementation:** React Native 0.76 / React Navigation 7

---

## Table of Contents

1. [Screen Inventory](#screen-inventory)
2. [Root Routing Rules](#root-routing-rules)
3. [Main Navigation](#main-navigation)
4. [User Flows](#user-flows)
5. [Screen Details](#screen-details)
6. [Deep Linking Routes](#deep-linking-routes)

---

## Screen Inventory

### Total Screens: 53

| Category            | Count | Screens                                                               |
| ------------------- | ----- | --------------------------------------------------------------------- |
| Authentication      | 6     | Welcome, Login, Signup, Verify Email, Forgot Password, Reset Password |
| Customer Onboarding | 4     | Slides, Role Selection, Create Profile, Complete                      |
| Customer Main Tabs  | 3     | Home, Ask AI, Messages                                                |
| Provider/Member     | 2     | Role-adaptive Home, Patients/Work/Orders list                         |
| Symptom Entry       | 2     | New Entry, Assessment Result                                          |
| Core/Utility        | 19    | Conversation, Services, Checkout, Orders, Telemedicine, etc.          |
| Profile Stack       | 14    | Personal info, Family, Health, Settings, etc.                         |
| Safety Stack        | 3     | Safety Hub, Settings, Contacts                                        |

Screen counts refer to concrete `.tsx` files under `src/screens/`. Shared
navigators and role-adaptive variants do not add to the file count.

---

## Root Routing Rules

Routing is derived from the hydrated auth store; it is not selected manually by
individual screens.

| Condition                                     | Destination             | Notes                                   |
| --------------------------------------------- | ----------------------- | --------------------------------------- |
| Store is hydrating                            | Loading screen          | Prevents a flash of the wrong navigator |
| Not authenticated                             | `AuthNavigator`         | Starts at `Welcome`                     |
| Authenticated customer, onboarding incomplete | `OnboardingNavigator`   | Starts at symptom/onboarding slides     |
| Authenticated customer, onboarding complete   | Customer `TabNavigator` | Home, Ask AI, Messages                  |
| Authenticated provider/partner                | `MemberTabNavigator`    | Customer onboarding is skipped          |

Provider account types are `healthcare_provider`, `service_provider`, and
`service_partner`. The `customer` account type is the only type that enters the
customer onboarding flow.

---

## Main Navigation

### Bottom Tab Bar

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     ┌──────────┐    ┌──────────────┐    ┌──────────┐          │
│     │   Home   │    │   Ask AI     │    │ Messages │          │
│     │    🏠    │    │     ✨       │    │    💬    │          │
│     └──────────┘    └──────────────┘    └──────────┘          │
│                      (highlighted)                              │
└─────────────────────────────────────────────────────────────────┘
```

### Provider/Partner Bottom Tabs

| Account type        | Work tab label | Work content                       |
| ------------------- | -------------- | ---------------------------------- |
| Healthcare Provider | Patients       | Patient list derived from bookings |
| Service Provider    | Work           | Assigned visits/services           |
| Service Partner     | Orders         | Lab, pharmacy, or partner orders   |

All provider variants also include **Home**, **Messages**, and **Profile**.

---

## User Flows

### Flow 0: Authentication and New-User Onboarding

```text
┌────────────────────┐
│ Welcome            │
│ • Get Started      │
│ • Sign In          │
└─────────┬──────────┘
          │
     ┌────┴─────┐
     ▼          ▼
┌───────────┐  ┌───────────┐
│ Signup    │  │ Login     │
│ • Type    │  │ • Email   │
│ • Name    │  │ • Password│
│ • Email   │  └─────┬─────┘
│ • Password│        │
└─────┬─────┘        │
      │              │
      ├── Session tokens returned ───────────────┐
      │                                          │
      └── OTP/email-link required ─┐             │
                                   ▼             │
                            ┌──────────────┐      │
                            │ Verify Email │      │
                            └──────┬───────┘      │
                                   └──────┬───────┘
                                          ▼
                              ┌───────────────────────┐
                              │ Route by account type │
                              └───────────┬───────────┘
                                  ┌───────┴────────┐
                                  ▼                ▼
                         ┌────────────────┐  ┌────────────────┐
                         │ Customer       │  │ Provider/      │
                         │ onboarding     │  │ partner tabs   │
                         └───────┬────────┘  └────────────────┘
                                 ▼
                   Slides → Role → Profile → Complete
                                 │
                                 ▼
                         Customer Home tabs
```

#### Signup account-type choices

- Customer — care for yourself or family.
- Healthcare Provider — doctors, nurses, and clinicians.
- Service Provider — home care and support services.
- Service Partner — labs, pharmacies, and partners.

#### Verification behavior

- The current email/password API may auto-verify and return tokens immediately.
  In that case the root router advances directly by account type.
- `VerifyEmailScreen` remains the fallback for OTP/email-link responses and
  handles `verify-email?token=...` deep links.
- Password recovery uses `ForgotPassword` followed by a tokenized
  `ResetPassword` route.

#### Customer onboarding steps

1. **Onboarding Slides:** symptom logging, care guidance, and family tracking.
2. **Role Selection:** family member or professional caregiver.
3. **Create Profile:** name, age, relationship where applicable, and gender.
4. **Complete:** confirms setup and marks onboarding complete.

Provider and partner users do not see these customer-specific steps.

### Flow 1: Ask CareBow (AI Health Consultation)

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENTRY POINTS                             │
├─────────────────────────────────────────────────────────────────┤
│  • Bottom Tab "Ask AI"                                          │
│  • Home Screen "AI Health Assistant" card                        │
│  • Deep link from notification                                   │
│  • Service context (pre-booking questions)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AskScreen (Entry Screen)                      │
├─────────────────────────────────────────────────────────────────┤
│  • Choose self or family member                                  │
│  • Add relationship/age context when needed                      │
│  • Describe symptoms with text or voice                          │
│  • Optionally attach symptom images                              │
│  • Start Conversation when required context is complete          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ConversationScreen (AI Chat)                    │
├─────────────────────────────────────────────────────────────────┤
│  HEADER:                                                         │
│  • Back button                                                   │
│  • "Ask CareBow" title                                           │
│  • Member context (if selected)                                  │
│                                                                  │
│  MESSAGE THREAD:                                                 │
│  • Welcome message                                               │
│  • User messages (right aligned)                                 │
│  • AI responses with:                                            │
│    - Guidance cards                                              │
│    - Follow-up questions                                         │
│    - Service recommendations                                     │
│    - Quick reply buttons                                         │
│    - Triage action bar                                           │
│                                                                  │
│  INPUT BAR:                                                      │
│  • Text input                                                    │
│  • Voice button (Whisper transcription)                          │
│  • Image button (symptom photos)                                 │
│  • Send button                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ AssessmentScreen │ │ ServiceDetails   │ │ HealthMemory     │
│                  │ │    Screen        │ │    Screen        │
│ • Assessment     │ │                  │ │                  │
│   summary        │ │ • Book service   │ │ • Save health    │
│ • Triage level   │ │ • From AI        │ │   info from      │
│ • Action items   │ │   recommendation │ │   conversation   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Flow 2: Book a Service

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENTRY POINTS                             │
├─────────────────────────────────────────────────────────────────┤
│  • Home Screen "Quick Services" cards                            │
│  • Home Screen "See all" services                                │
│  • AI recommendation in conversation                             │
│  • Direct navigation to Services                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ServicesScreen                              │
├─────────────────────────────────────────────────────────────────┤
│  CATEGORIES:                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ Doctor  │ │   Lab   │ │ Nursing │ │Equipment│              │
│  │  Visit  │ │  Tests  │ │   Care  │ │ Rental  │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                  │
│  SERVICE LIST:                                                   │
│  ┌──────────────────────────────────────────────────────┐      │
│  │ [Icon] Service Name                            ₹XXX  │      │
│  │        Short description               [Book Now]    │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ServiceDetailsScreen                           │
├─────────────────────────────────────────────────────────────────┤
│  • Service hero image                                            │
│  • Service name & price                                          │
│  • Rating & reviews                                              │
│  • Description                                                   │
│  • Features & benefits list                                      │
│  • Package options (if applicable)                               │
│  • Date picker                                                   │
│  • Time slot picker                                              │
│  • Member selector (self/family)                                 │
│  • Quantity/duration selector                                    │
│  • [Add to Cart] button                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CheckoutScreen                              │
├─────────────────────────────────────────────────────────────────┤
│  ORDER SUMMARY:                                                  │
│  • Cart items with details                                       │
│  • Date/time of service                                          │
│  • Member name                                                   │
│                                                                  │
│  ADDRESS:                                                        │
│  • Selected delivery address                                     │
│  • [Change] option                                               │
│                                                                  │
│  PAYMENT:                                                        │
│  • Subtotal                                                      │
│  • Taxes                                                         │
│  • Total amount                                                  │
│                                                                  │
│  [Place Order] button                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OrderSuccessScreen                            │
├─────────────────────────────────────────────────────────────────┤
│  • Success animation                                             │
│  • Order ID                                                      │
│  • "Your order has been placed"                                  │
│  • Service details summary                                       │
│  • [Track Order] button                                          │
│  • [Back to Home] button                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Profile Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      ProfileIndexScreen                          │
│                    (Profile Menu Screen)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────┐                         │
│  │  [Avatar]  User Name               │                         │
│  │            user@email.com          │                         │
│  └────────────────────────────────────┘                         │
│                                                                  │
│  MENU ITEMS:                                                     │
│  ┌────────────────────────────────────┐                         │
│  │ 👤 Personal Information        →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ 👨‍👩‍👧 Family Members             →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ 📍 Addresses                   →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ 📋 Care History                →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ 📄 Health Records              →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ 🏥 Insurance                   →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ 🔔 Notifications               →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ 🔒 Privacy                     →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ ❓ Help                        →   │                         │
│  ├────────────────────────────────────┤                         │
│  │ ⚙️ Settings                    →   │                         │
│  └────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 4: Safety Features

```
┌─────────────────────────────────────────────────────────────────┐
│                      SafetyIndexScreen                           │
│                     (Safety Hub Screen)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────┐             │
│  │              🆘 SOS BUTTON                     │             │
│  │         (Large, prominent button)              │             │
│  │       "Press and hold for emergency"           │             │
│  └────────────────────────────────────────────────┘             │
│                                                                  │
│  DAILY CHECK-IN:                                                 │
│  ┌────────────────────────────────────────────────┐             │
│  │  ☀️ Daily Check-In                             │             │
│  │  Next check-in: 9:00 AM                        │             │
│  │  Status: ✅ Checked in today                   │             │
│  │                              [Check In Now]    │             │
│  └────────────────────────────────────────────────┘             │
│                                                                  │
│  QUICK ACTIONS:                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Settings   │  │   Contacts   │  │   History    │          │
│  │      ⚙️      │  │      👥      │  │      📜      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  RECENT EVENTS:                                                  │
│  • Check-in completed - Today 9:00 AM                           │
│  • SOS triggered - Jan 15, 2026                                 │
│  • Missed check-in - Jan 14, 2026                               │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│SafetySettings    │ │SafetyContacts    │ │SOS Confirmation  │
│    Screen        │ │    Screen        │ │    Sheet         │
│                  │ │                  │ │                  │
│• Check-in time   │ │• Add contact     │ │• "Are you sure?" │
│• Enable/disable  │ │• Primary contact │ │• Call emergency  │
│• Notification    │ │• Contact list    │ │• Notify contacts │
│  settings        │ │• Quick dial      │ │• Share location  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## Screen Details

### Authentication Screens

| Screen                 | Purpose                                   | Primary actions                                         |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------- |
| `WelcomeScreen`        | Product introduction                      | Get Started, Sign In                                    |
| `SignupScreen`         | Create an account and choose account type | Select type, enter identity/credentials, create account |
| `LoginScreen`          | Authenticate an existing account          | Sign In, Forgot Password                                |
| `VerifyEmailScreen`    | Complete OTP or email-link verification   | Continue from link, submit code, resend                 |
| `ForgotPasswordScreen` | Request password recovery                 | Send reset email                                        |
| `ResetPasswordScreen`  | Set a new password from a token           | Save new password                                       |

### Customer Onboarding Screens

| Screen                     | Purpose                                        | Exit condition                             |
| -------------------------- | ---------------------------------------------- | ------------------------------------------ |
| `OnboardingSlidesScreen`   | Explain symptom, guidance, and family features | Continue or Skip to role selection         |
| `RoleSelectionScreen`      | Choose family-member or caregiver usage        | A role is selected                         |
| `CreateProfileScreen`      | Collect care-recipient details                 | Required fields validate                   |
| `OnboardingCompleteScreen` | Confirm setup                                  | `completeOnboarding()` persists completion |

### Provider/Partner Screens

| Screen             | Purpose                                                 | Role adaptation                      |
| ------------------ | ------------------------------------------------------- | ------------------------------------ |
| `MemberHomeScreen` | Operational overview, next appointment, recent activity | Practice, work, or order terminology |
| `MemberListScreen` | Role-specific work queue                                | Patients, assignments, or orders     |

The provider tab bar also reuses `MessagesScreen` and `ProfileStackNavigator`.

### Tab Screens

#### HomeScreen (`src/screens/tabs/HomeScreen.tsx`)

**Purpose:** Main dashboard and entry point

**Sections:**

1. **Header** - Personalized greeting, notifications, profile avatar
2. **AI Health Assistant Card** - Quick access to Ask CareBow
3. **Emergency & Safety** - Quick SOS and contacts access
4. **Healthcare Services** - Doctor, lab, nursing, and equipment shortcuts
5. **Upcoming** - Next booking or appointment
6. **Care Plans** - Subscription plan comparison
7. **Quick Actions** - Orders, requests, records, and support
8. **Care Readiness** - Profile-completion progress

**Actions:**

- Tap avatar → ProfileStack
- Tap AI Assistant card → Conversation
- Tap service card → ServiceDetails
- Tap "See all" → Services

---

#### AskScreen (`src/screens/tabs/AskScreen.tsx`)

**Purpose:** Collect structured context before starting an AI health consultation

**Sections:**

1. **Header** - Ask CareBow identity and Health Memory count
2. **Care Recipient** - Self or family-member context
3. **Relationship Context** - Relationship, age, and presence when applicable
4. **Symptom Input** - Separate text and voice modes with optional images
5. **Example Prompts** - Common symptom starters
6. **Start Conversation** - Enabled after required context is present
7. **Emergency Disclaimer** - Directs emergencies to 911

**State:** Uses `useAskCarebowStore`

---

#### MessagesScreen (`src/screens/tabs/MessagesScreen.tsx`)

**Purpose:** Message threads and notifications

**Sections:**

1. **Search Bar** - Search messages
2. **Message List** - Conversation threads
3. **Unread Badge** - Unread count

---

### Core Screens

#### ConversationScreen (`src/screens/ConversationScreen.tsx`)

**Purpose:** AI health consultation chat

**Components Used:**

- `ChatBubble` - Message display
- `ChatInput` - Input with voice/image
- `GuidanceCard` - Clinical guidance
- `ServiceRecommendationCard` - Booking suggestions
- `QuickOptionButtons` - Quick replies
- `TriageActionBar` - Severity actions
- `RedFlagWarning` - Emergency alerts

**State:** Uses `useAskCarebowStore`, `useEpisodeStore`

**Params:**

```typescript
{
  entryContext?: 'general' | 'symptom' | 'service' | 'followup';
  memberId?: string;  // For family member context
  sessionId?: string; // To continue existing session
}
```

---

#### ServicesScreen (`src/screens/ServicesScreen.tsx`)

**Purpose:** Browse all services

**Sections:**

1. **Category Tabs** - Filter by category
2. **Search** - Search services
3. **Service List** - Scrollable service cards

**Categories:**

- All
- Doctor Visit
- Lab Tests
- Nursing Care
- Physiotherapy
- Equipment Rental
- Packages

---

#### ServiceDetailsScreen (`src/screens/ServiceDetailsScreen.tsx`)

**Purpose:** Service info and booking

**Sections:**

1. **Hero Image** - Service image
2. **Info** - Name, price, rating
3. **Description** - Full description
4. **Features** - Benefits list
5. **Packages** - Package selector (if applicable)
6. **Booking Form:**
   - Date picker
   - Time slots
   - Member picker
   - Quantity/hours
7. **Sticky Footer** - Price + Add to Cart

**Params:**

```typescript
{
  serviceId: string;
  prefilledDate?: string;
  prefilledMemberId?: string;
}
```

---

#### CheckoutScreen (`src/screens/CheckoutScreen.tsx`)

**Purpose:** Order review and payment

**Sections:**

1. **Cart Items** - Order summary
2. **Address** - Delivery address
3. **Payment** - Payment method
4. **Price Breakdown** - Subtotal, tax, total
5. **Place Order** - CTA button

**State:** Uses `useCartStore`

---

#### OrdersScreen (`src/screens/OrdersScreen.tsx`)

**Purpose:** Order history

**Sections:**

1. **Filter Tabs** - All, Active, Completed
2. **Order List** - Order cards with status

---

#### OrderDetailsScreen (`src/screens/OrderDetailsScreen.tsx`)

**Purpose:** Single order details

**Sections:**

1. **Order Header** - ID, status badge
2. **Service Info** - What was ordered
3. **Timeline** - Order status timeline
4. **Provider Info** - Assigned provider
5. **Address** - Service location
6. **Payment** - Payment details
7. **Actions** - Cancel, reschedule

---

### Profile Screens

| Screen                    | Purpose            | Key Features             |
| ------------------------- | ------------------ | ------------------------ |
| `ProfileIndexScreen`      | Profile menu       | Menu navigation          |
| `PersonalInfoScreen`      | Edit personal info | Name, DOB, contact       |
| `FamilyMembersScreen`     | Family list        | Add/edit members         |
| `MemberDetailsScreen`     | Member profile     | Health info, preferences |
| `AddressesScreen`         | Manage addresses   | Add, edit, set primary   |
| `CareHistoryScreen`       | Service history    | Past bookings            |
| `HealthRecordsScreen`     | Documents          | Upload, view records     |
| `InsuranceScreen`         | Insurance info     | Policy details           |
| `NotificationsScreen`     | Notification prefs | Toggle settings          |
| `PrivacyScreen`           | Privacy settings   | Data preferences         |
| `HelpScreen`              | Help & FAQ         | Support contact          |
| `SettingsScreen`          | App settings       | Language, theme          |
| `EmergencyContactsScreen` | Emergency contacts | Quick dial setup         |
| `HealthInfoScreen`        | Health details     | Conditions, meds         |

---

### Safety Screens

| Screen                 | Purpose           | Key Features          |
| ---------------------- | ----------------- | --------------------- |
| `SafetyIndexScreen`    | Safety hub        | SOS, check-in, events |
| `SafetySettingsScreen` | Check-in settings | Time, notifications   |
| `SafetyContactsScreen` | Manage contacts   | Add, edit contacts    |

---

### Episode Screens

| Screen                 | Purpose             | Key Features      |
| ---------------------- | ------------------- | ----------------- |
| `ThreadScreen`         | Conversation thread | Message history   |
| `HealthMemoryScreen`   | Health memory       | Saved health info |
| `EpisodeSummaryScreen` | Episode summary     | Export for doctor |

---

## Navigation Params Quick Reference

```typescript
// ConversationScreen
navigation.navigate('Conversation', {
  symptom: 'Sore throat for two days',
  context: 'me',
  relation: 'Self',
  age: '34',
  memberName: 'Alex',
});

// ServiceDetailsScreen
navigation.navigate('ServiceDetails', {
  id: 'doctor-visit',
  serviceId: 'doctor-visit',
});

// OrderDetailsScreen
navigation.navigate('OrderDetails', {
  id: 'order-123',
});

// MemberDetailsScreen
navigation.navigate('Profile', {
  screen: 'MemberDetails',
  params: { memberId: 'member-123' },
});
```

---

## Deep Linking Routes

| Route                               | Screen                    | Params                          |
| ----------------------------------- | ------------------------- | ------------------------------- |
| `/welcome`                          | WelcomeScreen             | -                               |
| `/login`                            | LoginScreen               | -                               |
| `/signup`                           | SignupScreen              | -                               |
| `/verify-email`                     | VerifyEmailScreen         | `?token=...&email=...`          |
| `/forgot-password`                  | ForgotPasswordScreen      | -                               |
| `/reset-password/:token`            | ResetPasswordScreen       | `token`                         |
| `/onboarding`                       | OnboardingSlidesScreen    | -                               |
| `/onboarding/role`                  | RoleSelectionScreen       | -                               |
| `/onboarding/profile/:role`         | CreateProfileScreen       | `role`                          |
| `/onboarding/complete`              | OnboardingCompleteScreen  | -                               |
| `/home`                             | HomeScreen                | -                               |
| `/ask`                              | AskScreen                 | -                               |
| `/messages`                         | MessagesScreen            | -                               |
| `/conversation`                     | ConversationScreen        | Route-specific optional context |
| `/services/:category?`              | ServicesScreen            | Optional `category`             |
| `/service/:id`                      | ServiceDetailsScreen      | `id`                            |
| `/plan/:id`                         | PlanDetailsScreen         | `id`                            |
| `/checkout/:serviceId?`             | CheckoutScreen            | Optional `serviceId`            |
| `/orders`                           | OrdersScreen              | -                               |
| `/order/:id`                        | OrderDetailsScreen        | `id`                            |
| `/order-success/:orderId?`          | OrderSuccessScreen        | Optional `orderId`              |
| `/requests`                         | RequestsScreen            | -                               |
| `/request/:id`                      | RequestDetailsScreen      | `id`                            |
| `/profile`                          | ProfileIndexScreen        | -                               |
| `/safety`                           | SafetyIndexScreen         | -                               |
| `/telemedicine/book/:doctorId?`     | TelemedicineBookingScreen | Optional `doctorId`             |
| `/telemedicine/call/:appointmentId` | VideoCallScreen           | `appointmentId`                 |
| `/health-memory`                    | HealthMemoryScreen        | -                               |
| `/episode/:episodeId`               | EpisodeSummaryScreen      | `episodeId`                     |

---

### Maintenance Checklist

When navigation changes:

1. Update the screen count and category table.
2. Update the relevant text wireframe and routing rule.
3. Update deep links here and in `src/App.tsx` together.
4. Verify customer and provider branches independently.
5. Test with cleared auth storage when validating first-run onboarding.

---

_App Flows Documentation v2.0 — CareBow Healthcare App_
