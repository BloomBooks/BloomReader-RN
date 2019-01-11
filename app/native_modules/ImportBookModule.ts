import { NativeModules } from "react-native";
import * as BookStorage from "../util/BookStorage";
import RNFS from "react-native-fs";
import * as FileUtil from "../util/FileUtil";
import { BookCollection } from "../models/BookCollection";

const ImportBooksModule = NativeModules.ImportBooksModule;

export async function checkForBooksToImport(): Promise<
  BookCollection | undefined
> {
  const importPath = await ImportBooksModule.checkForBooksToImport();
  if (importPath) {
    const statResult = await RNFS.stat(importPath);
    if (statResult.isDirectory())
      return await BookStorage.importBooksDir(importPath);
    else
      return await BookStorage.importBookFile(
        FileUtil.nameFromPath(importPath)
      );
  }
}
