import { NativeModules } from "react-native";
import BookStorage from "../util/BookStorage";

const ImportBooksModule = NativeModules.ImportBooksModule;

export default {
  checkForBooksToImport: checkForBooksToImport
};

async function checkForBooksToImport() {
  const newFileName = await ImportBooksModule.checkForBooksToImport();
  if (newFileName) return await BookStorage.importBookFile(newFileName);
}
