## Summary

Describe the user/problem impact and the smallest useful explanation of the change.

Fixes #(issue number, if applicable)

## Change Type

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / maintenance
- [ ] Dependency update
- [ ] Native iOS / Android change
- [ ] CI/CD or release change
- [ ] Documentation only
- [ ] Breaking change

## What Changed

- Change 1
- Change 2
- Change 3

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test -- --passWithNoTests --ci`
- [ ] Relevant Android/iOS build or device flow tested
- [ ] New/changed behavior has automated coverage where practical

### Manual Test Notes

Describe the exact path tested, devices/simulators used, and expected result.

## Security & Privacy Review

Complete this for every PR, even when the answer is "not applicable".

- [ ] No credentials, tokens, signing material, private keys, or production secrets are committed
- [ ] No real patient/user data, PHI/PII, payment data, addresses, phone numbers, caregiver notes, or unredacted production screenshots/logs are included
- [ ] New environment variables are safe to embed in a user-controlled mobile binary, or are server-side only
- [ ] Authentication, authorization, session, payment, location, health-data, logging, analytics, and notification impacts were reviewed
- [ ] New or upgraded dependencies are necessary and pass dependency/security review
- [ ] Native permission or entitlement changes are documented and minimized
- [ ] Error/logging changes do not expose tokens or sensitive health/account data
- [ ] Any security exception is tied to a specific advisory, owner, compensating control, and review deadline

## Clinical / Safety Review

If this changes symptom assessment, urgency/triage, emergency escalation, medication guidance, care recommendations, or other safety-sensitive health behavior:

- [ ] Not applicable
- [ ] Product/clinical validation completed and linked below
- [ ] Red-flag/emergency behavior was explicitly tested
- [ ] User-facing wording and escalation boundaries were reviewed

Validation / evidence:

## Release Impact

- [ ] No release-pipeline impact
- [ ] iOS release impact reviewed
- [ ] Android release impact reviewed
- [ ] Backward compatibility with the current `carebow-main` API was checked
- [ ] Migration / rollout / rollback notes are included below when needed

Rollout / rollback notes:

## UI Evidence

For user-visible changes, attach redacted screenshots/video. Never attach real user or patient data.

## Reviewer Notes

Call out risky assumptions, follow-up work, intentionally deferred items, or areas that deserve extra scrutiny.
