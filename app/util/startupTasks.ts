import * as BookStorage from "./BookStorage";
import RNFS from "react-native-fs";

export default async function startupTasks(): Promise<void> {
  await BookStorage.createDirectories(); // Make this run only on new-install?
  cacheCleanup();
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
