package com.bloomreader;

import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;

import static com.bloomreader.IOUtilities.BLOOM_BUNDLE_FILE_EXTENSION;
import static com.bloomreader.IOUtilities.BOOK_FILE_EXTENSION;


public class ImportBookModule extends ReactContextBaseJavaModule {
    public static final String booksDirectory = "books";
    private static Uri uriToImport;
    
    private ReactContext context;

    public ImportBookModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @Override
    public String getName() {
        return "ImportBooksModule";
    }

    public static void setUriToImport(Uri uri) {
        uriToImport = uri;
    }

    @ReactMethod
    public void checkForBooksToImport(Promise promise) {
        if (uriToImport == null) {
            promise.resolve(null);
        }
        else {
            String filename = openTheUri(uriToImport);
            promise.resolve(filename);
            uriToImport = null;
        }
    }

    @Nullable
    private String openTheUri(Uri uri){
        String nameOrPath = uri.getPath();
        // Content URI's do not use the actual filename in the "path"
        if (uri.getScheme().equals("content")) {
            ContentResolver contentResolver = context.getContentResolver();
            if (contentResolver == null) // Play console showed us this could be null somehow
                return null;
            Cursor cursor = contentResolver.query(uri, null, null, null, null);
            if (cursor != null) {
                if (cursor.moveToFirst())
                    nameOrPath = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME));
                cursor.close();
            }
        }
        if (nameOrPath == null) // reported as crash on Play console
            return null;
        if (nameOrPath.endsWith(BOOK_FILE_EXTENSION))
            return importBook(uri, IOUtilities.getFilename(nameOrPath));
        if (nameOrPath.endsWith(BLOOM_BUNDLE_FILE_EXTENSION)) {
            // importBloomBundle(uri);
        }
        Log.e("Intents", "Couldn't figure out how to open URI: " + uri.toString());
        return null;
    }

    private String importBook(Uri bookUri, String filename){
        String filepath = context.getFilesDir() + File.separator + booksDirectory + File.separator + filename;
        Log.d("ImportBook", "Copying " + filename + " to " + filepath);
        IOUtilities.copyFile(context, bookUri, filepath);
        return filename;
    }
}
