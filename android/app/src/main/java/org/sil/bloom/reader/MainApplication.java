package org.sil.bloom.reader;

import android.app.Application;

import com.facebook.react.ReactApplication;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
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
        // Allow debugging within WebView (the actual book content).
        WebView.setWebContentsDebuggingEnabled(true);
        SoLoader.init(this, /* native exopackage */ false);
    }

    @Override
    public String getFileProviderAuthority() {
        // The name of the FileProvider defined in the Manifest
        return BuildConfig.APPLICATION_ID + ".provider";
    }
}
