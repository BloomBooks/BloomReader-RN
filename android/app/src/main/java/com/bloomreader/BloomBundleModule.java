package com.bloomreader;

import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

import java.io.File;
import java.io.IOException;

public class BloomBundleModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;

    public BloomBundleModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "BloomBundleModule";
    }

    @ReactMethod
    public void makeBundle(ReadableArray filepaths, Promise promise) {
        try {
            String dirPath = reactContext.getCacheDir() + File.separator + "bundles";
            new File(dirPath).mkdir();
            String bundlePath = dirPath + File.separator + "MyBloomBooks.bloombundle";
            File[] bundleFiles = new File[filepaths.size()];
            for (int i = 0; i < filepaths.size(); ++i)
                bundleFiles[i] = new File(filepaths.getString(i));
            IOUtilities.tar(bundleFiles, bundlePath);
            promise.resolve(bundlePath);
        }
        catch (IOException e) {
            Log.e("BloomBundleModule", "IOException creating bloom bundle:");
            e.printStackTrace();
            promise.reject(e);
        }
    }
}
