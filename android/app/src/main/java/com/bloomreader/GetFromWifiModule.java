package com.bloomreader;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.NetworkInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.reflect.Method;
import java.util.ArrayList;

/*
    Module for receiving books over WiFi from Bloom.
    The JavaScript initiates by calling listen() and concludes by calling stopListening().
    This module sends ProgressMessage and NewBook events to the Javascript.
 */

public class GetFromWifiModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;
    private ArrayList<String> newBookPaths = new ArrayList<String>();
    private NewBookListenerService newBookListenerService;

    public GetFromWifiModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "GetFromWifiModule";
    }

    @ReactMethod
    public void listen() {
        String wifiName = getWifiName(reactContext);
        if (wifiName == null) {
            sendProgressMessage("NoWifiConnected");
        }
        else {
            // For some reason the name of the ILC network comes with quotes already around it.
            // Since we want one lot of quotes but not two, decided to add them if missing.
            if (!wifiName.startsWith("\""))
                wifiName = "\"" + wifiName;
            if (!wifiName.endsWith("\""))
                wifiName = wifiName + "\"";
            WritableMap messageLiterals = Arguments.createMap();
            messageLiterals.putString("network", wifiName);
            sendProgressMessage( "LookingForAds", messageLiterals);

            startBookListener();
        }
    }

    public void sendProgressMessage(String messageKey) {
        sendProgressMessage(messageKey, null);
    }

    public void sendProgressMessage(String messageKey, WritableMap messageLiterals) {
        WritableMap eventParams = Arguments.createMap();
        eventParams.putString("messageKey", messageKey);
        eventParams.putMap("messageLiterals", messageLiterals);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("ProgressMessage", eventParams);
    }

    public void sendNewBookMessage(String filename) {
        WritableMap eventParams = Arguments.createMap();
        eventParams.putString("filename", filename);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("NewBook", eventParams);
    }

    @ReactMethod
    public void stopListening() {
        stopBookListener();
    }

    // Get the human-readable name of the WiFi network that the Android is connected to
    // (or null if not connected over WiFi).
    public String getWifiName(Context context) {
        WifiManager manager = (WifiManager) context.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (manager.isWifiEnabled()) {
            WifiInfo wifiInfo = manager.getConnectionInfo();
            if (wifiInfo != null) {
                NetworkInfo.DetailedState state = WifiInfo.getDetailedStateOf(wifiInfo.getSupplicantState());
                if (state == NetworkInfo.DetailedState.CONNECTED || state == NetworkInfo.DetailedState.OBTAINING_IPADDR) {
                    return wifiInfo.getSSID();
                }
            }
        }

        if (deviceHotspotActive(manager))
            return "Device Hotspot";

        return null;
    }

    // Android doesn't have a public API for finding this out,
    // but that's nothing a Reflection hack can't solve...
    private boolean deviceHotspotActive(WifiManager manager) {
        try {
            final Method method = manager.getClass().getDeclaredMethod("isWifiApEnabled");
            method.setAccessible(true);
            return (Boolean) method.invoke(manager);
        }
        catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private void startBookListener() {
        newBookListenerService = new NewBookListenerService(reactContext, this);
        newBookListenerService.startListening();
    }

    private void stopBookListener() {
        if (newBookListenerService == null)
            Log.e("GetFromWifi", "stopListening() called, but we weren't listening!");
        else {
            newBookListenerService.stopListening();
            newBookListenerService = null;
        }
    }
}
