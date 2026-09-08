# Security Policy

CareBow takes security and privacy seriously. This repository contains the CareBow mobile application and shared mobile packages. The production backend and server-side infrastructure live in the separate `carebow-main` repository and have their own security controls.

## Supported Versions

We support the current production mobile release and the current `main` branch. Security fixes are normally released as patch updates. Older builds may be asked to upgrade when a fix cannot be safely backported.

## Reporting a Vulnerability

**Do not open a public issue for a suspected security vulnerability.**

If GitHub shows a private **Report a vulnerability** option for this repository, use it. Otherwise email the published CareBow contact address, `info@carebow.com`, with a subject such as `Security vulnerability report` so the report can be routed privately.

Please include only the information needed to reproduce and assess the issue:

- affected app version, platform, and device/OS version;
- a concise description and impact assessment;
- minimal reproduction steps or proof of concept;
- whether authentication, payments, health information, location, or account data are involved;
- any suggested mitigation, if known.

Never send real patient records, credentials, payment data, access tokens, or other sensitive personal information in a report. Use synthetic data and redact screenshots/logs.

We aim to acknowledge valid reports within two business days, perform an initial severity assessment as quickly as practical, and coordinate remediation and disclosure with the reporter. Critical issues may require an emergency release or temporary feature restriction.

## Repository Security Baseline

Changes to this repository are expected to pass the following automated gates before merge:

- lint and TypeScript checks;
- automated tests;
- dependency audit at `moderate` severity or higher;
- dependency review for newly introduced packages;
- CodeQL analysis;
- Android release build;
- iOS release build.

Repository operators should keep secret scanning, Dependabot alerts/security updates, private vulnerability reporting, and GitHub security advisories enabled where available. Availability and enablement must be verified in GitHub settings rather than inferred from this policy document.

GitHub Actions are pinned to immutable commit SHAs. Release jobs use GitHub secrets and isolated runner temporary storage for signing material. Production mobile configuration must fail closed when required release configuration is absent.

## Sensitive Data Rules

This is a public repository. **Real CareBow user data must never be committed or pasted into issues, pull requests, test fixtures, snapshots, logs, screenshots, or workflow artifacts.** This includes health information, symptoms tied to an identifiable person, addresses, phone numbers, email addresses, government identifiers, payment details, caregiver notes, access tokens, and credentials.

Use synthetic fixtures only. If a bug can be reproduced only with production data, reproduce it in an approved private environment and attach only a redacted/minimized artifact to the engineering work item.

Mobile applications are user-controlled binaries. Any value embedded in a mobile bundle must be treated as publicly extractable. Do not place server credentials, private API keys, database credentials, signing secrets, or privileged service tokens in mobile environment variables.

## Dependency Vulnerabilities

New `moderate`, `high`, or `critical` dependency advisories are release blockers unless there is a documented, time-bounded exception with:

1. the exact advisory identifier;
2. reachability/exposure analysis;
3. the reason a safe patched version is unavailable;
4. compensating controls;
5. an owner and review deadline.

The current Metro `image-size` exceptions are tracked in issue #131 and must be removed when a maintained patched dependency chain becomes available.

## Clinical and Safety-Sensitive Changes

Changes that affect symptom assessment, urgency classification, emergency escalation, medication guidance, care recommendations, or other safety-sensitive health behavior require explicit product/clinical validation in addition to normal engineering review. Automated tests do not substitute for clinical validation.

## Coordinated Disclosure

Please give us a reasonable opportunity to investigate and remediate before public disclosure. We will coordinate disclosure timing for confirmed issues and credit reporters who want attribution.

CareBow does not currently operate a formal public bug-bounty program. Do not assume a reward is available unless agreed in writing.

## Scope Notes

Backend authentication, database authorization, infrastructure, API rate limiting, server-side payment processing, and other server controls are **not** defined by this mobile repository's policy. Report backend findings privately as well; we will route them to the correct repository and owner.
