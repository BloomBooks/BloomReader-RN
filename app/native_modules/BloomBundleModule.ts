import { NativeModules } from "react-native";
import { BookOrShelf } from "../models/BookOrShelf";

const BloomBundleModule = NativeModules.BloomBundleModule;

export async function makeBundle(items: BookOrShelf[]): Promise<string> {
  return await BloomBundleModule.makeBundle(items.map(item => item.filepath));
}
