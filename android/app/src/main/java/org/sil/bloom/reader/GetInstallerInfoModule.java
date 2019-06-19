package org.sil.bloom.reader;

import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import android.text.TextUtils;

import com.facebook.react.bridge.Callback;

// Standard packaging for a java function accessible from JS.
// All this code is to allow JS to call requestInstallerName and get a result back.
public class GetInstallerInfoModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;

    public GetInstallerInfoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "GetInstallerInfoModule";
    }

    @ReactMethod
    public void requestInstallerName(Callback callback) {
        // Typically this gives a result if installed from play store (or, reportedly,
        // amazon)
        String installer = this.reactContext.getPackageManager()
                .getInstallerPackageName(this.reactContext.getPackageName());
        if (TextUtils.isEmpty(installer))
            return; // in this case, it's fine just not to call it if we don't have any info
        callback.invoke(installer);
    }
}