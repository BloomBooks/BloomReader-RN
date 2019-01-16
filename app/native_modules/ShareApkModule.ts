import { NativeModules } from "react-native";

const ShareApkModule = NativeModules.ShareApkModule;

/*
  This module is Android-only. IOS does not support peer-to-peer sharing of apps.
*/

export async function getShareableApkPath(): Promise<string> {
  return await ShareApkModule.getShareableApkPath();
}
