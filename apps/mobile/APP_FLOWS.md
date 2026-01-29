# CareBow App Flows & Screen Reference

> Detailed documentation of all screens and user flows

---

## Table of Contents

1. [Screen Inventory](#screen-inventory)
2. [Main Navigation](#main-navigation)
3. [User Flows](#user-flows)
4. [Screen Details](#screen-details)

---

## Screen Inventory

### Total Screens: 40

| Category | Count | Screens |
|----------|-------|---------|
| Main Tabs | 3 | Home, Ask, Messages |
| Core Flows | 12 | Conversation, Services, Checkout, Orders, etc. |
| Profile Stack | 14 | Personal info, Family, Health, Settings, etc. |
| Safety Stack | 3 | Safety Hub, Settings, Contacts |
| Episodes | 3 | Thread, Health Memory, Episode Summary |
| Utility | 5 | Modal, Explore, Schedule, Requests, etc. |

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

---

## User Flows

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
│  • Trial status banner (if applicable)                          │
│  • "Start New Conversation" button                               │
│  • Recent sessions list                                          │
│  • "Continue" previous session option                            │
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

### Tab Screens

#### HomeScreen (`src/screens/tabs/HomeScreen.tsx`)
**Purpose:** Main dashboard and entry point

**Sections:**
1. **Header** - Greeting, search, notifications, profile avatar
2. **AI Health Assistant Card** - Quick access to Ask CareBow
3. **Emergency & Safety** - Quick SOS access
4. **Quick Services** - 4-6 popular services grid
5. **Next Appointment** - Upcoming booking card
6. **Promotions** - Marketing banners carousel
7. **Top Doctors** - Featured doctors list

**Actions:**
- Tap avatar → ProfileStack
- Tap AI Assistant card → Conversation
- Tap service card → ServiceDetails
- Tap "See all" → Services

---

#### AskScreen (`src/screens/tabs/AskScreen.tsx`)
**Purpose:** Ask CareBow entry and history

**Sections:**
1. **Trial Banner** - Days remaining (if on trial)
2. **Start Conversation** - Primary CTA
3. **Recent Sessions** - Session history list
4. **Quick Actions** - Common symptom categories

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

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| `ProfileIndexScreen` | Profile menu | Menu navigation |
| `PersonalInfoScreen` | Edit personal info | Name, DOB, contact |
| `FamilyMembersScreen` | Family list | Add/edit members |
| `MemberDetailsScreen` | Member profile | Health info, preferences |
| `AddressesScreen` | Manage addresses | Add, edit, set primary |
| `CareHistoryScreen` | Service history | Past bookings |
| `HealthRecordsScreen` | Documents | Upload, view records |
| `InsuranceScreen` | Insurance info | Policy details |
| `NotificationsScreen` | Notification prefs | Toggle settings |
| `PrivacyScreen` | Privacy settings | Data preferences |
| `HelpScreen` | Help & FAQ | Support contact |
| `SettingsScreen` | App settings | Language, theme |
| `EmergencyContactsScreen` | Emergency contacts | Quick dial setup |
| `HealthInfoScreen` | Health details | Conditions, meds |

---

### Safety Screens

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| `SafetyIndexScreen` | Safety hub | SOS, check-in, events |
| `SafetySettingsScreen` | Check-in settings | Time, notifications |
| `SafetyContactsScreen` | Manage contacts | Add, edit contacts |

---

### Episode Screens

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| `ThreadScreen` | Conversation thread | Message history |
| `HealthMemoryScreen` | Health memory | Saved health info |
| `EpisodeSummaryScreen` | Episode summary | Export for doctor |

---

## Navigation Params Quick Reference

```typescript
// ConversationScreen
navigation.navigate('Conversation', {
  entryContext: 'symptom',
  memberId: 'member-123',
});

// ServiceDetailsScreen
navigation.navigate('ServiceDetails', {
  serviceId: 'doctor-visit',
});

// OrderDetailsScreen
navigation.navigate('OrderDetails', {
  orderId: 'order-123',
});

// MemberDetailsScreen
navigation.navigate('ProfileStack', {
  screen: 'MemberDetails',
  params: { memberId: 'member-123' },
});
```

---

## Deep Linking Routes

| Route | Screen | Params |
|-------|--------|--------|
| `/home` | HomeScreen | - |
| `/ask` | AskScreen | - |
| `/ask/conversation` | ConversationScreen | `?member=ID` |
| `/services` | ServicesScreen | `?category=X` |
| `/services/:id` | ServiceDetailsScreen | - |
| `/orders` | OrdersScreen | - |
| `/orders/:id` | OrderDetailsScreen | - |
| `/profile` | ProfileIndexScreen | - |
| `/safety` | SafetyIndexScreen | - |

---

*App Flows Documentation v1.0 - CareBow Healthcare App*
