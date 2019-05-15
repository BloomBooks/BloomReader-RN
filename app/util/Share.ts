import {
  BookOrShelf,
  Book,
  Shelf,
  recursiveListForShelf,
  isShelf
} from "../models/BookOrShelf";
import Share from "react-native-share";
import * as ShareApkModule from "../native_modules/ShareApkModule";
import { BookCollection, getBookCollection } from "../models/BookCollection";
import { makeBundle } from "../native_modules/BloomBundleModule";
import { nameFromPath } from "./FileUtil";
import { logError } from "./ErrorLog";
import I18n from "../i18n/i18n";

export async function share(
  item: BookOrShelf,
  collection: BookCollection
): Promise<void> {
  if (isShelf(item)) shareShelfBundle(item, collection);
  else shareBook(item);
}

export async function shareAll(): Promise<void> {
  const collection = await getBookCollection();
  const itemsToShare = (collection.books as BookOrShelf[]).concat(
    collection.shelves
  );
  const bundlePath = await makeBundle(itemsToShare);
  shareBundle(bundlePath);
}

export async function shareApp(): Promise<void> {
  const apkPath = await ShareApkModule.getShareableApkPath();
  shareFile({
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
  shareFile({
    url: `file://${bundlePath}`,
    type: "application/*", // This gets us a better selection of apps to share with than "application/bloom" and seems to work just the same
    subject: "My Bloom Books.bloombundle"
  });
}

function shareBook(book: Book): void {
  shareFile({
    url: `file://${book.filepath}`,
    type: "application/*", // This gets us a better selection of apps to share with than "application/bloom" and seems to work just the same
    subject: nameFromPath(book.filepath)
  });
}

// More options are available, but the interfaces aren't exported
// so I just listed the ones we're using
async function shareFile(opts: { url: string; type: string; subject: string }) {
  try {
    await Share.open(opts);
  } catch (err) {
    logError({
      logMessage: `Error sharing file: "${opts.url}"\n${JSON.stringify(err)}`,
      toastMessage: I18n.t("CannotShare")
    });
  }
}
