# React Native 0.87 migration evidence

Tracking: #153, draft PR #161. Not release-ready.

## Target matrix

Inspected published npm archives react-native@0.87.1,
@react-native-community/template@0.87.1 and @react-native/gradle-plugin@0.87.1
on 2026-09-08. These values are targets, not completed native upgrades.

| Component              | Target/source                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Node                   | 22.22.0; RN engine requires ^22.13.0, ^24.3.0 or >=26                              |
| React                  | 19.2.3 in official template; RN peer ^19.2.3                                       |
| React Native           | 0.87.1                                                                             |
| CLI                    | 20.2.0 in template                                                                 |
| iOS deployment minimum | 15.1 in RN CocoaPods helpers                                                       |
| Xcode minimum          | 16.1 in RN CocoaPods helpers; local Xcode 26.6 available                           |
| CocoaPods              | Template >=1.13 excluding 1.15.0/1.15.1; resolve with full Ruby bundle constraints |
| Android Gradle Plugin  | 9.2.1 in RN Gradle plugin version catalog                                          |
| Gradle                 | 9.4.1 in template wrapper                                                          |
| JDK                    | 17 toolchain in RN Gradle plugin; local 17.0.18 available                          |
| Kotlin                 | 2.2.0                                                                              |
| Android SDK            | min 24, compile 37, target 36, build tools 37.0.0                                  |
| NDK                    | 27.1.12297006                                                                      |

## Completed

- Dedicated worktree and draft migration PR; parity branch preserved.
- Node 22.22.0 selected for version files, CI, CodeQL and release pipelines.
- Root and mobile engine constraints aligned to Node 22 >=22.13.
- Frozen install under Node 22.22.0 and API boundary check passed.
- actionlint passed for modified workflows.

## Next native batch

Compare native startup and build files against official template; preserve CareBow
module identifiers, payment/auth deep links, permissions and privacy manifests.
Android template replaces ReactNativeHost with ReactHost and loadReactNative.
iOS template uses RCTReactNativeFactory and RCTAppDependencyProvider; current app
uses Objective-C RCTAppDelegate with explicit custom/universal link forwarding.
Do not discard those handlers during migration.

Upgrade RN and React together with version-matched Babel/Metro/CLI packages.
Keep independent native dependency batches and real builds between batches.
Test stack, lint tooling and Sentry upgrades follow the native baseline.
All automated checks and both-platform device smoke evidence remain required.
No native build or device validation has yet been performed for RN 0.87.
