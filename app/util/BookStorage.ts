import { AsyncStorage } from "react-native";
import RNFS from "react-native-fs";
import { unzip } from "react-native-zip-archive";
import { Book } from "../models/Book";

const booksDir = RNFS.DocumentDirectoryPath + "/books";
const thumbsDir = RNFS.DocumentDirectoryPath + "/thumbs";
const openBookDir = RNFS.DocumentDirectoryPath + "/openBook";
const keyPrefix = "bloomreader.books.";
const bookListKey = keyPrefix + "list";

export async function createDirectories() {
  await RNFS.mkdir(booksDir);
  await RNFS.mkdir(thumbsDir);
}

export async function importBookFile(filename: string) {
  const bookName = bookNameFromFilename(filename);
  const tmpBookPath = await extractBookToTmp(
    booksDir + "/" + filename,
    bookName
  );
  const thumbPath: string | undefined = await saveThumbnail(
    tmpBookPath,
    bookName
  );
  const list: Book[] = await getBookList();
  const existingBook = list.find(book => book.name == bookName);
  let book;
  if (existingBook) book = updateBookEntry(existingBook, filename, thumbPath);
  else book = addBookEntry(list, filename, thumbPath);
  writeBookList(list);
  RNFS.unlink(tmpBookPath);
  return {
    book: book,
    list: list
  };
}

export async function getBookList() {
  const listJson = await AsyncStorage.getItem(bookListKey);
  return listJson ? JSON.parse(listJson) : [];
}

async function writeBookList(list: Array<Book>) {
  await AsyncStorage.setItem(bookListKey, JSON.stringify(list));
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

function addBookEntry(
  list: Book[],
  filename: string,
  thumbPath: string | undefined
) {
  const book = {
    name: bookNameFromFilename(filename),
    filename: filename,
    thumbPath: thumbPath,
    modifiedAt: Date.now()
  };
  list.push(book);
  list.sort((a, b) => a.name.localeCompare(b.name));
  return book;
}

function updateBookEntry(
  book: Book,
  filename: string,
  thumbPath: string | undefined
) {
  book.filename = filename;
  book.thumbPath = thumbPath;
  book.modifiedAt = Date.now();
  return book;
}

async function extractBookToTmp(zipPath: string, bookName: string) {
  const path = RNFS.CachesDirectoryPath + "/" + bookName;
  return await unzip(zipPath, path);
}

async function saveThumbnail(bookPath: string, bookName: string) {
  const fileList = await RNFS.readdir(bookPath);
  const thumbFilename = fileList.find(filename =>
    filename.startsWith("thumbnail.")
  );
  if (thumbFilename) {
    const inPath = bookPath + "/" + thumbFilename;
    let outPath = thumbsDir + "/" + bookName;
    await RNFS.mkdir(outPath);
    outPath += "/" + thumbFilename;
    await RNFS.moveFile(inPath, outPath);
    return outPath;
  }
}
