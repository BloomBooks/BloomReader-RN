package com.bloomreader;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.NetworkInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.support.v4.content.LocalBroadcastManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.lang.reflect.Method;
import java.util.ArrayList;

// An activity that is made to look like a dialog (see the theme associated with it in
// the main manifest and defined in styles.xml) and which implements the command to receive
// Bloom books from Wifi (i.e., from a desktop running Bloom...eventually possibly from
// another copy of BloomReader). This is launched from a menu option in the main activity.
public class GetFromWifiModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext reactContext;
    private ArrayList<String> newBookPaths = new ArrayList<String>();
    private ProgressReceiver mProgressReceiver;

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
        mProgressReceiver = new ProgressReceiver();
        LocalBroadcastManager.getInstance(reactContext).registerReceiver(mProgressReceiver,
                new IntentFilter(NewBookListenerService.BROADCAST_BOOK_LISTENER_PROGRESS));

        String wifiName = getWifiName(reactContext);
        if (wifiName == null) {
            sendProgressMessage(reactContext, "No Wifi Connected");
        }
        else {
            // For some reason the name of the ILC network comes with quotes already around it.
            // Since we want one lot of quotes but not two, decided to add them if missing.
            if (!wifiName.startsWith("\""))
                wifiName = "\"" + wifiName;
            if (!wifiName.endsWith("\""))
                wifiName = wifiName + "\"";
            sendProgressMessage(reactContext, "Looking for ads");  // TODO - Use the Wifi name

            startBookListener();
        }
    }

    private void sendProgressMessageToView(String messageKey, WritableMap messageLiterals) {
        WritableMap eventParams = Arguments.createMap();
        eventParams.putString("messageKey", messageKey);
        eventParams.putMap("messageLiterals", messageLiterals);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("ProgressMessage", eventParams);
    }

    @ReactMethod
    public void stopListening() {
        stopBookListener();
        LocalBroadcastManager.getInstance(reactContext).unregisterReceiver(mProgressReceiver);
    }

    // This is used by various companion classes that want to display stuff in our progress window.
    public static void sendProgressMessage(Context context, String message) {
        Intent progressIntent = new Intent(NewBookListenerService.BROADCAST_BOOK_LISTENER_PROGRESS)
                .putExtra(NewBookListenerService.BROADCAST_BOOK_LISTENER_PROGRESS_CONTENT, message);
        LocalBroadcastManager.getInstance(context).sendBroadcast(progressIntent);
    }

    // This class supports receiving the messages sent by calls to sendProgressMessage()
    private class ProgressReceiver extends BroadcastReceiver {

        @Override
        public void onReceive(Context context, Intent intent) {
            String message = intent.getStringExtra(NewBookListenerService.BROADCAST_BOOK_LISTENER_PROGRESS_CONTENT);
            sendProgressMessageToView(message, null); // TODO - Send literals
        }
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

    // TODO - I don't think we need a service for this. We're doing it in the foreground
    private void startBookListener() {
        Intent serviceIntent = new Intent(reactContext, NewBookListenerService.class);
        reactContext.startService(serviceIntent);
    }

    private void stopBookListener() {
        Intent serviceIntent = new Intent(reactContext, NewBookListenerService.class);
        reactContext.stopService(serviceIntent);
    }
}
