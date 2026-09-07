# Contributing to CareBow Mobile

This repository contains the CareBow React Native mobile application and shared mobile packages. The production backend, API, database, and web application live in the separate `carebow-main` repository.

## Prerequisites

Use the toolchain declared by the repository rather than installing arbitrary newer majors:

- Node.js 20 or newer compatible release (`package.json` currently requires `>=20`)
- pnpm 10.20.0 via the root `packageManager` declaration
- JDK 17 for Android builds
- Android Studio / Android SDK for Android development
- Xcode 15+ and CocoaPods for iOS development

Install dependencies from the repository root:

```bash
pnpm install --frozen-lockfile
```

For local mobile configuration:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Treat every value bundled into the mobile application as publicly extractable. Never put server credentials, private API keys, database credentials, signing material, privileged service tokens, or production user data in a mobile `.env` file.

## Development Workflow

Create changes on a branch from `main`. Recommended branch prefixes:

- `feature/` — user-facing capability
- `fix/` — bug or regression fix
- `security/` — security remediation
- `refactor/` — behavior-preserving refactor
- `docs/` — documentation only
- `chore/` — maintenance/dependencies/tooling

Direct pushes to protected release branches are against CareBow engineering policy. Changes should land through pull requests after required checks pass.

## Required Local Checks

Before requesting review, run the checks relevant to your change:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --passWithNoTests --ci
```

When native or release behavior changes, also run the relevant iOS/Android build and document the device/simulator path you tested.

## Pull Request Requirements

Every pull request should:

1. explain the user/problem impact and scope;
2. include or update tests where practical;
3. pass lint, type checking, tests, dependency/security review, CodeQL, and native build gates;
4. avoid unrelated dependency or formatting churn;
5. document rollout/rollback considerations for risky changes;
6. complete the security/privacy and clinical-safety sections of the PR template.

Do not merge a dependency major merely because Dependabot opened it. React Native, React, Metro, Babel, native tooling, testing frameworks, and release tooling can have coordinated breaking requirements. Major upgrades require a dedicated migration PR with both native builds and tests proving compatibility.

## Security and Privacy Rules

This is a public repository. Never commit or paste real CareBow user/patient data into source control, issues, pull requests, test fixtures, snapshots, screenshots, logs, or workflow artifacts. Use synthetic data only.

Sensitive examples include health information, symptom histories tied to a person, addresses, phone numbers, email addresses, caregiver notes, location histories, payment data, authentication tokens, private keys, and credentials.

Suspected vulnerabilities must be reported through GitHub Private Vulnerability Reporting or `security@carebow.com`, not through a public issue. See [SECURITY.md](SECURITY.md).

## Clinical / Safety-Sensitive Changes

Engineering review alone is not enough for changes that alter symptom assessment, triage/urgency, emergency escalation, medication guidance, or other safety-sensitive health recommendations. Those changes require explicit product/clinical validation and evidence attached to the PR.

## Dependency Policy

Dependabot runs weekly and GitHub Actions are pinned to immutable commit SHAs. New moderate/high/critical dependency vulnerabilities block CI unless an exact, time-bounded exception is documented.

Prefer upgrades that remove overrides instead of accumulating permanent transitive pins. When an override is added for security, document why it is safe and remove it once upstream dependencies adopt the patched version.

## Coding Standards

### TypeScript / React Native

- use TypeScript for new application logic;
- keep types precise and avoid unnecessary `any`;
- use functional components/hooks;
- use the existing design-system/theme tokens;
- keep business logic testable outside UI components;
- use Zustand for local/global app state where already established and React Query for server state where already established.

### Logging

Logs must not contain access tokens, passwords, payment details, or sensitive health/account data. Debug logging involving synthetic data must be removed or appropriately gated before release.

### Native Permissions

Request only permissions that the feature actually needs. Any new Android permission, iOS entitlement, HealthKit/Health Connect capability, location mode, background mode, camera/microphone access, or notification capability must be called out explicitly in the PR.

## Commits

Use Conventional Commit-style subjects where practical, for example:

```text
feat(booking): add reschedule confirmation
fix(auth): prevent stale session reuse
security(deps): patch vulnerable parser chain
ci(release): fail closed on missing mobile config
```

## Repository Ownership

Until the repository is migrated into a CareBow GitHub organization, `@mopshyai` is the valid CODEOWNER. After migration, replace personal ownership with real CareBow teams and require CODEOWNER review through the repository ruleset.
