# CareBow source inventories

Generated from inspected source on 2026-09-06. Presence is not proof of execution. Web integration base: 2a59ce3; mobile base: 0d9384b.

## API handlers

| Route                                                             | Methods                  | Auth references                        | Source                                                                              |
| ----------------------------------------------------------------- | ------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------- |
| /api/admin/admins                                                 | GET, POST, PATCH, DELETE | getCurrentUser                         | `src/app/api/admin/admins/route.ts`                                                 |
| /api/admin/ai-config/keys                                         | POST                     | getCurrentUser, requireAdmin           | `src/app/api/admin/ai-config/keys/route.ts`                                         |
| /api/admin/ai-config                                              | GET, PUT                 | getCurrentUser, requireAdmin           | `src/app/api/admin/ai-config/route.ts`                                              |
| /api/admin/alerts                                                 | GET                      | getCurrentUser                         | `src/app/api/admin/alerts/route.ts`                                                 |
| /api/admin/analytics                                              | GET                      | getCurrentUser                         | `src/app/api/admin/analytics/route.ts`                                              |
| /api/admin/ask-carebow/brain-status                               | GET                      | getCurrentUser                         | `src/app/api/admin/ask-carebow/brain-status/route.ts`                               |
| /api/admin/audit-logs                                             | GET                      | getCurrentUser                         | `src/app/api/admin/audit-logs/route.ts`                                             |
| /api/admin/backfill-auth-methods                                  | POST                     | inspect handler                        | `src/app/api/admin/backfill-auth-methods/route.ts`                                  |
| /api/admin/bookings/[bookingId]/operations                        | GET                      | getCurrentUser                         | `src/app/api/admin/bookings/[bookingId]/operations/route.ts`                        |
| /api/admin/bookings                                               | GET, PATCH               | getCurrentUser                         | `src/app/api/admin/bookings/route.ts`                                               |
| /api/admin/care-requests/fulfillment                              | GET, POST                | getCurrentUser                         | `src/app/api/admin/care-requests/fulfillment/route.ts`                              |
| /api/admin/care-requests                                          | GET, PATCH               | getCurrentUser                         | `src/app/api/admin/care-requests/route.ts`                                          |
| /api/admin/care-requests/summary                                  | GET                      | getCurrentUser                         | `src/app/api/admin/care-requests/summary/route.ts`                                  |
| /api/admin/clinical-escalations                                   | GET                      | getCurrentUser                         | `src/app/api/admin/clinical-escalations/route.ts`                                   |
| /api/admin/clinician-review/next                                  | GET                      | getCurrentUser                         | `src/app/api/admin/clinician-review/next/route.ts`                                  |
| /api/admin/clinician-review                                       | POST                     | getCurrentUser                         | `src/app/api/admin/clinician-review/route.ts`                                       |
| /api/admin/clinician-review/summary                               | GET                      | getCurrentUser                         | `src/app/api/admin/clinician-review/summary/route.ts`                               |
| /api/admin/config                                                 | GET, PATCH               | getCurrentUser                         | `src/app/api/admin/config/route.ts`                                                 |
| /api/admin/email-config                                           | GET, PUT                 | getCurrentUser                         | `src/app/api/admin/email-config/route.ts`                                           |
| /api/admin/email-templates                                        | GET, POST, PUT, DELETE   | getCurrentUser                         | `src/app/api/admin/email-templates/route.ts`                                        |
| /api/admin/files                                                  | GET, POST, PUT, DELETE   | getCurrentUser                         | `src/app/api/admin/files/route.ts`                                                  |
| /api/admin/manage-services                                        | GET, POST, PUT           | getCurrentUser                         | `src/app/api/admin/manage-services/route.ts`                                        |
| /api/admin/providers/[userId]/credentials/[credentialId]/download | GET                      | getCurrentUser                         | `src/app/api/admin/providers/[userId]/credentials/[credentialId]/download/route.ts` |
| /api/admin/providers/[userId]/credentials                         | GET, PATCH               | getCurrentUser                         | `src/app/api/admin/providers/[userId]/credentials/route.ts`                         |
| /api/admin/providers/[userId]/verification                        | POST                     | getCurrentUser                         | `src/app/api/admin/providers/[userId]/verification/route.ts`                        |
| /api/admin/providers/[userId]/verification-readiness              | GET                      | getCurrentUser                         | `src/app/api/admin/providers/[userId]/verification-readiness/route.ts`              |
| /api/admin/providers/review                                       | GET                      | getCurrentUser                         | `src/app/api/admin/providers/review/route.ts`                                       |
| /api/admin/rag/status                                             | GET                      | getCurrentUser                         | `src/app/api/admin/rag/status/route.ts`                                             |
| /api/admin/services                                               | GET, POST, PATCH         | getCurrentUser                         | `src/app/api/admin/services/route.ts`                                               |
| /api/admin/stats                                                  | GET                      | getCurrentUser                         | `src/app/api/admin/stats/route.ts`                                                  |
| /api/admin/system-config                                          | GET, PUT                 | getCurrentUser                         | `src/app/api/admin/system-config/route.ts`                                          |
| /api/admin/users                                                  | GET, PATCH, DELETE       | getCurrentUser                         | `src/app/api/admin/users/route.ts`                                                  |
| /api/ask-carebow/message                                          | POST                     | requireV1Auth                          | `src/app/api/ask-carebow/message/route.ts`                                          |
| /api/ask-carebow/trial                                            | POST                     | getCurrentUser                         | `src/app/api/ask-carebow/trial/route.ts`                                            |
| /api/auth/2fa/disable                                             | POST                     | getCurrentUser                         | `src/app/api/auth/2fa/disable/route.ts`                                             |
| /api/auth/2fa/enable                                              | GET, POST                | getCurrentUser                         | `src/app/api/auth/2fa/enable/route.ts`                                              |
| /api/auth/access-list                                             | GET                      | getCurrentUser                         | `src/app/api/auth/access-list/route.ts`                                             |
| /api/auth/enabled-methods                                         | GET                      | inspect handler                        | `src/app/api/auth/enabled-methods/route.ts`                                         |
| /api/auth/login                                                   | POST                     | inspect handler                        | `src/app/api/auth/login/route.ts`                                                   |
| /api/auth/logout                                                  | POST                     | inspect handler                        | `src/app/api/auth/logout/route.ts`                                                  |
| /api/auth/me                                                      | GET                      | getCurrentUser                         | `src/app/api/auth/me/route.ts`                                                      |
| /api/auth/methods                                                 | GET, POST                | getCurrentUser                         | `src/app/api/auth/methods/route.ts`                                                 |
| /api/auth/methods/send-verify                                     | POST                     | getCurrentUser                         | `src/app/api/auth/methods/send-verify/route.ts`                                     |
| /api/auth/methods/verify                                          | POST                     | getCurrentUser                         | `src/app/api/auth/methods/verify/route.ts`                                          |
| /api/auth/oauth/[provider]/callback                               | GET                      | getCurrentUser                         | `src/app/api/auth/oauth/[provider]/callback/route.ts`                               |
| /api/auth/oauth/[provider]                                        | GET                      | inspect handler                        | `src/app/api/auth/oauth/[provider]/route.ts`                                        |
| /api/auth/onboarding                                              | POST, GET                | getCurrentUser                         | `src/app/api/auth/onboarding/route.ts`                                              |
| /api/auth/password/setup                                          | POST                     | getCurrentUser                         | `src/app/api/auth/password/setup/route.ts`                                          |
| /api/auth/reset-password/confirm                                  | POST                     | inspect handler                        | `src/app/api/auth/reset-password/confirm/route.ts`                                  |
| /api/auth/reset-password/request                                  | POST                     | inspect handler                        | `src/app/api/auth/reset-password/request/route.ts`                                  |
| /api/auth/sessions/[id]                                           | DELETE                   | getCurrentUser                         | `src/app/api/auth/sessions/[id]/route.ts`                                           |
| /api/auth/sessions                                                | GET, DELETE              | getCurrentUser                         | `src/app/api/auth/sessions/route.ts`                                                |
| /api/auth/signup                                                  | POST                     | inspect handler                        | `src/app/api/auth/signup/route.ts`                                                  |
| /api/auth/update-profile                                          | POST                     | getCurrentUser                         | `src/app/api/auth/update-profile/route.ts`                                          |
| /api/auth/verify-email                                            | POST                     | inspect handler                        | `src/app/api/auth/verify-email/route.ts`                                            |
| /api/auth/verify-session                                          | GET                      | inspect handler                        | `src/app/api/auth/verify-session/route.ts`                                          |
| /api/bookings/[bookingId]/cancel                                  | POST                     | getCurrentUser                         | `src/app/api/bookings/[bookingId]/cancel/route.ts`                                  |
| /api/bookings/[bookingId]/rate                                    | POST                     | getCurrentUser                         | `src/app/api/bookings/[bookingId]/rate/route.ts`                                    |
| /api/bookings/[bookingId]                                         | GET                      | getCurrentUser                         | `src/app/api/bookings/[bookingId]/route.ts`                                         |
| /api/bookings                                                     | GET, POST                | getCurrentUser                         | `src/app/api/bookings/route.ts`                                                     |
| /api/chat/care-requests                                           | GET, PATCH               | assertProfileAccess, getChatAuthedUser | `src/app/api/chat/care-requests/route.ts`                                           |
| /api/chat/checkout-intents                                        | GET, PATCH               | assertProfileAccess, getChatAuthedUser | `src/app/api/chat/checkout-intents/route.ts`                                        |
| /api/chat/checkout-options                                        | GET                      | assertProfileAccess, getCurrentUser    | `src/app/api/chat/checkout-options/route.ts`                                        |
| /api/chat/clinical-escalations                                    | GET                      | getChatAuthedUser                      | `src/app/api/chat/clinical-escalations/route.ts`                                    |
| /api/chat/preflight                                               | GET, POST, PATCH         | getChatAuthedUser                      | `src/app/api/chat/preflight/route.ts`                                               |
| /api/chat/proactive-open                                          | POST                     | assertProfileAccess, getCurrentUser    | `src/app/api/chat/proactive-open/route.ts`                                          |
| /api/chat/sessions/[sessionId]/follow-up-outcome                  | POST                     | assertProfileAccess, getChatAuthedUser | `src/app/api/chat/sessions/[sessionId]/follow-up-outcome/route.ts`                  |
| /api/chat/sessions/[sessionId]/messages                           | POST                     | assertProfileAccess, getChatAuthedUser | `src/app/api/chat/sessions/[sessionId]/messages/route.ts`                           |
| /api/chat/sessions/[sessionId]                                    | GET, PATCH               | assertProfileAccess, getChatAuthedUser | `src/app/api/chat/sessions/[sessionId]/route.ts`                                    |
| /api/chat/sessions                                                | GET, POST                | assertProfileAccess, getChatAuthedUser | `src/app/api/chat/sessions/route.ts`                                                |
| /api/check-ins                                                    | GET, POST                | assertProfileAccess, getCurrentUser    | `src/app/api/check-ins/route.ts`                                                    |
| /api/contact                                                      | POST                     | inspect handler                        | `src/app/api/contact/route.ts`                                                      |
| /api/cron/daily                                                   | GET                      | inspect handler                        | `src/app/api/cron/daily/route.ts`                                                   |
| /api/cron/dispatch                                                | GET                      | inspect handler                        | `src/app/api/cron/dispatch/route.ts`                                                |
| /api/cron/weekly                                                  | GET                      | inspect handler                        | `src/app/api/cron/weekly/route.ts`                                                  |
| /api/dashboard/customer                                           | GET                      | getCurrentUser                         | `src/app/api/dashboard/customer/route.ts`                                           |
| /api/dashboard/org-admin                                          | GET                      | getCurrentUser                         | `src/app/api/dashboard/org-admin/route.ts`                                          |
| /api/dashboard/org-member                                         | GET                      | getCurrentUser                         | `src/app/api/dashboard/org-member/route.ts`                                         |
| /api/documents                                                    | GET, POST                | assertProfileAccess, getCurrentUser    | `src/app/api/documents/route.ts`                                                    |
| /api/emergency/contacts                                           | GET, POST, PUT, DELETE   | getCurrentUser                         | `src/app/api/emergency/contacts/route.ts`                                           |
| /api/emergency/sos/[sosEventId]                                   | PATCH                    | getCurrentUser                         | `src/app/api/emergency/sos/[sosEventId]/route.ts`                                   |
| /api/emergency/sos                                                | GET, POST                | getCurrentUser                         | `src/app/api/emergency/sos/route.ts`                                                |
| /api/health                                                       | GET                      | inspect handler                        | `src/app/api/health/route.ts`                                                       |
| /api/inventory                                                    | GET, POST, PATCH, DELETE | getCurrentUser                         | `src/app/api/inventory/route.ts`                                                    |
| /api/medications/[medicationId]                                   | DELETE                   | getCurrentUser                         | `src/app/api/medications/[medicationId]/route.ts`                                   |
| /api/medications                                                  | GET, POST                | assertProfileAccess, getCurrentUser    | `src/app/api/medications/route.ts`                                                  |
| /api/member/active-trips                                          | GET, PATCH               | getCurrentUser                         | `src/app/api/member/active-trips/route.ts`                                          |
| /api/member/assigned-orders                                       | GET, PATCH               | getCurrentUser                         | `src/app/api/member/assigned-orders/route.ts`                                       |
| /api/member/assigned-tests                                        | GET, PATCH               | getCurrentUser                         | `src/app/api/member/assigned-tests/route.ts`                                        |
| /api/member/assignments                                           | GET, PATCH               | getCurrentUser                         | `src/app/api/member/assignments/route.ts`                                           |
| /api/member/availability/[slotId]                                 | PATCH, DELETE            | getCurrentUser                         | `src/app/api/member/availability/[slotId]/route.ts`                                 |
| /api/member/availability                                          | GET, POST                | getCurrentUser                         | `src/app/api/member/availability/route.ts`                                          |
| /api/member/bookings/[bookingId]                                  | GET, PATCH               | getCurrentUser                         | `src/app/api/member/bookings/[bookingId]/route.ts`                                  |
| /api/member/bookings                                              | GET                      | getCurrentUser                         | `src/app/api/member/bookings/route.ts`                                              |
| /api/member/care-logs                                             | GET, POST                | getCurrentUser                         | `src/app/api/member/care-logs/route.ts`                                             |
| /api/member/client-progress                                       | GET                      | getCurrentUser                         | `src/app/api/member/client-progress/route.ts`                                       |
| /api/member/consultation-notes                                    | GET, POST                | getCurrentUser                         | `src/app/api/member/consultation-notes/route.ts`                                    |
| /api/member/daily-care-logs                                       | GET, POST                | getCurrentUser                         | `src/app/api/member/daily-care-logs/route.ts`                                       |
| /api/member/earnings                                              | GET                      | getCurrentUser                         | `src/app/api/member/earnings/route.ts`                                              |
| /api/member/exercise-plans                                        | GET, POST, PATCH         | getCurrentUser                         | `src/app/api/member/exercise-plans/route.ts`                                        |
| /api/member/fleet                                                 | GET, POST, PATCH         | getCurrentUser                         | `src/app/api/member/fleet/route.ts`                                                 |
| /api/member/inventory                                             | GET, POST, PATCH         | getCurrentUser                         | `src/app/api/member/inventory/route.ts`                                             |
| /api/member/lab-inventory                                         | GET                      | getCurrentUser                         | `src/app/api/member/lab-inventory/route.ts`                                         |
| /api/member/overview                                              | GET                      | getCurrentUser                         | `src/app/api/member/overview/route.ts`                                              |
| /api/member/patients/[profileId]/ai-summary                       | POST                     | getCurrentUser                         | `src/app/api/member/patients/[profileId]/ai-summary/route.ts`                       |
| /api/member/patients/[profileId]                                  | GET                      | getCurrentUser                         | `src/app/api/member/patients/[profileId]/route.ts`                                  |
| /api/member/patients                                              | GET                      | getCurrentUser                         | `src/app/api/member/patients/route.ts`                                              |
| /api/member/prescriptions                                         | GET, POST                | getCurrentUser                         | `src/app/api/member/prescriptions/route.ts`                                         |
| /api/member/profile                                               | GET, PATCH               | getCurrentUser                         | `src/app/api/member/profile/route.ts`                                               |
| /api/member/rental-orders                                         | GET, PATCH               | getCurrentUser                         | `src/app/api/member/rental-orders/route.ts`                                         |
| /api/member/vitals                                                | GET, POST                | getCurrentUser                         | `src/app/api/member/vitals/route.ts`                                                |
| /api/member/vitals-log                                            | GET, POST                | getCurrentUser                         | `src/app/api/member/vitals-log/route.ts`                                            |
| /api/member/wellness-plans                                        | GET, POST, PATCH         | getCurrentUser                         | `src/app/api/member/wellness-plans/route.ts`                                        |
| /api/member/wellness-sessions                                     | GET, PATCH               | getCurrentUser                         | `src/app/api/member/wellness-sessions/route.ts`                                     |
| /api/notifications                                                | GET, PATCH               | getCurrentUser                         | `src/app/api/notifications/route.ts`                                                |
| /api/org-admin/analytics                                          | GET                      | getCurrentUser                         | `src/app/api/org-admin/analytics/route.ts`                                          |
| /api/org-admin/bookings                                           | GET                      | getCurrentUser                         | `src/app/api/org-admin/bookings/route.ts`                                           |
| /api/org-admin/members/[memberId]                                 | PATCH, DELETE            | getCurrentUser                         | `src/app/api/org-admin/members/[memberId]/route.ts`                                 |
| /api/org-admin/members                                            | GET, POST                | getCurrentUser                         | `src/app/api/org-admin/members/route.ts`                                            |
| /api/org-admin/plans                                              | GET                      | getCurrentUser                         | `src/app/api/org-admin/plans/route.ts`                                              |
| /api/org-admin                                                    | GET, POST, PATCH         | getCurrentUser                         | `src/app/api/org-admin/route.ts`                                                    |
| /api/org-features                                                 | GET                      | inspect handler                        | `src/app/api/org-features/route.ts`                                                 |
| /api/organisations/[orgId]/analytics                              | GET                      | getCurrentUser                         | `src/app/api/organisations/[orgId]/analytics/route.ts`                              |
| /api/organisations/[orgId]/bookings                               | GET                      | getCurrentUser                         | `src/app/api/organisations/[orgId]/bookings/route.ts`                               |
| /api/organisations/[orgId]/features                               | GET, PATCH               | getCurrentUser                         | `src/app/api/organisations/[orgId]/features/route.ts`                               |
| /api/organisations/[orgId]/members/[memberId]                     | GET, PATCH, DELETE       | getCurrentUser                         | `src/app/api/organisations/[orgId]/members/[memberId]/route.ts`                     |
| /api/organisations/[orgId]/members/invite                         | POST                     | getCurrentUser                         | `src/app/api/organisations/[orgId]/members/invite/route.ts`                         |
| /api/organisations/[orgId]/members                                | GET, POST                | getCurrentUser                         | `src/app/api/organisations/[orgId]/members/route.ts`                                |
| /api/organisations/[orgId]                                        | GET, PATCH, DELETE       | getCurrentUser                         | `src/app/api/organisations/[orgId]/route.ts`                                        |
| /api/organisations/accept-invite                                  | POST                     | inspect handler                        | `src/app/api/organisations/accept-invite/route.ts`                                  |
| /api/organisations/features                                       | GET, PATCH               | getCurrentUser                         | `src/app/api/organisations/features/route.ts`                                       |
| /api/organisations                                                | GET, POST                | getCurrentUser                         | `src/app/api/organisations/route.ts`                                                |
| /api/organisations/slug/[slug]                                    | GET                      | getCurrentUser                         | `src/app/api/organisations/slug/[slug]/route.ts`                                    |
| /api/payment/ask-carebow-booking-order                            | POST                     | assertProfileAccess, getCurrentUser    | `src/app/api/payment/ask-carebow-booking-order/route.ts`                            |
| /api/payment/booking-order                                        | POST, PATCH              | getCurrentUser                         | `src/app/api/payment/booking-order/route.ts`                                        |
| /api/payment/care-request-order                                   | POST, PATCH              | getCurrentUser                         | `src/app/api/payment/care-request-order/route.ts`                                   |
| /api/payment/create-order                                         | POST                     | getCurrentUser                         | `src/app/api/payment/create-order/route.ts`                                         |
| /api/payment/verify                                               | POST                     | getCurrentUser                         | `src/app/api/payment/verify/route.ts`                                               |
| /api/payment/webhook                                              | POST                     | inspect handler                        | `src/app/api/payment/webhook/route.ts`                                              |
| /api/plans/[type]                                                 | GET                      | getCurrentUser                         | `src/app/api/plans/[type]/route.ts`                                                 |
| /api/profiles/[profileId]                                         | GET, PUT, DELETE         | assertProfileAccess, getCurrentUser    | `src/app/api/profiles/[profileId]/route.ts`                                         |
| /api/profiles/[profileId]/share                                   | POST, DELETE             | getCurrentUser                         | `src/app/api/profiles/[profileId]/share/route.ts`                                   |
| /api/profiles                                                     | GET, POST                | getCurrentUser                         | `src/app/api/profiles/route.ts`                                                     |
| /api/provider/bookings                                            | GET, PATCH               | getCurrentUser                         | `src/app/api/provider/bookings/route.ts`                                            |
| /api/provider/credentials                                         | GET, POST, DELETE        | getCurrentUser                         | `src/app/api/provider/credentials/route.ts`                                         |
| /api/provider/onboarding-status                                   | GET                      | getCurrentUser                         | `src/app/api/provider/onboarding-status/route.ts`                                   |
| /api/provider/profile                                             | GET, PUT                 | getCurrentUser                         | `src/app/api/provider/profile/route.ts`                                             |
| /api/provider/stats                                               | GET                      | getCurrentUser                         | `src/app/api/provider/stats/route.ts`                                               |
| /api/public/organisations/[slug]                                  | GET                      | inspect handler                        | `src/app/api/public/organisations/[slug]/route.ts`                                  |
| /api/public/organisations                                         | GET                      | inspect handler                        | `src/app/api/public/organisations/route.ts`                                         |
| /api/public/services                                              | GET                      | getCurrentUser                         | `src/app/api/public/services/route.ts`                                              |
| /api/ready                                                        | GET                      | inspect handler                        | `src/app/api/ready/route.ts`                                                        |
| /api/region                                                       | GET, PUT                 | getCurrentUser                         | `src/app/api/region/route.ts`                                                       |
| /api/.                                                            | GET                      | inspect handler                        | `src/app/api/route.ts`                                                              |
| /api/services                                                     | GET                      | getCurrentUser                         | `src/app/api/services/route.ts`                                                     |
| /api/storage/files/[id]/download                                  | GET                      | getCurrentUser                         | `src/app/api/storage/files/[id]/download/route.ts`                                  |
| /api/storage/files                                                | GET, DELETE              | getCurrentUser                         | `src/app/api/storage/files/route.ts`                                                |
| /api/storage/upload                                               | POST                     | getCurrentUser                         | `src/app/api/storage/upload/route.ts`                                               |
| /api/support/conversations/[id]/messages                          | GET, POST                | requireV1Auth                          | `src/app/api/support/conversations/[id]/messages/route.ts`                          |
| /api/support/conversations                                        | GET, POST                | requireV1Auth                          | `src/app/api/support/conversations/route.ts`                                        |
| /api/user/invoices                                                | GET                      | getCurrentUser                         | `src/app/api/user/invoices/route.ts`                                                |
| /api/user/notification-preferences                                | GET, PATCH               | getCurrentUser                         | `src/app/api/user/notification-preferences/route.ts`                                |
| /api/user/profile                                                 | GET, PATCH               | getCurrentUser                         | `src/app/api/user/profile/route.ts`                                                 |
| /api/v1/ask-carebow/entitlement                                   | GET, POST                | requireV1Auth                          | `src/app/api/v1/ask-carebow/entitlement/route.ts`                                   |
| /api/v1/auth/2fa/disable                                          | POST                     | requireV1Auth                          | `src/app/api/v1/auth/2fa/disable/route.ts`                                          |
| /api/v1/auth/2fa/enable                                           | GET, POST                | requireV1Auth                          | `src/app/api/v1/auth/2fa/enable/route.ts`                                           |
| /api/v1/auth/2fa/verify                                           | POST                     | inspect handler                        | `src/app/api/v1/auth/2fa/verify/route.ts`                                           |
| /api/v1/auth/apple                                                | POST                     | inspect handler                        | `src/app/api/v1/auth/apple/route.ts`                                                |
| /api/v1/auth/change-password                                      | POST                     | requireV1Auth                          | `src/app/api/v1/auth/change-password/route.ts`                                      |
| /api/v1/auth/delete-account                                       | POST                     | requireV1Auth                          | `src/app/api/v1/auth/delete-account/route.ts`                                       |
| /api/v1/auth/device-token                                         | POST, DELETE             | requireV1Auth                          | `src/app/api/v1/auth/device-token/route.ts`                                         |
| /api/v1/auth/forgot                                               | POST                     | inspect handler                        | `src/app/api/v1/auth/forgot/route.ts`                                               |
| /api/v1/auth/google                                               | POST                     | inspect handler                        | `src/app/api/v1/auth/google/route.ts`                                               |
| /api/v1/auth/login                                                | POST                     | inspect handler                        | `src/app/api/v1/auth/login/route.ts`                                                |
| /api/v1/auth/logout                                               | POST                     | requireV1Auth                          | `src/app/api/v1/auth/logout/route.ts`                                               |
| /api/v1/auth/me                                                   | GET                      | requireV1Auth                          | `src/app/api/v1/auth/me/route.ts`                                                   |
| /api/v1/auth/preferences                                          | GET, PATCH               | requireV1Auth                          | `src/app/api/v1/auth/preferences/route.ts`                                          |
| /api/v1/auth/refresh                                              | POST                     | inspect handler                        | `src/app/api/v1/auth/refresh/route.ts`                                              |
| /api/v1/auth/resend-verification                                  | POST                     | inspect handler                        | `src/app/api/v1/auth/resend-verification/route.ts`                                  |
| /api/v1/auth/reset                                                | POST                     | inspect handler                        | `src/app/api/v1/auth/reset/route.ts`                                                |
| /api/v1/auth/sessions/[id]                                        | DELETE                   | requireV1Auth                          | `src/app/api/v1/auth/sessions/[id]/route.ts`                                        |
| /api/v1/auth/sessions                                             | GET                      | requireV1Auth                          | `src/app/api/v1/auth/sessions/route.ts`                                             |
| /api/v1/auth/signup                                               | POST                     | inspect handler                        | `src/app/api/v1/auth/signup/route.ts`                                               |
| /api/v1/auth/update-profile                                       | PATCH                    | requireV1Auth                          | `src/app/api/v1/auth/update-profile/route.ts`                                       |
| /api/v1/auth/verify                                               | POST                     | inspect handler                        | `src/app/api/v1/auth/verify/route.ts`                                               |
| /api/v1/bookings/[bookingId]/cancel                               | POST                     | requireV1Auth                          | `src/app/api/v1/bookings/[bookingId]/cancel/route.ts`                               |
| /api/v1/bookings/[bookingId]                                      | GET                      | requireV1Auth                          | `src/app/api/v1/bookings/[bookingId]/route.ts`                                      |
| /api/v1/bookings                                                  | GET, POST                | requireV1Auth                          | `src/app/api/v1/bookings/route.ts`                                                  |
| /api/v1/dev/verify-org                                            | POST                     | requireV1Auth                          | `src/app/api/v1/dev/verify-org/route.ts`                                            |
| /api/v1/documents                                                 | GET, POST, DELETE        | assertProfileAccess, requireV1Auth     | `src/app/api/v1/documents/route.ts`                                                 |
| /api/v1/files/[id]/url                                            | GET                      | requireV1Auth                          | `src/app/api/v1/files/[id]/url/route.ts`                                            |
| /api/v1/fx                                                        | GET                      | inspect handler                        | `src/app/api/v1/fx/route.ts`                                                        |
| /api/v1/inventory                                                 | GET, POST, PATCH, DELETE | requireV1Auth                          | `src/app/api/v1/inventory/route.ts`                                                 |
| /api/v1/member/overview                                           | GET                      | requireV1Auth                          | `src/app/api/v1/member/overview/route.ts`                                           |
| /api/v1/member/profile                                            | GET, PATCH               | requireV1Auth                          | `src/app/api/v1/member/profile/route.ts`                                            |
| /api/v1/notifications                                             | GET, PATCH               | requireV1Auth                          | `src/app/api/v1/notifications/route.ts`                                             |
| /api/v1/org/analytics                                             | GET                      | requireV1Auth                          | `src/app/api/v1/org/analytics/route.ts`                                             |
| /api/v1/org/bookings                                              | GET                      | requireV1Auth                          | `src/app/api/v1/org/bookings/route.ts`                                              |
| /api/v1/org/members/[memberId]                                    | PATCH, DELETE            | requireV1Auth                          | `src/app/api/v1/org/members/[memberId]/route.ts`                                    |
| /api/v1/org/members                                               | GET, POST                | requireV1Auth                          | `src/app/api/v1/org/members/route.ts`                                               |
| /api/v1/org/plans                                                 | GET                      | requireV1Auth                          | `src/app/api/v1/org/plans/route.ts`                                                 |
| /api/v1/org                                                       | GET, POST, PATCH         | requireV1Auth                          | `src/app/api/v1/org/route.ts`                                                       |
| /api/v1/payments/[orderId]/status                                 | GET                      | requireV1Auth                          | `src/app/api/v1/payments/[orderId]/status/route.ts`                                 |
| /api/v1/payments/booking-order                                    | POST, PATCH              | requireV1Auth                          | `src/app/api/v1/payments/booking-order/route.ts`                                    |
| /api/v1/payments/plan-order                                       | POST, PATCH              | requireV1Auth                          | `src/app/api/v1/payments/plan-order/route.ts`                                       |
| /api/v1/payments                                                  | GET                      | requireV1Auth                          | `src/app/api/v1/payments/route.ts`                                                  |
| /api/v1/plans                                                     | GET                      | requireV1Auth                          | `src/app/api/v1/plans/route.ts`                                                     |
| /api/v1/profiles/[profileId]                                      | GET, PUT, DELETE         | assertProfileAccess, requireV1Auth     | `src/app/api/v1/profiles/[profileId]/route.ts`                                      |
| /api/v1/profiles/[profileId]/share                                | POST, DELETE             | assertProfileAccess, requireV1Auth     | `src/app/api/v1/profiles/[profileId]/share/route.ts`                                |
| /api/v1/profiles                                                  | GET, POST                | requireV1Auth                          | `src/app/api/v1/profiles/route.ts`                                                  |
| /api/v1/provider/profile                                          | GET, PUT                 | requireV1Auth                          | `src/app/api/v1/provider/profile/route.ts`                                          |
| /api/v1/region                                                    | GET, PUT                 | requireV1Auth                          | `src/app/api/v1/region/route.ts`                                                    |
| /api/v1/remedies                                                  | GET                      | assertProfileAccess, requireV1Auth     | `src/app/api/v1/remedies/route.ts`                                                  |
| /api/v1/safety/check-ins                                          | GET, PUT, POST           | requireV1Auth                          | `src/app/api/v1/safety/check-ins/route.ts`                                          |
| /api/v1/safety/contacts                                           | GET, PUT                 | requireV1Auth                          | `src/app/api/v1/safety/contacts/route.ts`                                           |
| /api/v1/safety/sos                                                | POST                     | requireV1Auth                          | `src/app/api/v1/safety/sos/route.ts`                                                |
| /api/v1/services                                                  | GET                      | requireV1Auth                          | `src/app/api/v1/services/route.ts`                                                  |
| /api/v1/vitals                                                    | GET, POST                | assertProfileAccess, requireV1Auth     | `src/app/api/v1/vitals/route.ts`                                                    |
| /api/vitals                                                       | GET, POST                | assertProfileAccess, getCurrentUser    | `src/app/api/vitals/route.ts`                                                       |

## Mobile API callers

- `apps/mobile/src/services/api/endpoints/askCareBow.ts`: `/ask-carebow/message`
- `apps/mobile/src/services/api/endpoints/askCarebowEntitlement.ts`: `/v1/ask-carebow/entitlement`
- `apps/mobile/src/services/api/endpoints/askCarebowOrchestrator.ts`: `/chat/sessions`, `/chat/sessions/${sessionId}/follow-up-outcome`, `/chat/sessions/${sessionId}/messages`
- `apps/mobile/src/services/api/endpoints/auth.ts`: `/v1/auth/change-password`, `/v1/auth/delete-account`, `/v1/auth/forgot`, `/v1/auth/login`, `/v1/auth/logout`, `/v1/auth/me`, `/v1/auth/resend-verification`, `/v1/auth/reset`, `/v1/auth/signup`, `/v1/auth/update-profile`, `/v1/auth/verify`
- `apps/mobile/src/services/api/endpoints/deviceToken.ts`: `/v1/auth/device-token`
- `apps/mobile/src/services/api/endpoints/index.ts`:
- `apps/mobile/src/services/api/endpoints/inventory.ts`: `/v1/inventory`
- `apps/mobile/src/services/api/endpoints/member.ts`: `/v1/bookings`, `/v1/bookings/${bookingId}`, `/v1/bookings/${bookingId}/cancel`, `/v1/member/overview`, `/v1/provider/profile`
- `apps/mobile/src/services/api/endpoints/notifications.ts`: `/v1/notifications`
- `apps/mobile/src/services/api/endpoints/payments.ts`: `/v1/payments`, `/v1/payments/${encodeURIComponent(orderId)}/status`, `/v1/payments/booking-order`, `/v1/payments/plan-order`, `/v1/plans`, `/v1/plans?type=${encodeURIComponent(type)}`
- `apps/mobile/src/services/api/endpoints/preferences.ts`: `/v1/auth/preferences`
- `apps/mobile/src/services/api/endpoints/profiles.ts`: `/v1/profiles`, `/v1/profiles/${profileId}`, `/v1/profiles/${profileId}/share`
- `apps/mobile/src/services/api/endpoints/region.ts`: `/v1/region`
- `apps/mobile/src/services/api/endpoints/remedies.ts`: `/v1/remedies`
- `apps/mobile/src/services/api/endpoints/safety.ts`: `/v1/safety/check-ins`, `/v1/safety/contacts`, `/v1/safety/sos`
- `apps/mobile/src/services/api/endpoints/services.ts`: `/v1/services`
- `apps/mobile/src/services/api/endpoints/vitals.ts`: `/v1/vitals`

## Database models and enums

- model `AmbulanceVehicle` — `prisma/models/ambulance.prisma`
- model `AskCarebowBookingLink` — `prisma/models/ask_carebow_booking_links.prisma`
- model `AskCarebowCheckoutIntent` — `prisma/models/ask_carebow_checkout.prisma`
- model `AskCarebowClinicalEscalation` — `prisma/models/ask_carebow_clinical_escalations.prisma`
- model `CareRequestBookingLink` — `prisma/models/care_request_booking_links.prisma`
- model `CareRequest` — `prisma/models/care_requests.prisma`
- enum `ProviderCredentialReviewStatus` — `prisma/models/provider_credentials.prisma`
- model `ProviderCredentialDocument` — `prisma/models/provider_credentials.prisma`
- model `ExercisePlan` — `prisma/models/rehabilitation.prisma`
- model `BookingRequestDetail` — `prisma/models/service_requests.prisma`
- model `BookingFulfillmentLink` — `prisma/models/service_requests.prisma`
- model `WellnessPlan` — `prisma/models/wellness.prisma`
- model `SystemConfig` — `prisma/schema.prisma`
- model `User` — `prisma/schema.prisma`
- model `UserAccessProfile` — `prisma/schema.prisma`
- enum `MainType` — `prisma/schema.prisma`
- model `AuthMethod` — `prisma/schema.prisma`
- enum `AuthMethodType` — `prisma/schema.prisma`
- model `UserMetadata` — `prisma/schema.prisma`
- model `Session` — `prisma/schema.prisma`
- model `OAuthAccount` — `prisma/schema.prisma`
- model `VerificationToken` — `prisma/schema.prisma`
- enum `TokenType` — `prisma/schema.prisma`
- model `File` — `prisma/schema.prisma`
- enum `FileType` — `prisma/schema.prisma`
- model `Payment` — `prisma/schema.prisma`
- enum `PaymentStatus` — `prisma/schema.prisma`
- model `EmailTemplate` — `prisma/schema.prisma`
- model `RefreshToken` — `prisma/schema.prisma`
- model `DeviceToken` — `prisma/schema.prisma`
- model `RateLimitEvent` — `prisma/schema.prisma`
- model `LoginAttempt` — `prisma/schema.prisma`
- model `UserPreferences` — `prisma/schema.prisma`
- model `AuditLog` — `prisma/schema.prisma`
- model `Profile` — `prisma/schema.prisma`
- model `ProfileAccess` — `prisma/schema.prisma`
- model `ChatSession` — `prisma/schema.prisma`
- model `ChatSessionSummary` — `prisma/schema.prisma`
- model `ChatMessage` — `prisma/schema.prisma`
- model `AskCarebowShadowLog` — `prisma/schema.prisma`
- model `AskCarebowClinicianReview` — `prisma/schema.prisma`
- model `Vital` — `prisma/schema.prisma`
- model `CheckIn` — `prisma/schema.prisma`
- model `EmergencyContact` — `prisma/schema.prisma`
- model `SOSEvent` — `prisma/schema.prisma`
- enum `DispatchChannel` — `prisma/schema.prisma`
- enum `DispatchStatus` — `prisma/schema.prisma`
- model `SOSDispatch` — `prisma/schema.prisma`
- model `Service` — `prisma/schema.prisma`
- model `Booking` — `prisma/schema.prisma`
- model `Document` — `prisma/schema.prisma`
- model `MedicationReminder` — `prisma/schema.prisma`
- model `ProviderProfile` — `prisma/schema.prisma`
- model `Notification` — `prisma/schema.prisma`
- model `SupportConversation` — `prisma/schema.prisma`
- model `SupportMessage` — `prisma/schema.prisma`
- enum `SupportConversationStatus` — `prisma/schema.prisma`
- model `InventoryItem` — `prisma/schema.prisma`
- model `ProactiveTrigger` — `prisma/schema.prisma`
- model `ProfilePattern` — `prisma/schema.prisma`
- enum `Gender` — `prisma/schema.prisma`
- enum `AccessLevel` — `prisma/schema.prisma`
- enum `UrgencyLevel` — `prisma/schema.prisma`
- enum `RiskLevel` — `prisma/schema.prisma`
- enum `MessageRole` — `prisma/schema.prisma`
- enum `ChatStatus` — `prisma/schema.prisma`
- enum `VitalType` — `prisma/schema.prisma`
- enum `CheckInStatus` — `prisma/schema.prisma`
- enum `ServiceCategory` — `prisma/schema.prisma`
- enum `BookingStatus` — `prisma/schema.prisma`
- enum `DocumentType` — `prisma/schema.prisma`
- enum `ProviderType` — `prisma/schema.prisma`
- enum `NotificationType` — `prisma/schema.prisma`
- model `Organisation` — `prisma/schema.prisma`
- model `OrgMember` — `prisma/schema.prisma`
- enum `OrgMemberRole` — `prisma/schema.prisma`
- model `ConsultationNote` — `prisma/schema.prisma`
- model `Prescription` — `prisma/schema.prisma`
- model `MemberAvailability` — `prisma/schema.prisma`
- enum `LabResultStatus` — `prisma/schema.prisma`
- enum `TripStatus` — `prisma/schema.prisma`
- enum `FulfillmentStatus` — `prisma/schema.prisma`
- model `LabResult` — `prisma/schema.prisma`
- model `MedicineOrder` — `prisma/schema.prisma`
- model `MedicineOrderItem` — `prisma/schema.prisma`
- model `RentalOrder` — `prisma/schema.prisma`
- model `AmbulanceTrip` — `prisma/schema.prisma`
- model `CareLog` — `prisma/schema.prisma`

## Canonical seeded services

```json
{
  "categories": [
    {
      "id": "personal_companion",
      "title": "Personal Companion",
      "serviceIds": ["companionship", "dynamic_transportation"]
    },
    {
      "id": "daily_care",
      "title": "Daily Care Services",
      "serviceIds": ["gourmet_food", "deep_cleaning", "culturaspire", "athome_barber"]
    },
    {
      "id": "health_care",
      "title": "Health Care",
      "serviceIds": [
        "yoga",
        "home_nurse",
        "transactional_care",
        "physiotherapy",
        "doctor_visit",
        "lab_testing",
        "healthcheck"
      ]
    },
    {
      "id": "special_packages",
      "title": "Special Packages",
      "serviceIds": [
        "cardiac_package",
        "oncology_package",
        "neuro_package",
        "cardiac_basic",
        "ortho_package"
      ]
    },
    {
      "id": "medical_devices",
      "title": "Medical Devices at Home",
      "serviceIds": [
        "oxygen_concentrator",
        "bpap",
        "cpap",
        "medical_cot_single",
        "medical_cot_two",
        "alfa_bed",
        "cardiac_monitor",
        "syringe_pump",
        "medicine_delivery"
      ]
    }
  ],
  "services": [
    {
      "id": "companionship",
      "title": "Companionship",
      "categoryId": "personal_companion",
      "rating": 4.6,
      "reviewCount": 22,
      "image": "companionship",
      "shortTagline": "Friendly companionship for your loved ones",
      "description": "Our companionship service provides meaningful social interaction and emotional support for seniors. Our trained companions engage in conversations, accompany on walks, assist with hobbies, and provide the human connection that enhances quality of life.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "Background-Verified Staff",
          "description": "Every staff member undergoes thorough background verification for your peace of mind."
        },
        {
          "title": "Friendly & Compassionate",
          "description": "Our team is selected for their warmth, patience, and genuine care."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "comp_4hr",
            "label": "4 Hours",
            "price": 20,
            "durationMinutes": 240
          },
          {
            "id": "comp_8hr",
            "label": "8 Hours",
            "price": 40,
            "durationMinutes": 480
          },
          {
            "id": "comp_12hr",
            "label": "12 Hours",
            "price": 60,
            "originalPrice": 72,
            "durationMinutes": 720,
            "notes": "17% off"
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "duration",
        "defaultDurationMinutes": 240,
        "availableTimeSlots": [
          "06:00",
          "06:30",
          "07:00",
          "07:30",
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
          "20:30",
          "21:00"
        ],
        "leadTimeHours": 2,
        "maxDaysAhead": 30
      },
      "request": {
        "enabled": true,
        "required": false,
        "placeholder": "Any specific activities or preferences for the companion session..."
      }
    },
    {
      "id": "dynamic_transportation",
      "title": "Dynamic Transportation",
      "categoryId": "personal_companion",
      "rating": 4.5,
      "reviewCount": 18,
      "image": "transport",
      "shortTagline": "Safe and comfortable transportation",
      "description": "Our transportation service ensures safe, comfortable, and reliable travel for seniors. Whether it's a doctor's appointment, shopping trip, or social visit, our trained drivers provide door-to-door service.",
      "benefits": [
        {
          "title": "Background-Verified Staff",
          "description": "Every staff member undergoes thorough background verification for your peace of mind."
        },
        {
          "title": "Friendly & Compassionate",
          "description": "Our team is selected for their warmth, patience, and genuine care."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        },
        {
          "title": "Convenient Pick-Up and Drop-Off",
          "description": "We provide safe and comfortable transportation to and from your destination."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "hourly",
        "hourlyRate": 15,
        "minHours": 1,
        "maxHours": 8
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": [
          "06:00",
          "06:30",
          "07:00",
          "07:30",
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
          "20:30",
          "21:00"
        ],
        "leadTimeHours": 4,
        "maxDaysAhead": 14
      },
      "request": {
        "enabled": true,
        "required": false,
        "placeholder": "Please specify pickup location, destination, and any special requirements..."
      }
    },
    {
      "id": "gourmet_food",
      "title": "Gourmet Food Delivery",
      "categoryId": "daily_care",
      "rating": 4.5,
      "reviewCount": 31,
      "image": "food",
      "shortTagline": "Healthy, delicious meals delivered daily",
      "description": "Our gourmet food service provides nutritionally balanced, delicious meals tailored to senior dietary needs. Our expert nutritionists design menus that accommodate health conditions.",
      "benefits": [
        {
          "title": "Customized Meal Plans",
          "description": "Meals designed around your specific health needs and taste preferences."
        },
        {
          "title": "Fresh Daily Delivery",
          "description": "Freshly prepared meals delivered to your doorstep every day."
        },
        {
          "title": "Expert Nutritionist Oversight",
          "description": "All menus are reviewed and approved by certified nutritionists."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "daily",
        "dailyRate": 25,
        "minDays": 7,
        "maxDays": 30
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "timeMode": "start_only",
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      },
      "request": {
        "enabled": true,
        "required": true,
        "placeholder": "Please describe dietary requirements, allergies, preferred cuisine, and any health conditions..."
      }
    },
    {
      "id": "deep_cleaning",
      "title": "Comprehensive Deep-Cleaning",
      "categoryId": "daily_care",
      "rating": 5,
      "reviewCount": 45,
      "image": "cleaning",
      "shortTagline": "Thorough home cleaning services",
      "description": "Our deep-cleaning service goes beyond regular cleaning to ensure a spotless, hygienic living environment. We use senior-safe, eco-friendly products.",
      "benefits": [
        {
          "title": "Eco-Friendly Products",
          "description": "We use only safe, non-toxic cleaning products suitable for seniors."
        },
        {
          "title": "Background-Verified Staff",
          "description": "Every staff member undergoes thorough background verification for your peace of mind."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "hourly",
        "hourlyRate": 20,
        "minHours": 2,
        "maxHours": 8
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "duration",
        "defaultDurationMinutes": 180,
        "availableTimeSlots": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
        "leadTimeHours": 24,
        "maxDaysAhead": 14
      },
      "request": {
        "enabled": true,
        "required": false,
        "placeholder": "Any specific areas to focus on or special cleaning requirements..."
      }
    },
    {
      "id": "culturaspire",
      "title": "Culturaspire",
      "categoryId": "daily_care",
      "rating": 4.5,
      "reviewCount": 12,
      "image": "culture",
      "shortTagline": "Cultural activities and enrichment programs",
      "description": "Culturaspire brings enriching cultural experiences to seniors. From music sessions and art classes to book clubs and cultural discussions, we help seniors stay mentally active and socially engaged.",
      "benefits": [
        {
          "title": "Personalized Programs",
          "description": "Activities tailored to individual interests and abilities."
        },
        {
          "title": "Expert Facilitators",
          "description": "Led by trained professionals in arts, music, and cultural studies."
        },
        {
          "title": "Friendly & Compassionate",
          "description": "Our team is selected for their warmth, patience, and genuine care."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        }
      ],
      "fulfillment": {
        "mode": "on_request",
        "requiresPayment": false,
        "allowBookingFee": true
      },
      "pricing": {
        "type": "quote",
        "bookingFee": 25
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "duration",
        "defaultDurationMinutes": 120,
        "availableTimeSlots": [
          "06:00",
          "06:30",
          "07:00",
          "07:30",
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
          "20:30",
          "21:00"
        ],
        "leadTimeHours": 48,
        "maxDaysAhead": 30
      },
      "request": {
        "enabled": true,
        "required": true,
        "placeholder": "Tell us about your interests - music, art, literature, languages, or other cultural activities you'd like to explore..."
      }
    },
    {
      "id": "athome_barber",
      "title": "AtHome Barber Services",
      "categoryId": "daily_care",
      "rating": 4.5,
      "reviewCount": 28,
      "image": "barber",
      "shortTagline": "Professional grooming at your doorstep",
      "description": "Our at-home barber service brings professional grooming right to your door. Our experienced barbers are trained to work with seniors.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "Background-Verified Staff",
          "description": "Every staff member undergoes thorough background verification for your peace of mind."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 35,
        "originalPrice": 40
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        "leadTimeHours": 4,
        "maxDaysAhead": 14
      },
      "request": {
        "enabled": true,
        "required": false,
        "placeholder": "Any specific grooming preferences or requirements..."
      }
    },
    {
      "id": "yoga",
      "title": "Yoga and Meditation",
      "categoryId": "health_care",
      "rating": 4.7,
      "reviewCount": 34,
      "image": "yoga",
      "shortTagline": "Gentle yoga and meditation for seniors",
      "description": "Our yoga and meditation service offers gentle, age-appropriate practices designed specifically for seniors. Our certified instructors focus on improving flexibility, balance, and mental well-being.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        },
        {
          "title": "Senior-Adapted Practices",
          "description": "All exercises are modified for safety and accessibility."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "yoga_single",
            "label": "Single Session (1 hour)",
            "price": 30,
            "durationMinutes": 60
          },
          {
            "id": "yoga_weekly",
            "label": "Weekly Package (4 sessions)",
            "price": 100,
            "originalPrice": 120,
            "notes": "17% off"
          },
          {
            "id": "yoga_monthly",
            "label": "Monthly Package (12 sessions)",
            "price": 270,
            "originalPrice": 360,
            "notes": "25% off"
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["06:00", "07:00", "08:00", "17:00", "18:00", "19:00"],
        "leadTimeHours": 12,
        "maxDaysAhead": 30
      },
      "request": {
        "enabled": true,
        "required": false,
        "placeholder": "Any physical limitations or specific focus areas (flexibility, stress relief, etc.)..."
      }
    },
    {
      "id": "home_nurse",
      "title": "Expert Home Stay Nurse",
      "categoryId": "health_care",
      "rating": 4.8,
      "reviewCount": 67,
      "image": "nurse",
      "shortTagline": "Professional nursing care at home",
      "description": "Our Expert Home Stay Nurse service provides qualified nursing professionals who deliver medical care in the comfort of your home. From medication management and vital sign monitoring to wound care and post-operative support.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "Background-Verified Staff",
          "description": "Every staff member undergoes thorough background verification for your peace of mind."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Medical Expertise",
          "description": "All nurses are registered professionals with specialized geriatric training."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "nurse_home_12",
            "label": "Home Aid - 12 hrs/day, 30 days",
            "price": 360,
            "durationMinutes": 720,
            "notes": "Basic assistance"
          },
          {
            "id": "nurse_home_24",
            "label": "Home Aid - 24 hrs/day, 30 days",
            "price": 450,
            "durationMinutes": 1440,
            "notes": "Round-the-clock"
          },
          {
            "id": "nurse_basic_12",
            "label": "Basic Nursing - 12 hrs/day",
            "price": 375,
            "durationMinutes": 720
          },
          {
            "id": "nurse_basic_24",
            "label": "Basic Nursing - 24 hrs/day",
            "price": 550,
            "originalPrice": 600,
            "durationMinutes": 1440,
            "notes": "8% off"
          },
          {
            "id": "nurse_advanced",
            "label": "Advanced Nursing - 12 hrs/day",
            "price": 500,
            "durationMinutes": 720,
            "notes": "Complex care"
          },
          {
            "id": "nurse_critical",
            "label": "Critical Care - 12 hrs/day",
            "price": 750,
            "durationMinutes": 720,
            "notes": "ICU-trained nurses"
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["06:00", "07:00", "08:00", "09:00", "18:00", "19:00", "20:00"],
        "leadTimeHours": 24,
        "maxDaysAhead": 60
      },
      "request": {
        "enabled": true,
        "required": true,
        "placeholder": "Please describe the patient condition, required care level, and any medical history we should know..."
      }
    },
    {
      "id": "transactional_care",
      "title": "Transactional Care",
      "categoryId": "health_care",
      "rating": 5,
      "reviewCount": 18,
      "image": "transactional_care",
      "shortTagline": "On-demand medical assistance",
      "description": "Quick, one-time medical care services for immediate needs. Our trained professionals provide essential care support when you need it most.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "Background-Verified Staff",
          "description": "Every staff member undergoes thorough background verification for your peace of mind."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "trans_basic",
            "label": "Basic Visit",
            "price": 25,
            "durationMinutes": 60
          },
          {
            "id": "trans_extended",
            "label": "Extended Care",
            "price": 45,
            "durationMinutes": 120
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": [
          "06:00",
          "06:30",
          "07:00",
          "07:30",
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
          "20:30",
          "21:00"
        ],
        "leadTimeHours": 2,
        "maxDaysAhead": 7
      }
    },
    {
      "id": "physiotherapy",
      "title": "Physiotherapy",
      "categoryId": "health_care",
      "rating": 4.7,
      "reviewCount": 52,
      "image": "physio",
      "shortTagline": "Expert physiotherapy at home",
      "description": "Our physiotherapy service brings qualified therapists to your home for rehabilitation, pain management, and mobility improvement.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Customized Treatment Plans",
          "description": "Therapy programs tailored to your specific needs and goals."
        },
        {
          "title": "Progress Tracking",
          "description": "Regular assessments to monitor improvement and adjust treatment."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "physio_single",
            "label": "Single Session (45 min)",
            "price": 45,
            "durationMinutes": 45
          },
          {
            "id": "physio_5pack",
            "label": "5 Session Package",
            "price": 200,
            "originalPrice": 225,
            "notes": "11% off"
          },
          {
            "id": "physio_10pack",
            "label": "10 Session Package",
            "price": 360,
            "originalPrice": 450,
            "notes": "20% off"
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": [
          "06:00",
          "06:30",
          "07:00",
          "07:30",
          "08:00",
          "08:30",
          "09:00",
          "09:30",
          "10:00",
          "10:30",
          "11:00",
          "11:30",
          "12:00",
          "12:30",
          "13:00",
          "13:30",
          "14:00",
          "14:30",
          "15:00",
          "15:30",
          "16:00",
          "16:30",
          "17:00",
          "17:30",
          "18:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
          "20:30",
          "21:00"
        ],
        "leadTimeHours": 12,
        "maxDaysAhead": 30
      },
      "request": {
        "enabled": true,
        "required": true,
        "placeholder": "Please describe the condition requiring therapy, any previous treatments, and your goals..."
      }
    },
    {
      "id": "doctor_visit",
      "title": "Doctor Visit",
      "categoryId": "health_care",
      "rating": 4.6,
      "reviewCount": 89,
      "image": "doctor",
      "shortTagline": "Qualified doctors at your doorstep",
      "description": "Our Doctor Visit service brings qualified physicians to your home for consultations, check-ups, and follow-up visits. Skip the hassle of hospital queues.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        },
        {
          "title": "Comprehensive Consultations",
          "description": "Thorough examinations with prescription and follow-up recommendations."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 50
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        "leadTimeHours": 4,
        "maxDaysAhead": 14
      },
      "request": {
        "enabled": true,
        "required": false,
        "placeholder": "Describe symptoms or reason for consultation..."
      }
    },
    {
      "id": "lab_testing",
      "title": "Lab Testing",
      "categoryId": "health_care",
      "rating": 4.5,
      "reviewCount": 56,
      "image": "lab",
      "shortTagline": "Home sample collection & lab tests",
      "description": "Our lab testing service provides convenient home sample collection for a wide range of diagnostic tests. Our trained phlebotomists ensure comfortable sample collection.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Quick Results",
          "description": "Most test results available within 24-48 hours."
        },
        {
          "title": "Digital Reports",
          "description": "Access your reports online or receive them via email."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "lab_basic",
            "label": "Basic Health Panel",
            "price": 45,
            "notes": "CBC, Sugar, Lipid"
          },
          {
            "id": "lab_comprehensive",
            "label": "Comprehensive Panel",
            "price": 120,
            "originalPrice": 150,
            "notes": "20% off - 40+ parameters"
          },
          {
            "id": "lab_diabetes",
            "label": "Diabetes Panel",
            "price": 35,
            "notes": "HbA1c, Fasting, PP"
          },
          {
            "id": "lab_thyroid",
            "label": "Thyroid Panel",
            "price": 40,
            "notes": "T3, T4, TSH"
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00"],
        "leadTimeHours": 12,
        "maxDaysAhead": 14
      },
      "request": {
        "enabled": true,
        "required": false,
        "placeholder": "Any specific tests required or doctor prescription details..."
      }
    },
    {
      "id": "healthcheck",
      "title": "HealthCheck Visit",
      "categoryId": "health_care",
      "rating": 4.5,
      "reviewCount": 41,
      "image": "healthcheck",
      "shortTagline": "Comprehensive health assessments at home",
      "description": "Our HealthCheck Visit service provides thorough health assessments conducted at your home. Our medical team evaluates vital signs, reviews medications, and provides recommendations.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Detailed Health Report",
          "description": "Receive a comprehensive report with findings and recommendations."
        },
        {
          "title": "Care Plan Development",
          "description": "Personalized care recommendations based on assessment results."
        }
      ],
      "fulfillment": {
        "mode": "on_request",
        "requiresPayment": false,
        "allowBookingFee": false
      },
      "pricing": {
        "type": "quote"
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_end",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      },
      "request": {
        "enabled": true,
        "required": true,
        "placeholder": "Please describe any specific health concerns, current medications, and areas to focus on..."
      }
    },
    {
      "id": "cardiac_package",
      "title": "Cardiac Package",
      "categoryId": "special_packages",
      "rating": 5,
      "reviewCount": 24,
      "image": "cardiac_package",
      "shortTagline": "Comprehensive cardiac care package",
      "description": "Complete cardiac health monitoring and care package including ECG, heart health checkup, medication management, and regular follow-ups.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 199,
        "originalPrice": 249
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "oncology_package",
      "title": "Oncology Package",
      "categoryId": "special_packages",
      "rating": 4.5,
      "reviewCount": 12,
      "image": "oncology_package",
      "shortTagline": "Specialized oncology support care",
      "description": "Comprehensive oncology care package with specialized nursing, medication management, pain management support, and emotional care.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 299,
        "originalPrice": 349
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "neuro_package",
      "title": "Neuro Package",
      "categoryId": "special_packages",
      "rating": 4.5,
      "reviewCount": 15,
      "image": "neuro_package",
      "shortTagline": "Neurological care and rehabilitation",
      "description": "Specialized neurological care package including cognitive assessments, rehabilitation exercises, and ongoing monitoring.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 249,
        "originalPrice": 299
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "cardiac_basic",
      "title": "Cardiac Basic",
      "categoryId": "special_packages",
      "rating": 4.5,
      "reviewCount": 32,
      "image": "cardiac_basic",
      "shortTagline": "Essential cardiac monitoring",
      "description": "Basic cardiac health monitoring package with ECG and vital signs tracking.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 79,
        "originalPrice": 99
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        "leadTimeHours": 12,
        "maxDaysAhead": 14
      }
    },
    {
      "id": "ortho_package",
      "title": "Ortho Package",
      "categoryId": "special_packages",
      "rating": 4.5,
      "reviewCount": 19,
      "image": "ortho_package",
      "shortTagline": "Orthopedic care and support",
      "description": "Complete orthopedic care package including mobility assessment, physiotherapy, and pain management.",
      "benefits": [
        {
          "title": "Certified Professional Care",
          "description": "All our caregivers are trained and certified professionals with extensive experience."
        },
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Flexible Scheduling",
          "description": "Choose times that work best for you with our flexible booking system."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 179,
        "originalPrice": 219
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": true,
        "timeMode": "start_only",
        "availableTimeSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "oxygen_concentrator",
      "title": "Oxygen Concentrator",
      "categoryId": "medical_devices",
      "rating": 4.5,
      "reviewCount": 28,
      "image": "oxygen_concentrator",
      "shortTagline": "Medical-grade oxygen therapy at home",
      "description": "Rent medical-grade oxygen concentrators for home use with setup assistance and 24/7 technical support.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        },
        {
          "title": "Installation Included",
          "description": "Professional setup and training included."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "oxy_week",
            "label": "Weekly Rental",
            "price": 50,
            "durationMinutes": 10080
          },
          {
            "id": "oxy_month",
            "label": "Monthly Rental",
            "price": 150,
            "originalPrice": 200,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "bpap",
      "title": "BPAP",
      "categoryId": "medical_devices",
      "rating": 4.5,
      "reviewCount": 16,
      "image": "bpap",
      "shortTagline": "Bilevel positive airway pressure device",
      "description": "BPAP machine rental for respiratory support with professional setup and monitoring.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "bpap_week",
            "label": "Weekly Rental",
            "price": 75,
            "durationMinutes": 10080
          },
          {
            "id": "bpap_month",
            "label": "Monthly Rental",
            "price": 200,
            "originalPrice": 300,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "cpap",
      "title": "CPAP",
      "categoryId": "medical_devices",
      "rating": 4.5,
      "reviewCount": 22,
      "image": "cpap",
      "shortTagline": "Continuous positive airway pressure device",
      "description": "CPAP machine rental for sleep apnea treatment with professional setup and support.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "cpap_week",
            "label": "Weekly Rental",
            "price": 60,
            "durationMinutes": 10080
          },
          {
            "id": "cpap_month",
            "label": "Monthly Rental",
            "price": 180,
            "originalPrice": 240,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "medical_cot_single",
      "title": "Medical Cot Single Function",
      "categoryId": "medical_devices",
      "rating": 4.5,
      "reviewCount": 14,
      "image": "medical_cot_single",
      "shortTagline": "Single-function hospital bed rental",
      "description": "Single-function medical cot for home care with adjustable head position.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Delivery & Setup",
          "description": "Free delivery and professional setup included."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "cot1_week",
            "label": "Weekly Rental",
            "price": 40,
            "durationMinutes": 10080
          },
          {
            "id": "cot1_month",
            "label": "Monthly Rental",
            "price": 120,
            "originalPrice": 160,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 48,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "medical_cot_two",
      "title": "Medical Cot Two Function",
      "categoryId": "medical_devices",
      "rating": 4.5,
      "reviewCount": 11,
      "image": "medical_cot_two",
      "shortTagline": "Two-function hospital bed rental",
      "description": "Two-function medical cot with adjustable head and leg positions for enhanced comfort.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Delivery & Setup",
          "description": "Free delivery and professional setup included."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "cot2_week",
            "label": "Weekly Rental",
            "price": 55,
            "durationMinutes": 10080
          },
          {
            "id": "cot2_month",
            "label": "Monthly Rental",
            "price": 160,
            "originalPrice": 220,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 48,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "alfa_bed",
      "title": "Alfa Bed",
      "categoryId": "medical_devices",
      "rating": 5,
      "reviewCount": 9,
      "image": "alfa_bed",
      "shortTagline": "Premium multi-function hospital bed",
      "description": "Premium Alfa bed with multiple adjustable positions, side rails, and IV pole attachment.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        },
        {
          "title": "Premium Quality",
          "description": "Hospital-grade equipment for maximum comfort."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "alfa_week",
            "label": "Weekly Rental",
            "price": 80,
            "durationMinutes": 10080
          },
          {
            "id": "alfa_month",
            "label": "Monthly Rental",
            "price": 250,
            "originalPrice": 320,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 48,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "cardiac_monitor",
      "title": "Cardiac Monitor",
      "categoryId": "medical_devices",
      "rating": 5,
      "reviewCount": 17,
      "image": "cardiac_monitor",
      "shortTagline": "Continuous cardiac monitoring device",
      "description": "Portable cardiac monitor for continuous heart rhythm monitoring at home.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "cm_week",
            "label": "Weekly Rental",
            "price": 45,
            "durationMinutes": 10080
          },
          {
            "id": "cm_month",
            "label": "Monthly Rental",
            "price": 130,
            "originalPrice": 180,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "syringe_pump",
      "title": "Syringe Pump",
      "categoryId": "medical_devices",
      "rating": 4.5,
      "reviewCount": 8,
      "image": "syringe_pump",
      "shortTagline": "Precision medication delivery device",
      "description": "Medical syringe pump for precise medication administration at controlled rates.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "24/7 Support Available",
          "description": "Our support team is available round the clock for any emergencies or queries."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "packages",
        "packages": [
          {
            "id": "sp_week",
            "label": "Weekly Rental",
            "price": 35,
            "durationMinutes": 10080
          },
          {
            "id": "sp_month",
            "label": "Monthly Rental",
            "price": 100,
            "originalPrice": 140,
            "durationMinutes": 43200
          }
        ]
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 24,
        "maxDaysAhead": 30
      }
    },
    {
      "id": "medicine_delivery",
      "title": "Medicine Delivery",
      "categoryId": "medical_devices",
      "rating": 4.5,
      "reviewCount": 45,
      "image": "medicine_delivery",
      "shortTagline": "Doorstep medicine delivery service",
      "description": "Fast and reliable medicine delivery service. Upload prescription and get medicines delivered to your doorstep.",
      "benefits": [
        {
          "title": "At Home Service",
          "description": "All services are delivered at your doorstep, ensuring comfort and convenience."
        },
        {
          "title": "Same Day Delivery",
          "description": "Orders before 2 PM delivered same day."
        },
        {
          "title": "Prescription Upload",
          "description": "Easy prescription upload via app."
        }
      ],
      "fulfillment": {
        "mode": "checkout",
        "requiresPayment": true
      },
      "pricing": {
        "type": "fixed",
        "price": 5,
        "notes": "Delivery fee only. Medicine cost additional."
      },
      "booking": {
        "requiresMember": true,
        "requiresDate": true,
        "requiresTime": false,
        "leadTimeHours": 4,
        "maxDaysAhead": 7
      },
      "request": {
        "enabled": true,
        "required": true,
        "placeholder": "List medicines needed or upload prescription..."
      }
    }
  ]
}
```
