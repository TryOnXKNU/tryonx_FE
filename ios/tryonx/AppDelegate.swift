import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import KakaoSDKAuth
import KakaoSDKUser

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "tryonx",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
  
  // 카카오 로그인 URL 처리 함수
   func application(
     _ app: UIApplication,
     open url: URL,
     options: [UIApplication.OpenURLOptionsKey : Any] = [:]
   ) -> Bool {
     if AuthApi.isKakaoTalkLoginUrl(url) {
       return AuthController.handleOpenUrl(url: url)
     }
     return false
   }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
