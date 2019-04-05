import * as BookStorage from "./BookStorage";
import RNFS from "react-native-fs";
import { AsyncStorage } from "react-native";
import importSampleBooks from "./importSampleBooks";
import * as ErrorLog from "./ErrorLog";
<<<<<<< HEAD
import { BOOK_ITEM_VERSION } from "../models/BookOrShelf";
=======
import * as BRAnalytics from "./BRAnalytics";
>>>>>>> Send analytics.

const appVersion = require("../../package.json").version;
const lastRunVersionKey = "bloomreader.lastRunVersion";
const bookItemVersionKey = "bloomreader.bookItemVersion";

export default async function startupTasks(): Promise<void> {
  await BookStorage.createDirectories();
  await BRAnalytics.setup();
  cacheCleanup();

  const lastRunVersion = await getLastRunVersion();
  if (lastRunVersion !== appVersion) {
    ErrorLog.logNewAppVersion(appVersion);
    await importSampleBooks();
  }

  const existingBookItemVersion = await getExistingBookItemVersion();
  if (lastRunVersion !== null && existingBookItemVersion != BOOK_ITEM_VERSION) {
    await BookStorage.updateBookListFormat();
  }

  setVersions();
}

// When we share temporary files, we can't clean them up immediately
// because the receiving app needs them. 1 day should be long enough
async function cacheCleanup(): Promise<void> {
  const dirNames = ["apk", "bundles"];
  for (let i = 0; i < dirNames.length; ++i) {
    const path = `${RNFS.CachesDirectoryPath}/${dirNames[i]}`;
    if (await RNFS.exists(path)) {
      const stat = await RNFS.stat(path);
      const fileMS = stat.mtime.valueOf();
      if (Date.now().valueOf() > fileMS + 1000 * 60 * 60 * 24)
        RNFS.unlink(path);
    }
  }
}

async function getLastRunVersion(): Promise<string | null> {
  return AsyncStorage.getItem(lastRunVersionKey);
}

async function getExistingBookItemVersion(): Promise<string | null> {
  return AsyncStorage.getItem(bookItemVersionKey);
}

async function setVersions(): Promise<void> {
  AsyncStorage.multiSet([
    [lastRunVersionKey, appVersion],
    [bookItemVersionKey, BOOK_ITEM_VERSION]
  ]);
}
