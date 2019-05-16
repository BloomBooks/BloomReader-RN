import { NativeModules, Platform } from "react-native";

// Has one method dirPaths() which returns a promise
// that resolves to a string containing filepaths
// separated by newlines
const AndroidExternalStorageDirsModule =
  NativeModules.AndroidExternalStorageDirsModule;

export async function androidExternalStorageDirs(): Promise<string[]> {
  return Platform.OS == "android"
    ? ((await AndroidExternalStorageDirsModule.dirPaths()) as string)
        .split("\n")
        .filter(s => s.length > 0)
    : [];
}
