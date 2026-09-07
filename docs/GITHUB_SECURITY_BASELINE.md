# GitHub Repository Security Baseline

This document is the minimum repository-governance standard for `mopshyai/carebowapp`. Workflow files enforce technical checks; GitHub repository settings must enforce that those checks cannot be bypassed accidentally.

## `main` Ruleset

Create an **active branch ruleset** targeting the default branch `main` with the following controls:

- restrict deletions;
- block force pushes;
- require a pull request before merging;
- require all review conversations to be resolved;
- require the branch to be up to date before merge;
- require CODEOWNER review once ownership moves to valid CareBow organization teams;
- require at least one independent approval once more than one engineer has write access;
- require successful status checks before merge;
- do not allow routine bypasses. Any emergency bypass must be narrowly scoped, auditable, and followed by a normal PR/incident review.

Required checks should include the stable checks produced by this repository:

- `Lint & Type Check`
- `Test`
- `Security Audit`
- `Dependency Review` for pull requests that change dependencies
- `Build Android`
- `Build iOS`
- `CodeQL JavaScript/TypeScript`
- `CodeQL Android (Java/Kotlin)`
- `CodeQL iOS (C/C++/Swift)` when the iOS-native workflow is triggered

Do not configure a conditional/path-scoped check as globally required unless GitHub reports a neutral/skipped status for unaffected PRs. Otherwise the ruleset can deadlock unrelated changes.

## Merge Policy

Preferred default is **squash merge** for product and dependency PRs. Delete merged branches automatically. Major dependency migrations should use dedicated PRs rather than being mixed into unrelated feature work.

When the repository moves to a CareBow GitHub organization, replace personal CODEOWNERS with real teams such as mobile/platform/security and require CODEOWNER review.

## Release Environments

Use these GitHub Environments:

- `testflight`
- `play-internal`

Move platform-specific release credentials from broad repository secrets into the appropriate environment where practical. Configure environment protection rules so production-capable publishing credentials are not available to arbitrary jobs.

Recommended environment controls:

- restrict deployment branches/tags to `main` or approved release refs;
- require reviewer approval when a second trusted maintainer is available;
- keep App Store / Play credentials environment-scoped;
- rotate signing/API credentials on staff changes or suspected exposure.

`MOBILE_DOTENV` must contain mobile-safe configuration only. Anything bundled into the app is extractable by users and must not be treated as a secret.

## Security Features

Keep these repository features enabled:

- Dependabot alerts and security updates;
- Code scanning / CodeQL;
- secret scanning;
- push protection for secrets where available;
- private vulnerability reporting;
- security advisories.

Do not dismiss alerts to make the dashboard look clean. Dismiss only with a documented reason, owner, compensating control, and review date.

## Review Cadence

At least monthly, and before major releases:

1. review open Dependabot and CodeQL alerts;
2. review documented exceptions and expiration dates;
3. review GitHub Actions pins and Dependabot configuration;
4. confirm release environment protections and credentials still match current maintainers;
5. confirm `main` remains protected and required checks still map to real workflow check names;
6. remove stale collaborators, deploy keys, or app installations;
7. verify public documentation does not claim security controls that the repository cannot prove.

## Public Repository Data Rule

No production CareBow user/patient data belongs in GitHub. This includes issues, PRs, comments, screenshots, logs, test fixtures, Actions artifacts, or security examples. Use synthetic/redacted data only.
