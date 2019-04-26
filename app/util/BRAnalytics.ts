import Analytics from "@segment/analytics-react-native";
import { AsyncStorage } from "react-native";
import { readExternalBloomDir } from "./FileUtil";
import RNFS from "react-native-fs";
import { logError } from "./ErrorLog";

const storageDeviceIdKey = "bloomreader.analytics.deviceId";
const storageDeviceGroupKey = "bloomreader.analytics.deviceGroup";

const segmentKeys = {
  test: "FSepBapJtfOi3FfhsEWQjc2Dw0O3ixuY",
  beta: "HRltJ1F4vEVgCypIMeRVnjLAMUTAyOAI",
  release: "EfisyNbRjBYIHyHZ9njJcs5dWF4zabyH"
};

export async function setup(): Promise<void> {
  // Don't create duplicate Analytics object when refreshing JS in development
  if (Analytics.ready) return;

  const key = segmentKeys.test; // TODO - use the appropriate key

  const success = Analytics.setup(key, {
    trackAppLifecycleEvents: true
  });

  if (success) {
    identify();
  } else {
    logError({
      logMessage: `Error setting up analytics in BRAnalytics.setup()\nAnalytics object:\n${JSON.stringify(
        Analytics
      )}`
    });
  }
}

async function identify(): Promise<void> {
  let [
    [idKey, deviceId],
    [groupKey, deviceGroup]
  ] = await AsyncStorage.multiGet([storageDeviceIdKey, storageDeviceGroupKey]);
  if (!deviceId) {
    const deviceParams = await getIdentityFromFile();
    if (!deviceParams) return;
    deviceId = deviceParams.device;
    deviceGroup = deviceParams.project;
  }

  // The value used with identify() needs to be globally unique. Just in case somebody
  // might reuse a deviceId in a different project, we concatenate them.
  const fullId = `${deviceGroup}-${deviceId}`;
  Analytics.identify(fullId);
  Analytics.group(deviceGroup);
}

interface DeviceIdParams {
  device: string;
  project: string;
}

async function getIdentityFromFile(): Promise<DeviceIdParams | null> {
  try {
    const dirPath = await readExternalBloomDir();
    const idFilePath = `${dirPath}/deviceId.json`;
    const idFileExists = RNFS.exists(idFilePath);
    if (idFileExists) {
      const idJson = await RNFS.readFile(idFilePath);
      const idParams = JSON.parse(idJson);
      if (idParams.project && idParams.device) {
        AsyncStorage.setItem(storageDeviceIdKey, idParams.device);
        AsyncStorage.setItem(storageDeviceGroupKey, idParams.project);
        return idParams;
      }
    }
    return null;
  } catch (err) {
    logError({
      logMessage: `Error in BRAnalytics.getIdentityFromFile()\n${JSON.stringify(
        err
      )}`
    });
    return null;
  }
}

type ScreenName = "Main" | "Shelf";
export async function screenView(
  screenName: ScreenName,
  shelf?: string
): Promise<void> {
  Analytics.screen(screenName, {
    shelf: shelf || null
  });
}

export type AddedBooksMethod = "Wifi" | "FileIntent";
export async function addedBooks(
  method: AddedBooksMethod,
  titles: string[]
): Promise<void> {
  Analytics.track("AddedBooks", {
    method,
    titles
  });
}
