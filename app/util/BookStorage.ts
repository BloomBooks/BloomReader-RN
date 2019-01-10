import { AsyncStorage } from "react-native";
import RNFS from "react-native-fs";
import { unzip } from "react-native-zip-archive";
import { Book, Shelf } from "../models/BookOrShelf";
import { BookCollection } from "../models/BookCollection";
import { nameFromPath } from "./FileUtil";

const booksDir = RNFS.DocumentDirectoryPath + "/books";
const thumbsDir = RNFS.DocumentDirectoryPath + "/thumbs";
const openBookDir = RNFS.DocumentDirectoryPath + "/openBook";
const keyPrefix = "bloomreader.books.";
const bookListKey = keyPrefix + "books";
const shelfListKey = keyPrefix + "shelves";

export async function createDirectories() {
  await RNFS.mkdir(booksDir);
  await RNFS.mkdir(thumbsDir);
}

export async function importBookFile(
  filename: string
): Promise<BookCollection> {
  let bookList: Book[] = await readList(bookListKey);
  const book = await addBookToList(filename, bookList);
  writeList(bookListKey, bookList);
  return {
    book: book,
    books: bookList,
    shelves: await readList(shelfListKey)
  };
}

async function addBookToList(filename: string, list: Book[]) {
  const tmpBookPath = await extractBookToTmp(filename);
  const thumbPath: string | undefined = await saveThumbnail(tmpBookPath);
  const metaData = JSON.parse(await RNFS.readFile(`${tmpBookPath}/meta.json`));
  RNFS.unlink(tmpBookPath);
  const existingBookIndex = list.findIndex(book => book.filename == filename);
  if (existingBookIndex >= 0) list.splice(existingBookIndex, 1);
  const book = {
    filename: filename,
    title: metaData.title,
    allTitles: JSON.parse(metaData.allTitles),
    tags: metaData.tags,
    thumbPath: thumbPath,
    modified: Date.now()
  };
  list.push(book);
  return book;
}

export async function importBooksDir(
  filepath: string
): Promise<BookCollection> {
  let bookList: Book[] = await readList(bookListKey);
  let shelfList: Shelf[] = await readList(shelfListKey);
  const files = await RNFS.readDir(filepath);
  for (let i = 0; i < files.length; ++i) {
    let file = files[i];
    if (file.name.endsWith(".bloomd")) {
      await RNFS.moveFile(file.path, `${booksDir}/${file.name}`);
      await addBookToList(file.name, bookList);
    } else if (file.name.endsWith(".bloomshelf")) {
      let shelfInfo = JSON.parse(await RNFS.readFile(file.path));
      addShelfToList(shelfInfo, shelfList);
    }
  }
  RNFS.unlink(filepath);
  writeList(bookListKey, bookList);
  writeList(shelfListKey, shelfList);
  return {
    books: bookList,
    shelves: shelfList
  };
}

function addShelfToList(newShelf: Shelf, list: Shelf[]) {
  newShelf.isShelf = true;
  let existingShelfIndex = list.findIndex(shelf => shelf.id == newShelf.id);
  if (existingShelfIndex >= 0) list.splice(existingShelfIndex, 1);
  list.push(newShelf);
}

export async function getBookCollection(): Promise<BookCollection> {
  return {
    books: await readList(bookListKey),
    shelves: await readList(shelfListKey)
  };
}

export async function openBookForReading(book: Book) {
  return await unzip(bookPath(book), openBookDir);
}

export async function getThumbnail(book: Book) {
  if (!book.thumbPath) return undefined;
  return {
    data: await RNFS.readFile(book.thumbPath, "base64"),
    format: book.thumbPath
      .slice(book.thumbPath.lastIndexOf(".") + 1)
      .toLocaleLowerCase()
  };
}

export async function fetchHtml() {
  const fileList = await RNFS.readDir(openBookDir);
  const htmlFile = fileList.find(entry => /\.html?$/.test(entry.name));
  return htmlFile ? await RNFS.readFile(htmlFile.path) : "";
}

function bookPath(book: Book) {
  return booksDir + "/" + book.filename;
}

function bookNameFromFilename(filename: string) {
  return filename.replace(/\.bloomd$/, "");
}

async function readList(key: string) {
  const listJson = await AsyncStorage.getItem(key);
  return listJson ? JSON.parse(listJson) : [];
}

async function writeList(key: string, list: object[]) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

async function extractBookToTmp(filename: string) {
  const inPath = `${booksDir}/${filename}`;
  const outPath = `${RNFS.CachesDirectoryPath}/${filename}_FILES`;
  return await unzip(inPath, outPath);
}

async function saveThumbnail(bookPath: string) {
  const fileList = await RNFS.readdir(bookPath);
  const thumbFilename = fileList.find(filename =>
    filename.startsWith("thumbnail.")
  );
  if (thumbFilename) {
    const inPath = bookPath + "/" + thumbFilename;
    let outPath =
      thumbsDir + "/" + bookNameFromFilename(nameFromPath(bookPath));
    await RNFS.mkdir(outPath);
    outPath += "/" + thumbFilename;
    await RNFS.moveFile(inPath, outPath);
    return outPath;
  }
}
