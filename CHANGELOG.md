# Changelog

All notable changes to the CareBow mobile application are documented here. This repository contains the React Native mobile app and shared mobile packages only; backend/web changes belong in `carebow-main`.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses semantic versioning for released mobile builds.

## [Unreleased]

### Added

- Canonical mobile flows for CareRequest, payment continuation, rescheduling, provider fulfillment, and clinical documentation parity with the web platform.
- Automated CodeQL security scanning and dependency review.
- Native Android/iOS build verification in CI.

### Changed

- Dependency security policy now blocks new moderate, high, and critical audit findings except explicitly documented, time-bounded exceptions.
- Release workflow is hardened to use CI-gated publishing, immutable GitHub Action pins, fail-closed mobile configuration, and isolated signing material.
- Repository governance, contributor guidance, CODEOWNERS, and security policy were aligned with the mobile-only architecture.

### Security

- Remediated actionable CodeQL findings in shared validation and analytics session identifiers.
- Patched vulnerable transitive `uuid` and `fast-xml-parser` dependency paths.
- Two upstream Metro `image-size` denial-of-service advisories remain documented in issue #131 pending a maintained patched upstream dependency chain.

## [1.0.0]

### Added

- Initial CareBow React Native application for iOS and Android.
- Home and service discovery experiences.
- Ask CareBow mobile experience.
- Booking and care-request flows.
- Family and care coordination experiences.
- Push-notification and offline-capable mobile foundations.

> Historical release dates should be taken from signed store/release records. Do not invent dates in this changelog when the authoritative release record is unavailable.

[Unreleased]: https://github.com/mopshyai/carebowapp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mopshyai/carebowapp/releases/tag/v1.0.0
