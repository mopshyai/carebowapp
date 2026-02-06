<p align="center">
  <img src="assets/brand/logo.svg" alt="CareBow Logo" width="120" height="120">
</p>

<h1 align="center">CareBow</h1>

<p align="center">
  <strong>Healthcare at your fingertips</strong>
</p>

<p align="center">
  A modern React Native healthcare companion app connecting families with trusted caregivers, medical services, and AI-powered health guidance.
</p>

<p align="center">
  <a href="https://github.com/mopshyai/carebowapp/actions/workflows/ci.yml">
    <img src="https://github.com/mopshyai/carebowapp/actions/workflows/ci.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://codecov.io/gh/mopshyai/carebowapp">
    <img src="https://codecov.io/gh/mopshyai/carebowapp/branch/main/graph/badge.svg" alt="Code Coverage">
  </a>
  <a href="https://github.com/mopshyai/carebowapp/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <a href="https://github.com/mopshyai/carebowapp/releases">
    <img src="https://img.shields.io/github/v/release/mopshyai/carebowapp" alt="Release">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=flat-square&logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma" alt="Prisma">
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Docs</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Overview

CareBow is a comprehensive healthcare platform designed for modern families:

- **Professional Care Services** - Book verified caregivers for elderly care, child care, physiotherapy, nursing, and more
- **AI Health Assistant** - Get doctor-grade symptom assessment and personalized health guidance
- **Emergency Safety Features** - One-tap SOS alerts, scheduled check-ins, and emergency contact management
- **Family Care Management** - Manage health records, care history, and insurance for your entire family

## Features

| Feature | Description |
|---------|-------------|
| **Home Dashboard** | Quick access to services, orders, and health insights |
| **Ask CareBow** | AI-powered health triage with voice support |
| **Service Booking** | Browse, compare, and book healthcare services |
| **Safety Hub** | SOS emergency alerts and scheduled check-ins |
| **Family Profiles** | Manage health data for multiple family members |
| **Order Management** | Track bookings and service requests |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+ (`npm install -g pnpm`)
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- PostgreSQL 15+ (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/mopshyai/carebowapp.git
cd carebowapp

# Install dependencies
pnpm install

# Set up environment variables
cp apps/mobile/.env.example apps/mobile/.env
cp apps/api/.env.example apps/api/.env

# Set up the database
pnpm db:push

# iOS: Install pods
pnpm pod-install

# Start development
pnpm dev
```

### Running the Apps

```bash
# Run iOS simulator
pnpm ios

# Run Android emulator
pnpm android

# Run API server
pnpm dev:api
```

Or use Make commands:

```bash
make help      # See all available commands
make dev       # Start all dev servers
make ios       # Run iOS app
make android   # Run Android app
```

## Project Structure

```
carebow/
├── apps/
│   ├── mobile/              # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/     # 56+ app screens
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── navigation/  # React Navigation setup
│   │   │   ├── store/       # Zustand state management
│   │   │   ├── services/    # API, storage, analytics
│   │   │   ├── features/    # Feature modules
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   └── theme/       # Design system tokens
│   │   ├── ios/             # iOS native project
│   │   └── android/         # Android native project
│   └── api/                 # Next.js 15 backend API
│       ├── app/api/         # API routes
│       ├── lib/             # Auth, Prisma, utilities
│       └── prisma/          # Database schema
├── packages/
│   └── shared/              # Shared types & utilities
├── .github/                 # GitHub Actions & templates
├── docker-compose.yml       # Docker setup
└── Makefile                 # Development commands
```

## Tech Stack

### Mobile App
- **React Native 0.76** with New Architecture (Fabric)
- **TypeScript** for type safety
- **React Navigation 7** for routing
- **Zustand** for state management
- **React Native Reanimated** for animations
- **Sentry** for error tracking

### Backend API
- **Next.js 15** with App Router
- **Prisma 6** ORM with PostgreSQL
- **NextAuth v5** for authentication
- **Zod** for validation

### Infrastructure
- **pnpm** workspaces
- **Turborepo** build orchestration
- **Docker** for containerization
- **GitHub Actions** for CI/CD

## Documentation

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [SECURITY.md](SECURITY.md) | Security policy |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [Mobile Docs](apps/mobile/DEVELOPER_DOCUMENTATION.md) | Mobile app development guide |
| [Design System](apps/mobile/DESIGN_SYSTEM.md) | UI design tokens |
| [API Docs](apps/api/README.md) | Backend API documentation |

## Scripts

```bash
# Development
pnpm dev              # Start all dev servers
pnpm dev:mobile       # Start Metro bundler
pnpm dev:api          # Start API server

# Quality
pnpm lint             # Lint all code
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code
pnpm typecheck        # TypeScript validation
pnpm test             # Run all tests
pnpm test:coverage    # Run tests with coverage

# Build
pnpm build            # Build all apps
pnpm build:api        # Build API only

# Database
pnpm db:push          # Push Prisma schema
pnpm db:migrate       # Create migration
pnpm db:studio        # Prisma visual editor
pnpm db:seed          # Seed database

# Mobile
pnpm ios              # Build & run iOS
pnpm android          # Build & run Android
pnpm pod-install      # Install iOS CocoaPods
```

## Docker

```bash
# Start all services (API + PostgreSQL + Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

Found a security vulnerability? Please see our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with care by <a href="https://github.com/mopshyai">Mopshy AI</a></sub>
</p>

<p align="center">
  <a href="https://github.com/mopshyai/carebowapp/stargazers">
    <img src="https://img.shields.io/github/stars/mopshyai/carebowapp?style=social" alt="Stars">
  </a>
  <a href="https://github.com/mopshyai/carebowapp/network/members">
    <img src="https://img.shields.io/github/forks/mopshyai/carebowapp?style=social" alt="Forks">
  </a>
</p>
