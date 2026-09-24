import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UIKit

/// Owns the application window and React Native runtime under the UIScene
/// lifecycle required by iOS 27 when building with the latest SDK.
///
/// CareBow is currently on React Native 0.87.1, whose factory/linking APIs
/// predate the newer scene-specific helpers. Keep this adapter on the 0.87.1
/// API surface until the RN upgrade that introduces those helpers.
final class SceneDelegate: RCTDefaultReactNativeFactoryDelegate, UIWindowSceneDelegate {
  var window: UIWindow?
  private var reactNativeFactory: RCTReactNativeFactory?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else {
      return
    }

    dependencyProvider = RCTAppDependencyProvider()

    let factory = RCTReactNativeFactory(delegate: self)
    reactNativeFactory = factory

    let window = UIWindow(windowScene: windowScene)
    self.window = window

    // RN 0.87.1 uses the launchOptions overload. The connectionOptions-aware
    // overload landed later, so scene URLs/user activities are forwarded to
    // RCTLinkingManager below after the React Native runtime is started.
    factory.startReactNative(
      withModuleName: "CareBow",
      in: window,
      launchOptions: nil
    )

    forwardInitialConnectionOptions(connectionOptions)
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      _ = RCTLinkingManager.application(
        UIApplication.shared,
        open: context.url,
        options: [:]
      )
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = RCTLinkingManager.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }

  private func forwardInitialConnectionOptions(_ connectionOptions: UIScene.ConnectionOptions) {
    for context in connectionOptions.urlContexts {
      _ = RCTLinkingManager.application(
        UIApplication.shared,
        open: context.url,
        options: [:]
      )
    }

    for userActivity in connectionOptions.userActivities {
      _ = RCTLinkingManager.application(
        UIApplication.shared,
        continue: userActivity,
        restorationHandler: { _ in }
      )
    }
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
