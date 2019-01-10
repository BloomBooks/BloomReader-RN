# The .bloomd as understood by BloomReader-RN

This is a document to keep track of the assumptions I am making about .bloomd files as I'm working on BloomReader-RN. This can then either be or feed into some kind of common spec for both Desktop and Mobile developers to use to ensure compatability.

## Extension

The file extension is ".bloomd". We don't check for ".BLOOMD" or any other variant. The file extension is how we communicate to Android that BloomReader is the app that can handle this kind of file.

## Mime Type

We also register the filetype by MIME type as either "application/bloom" or "application/vnd.bloom". 

## Contents

The .bloomd is a Zip archive with the following contents:

 - A single html file. 
    - Normally the filename is name of the book with the extension ".htm". 
    - Because there is only one html file, BloomReader simply chooses whichever file has the .htm(l) extension.
 - The assets needed by the html file, images and other media
 - meta.json
   - See below
 - Optionally a thumbnail  (Is it actually optional?)
    - The filename is "thumbnail" plus an appropriate extension
    - The format is PNG or JPG
    - The extension needs to match the format (".png" or ".jpg")
    - Dimensions? Thumbnails are assumed to be square

## Meta Data

The meta data is contained in meta.json. The following properties are consumed by BloomReader. All of them are assumed to exist in the file unless otherwise stated.

- tags: array of strings
   - each string is in the format "{tagname}:{value}"
   - BR looks for the "bloomshelf" tag which is optional


    