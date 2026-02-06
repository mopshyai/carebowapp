# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial monorepo setup with Turborepo
- React Native mobile app (iOS & Android)
- Next.js 15 API backend
- Authentication with NextAuth v5
- Prisma ORM with PostgreSQL
- CI/CD pipeline with GitHub Actions
- Docker support for API deployment
- Comprehensive documentation

### Security
- Secure authentication flow
- Environment variable validation
- API rate limiting

## [1.0.0] - 2024-XX-XX

### Added
- **Mobile App**
  - Home dashboard with service overview
  - Ask CareBow AI health assistant
  - Service marketplace and booking
  - Safety features (SOS, check-ins)
  - Family profile management
  - Order tracking and history
  - Push notifications (Notifee)
  - Offline support with AsyncStorage

- **Backend API**
  - User authentication (email/OAuth)
  - Family and caregiver profiles
  - Booking management
  - Health records storage
  - Care logs
  - Review system
  - Admin dashboard endpoints

- **Infrastructure**
  - Monorepo with pnpm workspaces
  - Turborepo build orchestration
  - Shared packages for types and utilities
  - TypeScript strict mode throughout

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- bcrypt password hashing
- JWT session management
- Input validation with Zod
- Secure cookie configuration

---

[Unreleased]: https://github.com/mopshyai/carebowapp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mopshyai/carebowapp/releases/tag/v1.0.0
