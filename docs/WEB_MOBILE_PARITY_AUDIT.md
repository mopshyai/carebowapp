# CareBow Web ↔ Mobile Platform Parity Audit

In progress, 2026-09-06. Source audit, not a claim of deployed or E2E parity.

## Architecture

Web `carebow-main` is Next.js 15 / React 19 and owns the API server. Mobile `carebowapp` is React Native 0.76 / React 18 with Zustand caches and an HTTP ApiClient. Neither a mobile store nor a static catalog is authoritative for bookings, patients, or payments.

## Shared Backend

Both clients target the Next.js API. Web main is `c0d2a3447bcf5f859ff7acfba9a8f3285ad2f648`; mobile branch `codex/run-github-main-20260821` is `0d9384b51ec7406c93f1b0b61804ccbb8749aedc`. Both fetched and 0 ahead / 0 behind origin/main. Existing changes preserved: mobile privacy manifest, profile repository/tests, care plans, checkout, order details, personal info, Ask screen, untracked store assets; web bookings/payment/settle tests and implementations.

The newer durable CareRequest is NOT on web main. It lives on `origin/ask-carebow-core-hardening-20260902` at `2a59ce3`. Integration is isolated at `/private/tmp/carebow-platform-web`, branch `codex/web-mobile-parity-20260906`. Existing web working changes applied cleanly to that worktree, originals untouched. No push, deployment, or migration against a live database.

## Database Source of Truth

Prisma 7 with PostgreSQL (`DATABASE_URL`), using the pg driver adapter. Prisma CLI and runtime share that environment key. Actual deployed database identity and contents remain unverified. See `WEB_MOBILE_SOURCE_INVENTORY.md` for models, routes and complete seed payload. Never infer production rows from seeds.

## Authentication Model

Web uses opaque database Session cookies; mobile uses access JWTs plus database refresh tokens, both resolving User. Shared chat auth accepts both. ProfileAccess handles dependent sharing. UserAccessProfile roles differ from patient Profile. UserProfile/FamilyMember in mobile are cached account/patient representations; preserve existing self-profile bridge edits. JWT roles are overlaid from token claims: role revocation freshness requires verification.

## Domain Models

User -> Profile / ProfileAccess -> ChatSession / ChatMessage, Booking, medical records. Service -> Booking; Payment snapshots intent. ProviderProfile and provider credentials attach to User. Organisation/OrgMember handle provider organizations. CareRequest includes user/profile/session IDs, quote, payment reference, sourcing and escalation state; CareRequestBookingLink links fulfillment to Booking. Numerous new request links are scalar IDs without database relations; application authorization and orphan handling matter.

## Service Catalog

Canonical published Service rows in PostgreSQL; `prisma/mobile-catalog.json` and `seed-catalog.ts` supply rich services. Mobile has an independent local catalog and currently filters out backend rows lacking rich display details. `backendServiceResolver.ts` has obsolete fuzzy/first-row matching and no callers found. Local IDs must never be substituted for canonical IDs. Catalog prices are authored in USD; server pricing determines settlement currency. A legacy raw basePrice must not become an invented fixed payable amount.

## Feature Matrix

✅ source implementation; 🟡 partial; 🔴 missing; ⚫ legacy/dead. E2E is unverified unless explicitly stated. Web column covers the isolated integration branch, with main differences noted. These are capability groups, not a fabricated percentage.

| Domain        | Capability                          | Web | Mobile | Backend | DB  | Working E2E? | Gap                                        | Priority | Action                             |
| ------------- | ----------------------------------- | --- | ------ | ------- | --- | ------------ | ------------------------------------------ | -------- | ---------------------------------- |
| Identity      | signup/login/logout/refresh         | ✅  | ✅     | ✅      | ✅  | unverified   | cookie/JWT revocation parity               | P0       | test both transports               |
| Identity      | reset/verification/profile editing  | ✅  | ✅     | ✅      | ✅  | unverified   | preserve local fixes                       | P2       | regression tests                   |
| Identity      | roles/provider/admin                | ✅  | 🟡     | ✅      | ✅  | unverified   | mobile role surfaces limited               | P2       | audit authorization                |
| Family        | dependent CRUD/sharing              | ✅  | ✅     | ✅      | ✅  | unverified   | local self/account bridge                  | P1       | preserve and verify                |
| Family        | emergency/medical context           | ✅  | 🟡     | ✅      | ✅  | unverified   | all profile fields not sent                | P1       | inspect write contracts            |
| Services      | canonical discovery                 | ✅  | 🟡     | ✅      | ✅  | unverified   | mobile hides non-rich rows                 | P1       | render all published rows          |
| Services      | offline catalog identity            | ✅  | 🟡     | ✅      | ✅  | unverified   | local fallback advertises unknown IDs      | P1       | fail closed on unavailable catalog |
| Ask           | server conversation turns           | ✅  | 🟡     | ✅      | ✅  | unverified   | only symptom intent reaches orchestrator   | P1       | send non-emergency intents too     |
| Ask           | cross-device conversation history   | ✅  | 🟡     | ✅      | ✅  | unverified   | mobile keeps local sessions                | P1       | expose server sessions             |
| Ask           | voice                               | 🟡  | ✅     | ✅      | 🟡  | unverified   | platform input differences                 | P2       | intentional native capability      |
| Ask           | unlisted request/ops handoff        | ✅  | 🔴     | ✅      | ✅  | unverified   | CareRequest missing on main and mobile     | P1       | use existing branch domain         |
| Booking       | create/list/detail/clinical outcome | ✅  | ✅     | ✅      | ✅  | unverified   | refresh on return                          | P1       | shared lifecycle tests             |
| Booking       | cancel/refund                       | ✅  | ✅     | ✅      | ✅  | unverified   | cross-platform proof absent                | P1       | integration test                   |
| Booking       | reschedule                          | ✅  | 🔴     | ✅      | ✅  | unverified   | mobile action missing                      | P1       | use canonical operation            |
| Care requests | status/history                      | ✅  | 🔴     | ✅      | ✅  | unverified   | no mobile list                             | P1       | shared customer endpoint           |
| Care requests | quote approval/cancel               | ✅  | 🔴     | ✅      | ✅  | unverified   | no mobile controls                         | P1       | shared PATCH endpoint              |
| Payments      | booking/plan hosted checkout        | ✅  | ✅     | ✅      | ✅  | unverified   | webhook requires deployed credentials      | P1       | preserve server verification       |
| Payments      | custom quote checkout               | ✅  | 🔴     | 🟡      | ✅  | unverified   | cookie-only order; no hosted request       | P1       | shared auth and hosted transport   |
| Payments      | retry/refund/idempotency            | ✅  | 🟡     | ✅      | ✅  | unverified   | concurrent client actions                  | P0       | server claims remain canonical     |
| Provider      | onboarding/documents/verification   | ✅  | 🟡     | ✅      | ✅  | unverified   | mobile category coverage                   | P2       | retain web operations              |
| Provider      | assignment/fulfillment              | ✅  | 🟡     | ✅      | ✅  | unverified   | link serialization differs                 | P1       | shared booking IDs                 |
| Admin         | sourcing/quote/escalation/timeline  | ✅  | ⚫     | ✅      | ✅  | unverified   | web role-specific UI intentional           | P2       | mobile requests reach same queue   |
| Clinical      | patient/session handoff             | ✅  | 🟡     | ✅      | ✅  | unverified   | local conversation engine duplicates rules | P1       | backend orchestration first        |
| Notifications | email/SMS/WhatsApp                  | ✅  | 🟡     | ✅      | ✅  | unverified   | provider delivery unverified               | P2       | inspect adapters/outbox            |
| Notifications | native push/inbox                   | 🟡  | ✅     | 🟡      | ✅  | unverified   | live device delivery unverified            | P2       | verify credentials/device          |
| History       | bookings/payments                   | ✅  | ✅     | ✅      | ✅  | unverified   | custom requests omitted                    | P1       | show request history               |
| AI            | RAG/safety/streaming                | ✅  | 🟡     | ✅      | ✅  | unverified   | mobile fallback medical logic              | P1       | avoid expanding duplication        |
| Location      | saved address/GPS/service area      | 🟡  | 🟡     | 🟡      | 🟡  | unverified   | native address cache vs booking text       | P2       | map address persistence            |
| Safety        | SOS/check-ins/contacts              | ✅  | ✅     | ✅      | ✅  | unverified   | dispatch delivery not proven               | P2       | verify without sending alerts      |
| Records       | vitals/documents/medications        | ✅  | 🟡     | ✅      | ✅  | unverified   | device-local episode memory                | P2       | canonical record access            |

## Mobile-only Features

Native voice, push/device token integration, GPS, offline episode memory and local safety fallback. Presentation differences are intentional; persisted care state must remain shared. Static catalog entries are inventoried in companion source file.

## Web-only Features

Durable custom requests, quoting, operations sourcing, provider credential management, clinical escalation monitoring and server conversation history. Some exist only on the unmerged integration base, not main.

## Backend Gaps

New CareRequest workflow not integrated into main. Hosted custom-payment transport missing. Customer request list capped at 20 and does not recheck profile access for each row. Mobile payment status treats all non-booking payments as plans.

## Database Gaps

CareRequest status uses String rather than DB enum; transitions must stay server-owned. Scalar user/profile/session/payment/link IDs lack several FK constraints. No live orphan scan or schema drift proof yet. No destructive changes justified.

## API Gaps

See route/caller inventory. Shared chat uses dual auth, request payment currently cookie-only. V1 catalog exposes raw rich JSON while public catalog strips marketing fields. Mobile and web errors have different envelopes; preserve explicit failure handling.

## Security Findings

No new client secrets. Payment amount/currency and access checks stay server-owned. Revoked shared-profile access must also apply to request list/history. Existing copied web edits are separately preserved and are not counted as new work.

## P0

Verify patient-access boundaries for CareRequest reads and actions. Avoid unsafe local service remapping. Do not claim payment success based on a browser return.

## P1

Connect mobile orchestration and durable request list/actions/payments; expose full catalog; refresh bookings across navigation; prove shared patient and payment identity.

## P2

Complete server conversation history, notification transport evidence, location/records and provider parity after core integration.

## P3

Presentation polish deferred.

## Completed During This Work

Repository inspection/fetch; safe isolated integration checkout; preservation of existing changes; architecture and source inventories.

## Remaining Work

Implementation and tests in progress. Main integration, migration deployment, live database comparisons, and all eight device/web E2E journeys are not yet verified.

## E2E Verification

Scenarios 1–8: pending. Compilation and mocked tests will be reported separately from PostgreSQL/API/device proof.

## Recommended Architecture Decisions

Use carebow-main PostgreSQL + shared domain functions as source of truth. Extend the existing CareRequest branch rather than introducing a second request model. Mobile remains a transport/UI client. Main rollout must include that branch's migrations and reviewed existing fixes. Keep integration isolated until tested; no push or production deployment authorized.
