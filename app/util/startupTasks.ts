import * as BookStorage from "../storage/BookStorage";
import RNFS from "react-native-fs";
import { AsyncStorage } from "react-native";
import * as ErrorLog from "./ErrorLog";
import * as BRAnalytics from "./BRAnalytics";
import { updateBookListFormatIfNeeded } from "../models/BookCollection";

const APP_VERSION = require("../../package.json").version;
const LAST_RUN_VERSION_KEY = "bloomreader.lastRunVersion";
const COLLECTION_FORMAT_VERSION = "bloomreader.bookItemVersion";

export default async function startupTasks(): Promise<void> {
  await BookStorage.createDirectories();
  await BRAnalytics.setup();
  cacheCleanup();

  const lastRunVersion = await getLastRunVersion();
  if (lastRunVersion !== APP_VERSION) {
    ErrorLog.logNewAppVersion(APP_VERSION);
    if (lastRunVersion !== null)
      await updateBookListFormatIfNeeded(
        await getExistingCollectionFormatVersion()
      );
    await BookStorage.importSampleBooks();
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
  return AsyncStorage.getItem(LAST_RUN_VERSION_KEY);
}

async function getExistingCollectionFormatVersion(): Promise<string | null> {
  return AsyncStorage.getItem(COLLECTION_FORMAT_VERSION);
}

async function setVersions(): Promise<void> {
  AsyncStorage.multiSet([
    [LAST_RUN_VERSION_KEY, APP_VERSION],
    [COLLECTION_FORMAT_VERSION, COLLECTION_FORMAT_VERSION]
  ]);
}
