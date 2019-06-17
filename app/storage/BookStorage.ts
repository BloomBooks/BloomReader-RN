import RNFS, { ReadDirItem } from "react-native-fs";
import { unzip } from "react-native-zip-archive";
import { Book, Shelf, BookOrShelf, isShelf } from "../models/BookOrShelf";
import {
  BookCollection,
  importBookToCollection
} from "../models/BookCollection";
import {
  nameFromPath,
  rnfsSafeUnlink,
  nameifyPath,
  isBookFile,
  isShelfFile,
  extension,
  readExternalBloomDir
} from "../util/FileUtil";
import getFeaturesList from "../util/getFeaturesList";
import { logError } from "../util/ErrorLog";
import { androidExternalStorageDirs } from "../native_modules/AndroidExternalStorageDirsModule";

const PRIVATE_BOOKS_DIR = RNFS.DocumentDirectoryPath + "/books";
const THUMBS_DIR = RNFS.DocumentDirectoryPath + "/thumbs";
const OPEN_BOOK_DIR = RNFS.DocumentDirectoryPath + "/openBook";

interface ShelfFileContents {
  id: string;
  label: Array<{ [localeName: string]: string }>;
  color: string;
  tags: string[];
}

export async function createDirectories(): Promise<void> {
  await RNFS.mkdir(PRIVATE_BOOKS_DIR);
  await RNFS.mkdir(THUMBS_DIR);
}

export async function importSampleBooks() {
  const sampleBookFiles = await RNFS.readDirAssets("books");
  for (let i = 0; i < sampleBookFiles.length; ++i) {
    const sampleBookFile = sampleBookFiles[i];
    const copyToPath = `${PRIVATE_BOOKS_DIR}/${sampleBookFile.name}`;
    await RNFS.copyFileAssets(`books/${sampleBookFile.name}`, copyToPath);
    await importBookToCollection(copyToPath, null);
  }
}

// Caches thumbnail and extracts metadata for BookCollection
export async function importBookFile(filepath: string): Promise<Book> {
  const tmpBookPath = await extractBookToTmp(filepath);
  const thumbPath = await saveThumbnail(tmpBookPath, filepath);
  const metaData = JSON.parse(await RNFS.readFile(`${tmpBookPath}/meta.json`));
  const bookFeatures = await getFeaturesList(metaData, tmpBookPath);
  const modifiedAt = (await RNFS.stat(filepath)).mtime.valueOf(); // mtime is actually a Date object
  RNFS.unlink(tmpBookPath);
  const book = {
    filepath,
    title: metaData.title,
    allTitles: JSON.parse(metaData.allTitles.replace(/\n/g, " ")), // Remove newlines to avoid JSON parse error
    tags: metaData.tags,
    features: bookFeatures,
    thumbPath,
    modifiedAt,
    brandingProjectName: metaData.brandingProjectName,
    bloomdVersion: metaData.bloomdVersion ? metaData.bloomdVersion : 0
  };
  return book;
}

// Parses shelf file and return Shelf based on contents
export async function importShelfFile(filepath: string): Promise<Shelf> {
  const fileContents = JSON.parse(
    await RNFS.readFile(filepath)
  ) as ShelfFileContents;
  const modifiedAt = (await RNFS.stat(filepath)).mtime.valueOf(); // mtime is actually a Date object
  return { ...fileContents, filepath, modifiedAt };
}

export function privateStorageDirs() {
  return [PRIVATE_BOOKS_DIR];
}

async function storageDirs() {
  let dirs = privateStorageDirs();
  dirs = dirs.concat(await androidExternalStorageDirs());
  try {
    const oldBloomDirPath = await readExternalBloomDir();
    dirs.push(oldBloomDirPath);
  } catch (err) {
    // Permission refused
    logError({ logMessage: err });
  }
  return dirs;
}

// Moves book and shelf files to private books dir
// and returns BookCollection of the imported items
export async function importBooksDir(srcDir: string): Promise<BookCollection> {
  const books: Book[] = [];
  const shelves: Shelf[] = [];
  const files = await RNFS.readDir(srcDir);
  for (let i = 0; i < files.length; ++i) {
    const file = files[i];
    if (isBookFile(file) || isShelfFile(file)) {
      const newPath = `${PRIVATE_BOOKS_DIR}/${file.name}`;
      await RNFS.moveFile(file.path, newPath);
      if (isBookFile(file)) books.push(await importBookFile(newPath));
      else shelves.push(await importShelfFile(newPath));
    }
  }
  RNFS.unlink(srcDir);
  return { books, shelves };
}

export async function getPublicDirFiles(): Promise<ReadDirItem[]> {
  const dirPaths = (await storageDirs()).filter(
    path => path != PRIVATE_BOOKS_DIR
  );
  let files: ReadDirItem[] = [];
  for (let i = 0; i < dirPaths.length; ++i) {
    if (await RNFS.exists(dirPaths[i]))
      files = files.concat(await RNFS.readDir(dirPaths[i]));
  }
  return files;
}

export async function openBookForReading(book: Book): Promise<string> {
  await rnfsSafeUnlink(OPEN_BOOK_DIR);
  return await unzip(book.filepath, OPEN_BOOK_DIR);
}

export async function getThumbnail(
  book: Book
): Promise<{ data: string; format: string } | undefined> {
  if (!book.thumbPath) return undefined;
  return {
    data: await RNFS.readFile(book.thumbPath, "base64"),
    format: extension(book.thumbPath)
  };
}

export async function moveBook(): Promise<string> {
  const fileList = await RNFS.readDir(OPEN_BOOK_DIR);
  const htmlFile = fileList.find(entry => /\.html?$/.test(entry.name));
  if (!htmlFile || !htmlFile.path) {
    return "";
  }
  await RNFS.moveFile(htmlFile.path, OPEN_BOOK_DIR + "/openBook.htm");
  return htmlFile.path;
}

export async function fetchHtml(bookDir = OPEN_BOOK_DIR): Promise<string> {
  const fileList = await RNFS.readDir(bookDir);
  const htmlFile = fileList.find(entry => /\.html?$/.test(entry.name));
  return htmlFile ? await RNFS.readFile(htmlFile.path) : "";
}

export function deleteBooksAndShelves(items: BookOrShelf[]) {
  items.forEach(item => {
    rnfsSafeUnlink(item.filepath);
    if (!isShelf(item) && item.thumbPath) rnfsSafeUnlink(item.thumbPath);
  });
}

export function openBookFolderPath(): string {
  return OPEN_BOOK_DIR;
}

async function extractBookToTmp(inPath: string): Promise<string> {
  const filename = nameFromPath(inPath);
  const outPath = `${RNFS.CachesDirectoryPath}/${filename}_FILES`;
  return await unzip(inPath, outPath);
}

async function saveThumbnail(
  tmpBookPath: string,
  bookFilePath: string
): Promise<string | undefined> {
  const fileList = await RNFS.readdir(tmpBookPath);
  const thumbFilename = fileList.find(filename =>
    filename.startsWith("thumbnail.")
  );
  if (thumbFilename) {
    const extension = thumbFilename.slice(thumbFilename.lastIndexOf("."));
    const inPath = tmpBookPath + "/" + thumbFilename;
    const outPath =
      THUMBS_DIR + "/" + nameifyPath(bookFilePath).replace(/\.\w+$/, extension);
    await RNFS.moveFile(inPath, outPath);
    return outPath;
  }
}
