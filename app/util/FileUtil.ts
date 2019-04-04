import RNFS from "react-native-fs";
import * as ErrorLog from "./ErrorLog";

export function nameFromPath(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

export async function rnfsSafeUnlink(path: string): Promise<void> {
  try {
    const exists = await RNFS.exists(path);
    if (exists) RNFS.unlink(path);
  } catch (err) {
    ErrorLog.logError({
      logMessage: `[rnfsSafeUnlink] Error deleting file: ${path}\n${JSON.stringify(
        err
      )}`
    });
  }
}
