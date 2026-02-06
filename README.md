<p align="center">
  <img src="apps/mobile/src/assets/images/icon.png" alt="CareBow Logo" width="140" height="140" style="border-radius: 28px;">
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

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Clone the repository
git clone https://github.com/mopshyai/carebowapp.git
cd carebowapp

# Install dependencies
pnpm install

# iOS: Install pods
pnpm run pod-install

# Run iOS
pnpm run ios

# Run Android
pnpm run android
```

### Environment Setup

Copy the example environment files and configure:

```bash
# Mobile app
cp apps/mobile/.env.example apps/mobile/.env

# API (if running backend locally)
cp apps/api/.env.example apps/api/.env
```

---

## Project Structure

```
Carebow/
├── apps/
│   ├── mobile/              # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/     # App screens (56 screens)
│   │   │   ├── components/  # Reusable components
│   │   │   ├── navigation/  # React Navigation setup
│   │   │   ├── store/       # Zustand state management
│   │   │   ├── services/    # API, storage, analytics services
│   │   │   ├── features/    # Feature modules (safety, etc.)
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Business logic
│   │   │   └── theme/       # Design system tokens
│   │   ├── ios/             # iOS native project
│   │   └── android/         # Android native project
│   └── api/                 # Next.js 15 backend API
│       ├── app/api/         # API routes
│       └── prisma/          # Database schema
├── packages/
│   └── shared/              # Shared types & utilities
├── turbo.json               # Turbo build configuration
└── pnpm-workspace.yaml      # Monorepo workspace config
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

### Mobile App
- **React Native 0.76** with New Architecture (Fabric)
- **TypeScript** for type safety
- **React Navigation 7** for routing
- **Zustand** for state management
- **React Native Reanimated** for animations
- **react-native-vector-icons** for cross-platform icons

### Backend API
- **Next.js 15** with App Router
- **Prisma 6** ORM with PostgreSQL
- **NextAuth v5** for authentication
- **Zod** for validation

### Monorepo
- **pnpm** workspaces
- **Turbo** build system

---

## Scripts

```bash
# Development
pnpm dev              # Start all dev servers
pnpm run dev:mobile   # Start Metro bundler
pnpm run dev:api      # Start API server

# Build
pnpm build            # Build all apps

# Quality
pnpm lint             # Lint all code
pnpm test             # Run all tests
pnpm typecheck        # TypeScript validation

# Mobile
pnpm run ios          # Build & run iOS
pnpm run android      # Build & run Android
pnpm run pod-install  # Install iOS CocoaPods

# Database
pnpm run db:push      # Push Prisma schema
pnpm run db:migrate   # Create migration
pnpm run db:studio    # Prisma visual editor
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with care by <a href="https://github.com/mopshyai">Mopshy AI</a></sub>
</p>
