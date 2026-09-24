#import "AppDelegate.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // iOS 27 requires the UIScene lifecycle for apps built with the latest SDK.
  // React Native window creation is owned by SceneDelegate.
  return YES;
}

@end
