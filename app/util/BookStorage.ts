import { AsyncStorage } from "react-native";
import RNFS from "react-native-fs";
import { unzip } from "react-native-zip-archive";
import { Book } from "../models/Book";

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

export async function importBookFile(filename) {
  let bookList = await readList(bookListKey);
  const book = await addBookToList(filename, bookList);
  writeList(bookListKey, bookList);
  return {
    book: book,
    books: bookList,
    shelves: await readList(shelfListKey)
  };
}

async function addBookToList(filename, list) {
  const bookName = bookNameFromFilename(filename);
  const tmpBookPath = await extractBookToTmp(
    booksDir + "/" + filename,
    bookName
  );
  const thumbPath: (string | undefined)  = await saveThumbnail(tmpBookPath, bookName);
  const metaData = JSON.parse(await RNFS.readFile(`${tmpBookPath}/meta.json`));
  let list: Book[] = await getBookList();
  let existingBook = list.find(book => book.name == bookName);
  let book;
  if (existingBook) book = updateBookEntry(existingBook, filename, thumbPath);
  else book = addBookEntry(list, filename, thumbPath);
  writeBookList(list);
  RNFS.unlink(tmpBookPath);
  const existingBookIndex = list.findIndex(book => book.name == bookName);
  if (existingBookIndex >= 0) list.splice(existingBookIndex, 1);
  const book = {
    name: bookName,
    filename: filename,
    thumbPath: thumbPath,
    metaData: metaData,
    modified: Date.UTC()
  };
  list.push(book);
  return book;
}

async function importBooksDir(filepath) {
  let bookList = await readList(bookListKey);
  let shelfList = await readList(shelfListKey);
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

function addShelfToList(newShelf, list) {
  newShelf.isShelf = true;
  let existingShelfIndex = list.findIndex(shelf => shelf.id == newShelf.id);
  if (existingShelfIndex >= 0) list.splice(existingShelfIndex, 1);
  list.push(newShelf);
}

export async function getBooksAndShelves() {
  return {
    books: await readList(bookListKey),
    shelves: await readList(shelfListKey)
  };

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

async function readList(key) {
  const listJson = await AsyncStorage.getItem(key);
  return listJson ? JSON.parse(listJson) : [];
}

async function writeList(key, list) {
  await AsyncStorage.setItem(key, JSON.stringify(list));
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
