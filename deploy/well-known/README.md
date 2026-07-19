# Deep-link server files for carebow.com (Hostinger VPS)

Upload both files to the web root so they're served at:

- `https://www.carebow.com/.well-known/assetlinks.json`
- `https://www.carebow.com/.well-known/apple-app-site-association`

Both must return HTTP 200 with `Content-Type: application/json` and **no redirect**
(serve on the `www` host directly). For the Next.js app on the VPS, place them in
`public/.well-known/` and redeploy — Next serves `public/` files at the site root.

## assetlinks.json (Android App Links)

Removes the "open with" chooser: emailed `https://www.carebow.com/verify-email?token=...`
links then open the CareBow app directly on Android 12+.

⚠️ The current SHA-256 fingerprint is the **debug keystore** (`android/app/debug.keystore`).
Before a Play Store release, append the release key's fingerprint:

```bash
keytool -list -v -keystore <release.keystore> -alias <alias> | grep SHA256
```

(Play App Signing: copy the fingerprint from Play Console → Setup → App integrity.)

After uploading, force re-verification on a device:

```bash
adb shell pm verify-app-links --re-verify com.carebow
adb shell pm get-app-links com.carebow   # should show "verified"
```

## apple-app-site-association (iOS Universal Links)

⚠️ Replace `TEAMID` with the real Apple Developer Team ID (Xcode → Signing & Capabilities,
or developer.apple.com → Membership). No team is configured in the Xcode project yet.

Also required in Xcode (one-time):
1. Target CareBow → Signing & Capabilities → + Capability → **Associated Domains**
2. Add: `applinks:www.carebow.com` and `applinks:carebow.com`
3. Rebuild the app.

Note: the file is served **without** a `.json` extension — configure the server to still
send `Content-Type: application/json` for it.

## Verify after upload

```bash
curl -si https://www.carebow.com/.well-known/assetlinks.json | head -5
curl -si https://www.carebow.com/.well-known/apple-app-site-association | head -5
```

Both should be 200, JSON, no redirect. Apple's CDN check:
https://app-site-association.cdn-apple.com/a/v1/www.carebow.com
