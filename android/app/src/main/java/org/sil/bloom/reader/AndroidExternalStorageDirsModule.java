package org.sil.bloom.reader;

import android.os.Build;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;

/**
    Provides a list of available app-private external storage directories to the JS
 */

public class AndroidExternalStorageDirsModule extends ReactContextBaseJavaModule {
//    private ReactApplicationContext context;
    private ReactApplicationContext context;

    public AndroidExternalStorageDirsModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @Override
    public String getName() {
        return "AndroidExternalStorageDirsModule";
    }

    /*
        Exposes Context.getExternalFilesDirs() to Javascript.
        Provides a list of app-private directories in external storage.
        Promise is resolved with a String of paths separated by newlines.
        Note: Access to files dir on SD card requires Android 4.4 or higher.
     */
    @ReactMethod
    public void dirPaths(Promise promise) {
        File[] dirs;
        if (Build.VERSION.SDK_INT >= 19) dirs = context.getExternalFilesDirs(null);
        else dirs = new File[]{context.getExternalFilesDir(null)};
        String dirPathList = "";
        for(File dir : dirs) {
            dirPathList += dir.getAbsolutePath() + '\n';
        }
        promise.resolve(dirPathList);
    }
}
