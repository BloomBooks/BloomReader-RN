package org.sil.bloom.reader;

import android.annotation.TargetApi;
import android.app.Application;

import com.facebook.react.ReactApplication;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.segment.analytics.reactnative.core.RNAnalyticsPackage;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.rnziparchive.RNZipArchivePackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.rnfs.RNFSPackage;

import android.os.Build;
import android.webkit.WebView;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication, ShareApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new SplashScreenReactPackage(),
                new RNAnalyticsPackage(),
                new RNSharePackage(),
                new RNI18nPackage(),
                new RNCWebViewPackage(),
                new RNZipArchivePackage(),
                new RNGestureHandlerPackage(),
                new RNFSPackage(),
                new ImportBooksPackage(),
                new BloomBundlePackage(),
                new ShareApkPackage(),
                new GetFromWifiPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        if (Build.VERSION.SDK_INT >= 19)
            AdditionalSetupForApi19();

        SoLoader.init(this, /* native exopackage */ false);
    }

    // Note, TargetApi annotation only affects linting,
    // so we must only call this method based on a conditional check at the caller.
    @TargetApi(19)
    private void AdditionalSetupForApi19() {
        // Allow debugging within WebView (the actual book content).
        WebView.setWebContentsDebuggingEnabled(true);
    }

    @Override
    public String getFileProviderAuthority() {
        // The name of the FileProvider defined in the Manifest
        return BuildConfig.APPLICATION_ID + ".provider";
    }
}
