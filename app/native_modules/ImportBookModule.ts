import { NativeModules } from "react-native";
import RNFS from "react-native-fs";
import {
  BookCollectionWithNewBook,
  importBookDirToCollection,
  importBookToCollection
} from "../models/BookCollection";
import { Platform } from "react-native";

const ImportBooksModule = NativeModules.ImportBooksModule;

export async function checkForBooksToImport(): Promise<
  BookCollectionWithNewBook | undefined
> {
  if (Platform.OS == "ios") return undefined; // Not implemented in iOS
  const importPath = await ImportBooksModule.checkForBooksToImport();
  if (importPath) {
    const statResult = await RNFS.stat(importPath);
    if (statResult.isDirectory())
      return await importBookDirToCollection(importPath);
    else {
      return await importBookToCollection(importPath, "FileIntent");
    }
  }
}
