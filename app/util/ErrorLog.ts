import { ToastAndroid, Platform } from "react-native";
import RNFS from "react-native-fs";
import email from "react-native-email";
import I18n from "../i18n/i18n";

const errorLogPath = RNFS.DocumentDirectoryPath + "/bloom-reader-errors.log";
const issuesEmailAddress = "issues@bloomlibrary.org";

interface Options {
  logMessage: string;
  toastMessage?: string;
}

export function logError(options: Options): void {
  writeToErrorLog(options.logMessage);
  if (options.toastMessage) {
    ToastAndroid.show(options.toastMessage, ToastAndroid.SHORT);
  }
}

export function logNewAppVersion(appVersion: string): void {
  const message =
    `  BloomReader version: ${appVersion}\n` +
    `  Device OS: ${Platform.OS}\n` +
    `  OS Version: ${Platform.Version}`;

  writeToErrorLog(message);
}

export async function emailLog(): Promise<void> {
  const errorLog = await getErrorLog();
  try {
    email(issuesEmailAddress, {
      subject: "Bloom Reader Error Log",
      body: errorLog
    });
  } catch (err) {
    logError({
      logMessage: `Error emailing error log:\n${JSON.stringify(err)}`,
      toastMessage: I18n.t("Could not email error log.")
    });
  }
}

async function getErrorLog(): Promise<string> {
  const logExists = await RNFS.exists(errorLogPath);
  if (!logExists) return "[Empty error log]"; // This is unlikely since we log version info when the app starts
  return RNFS.readFile(errorLogPath);
}

async function writeToErrorLog(message: string): Promise<void> {
  const logExists = await RNFS.exists(errorLogPath);
  if (logExists) {
    // appendFile() is missing from type definitions but it exists
    // PR: https://github.com/itinance/react-native-fs/pull/651
    await RNFS.appendFile(errorLogPath, wrapMessage(message));
  } else {
    await RNFS.writeFile(errorLogPath, wrapMessage(message));
  }
}

function wrapMessage(message: string): string {
  return `== ${new Date().toString()} ==\n${message}\n\n`;
}
