package com.bloomreader;

import android.content.Context;
import android.net.wifi.WifiManager;
import android.util.Log;

// Service that runs a simple 'web server' that Bloom desktop can talk to.
// This is probably overkill for simply allowing the desktop to send one file per book to the device.
// But (a) code was available to reuse; and (b) copying one more file from HTA will allow this
// service to also support getting files, which is likely to be helpful for peer-to-peer sharing.
public class SyncService {
    private Context context;
    private GetFromWifiModule getFromWifiModule;

    public SyncService(Context context, GetFromWifiModule getFromWifiModule) {
        this.context = context;
        this.getFromWifiModule = getFromWifiModule;
    }

    private SyncServer _server;
    private WifiManager.WifiLock _lock;

    public void startSyncServer() {
        // acquiring this lock may help prevent the OS deciding to shut down the WiFi system
        // while we are are transferring. It won't prevent the user restarting, turning off WiFi,
        // switching to airplane mode, etc.
        // Note that this service is started when we request a book and stopped when we get it,
        // so WiFi should not remain locked indefinitely.
        // Enhance: possibly we should do something to prevent WiFi staying locked if the
        // transfer is interrupted?
        _lock = ((WifiManager)context.getApplicationContext().getSystemService(Context.WIFI_SERVICE)).createWifiLock("file transfer lock");
        _lock.acquire();

        _server = new SyncServer(context, getFromWifiModule);
        _server.startThread();
    }

    public void stopSyncServer() {
        if (_server == null)
            Log.e("GetFromWifi", "Tried to stop the SyncServer, but it wasn't running!");
        else {
            _server.stopThread();
            _lock.release();
        }
    }
}
