# CareBow Web ↔ Mobile Platform Parity Audit

Living document. Last updated 2026-09-06 (second pass: shared reschedule lifecycle,
local CI replay, production catalog read).

**Status legend** — applied per row, never aspirationally:

| Mark | Meaning                                                  |
| ---- | -------------------------------------------------------- |
| ✅   | implemented **and** verified by something that can fail  |
| 🟡   | implemented, but end-to-end behaviour not proven         |
| ⚠️   | cannot be verified from this environment (blocker named) |
| 🔴   | missing or broken                                        |
| ⚫   | obsolete / deliberately removed                          |

## Architecture

Web `carebow-main` is Next.js 15 / React 19 and owns the API server. Mobile `carebowapp` is
React Native 0.76 / React 18 with Zustand caches and an HTTP ApiClient. Neither a mobile store
nor a static catalog is authoritative for bookings, patients, or payments.

Backend parity branch: `codex/web-mobile-parity-20260906` (based on
`origin/ask-carebow-core-hardening-20260902`). Mobile parity branch:
`audit/web-mobile-parity`. The name `parity/mobile-care-request-integration` does not exist in
this environment and should not be used.

## Database Source of Truth

Prisma 7 + PostgreSQL via the pg driver adapter. The schema is multi-file: `prisma/schema.prisma`
plus `prisma/models/*.prisma` (loaded because `prisma.config.ts` sets `schema: 'prisma/'`).
A stale generated client — not a missing model — is what made `CareRequest`,
`CareRequestBookingLink`, `AskCarebowCheckoutIntent`, `AskCarebowBookingLink` and
`AskCarebowClinicalEscalation` appear absent from `PrismaClient`. `prisma generate` fixes it.

## Booking Reschedule — resolved

Previously recorded here as "mobile action missing". The real defect was worse and is now fixed:
mobile called `POST /v1/bookings/:id/reschedule`, **the backend had no such route**, and the only
implementation of the reschedule rules lived inline inside the Ask CareBow booking tool.

`rescheduleBookingByCustomer()` in `src/lib/booking-lifecycle.ts` is now the single implementation.
Mobile (`POST|PATCH /api/v1/bookings/:bookingId/reschedule`, body `{ scheduledAt }` only) and
Ask CareBow (`update_booking` action `RESCHEDULE`) both call it. Rules:

- owner-only; another account's booking is 404, not 403
- profile access re-checked at reschedule time (revoked family grant cannot move care)
- only `PENDING` standard bookings move; `CONFIRMED` returns `requiresOperations`
- a materialized custom CareRequest job returns `requiresOperations` — never a silent move
- `IN_PROGRESS` / `COMPLETED` / `CANCELLED` refused
- new time must clear `MIN_RESCHEDULE_LEAD_MS`
- the **same Booking row** is updated; no replacement booking is ever created
- a provider assigned for the old time is released and notified
- previous and new times are written to `AuditLog`
- compare-and-set over status + scheduledAt + providerId, so a concurrent confirmation or
  assignment wins instead of being overwritten by a stale phone screen
- a repeat request for the time already stored returns `unchanged: true`, not a false conflict

## Feature Matrix

E2E is unverified unless the row says otherwise.

| Domain        | Capability                           | Web | Mobile | Backend | DB  | E2E | Notes                                                  |
| ------------- | ------------------------------------ | --- | ------ | ------- | --- | --- | ------------------------------------------------------ |
| Identity      | signup/login/logout/refresh          | ✅  | ✅     | ✅      | ✅  | ⚠️  | no test credentials in this environment                |
| Family        | dependent CRUD/sharing               | ✅  | ✅     | ✅      | ✅  | ⚠️  |                                                        |
| Services      | canonical discovery                  | ✅  | ✅     | ✅      | ✅  | 🟡  | mobile renders legacy rows without rich `details`      |
| Ask           | server conversation turns            | ✅  | 🟡     | ✅      | ✅  | ⚠️  |                                                        |
| Ask           | unlisted request → ops handoff       | ✅  | ✅     | ✅      | ✅  | ⚠️  | CareRequest lifecycle present on the parity branch     |
| Booking       | create/list/detail                   | ✅  | ✅     | ✅      | ✅  | ⚠️  |                                                        |
| Booking       | cancel/refund                        | ✅  | ✅     | ✅      | ✅  | ⚠️  |                                                        |
| Booking       | **reschedule**                       | ✅  | ✅     | ✅      | ✅  | 🟡  | one shared lifecycle; 17 unit tests, no device run     |
| Care requests | status/history                       | ✅  | ✅     | ✅      | ✅  | ⚠️  | `RequestsScreen` / `RequestDetailsScreen`              |
| Care requests | quote approval/cancel                | ✅  | ✅     | ✅      | ✅  | ⚠️  | `approveQuote()` / `cancel()`                          |
| Payments      | booking/plan hosted checkout         | ✅  | ✅     | ✅      | ✅  | ⚠️  | needs Razorpay test mode + account                     |
| Payments      | custom quote checkout                | ✅  | ✅     | ✅      | ✅  | ⚠️  | `paymentsApi.createCareRequestOrder` + hosted checkout |
| Payments      | retry/refund/idempotency             | ✅  | ✅     | ✅      | ✅  | ⚠️  | failure matrix not executed                            |
| Provider      | assignment/fulfillment               | ✅  | 🟡     | ✅      | ✅  | ⚠️  | continuity not proven                                  |
| Clinical      | escalation convergence               | ✅  | n/a    | ✅      | ✅  | ✅  | triggers exercised on real Postgres (see below)        |
| Notifications | in-app inbox                         | ✅  | ✅     | ✅      | ✅  | 🟡  |                                                        |
| Notifications | **remote push (server→device)**      | 🔴  | 🔴     | 🔴      | ✅  | 🔴  | see Notifications below                                |
| Ask           | fake local `order_*`/`request_*` IDs | ⚫  | ⚫     | n/a     | n/a | n/a | `actionIntegration.ts` removed; must stay removed      |

## Verification Performed (2026-09-06)

Run on a disposable PostgreSQL 16 + pgvector instance built for this audit.

| Check                                             | Result                                                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Backend typecheck (`tsc --noEmit`)                | ✅ 0 errors                                                                                               |
| Backend tests (`npm test`)                        | ✅ 495 / 495 passing                                                                                      |
| Backend production build                          | ⚠️ blocked — sandbox cannot fetch Google Fonts for `next/font`                                            |
| Migrations from scratch (27 migrations, in order) | ✅ all applied to an empty database                                                                       |
| Schema ↔ migrations drift                         | ✅ 62 models / 62 tables, 0 table and 0 column differences                                                |
| `prisma migrate deploy` + `migrate diff`          | ⚠️ blocked — `binaries.prisma.sh` unreachable (403/000); replayed the SQL directly instead                |
| Clinical escalation triggers                      | ✅ OPEN→ASSIGNED→ACCEPTED, provider swap resets acceptance, cancel resolves, CHECK rejects invalid status |
| Reschedule vs clinical escalation                 | ✅ a reschedule-shaped write fabricates no clinical progress (escalation returns to OPEN, unresolved)     |
| Catalog seed (`prisma/seed-catalog.ts`)           | ✅ 27 created, then 0 created / 27 updated on re-run — idempotent, non-destructive                        |
| Mobile typecheck                                  | ✅ 0 errors                                                                                               |
| Mobile lint                                       | ✅ 0 errors (201 pre-existing console/`any` warnings)                                                     |
| Mobile tests                                      | ✅ 568 / 568 passing, 39 suites                                                                           |
| **GitHub CI**                                     | ⚠️ **blocked by environment authentication** — see below                                                  |

### ⚠️ CI verification blocked by environment authentication

Neither repository is attached to this session: the GitHub API answers
"sessions are bound to their configured repositories", the tool that would attach them is not
available here, and `carebow-main` rejects git credentials entirely (private repo).
Therefore: workflow runs, commit checks and PR #136 status **have not been read**, and branches
**have not been pushed**. Every result above is a local replay of what the workflows define
(`.github/workflows/ci.yml` in both repos), not a green CI run. Do not report CI as green.

## Production Service Catalog

Read live from `GET https://www.carebow.com/api/public/services` (unauthenticated, read-only).
`GET /api/ready` → `{"ready":true}`.

- **All 27 canonical services are present in production**, with pricing model and category
  matching `prisma/mobile-catalog.json` exactly (fixed / packages / hourly / daily / quote).
- **11 extra legacy rows are also published** — all quote-only, all with `cmoptp…` ids from an
  earlier generation, several semantically duplicating a canonical service:

| Legacy row                 | Category         | Duplicates                                    |
| -------------------------- | ---------------- | --------------------------------------------- |
| Doctor Home Visit          | DOCTOR_VISIT     | Doctor Visit (fixed $50)                      |
| Home Nursing Care          | NURSE_CARE       | Expert Home Stay Nurse (packages)             |
| Physiotherapy Session      | PHYSIOTHERAPY    | Physiotherapy (packages)                      |
| Home Blood Test            | LAB_TEST         | Lab Testing (packages)                        |
| Medicine Home Delivery     | PHARMACY         | Medicine Delivery (fixed $5)                  |
| Companion Care             | COMPANION        | Companionship (packages)                      |
| Medical Equipment Rental   | EQUIPMENT_RENTAL | the 9 specific equipment rows                 |
| Yoga for Seniors           | YOGA             | Yoga and Meditation (packages)                |
| Elder Caregiver (Full Day) | CAREGIVER        | Elder care overlaps daily_care rows           |
| Emergency Ambulance        | AMBULANCE        | no canonical equivalent                       |
| Diet Consultation          | MEDITATION       | no canonical equivalent; category looks wrong |

A customer browsing production today sees both a priced canonical service and a quote-only
near-duplicate for the same care. **P1, requires a human decision — no rows were changed.**
The safe remedy is to set `isAvailable = false` on the reviewed duplicates (never delete: they
may be referenced by historical bookings). `prisma/seed-catalog.ts` will not do this; it only
upserts the canonical 27 by slug and contains no delete.

Not verifiable through the public endpoint: `slug` values, rows with `isAvailable = false`, and
rows whose pricing is malformed (all three are filtered out server-side before the response).
Those need a database session.

## Notifications

| Piece                                             | State                                                                                                                        |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Local / scheduled notifications (Notifee)         | ✅ real                                                                                                                      |
| In-app notification inbox (`Notification` table)  | ✅ real                                                                                                                      |
| `POST/DELETE /v1/auth/device-token` backend route | ✅ exists, upserts and deletes `DeviceToken`                                                                                 |
| `deviceTokenApi` client in mobile                 | 🔴 exists but has **zero call sites**                                                                                        |
| APNs / FCM SDK in mobile                          | 🔴 absent — only `@notifee/react-native`; no `getToken`, `getAPNSToken`, `registerDeviceForRemoteMessages`, `onTokenRefresh` |
| Backend sender to APNs / FCM                      | 🔴 absent — the only match for `fcm`/`apns`/`firebase-admin` in `src/` is a comment                                          |

**`DeviceToken` is a write-only sink: nothing writes to it from the app and nothing reads it to
send.** Local notifications firing on a phone is not remote push. Completing this means adding a
messaging SDK, APNs certificates/entitlements, an FCM project, and a backend sender with
credentials — a standalone integration, not a finishing touch.

→ **P2 / launch-decision required.** Do not mark push complete.

## Cross-Platform E2E Matrix

**Partially executed.** `carebow-main/e2e/` drives the real Next.js server against a real
PostgreSQL database over HTTP, with a real JWT on `/api/v1/*` and a real session cookie on
the web routes. **18 / 18 checks passed.** Full log with canonical IDs:
`carebow-main/docs/WEB_MOBILE_E2E_EVIDENCE.md`.

| Scenario                                         | Status | Proven                                                                                                                                                                                                      |
| ------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A/B — same Booking across mobile and web         | ✅     | identical id / profile / service / status / schedule                                                                                                                                                        |
| G — reschedule parity                            | ✅     | same Booking id, web sees the mobile move, no duplicate row, provider released, CONFIRMED and custom jobs return requiresOperations, terminal states refused, stranger 404, past time 400, retry idempotent |
| H — profile parity                               | ✅     | web-side edit read back through the mobile route on the same Profile id                                                                                                                                     |
| I — access revocation                            | ✅     | granted family account reads the shared CareRequest; after revocation it can neither read it nor act on the Booking                                                                                         |
| C — CareRequest identity                         | 🟡     | server-generated cuid proven; Ask CareBow phrasing on a handset not run                                                                                                                                     |
| D — quote → approve → Razorpay → webhook         | ⚠️     | needs Razorpay TEST keys + operations account                                                                                                                                                               |
| E — materialize custom care → provider lifecycle | ⚠️     | needs provider/ops accounts on a running stack                                                                                                                                                              |
| F — cancel + refund parity                       | ⚠️     | needs Razorpay TEST keys                                                                                                                                                                                    |
| Payment chaos matrix (16 cases)                  | ⚠️     | needs Razorpay TEST keys                                                                                                                                                                                    |

What this does **not** establish: behaviour on a physical device, anything through Razorpay
or its webhooks, and anything about production data.

## Production Catalog — classified

Production publishes 38 services; all 27 canonical rows are present and correct. The 11
extras are one legacy `cmoptp…` batch, all quote-priced, surviving because `Service.slug`
is nullable and the seed upserts strictly by slug. Seven are unambiguous duplicates of a
canonical service; four need a product decision. Full classification and a tested,
reversible remedy (`isAvailable=false`, never delete) live in
`carebow-main/docs/PRODUCTION_CATALOG_RECONCILIATION.md` and
`carebow-main/scripts/catalog-deprecate-legacy-duplicates.sql`.
⚠️ Not executed against production — needs a DB session.

## P0

None open from this pass.

## P1

- **Provider fulfilment is web-only.** No `/api/v1/*` route constructs a provider actor, so
  a provider using the mobile app cannot accept, start or complete a job. The lifecycle
  itself is proven over the web transport.
- Production catalog: 7 duplicate rows still published; remedy scripted and tested against a
  reproduction of production, **awaiting production DB execution**.
- Razorpay-API half of the payment matrix unexecuted (order/link creation, outbound refunds).
- The four ambiguous legacy services are decided: equipment catch-all, full-day caregiver
  and ambulance are kept as intentional offerings; Diet Consultation is kept but was
  mis-categorised as `MEDITATION`, which maps to `YOGA_INSTRUCTOR`. A `DIETITIAN` service
  category now exists backend-side; the **production row is still `MEDITATION`** and needs
  the same DB session as the duplicate hide.

### Closed this pass

- **GitHub CI is read and green.** Both branches are pushed. Backend
  `ask-carebow-core-hardening-20260902` (PR #136, draft) is green on all five CI jobs plus
  Runtime Image; mobile `audit/web-mobile-parity` (PR #130, draft) is green on Lint & Type
  Check, Test and Security Audit.
- **Mobile release builds now build, and CI now runs them.** They had been gated to pushes
  on `main`, so no release build was ever validated before merge — a PR could be green on
  lint and tests and still break `assembleRelease` or `xcodebuild -configuration Release`,
  with the failure only appearing after landing. Both were proven locally on this branch
  first, then the gate was removed:

  | Build                                                    | Result                          | Artifact                                                      |
  | -------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------- |
  | Android `assembleRelease`, local `keystore.properties`   | ✅ `BUILD SUCCESSFUL in 2m 28s` | 61 MB APK signed `CN=CareBow`                                 |
  | Android `assembleRelease`, CI ephemeral env-var keystore | ✅ `BUILD SUCCESSFUL in 48s`    | same APK signed `CN=CI` — proves the branch CI actually takes |
  | iOS `xcodebuild -configuration Release`                  | ✅ `** BUILD SUCCEEDED **`      | `CareBow.app` (Release-iphonesimulator)                       |

  Both signing paths were exercised deliberately: `build.gradle` prefers
  `keystore.properties` over the environment, so a local run silently uses the real upload
  key and never touches the code path CI depends on.

  Cost note: `build-ios` runs on `macos-latest`, billed at 10x minutes, on every PR to
  `main`/`develop`. `needs: [lint, test]` short-circuits it when the cheap checks fail. If
  that is too expensive, add a paths filter to the iOS job rather than restoring main-only.

- **Payment chaos matrix, webhook side: 7/7.** It found a real defect — the care-request
  capture re-checked patient access only at order creation, so a payer who lost access
  mid-checkout still got a `CONFIRMED` request. Fixed and regression-guarded.
- **Provider/operations continuity proven end to end: 12/12**, over the web transport.
- **Post-integration regression: 37/37** across all four suites on a database built from
  scratch.

## P2

- Remote push notifications: launch decision required (above).
- Server conversation history, location/records parity, notification transport evidence.

## P3

- 201 pre-existing mobile lint warnings (console statements, `any`). Not this project's scope.
