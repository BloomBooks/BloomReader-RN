package com.bloomreader;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

public class ShareApkModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;

    public ShareApkModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ShareApkModule";
    }

    @ReactMethod
    public void getShareableApkPath(Promise promise) {
        String apkPath = reactContext.getApplicationInfo().publicSourceDir;
        String dirPath = reactContext.getCacheDir() + File.separator + "apk";
        new File(dirPath).mkdir();
        String shareableApkPath = dirPath + File.separator + "Bloom Reader.apk";
        IOUtilities.copyFile(apkPath, shareableApkPath);
        promise.resolve(shareableApkPath);
    }

}
