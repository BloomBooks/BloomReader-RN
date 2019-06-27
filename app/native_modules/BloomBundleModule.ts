import { NativeModules } from "react-native";
import { BookOrShelf } from "../models/BookOrShelf";
import { bookOrShelfPath } from "../storage/BookStorage";

const BloomBundleModule = NativeModules.BloomBundleModule;

export async function makeBundle(items: BookOrShelf[]): Promise<string> {
  return await BloomBundleModule.makeBundle(
    items.map(item => bookOrShelfPath(item))
  );
}
