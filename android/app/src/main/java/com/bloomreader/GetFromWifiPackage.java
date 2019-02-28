package com.bloomreader;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
    This boilerplate class is the required way of making native code accessible from JavaScript.
    It exposes an instance of GetFromWifiModule so that it can be used from Javascript to fetch books from WiFi.
    https://facebook.github.io/react-native/docs/native-modules-android#register-the-module
 */

public class GetFromWifiPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new GetFromWifiModule(reactContext));
        return modules;
    }
}
