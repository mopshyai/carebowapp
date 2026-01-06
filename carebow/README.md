<p align="center">
  <img src="src/assets/images/icon.png" alt="CareBow Logo" width="120" height="120" style="border-radius: 24px;">
</p>

<h1 align="center">CareBow</h1>

<p align="center">
  <strong>Healthcare at your fingertips</strong>
</p>

<p align="center">
  A modern healthcare companion app connecting families with trusted caregivers, medical services, and AI-powered health guidance.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

---

## Features

### Healthcare Services
- Browse and book professional caregiving services
- Elderly care, child care, physiotherapy, and more
- Verified service providers with ratings and reviews
- Flexible scheduling with date and time selection

### Ask CareBow (AI Health Assistant)
- Doctor-grade symptom triage and assessment
- Personalized health guidance and recommendations
- Voice input support for hands-free interaction
- Smart service recommendations based on health needs

### Emergency & Safety
- One-tap SOS emergency alerts
- Scheduled check-ins with automatic notifications
- Emergency contact management
- Real-time location sharing during emergencies

### Family Management
- Multi-member family profiles
- Individual health records per member
- Care history tracking
- Insurance information management

### Orders & Requests
- Service booking with package selection
- Order tracking and history
- Custom care request submissions
- Transparent pricing with checkout flow

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native 0.76 (New Architecture) |
| **Language** | TypeScript 5.3 |
| **Navigation** | React Navigation 7 |
| **State Management** | Zustand with AsyncStorage persistence |
| **UI Components** | Custom components with dark mode support |
| **Icons** | React Native Vector Icons (Ionicons) |
| **Animations** | React Native Reanimated |
| **Gestures** | React Native Gesture Handler |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- CocoaPods (for iOS dependencies)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mopshyai/carebowapp.git
   cd carebowapp/carebow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS pods**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the app**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android
   ```

---

## Project Structure

```
carebow/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── askCarebow/      # AI assistant components
│   │   └── ui/              # Core UI elements
│   ├── screens/             # Screen components
│   │   ├── tabs/            # Bottom tab screens
│   │   ├── profile/         # Profile stack screens
│   │   └── safety/          # Safety feature screens
│   ├── navigation/          # React Navigation setup
│   ├── store/               # Zustand state stores
│   ├── features/            # Feature modules
│   │   └── safety/          # Emergency & safety features
│   ├── lib/                 # Business logic
│   │   └── askCarebow/      # AI triage engine
│   ├── theme/               # Design tokens & theming
│   ├── constants/           # App constants
│   ├── types/               # TypeScript definitions
│   ├── hooks/               # Custom React hooks
│   ├── data/                # Mock data & catalogs
│   └── utils/               # Utility functions
├── ios/                     # iOS native project
├── android/                 # Android native project
└── index.js                 # App entry point
```

---

## Key Screens

| Screen | Description |
|--------|-------------|
| **Home** | Dashboard with quick actions and service categories |
| **Ask CareBow** | AI-powered health assistant with chat interface |
| **Messages** | Conversation threads with care providers |
| **Services** | Browse healthcare services catalog |
| **Profile** | User settings and family management |
| **Safety Hub** | Emergency SOS and check-in features |
| **Orders** | Order history and tracking |
| **Requests** | Custom care request management |

---

## Design System

CareBow uses a carefully crafted dark-mode-first design system:

- **Primary Color**: `#6366F1` (Indigo)
- **Background**: `#0F0F0F` (Near black)
- **Cards**: `#1A1A1A` with subtle borders
- **Typography**: System fonts with consistent scale
- **Spacing**: 4px base unit grid system

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with care by <a href="https://github.com/mopshyai">Mopshy AI</a>
</p>
