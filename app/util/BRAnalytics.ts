import Analytics from "@segment/analytics-react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { readExternalBloomDir } from "./FileUtil";
import RNFS from "react-native-fs";
import { logError } from "./ErrorLog";
import { NativeModules } from "react-native";

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
    const idFileExists = await RNFS.exists(idFilePath);
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

// This doesn't add any functionality to Analytics.track,
// but maintains a convention that all analytics goes through
// this BRAnalytics API.
export async function track(event: string, params: any) {
  Analytics.track(event, params);
}

export async function reportPagesRead(args: {
  title: string; // file name of book
  audioPages: number; // of pages with audio that the user has displayed
  nonAudioPages: number; // of non-audio pages user has displayed
  totalNumberedPages: number; // total number of pages in the book that are numbered
  // true if user read all the way to last page
  // much prefer the name lastNumberedPageWasRead, but the other name is already
  // established usage in our analytics.
  lastNumberedPage: boolean;
  questionCount: number; // total number of comprehension questions in book
  contentLang: string; // book's primary language
  features: string;
  sessionId: string;
  brandingProjectName?: string; // bloom enterprise branding that book is part of, if any
}) {
  track("Pages Read", args);
}

export async function reportLoadBook(args: {
  title: string; // file name of book
  totalNumberedPages: number; // total number of pages in the book that are numbered
  questionCount: number; // total number of comprehension questions in book
  contentLang: string; // book's primary language
  features: string;
  sessionId: string;
  brandingProjectName?: string; // bloom enterprise branding that book is part of, if any
}) {
  track("BookOrShelf opened", args);
}

export async function reportInstallationSource() {
  NativeModules.GetInstallerInfoModule.requestInstallerName(
    (installer: string) => {
      track("Install Attributed", {
        provider: "getInstallerPackageName",
        installer
      });
    }
  );
}
