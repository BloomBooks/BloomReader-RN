import { NativeModules } from "react-native";

const BloomBundleModule = NativeModules.BloomBundleModule;

export async function makeBundle(filepaths: string[]): Promise<string> {
  return await BloomBundleModule.makeBundle(filepaths);
}
