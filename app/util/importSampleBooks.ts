import RNFS from "react-native-fs";
import { booksDir, importBookFile } from "./BookStorage";

export default async function importSampleBooks() {
  const sampleBookFiles = await RNFS.readDirAssets("books");
  for (let i = 0; i < sampleBookFiles.length; ++i) {
    const sampleBookFile = sampleBookFiles[i];
    await RNFS.copyFileAssets(
      `books/${sampleBookFile.name}`,
      `${booksDir}/${sampleBookFile.name}`
    );
    await importBookFile(sampleBookFile.name);
  }
}
