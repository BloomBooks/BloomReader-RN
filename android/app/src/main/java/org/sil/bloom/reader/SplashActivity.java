package org.sil.bloom.reader;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

/**
    The launch activity for the app which is needed to set the splash screen properly
    to avoid seeing a mommentary plain white screen 
    See the entry in AndroidManifest.xml for how this sets the splash screen as its theme.
    Once loaded, it simply passes on to the MainActivity
 */

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        finish();
    }
}