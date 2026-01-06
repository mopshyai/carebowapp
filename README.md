<p align="center">
  <img src="carebow/src/assets/images/icon.png" alt="CareBow Logo" width="140" height="140" style="border-radius: 28px;">
</p>

<h1 align="center">CareBow</h1>

<p align="center">
  <strong>Healthcare at your fingertips</strong>
</p>

<p align="center">
  A modern React Native healthcare companion app connecting families with trusted caregivers, medical services, and AI-powered health guidance.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=for-the-badge&logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/iOS-17+-000000?style=for-the-badge&logo=apple" alt="iOS">
  <img src="https://img.shields.io/badge/Android-14+-3DDC84?style=for-the-badge&logo=android" alt="Android">
</p>

---

## Overview

CareBow is a comprehensive healthcare platform that brings together:

- **Professional Care Services** - Book verified caregivers for elderly care, child care, physiotherapy, nursing, and more
- **AI Health Assistant** - Get doctor-grade symptom assessment and personalized health guidance
- **Emergency Safety Features** - One-tap SOS alerts, scheduled check-ins, and emergency contact management
- **Family Care Management** - Manage health records, care history, and insurance for your entire family

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mopshyai/carebowapp.git

# Navigate to the app directory
cd carebowapp/carebow

# Install dependencies
npm install

# iOS: Install pods and run
cd ios && pod install && cd ..
npm run ios

# Android: Run
npm run android
```

---

## Project Structure

```
carebowapp/
└── carebow/                 # React Native mobile app
    ├── src/
    │   ├── screens/         # App screens
    │   ├── components/      # Reusable components
    │   ├── navigation/      # React Navigation setup
    │   ├── store/           # Zustand state management
    │   ├── features/        # Feature modules (safety, etc.)
    │   └── lib/             # Business logic
    ├── ios/                 # iOS native project
    └── android/             # Android native project
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Home Dashboard** | Quick access to services, orders, and health insights |
| **Ask CareBow** | AI-powered health triage with voice support |
| **Service Booking** | Browse, compare, and book healthcare services |
| **Safety Hub** | SOS emergency alerts and scheduled check-ins |
| **Family Profiles** | Manage health data for multiple family members |
| **Order Management** | Track bookings and service requests |

---

## Tech Stack

- **React Native 0.76** with New Architecture (Fabric)
- **TypeScript** for type safety
- **React Navigation 7** for routing
- **Zustand** for state management
- **React Native Reanimated** for animations

---

## Design

Based on the original [CareBow Healthcare App Design](https://www.figma.com/design/pyJJKPI3uqd1gbuYCvFLG0/CareBow-Healthcare-App-Design) on Figma.

Dark-mode-first design with:
- Indigo accent color (`#6366F1`)
- Clean, accessible typography
- Consistent spacing system

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with care by <a href="https://github.com/mopshyai">Mopshy AI</a></sub>
</p>
