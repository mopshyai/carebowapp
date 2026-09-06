# CareBow store privacy submission answers

Audited against the mobile checkout and its production API contract on 2026-08-29.
These answers describe the current binary and enabled server-backed mobile flows.

## Submission boundary

- CareBow collects account identity, patient/family profiles, health context, symptom chat, vitals, safety contacts and check-ins, booking/payment history, and feature-usage records.
- CareBow does not use advertising SDKs, data brokers, cross-app tracking, or the advertising identifier.
- Payment credentials are entered on Razorpay's hosted page. The app and CareBow application storage receive order/payment identifiers, amount, currency, and status, but not card or bank credentials.
- Selected symptom photos stay on-device. The production mobile API rejects image attachments and has no active photo upload path.
- Voice input uses the platform speech-recognition service. CareBow receives the resulting symptom text, not an audio recording.
- Precise location is optional and SOS-only. CareBow currently sends coordinates to the public OpenStreetMap Nominatim reverse-geocoding service and can place the result in a user-initiated SMS. CareBow does not persist those coordinates in its current SOS request, but OSMF states that its service logs API use, including IP address and queries. Treat precise location as collected and shared for Google Play, and as collected for Apple.
- The mobile analytics implementation has only a development console provider. It does not send analytics events to a remote analytics vendor.
- `SENTRY_DSN` is empty in the audited mobile configuration, so Sentry transmission is disabled. See the release gate below before submitting a differently configured archive.

## App Store Connect: App Privacy

### Top-level answers

- Privacy Policy URL: `https://www.carebow.com/privacy`
- User Privacy Choices URL: `https://www.carebow.com/privacy`
- Does this app collect data? **Yes**
- Is any collected data used for tracking? **No**

Select the following data types. For every row, answer **Yes, linked to the user's identity** and **No, not used for tracking**.

| App Store data type               | Purposes to select                                    |
| --------------------------------- | ----------------------------------------------------- |
| Contact Info > Name               | App Functionality                                     |
| Contact Info > Email Address      | App Functionality                                     |
| Contact Info > Phone Number       | App Functionality                                     |
| Health & Fitness > Health         | App Functionality; Analytics; Product Personalization |
| Location > Coarse Location        | App Functionality                                     |
| Location > Precise Location       | App Functionality                                     |
| Sensitive Info > Sensitive Info   | App Functionality; Analytics; Product Personalization |
| User Content > Other User Content | App Functionality; Analytics; Product Personalization |
| Identifiers > User ID             | App Functionality                                     |
| Purchases > Purchase History      | App Functionality                                     |
| Usage Data > Product Interaction  | App Functionality; Analytics                          |
| Other Data > Other Data Types     | App Functionality; Product Personalization            |

Why the less-obvious selections are required:

- **Sensitive Info** covers health conditions that can include pregnancy or disability-related context.
- **Other User Content** covers symptom chat, booking notes, and other free-form care context.
- **Product Interaction** covers server-side Ask CareBow turn metering, safety/check-in actions, and rollout/quality records.
- **Other Data Types** covers date of birth and gender; country is also represented as coarse location.
- **Analytics** applies to the stored Ask CareBow shadow/quality-review records used to evaluate feature safety and quality. It does not mean an advertising analytics SDK is active.

Do **not** select these for the audited build:

- Payment Info — Razorpay collects credentials outside the app and CareBow never receives them.
- Physical Address — addresses are currently stored on-device and the active checkout does not send them.
- Contacts — CareBow does not read the iOS address book; manually entered safety names and numbers are covered by Name and Phone Number.
- Photos or Videos — selected symptom photos are not uploaded.
- Audio Data — iOS speech recognition is an Apple service; CareBow receives only the transcript.
- Emails or Text Messages — the active mobile product has no server-backed person-to-person messaging flow; symptom chat is Other User Content.
- Device ID — the mobile device-token endpoint exists but is not called by this build, and no advertising identifier is collected.
- Crash Data, Performance Data, or Other Diagnostic Data — Sentry is disabled in the audited configuration.

## Google Play Console: Data safety

### Data collection and security

- Does your app collect or share any of the required user data types? **Yes**
- Is all user data collected by your app encrypted in transit? **Yes**
- Do you provide a way for users to request that their data is deleted? **Yes** — in-app authenticated account deletion and `https://www.carebow.com/privacy`.
- Is any data shared with third parties? **Yes** — precise SOS location is sent to public Nominatim, whose own privacy policy says API queries and IP data are logged. Transfers to CareBow's AI, payment, SMS, hosting, and monitoring processors do not count as sharing only while those vendors process solely on CareBow's behalf and instructions.
- Independent security review badge: **No / do not claim**
- Families Policy badge: **No / do not claim** unless the Play target-audience declaration separately includes children and the app has completed Families Policy review.
- UPI badge: **No / do not claim** unless CareBow has current NPCI accreditation for this package.

For each selected data type, use the answers below. `No` under Shared relies only on Google Play's service-provider or user-initiated-transfer exceptions.

| Google Play data type                       | Collected | Shared | Required or optional | Ephemeral | Purposes to select                                                                                          |
| ------------------------------------------- | --------- | ------ | -------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| Location > Approximate location             | Yes       | No     | Required             | No        | App functionality; Fraud prevention, security, and compliance                                               |
| Location > Precise location                 | Yes       | Yes    | Optional             | No        | App functionality                                                                                           |
| Personal info > Name                        | Yes       | No     | Required             | No        | App functionality; Account management                                                                       |
| Personal info > Email address               | Yes       | No     | Required             | No        | App functionality; Developer communications; Fraud prevention, security, and compliance; Account management |
| Personal info > User IDs                    | Yes       | No     | Required             | No        | App functionality; Fraud prevention, security, and compliance; Account management                           |
| Personal info > Phone number                | Yes       | No     | Optional             | No        | App functionality; Account management                                                                       |
| Personal info > Other info                  | Yes       | No     | Required             | No        | App functionality; Personalization; Account management                                                      |
| Financial info > Purchase history           | Yes       | No     | Optional             | No        | App functionality; Account management                                                                       |
| Health and fitness > Health info            | Yes       | No     | Optional             | No        | App functionality; Analytics; Personalization                                                               |
| Messages > Other in-app messages            | Yes       | No     | Optional             | No        | App functionality; Analytics; Personalization                                                               |
| Audio files > Voice or sound recordings     | Yes       | No     | Optional             | No        | App functionality                                                                                           |
| Contacts > Contacts                         | Yes       | No     | Optional             | No        | App functionality                                                                                           |
| App activity > App interactions             | Yes       | No     | Required             | No        | App functionality; Analytics                                                                                |
| App activity > Other user-generated content | Yes       | No     | Optional             | No        | App functionality; Analytics; Personalization                                                               |

Do **not** select these for the audited build:

- Personal info > Address
- Financial info > User payment info, Credit score, or Other financial info
- Photos and videos
- Files and docs
- Emails or SMS/MMS
- Calendar
- In-app search history, Installed apps, Other actions, or Web browsing history
- Crash logs, Diagnostics, or Other app performance data
- Device or other IDs

## Release gates that change the answers

Re-run the privacy submission audit before upload if any gate below changes:

1. If the submitted release sets `SENTRY_DSN`, add Apple **Crash Data**, **Performance Data**, and **Other Diagnostic Data** as not linked/not tracked for App Functionality. Add Google **Crash logs** and **Diagnostics** as collected, not shared, required, non-ephemeral, for Analytics.
2. If remote push-token registration is wired, add Apple **Device ID** and Google **Device or other IDs**.
3. If symptom-image upload is enabled, add Apple **Photos or Videos** and Google **Photos**; health-purpose images may also remain Health Info.
4. If booking/service addresses begin leaving the device, add Apple **Physical Address** and Google **Address**.
5. If CareBow replaces public Nominatim with a processor contract that acts only on CareBow's instructions, Google Precise location can change from Shared **Yes** to **No**. It remains Collected unless the provider processes it ephemerally and Google Play's ephemeral criteria are met.
6. If any AI/payment/SMS/monitoring vendor uses app data for its own purposes rather than solely as CareBow's service provider, mark the affected Google data types as Shared.
7. Before submission, update the public privacy policy to identify OpenStreetMap Nominatim and its query/IP logging. The current live policy names the other major providers but not this direct mobile transfer.

Xcode's generated privacy report also aggregates static manifests from bundled SDKs. In this checkout, `react-native-image-picker` declares Photos or Videos even though CareBow does not transmit the selected images, and Sentry declares diagnostics even while its DSN is empty. Do not copy those static vendor declarations into the store forms as actual collection for this build. Update or patch the dependency manifest, or enable and disclose the corresponding data flow, if App Store validation requires the generated report and the store answers to match exactly.

## Code-to-declaration evidence

| Flow                         | Current behavior                                                                                                                                 | Store impact                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Auth and region              | Email/password, account ID, IP/user agent security logs, name/phone, country and CDN country detection                                           | Email, User IDs, Name, Phone, Approximate/Coarse location, Other info                  |
| Profiles and vitals          | DOB, gender, relationship, conditions, allergies, medications, blood group, vitals                                                               | Health, Sensitive Info, Other info/Other Data Types                                    |
| Ask CareBow                  | Symptom/chat text and profile context persist server-side and may be processed by configured AI providers; quality shadow logs are retained      | Health, Other in-app messages/Other User Content, App interactions/Product Interaction |
| Safety                       | Manually entered emergency contacts and check-in settings sync to CareBow; precise location is optional and reverse-geocoded by public Nominatim | Name, Phone, Contacts, Precise location                                                |
| Bookings and hosted checkout | Service/profile/schedule/notes and order/payment status persist; payment credentials stay on Razorpay's page                                     | Purchase history, Other user-generated content; no Payment Info                        |
| Photos                       | Picker returns local file URIs; production API rejects attachments                                                                               | Not collected                                                                          |
| Analytics and diagnostics    | Remote analytics absent; Sentry disabled while DSN is empty                                                                                      | No diagnostics in audited answers; conditional release gate applies                    |
