# TODOS

## URGENT: rotate any accounts created by the old /api/admin/run-seed endpoint

**What:** Check the live database for accounts seeded by the now-deleted
`/api/admin/run-seed` endpoint and rotate their passwords. Known hardcoded
credentials from that handler: `SuperAdmin@2024` (super admin),
`Customer@Premium123`, `Client@Enterprise123`.

**Why:** The endpoint was unauthenticated and returned the plaintext credentials
in its response body. Anyone who ever POSTed to it — or found it in a crawl — has
super-admin credentials. Deleting the route stops new accounts being created; it
does nothing about accounts that already exist.

**Context:** Found while executing T3 of the 2026-07-27 engineering review
(`src/app/api/admin/run-seed/route.ts:184-248`, deleted). The endpoint had no
callers anywhere in the codebase, so it may never have been invoked in
production — but that has to be checked, not assumed.

**How to start:** Query for the seeded emails in the live DB. If they exist, check
`LoginAttempt` and `AuditLog` for any activity on them, rotate the passwords, and
revoke their sessions and refresh tokens.

**Depends on:** nothing. Do this before the branch ships.

## Add cursor pagination to nine unbounded `/v1` endpoints

**What:** Add cursor pagination to the `/v1` endpoints that call `findMany` with no
`take`, `skip`, or `cursor`: `bookings`, `documents`, `profiles`, `services`,
`inventory`, `auth/sessions`, `org/members`, `org/analytics`, `safety/sos`
(all under `carebow-main/src/app/api/v1/`).

**Why:** A mobile client on cellular downloads the entire table. An org admin with
800 members waits for all 800; a long-standing customer re-downloads every booking
they have ever made on every screen open. It degrades quietly — fine at 10 rows,
painful at 1,000 — and surfaces as "the app is slow" with no obvious cause.

**Pros:** Bounded response size and predictable latency. Also caps server memory,
since Prisma materializes the full result set before serializing.

**Cons:** Every calling screen needs infinite-scroll or a load-more control, so this
is a mobile UI change as much as an API change. Cursor pagination is a breaking
response-shape change for existing clients.

**Context:** Found in the performance section of the 2026-07-27 engineering review.
None of the nine has any limit today. Org endpoints are most urgent — member lists
grow fastest. Start with `v1/bookings`: it backs `OrdersScreen`, the most frequently
opened list in the app.

**Depends on / blocked by:** Nothing blocking. Easier after the shared-domain-service
extraction, since the pagination helper can live in the service layer and be applied
once per domain instead of once per transport.

**Trigger to schedule:** before onboarding any org customer with a large member roster.
