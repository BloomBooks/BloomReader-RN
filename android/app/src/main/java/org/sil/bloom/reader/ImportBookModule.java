package org.sil.bloom.reader;

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


import java.io.File;
import java.io.IOException;

import static org.sil.bloom.reader.IOUtilities.BLOOM_BUNDLE_FILE_EXTENSION;
import static org.sil.bloom.reader.IOUtilities.BOOK_FILE_EXTENSION;


public class ImportBookModule extends ReactContextBaseJavaModule {
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
        try {
            String nameOrPath = getNameOrPath(uri);
            if (nameOrPath == null) // reported as crash on Play console
                return null;
            if (nameOrPath.endsWith(BOOK_FILE_EXTENSION))
                return importBook(uri, IOUtilities.getFilename(nameOrPath));
            if (nameOrPath.endsWith(BLOOM_BUNDLE_FILE_EXTENSION)) {
                return importBloomBundle(uri, IOUtilities.getFilename(nameOrPath));
            }
        }
        catch (IOException e) {
            Log.e("ImportBook", "IOException:");
            e.printStackTrace();
        }
        Log.e("ImportBook", "Couldn't figure out how to open URI: " + uri.toString());
        return null;
    }

    @Nullable
    private String getNameOrPath(Uri uri) {
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
        return nameOrPath;
    }

    private String importBook(Uri bookUri, String filename){
        File booksDir = IOUtilities.booksDirectory(context);
        String filepath = booksDir.getAbsolutePath() + File.separator + filename;
        Log.d("ImportBook", "Copying " + filename + " to " + filepath);
        IOUtilities.copyFile(context, bookUri, filepath);
        return filepath;
    }

    private String importBloomBundle(Uri uri, String filename) throws IOException {
        String extractPath = context.getCacheDir() + File.separator + filename + "_FILES";
        Log.d("ImportBook", "Extracting " + filename + " to " + extractPath);
        new File(extractPath).mkdir();
        IOUtilities.extractBloomBundle(context, uri, extractPath);
        return extractPath;
    }
}
