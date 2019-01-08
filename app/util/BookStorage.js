import { AsyncStorage } from "react-native";
import RNFS from "react-native-fs";
import { unzip } from "react-native-zip-archive";

const booksDir = RNFS.DocumentDirectoryPath + "/books";
const thumbsDir = RNFS.DocumentDirectoryPath + "/thumbs";
const openBookDir = RNFS.DocumentDirectoryPath + "/openBook";
const keyPrefix = "bloomreader.books.";
const bookListKey = keyPrefix + "list";

export default {
  createDirectories: createDirectories,
  importBookFile: importBookFile,
  getBookList: getBookList,
  openBookForReading: openBookForReading,
  getThumbnail: getThumbnail,
  fetchHtml: fetchHtml
};

async function createDirectories() {
  await RNFS.mkdir(booksDir);
  await RNFS.mkdir(thumbsDir);
}

async function importBookFile(filename) {
  const bookName = bookNameFromFilename(filename);
  const tmpBookPath = await extractBookToTmp(
    booksDir + "/" + filename,
    bookName
  );
  const thumbPath = await saveThumbnail(tmpBookPath, bookName);
  let list = await getBookList();
  let existingBook = list.find(book => book.name == bookName);
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

async function getBookList() {
  const listJson = await AsyncStorage.getItem(bookListKey);
  return listJson ? JSON.parse(listJson) : [];
}

async function writeBookList(list) {
  await AsyncStorage.setItem(bookListKey, JSON.stringify(list));
}

async function openBookForReading(book) {
  return await unzip(bookPath(book), openBookDir);
}

async function getThumbnail(book) {
  if (!book.thumbPath) return undefined;
  return {
    data: await RNFS.readFile(book.thumbPath, "base64"),
    format: book.thumbPath
      .slice(book.thumbPath.lastIndexOf(".") + 1)
      .toLocaleLowerCase()
  };
}

async function fetchHtml() {
  const fileList = await RNFS.readDir(openBookDir);
  const htmlFile = fileList.find(entry => /\.html?$/.test(entry.name));
  return htmlFile ? await RNFS.readFile(htmlFile.path) : "";
}

function bookPath(book) {
  return booksDir + "/" + book.filename;
}

function bookNameFromFilename(filename) {
  return filename.replace(/\.bloomd$/, "");
}

function addBookEntry(list, filename, thumbPath) {
  const book = {
    name: bookNameFromFilename(filename),
    filename: filename,
    thumbPath: thumbPath,
    modified: Date.UTC()
  };
  list.push(book);
  list.sort((a, b) => a.name.localeCompare(b.name));
  return book;
}

function updateBookEntry(book, filename, thumbPath) {
  book.filename = filename;
  book.thumbPath = thumbPath;
  book.modified = Date.UTC();
  return book;
}

async function extractBookToTmp(zipPath, bookName) {
  const path = RNFS.CachesDirectoryPath + "/" + bookName;
  return await unzip(zipPath, path);
}

async function saveThumbnail(bookPath, bookName) {
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
