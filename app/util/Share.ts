import {
  BookOrShelf,
  Book,
  Shelf,
  recursiveListForShelf,
  isShelf
} from "../models/BookOrShelf";
import * as BookStorage from "../storage/BookStorage";
import Share from "react-native-share";
import * as ShareApkModule from "../native_modules/ShareApkModule";
import {
  BookCollection,
  syncCollectionAndFetch
} from "../storage/BookCollection";
import { makeBundle } from "../native_modules/BloomBundleModule";
import { nameFromPath } from "./FileUtil";

export async function share(
  item: BookOrShelf,
  collection: BookCollection
): Promise<void> {
  if (isShelf(item)) shareShelfBundle(item, collection);
  else shareBook(item);
}

export async function shareAll(): Promise<void> {
  const collection = await syncCollectionAndFetch();
  const itemsToShare = (collection.books as BookOrShelf[]).concat(
    collection.shelves
  );
  const bundlePath = await makeBundle(itemsToShare);
  shareBundle(bundlePath);
}

export async function shareApp(): Promise<void> {
  const apkPath = await ShareApkModule.getShareableApkPath();
  Share.open({
    url: `file://${apkPath}`,
    type: "application/*",
    subject: "Bloom Reader.apk"
  });
}

async function shareShelfBundle(
  shelf: Shelf,
  collection: BookCollection
): Promise<void> {
  const itemsToShare = recursiveListForShelf(shelf, collection);
  const bundlePath = await makeBundle(itemsToShare);
  shareBundle(bundlePath);
}

function shareBundle(bundlePath: string): void {
  Share.open({
    url: `file://${bundlePath}`,
    type: "application/*", // This gets us a better selection of apps to share with than "application/bloom" and seems to work just the same
    subject: "My Bloom Books.bloombundle"
  });
}

function shareBook(book: Book): void {
  Share.open({
    url: `file://${book.filepath}`,
    type: "application/*", // This gets us a better selection of apps to share with than "application/bloom" and seems to work just the same
    subject: nameFromPath(book.filepath)
  });
}
