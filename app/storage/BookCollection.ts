import { AsyncStorage, ToastAndroid } from "react-native";
import {
  Book,
  Shelf,
  BookOrShelf,
  listForShelf,
  isShelf
} from "../models/BookOrShelf";
import { BookCollection } from "./BookCollection";
import I18n from "../i18n/i18n";
import * as BRAnalytics from "../util/BRAnalytics";
import * as BookStorage from "./BookStorage";

const KEY_PREFIX = "bloomreader.books.";
const BOOK_LIST_KEY = KEY_PREFIX + "books";
const SHELF_LIST_KEY = KEY_PREFIX + "shelves";
export const COLLECTION_FORMAT_VERSION = "2";

export interface BookCollection {
  books: Book[];
  shelves: Shelf[];
}

export interface BookCollectionWithNewBook extends BookCollection {
  newBook?: Book;
}

export function emptyBookCollection(): BookCollection {
  return {
    books: [],
    shelves: []
  };
}

export async function syncCollectionAndFetch(): Promise<BookCollection> {
  const collection = getBookCollection();
  // Sync collection with public dirs
  return collection;
}

export async function importBookToCollection(
  filepath: string,
  importMethod: BRAnalytics.AddedBooksMethod | null
): Promise<BookCollectionWithNewBook> {
  const collection = await getBookCollection();
  const book = await BookStorage.importBookFile(filepath);
  collection.books = collection.books.filter(b => b.filepath != filepath); // Remove any existing copy
  collection.books.push(book);
  writeCollection(collection);
  if (importMethod) BRAnalytics.addedBooks(importMethod, [book.title]);
  return {
    ...collection,
    newBook: book
  };
}

export async function importBookDirToCollection(
  srcDir: string
): Promise<BookCollection> {
  const newItems = await BookStorage.importBooksDir(srcDir);
  const collection = await getBookCollection();
  collection.books = newItems.books.reduce(
    (combinedBooks, newBook) => [
      ...combinedBooks.filter(b => b.filepath != newBook.filepath),
      newBook
    ],
    collection.books
  );
  collection.shelves = newItems.shelves.reduce(
    (combinedShelves, newShelf) => [
      ...combinedShelves.filter(s => s.id != newShelf.id),
      newShelf
    ],
    collection.shelves
  );
  writeCollection(collection);
  BRAnalytics.addedBooks("FileIntent", newItems.books.map(b => b.title));
  return collection;
}

export async function updateBookListFormatIfNeeded(
  oldFormatVersion: string | null
): Promise<void> {
  if (oldFormatVersion == COLLECTION_FORMAT_VERSION) return;

  // This can take some time, let the user know what we're up to
  ToastAndroid.show(I18n.t("UpdatingBookCollectionFormat"), ToastAndroid.SHORT);

  const oldBookList = (await readList(BOOK_LIST_KEY)) as Book[];
  const newBookList: Book[] = [];
  for (let i = 0; i < oldBookList.length; ++i) {
    newBookList.push(await BookStorage.importBookFile(oldBookList[i].filepath));
  }
  await writeList(BOOK_LIST_KEY, newBookList);
}

export async function deleteBookOrShelf(
  bookOrShelf: BookOrShelf
): Promise<BookCollection> {
  const collection = await getBookCollection();
  const deletedItems = deleteItem(bookOrShelf, collection);
  BookStorage.deleteBooksAndShelves(deletedItems);
  collection.books = collection.books.filter(
    b => !deletedItems.some(item => item.filepath == b.filepath)
  );
  collection.shelves = collection.shelves.filter(
    s => !deletedItems.some(item => isShelf(item) && item.id == s.id)
  );
  writeCollection(collection);
  return collection;
}

function deleteItem(
  item: BookOrShelf,
  collection: BookCollection,
  deletedItems: BookOrShelf[] = []
): BookOrShelf[] {
  deletedItems.push(item);
  if (isShelf(item)) {
    const shelfItems = listForShelf(item, collection);
    deletedItems = shelfItems.reduce(
      (deletedItems, item) => deleteItem(item, collection, deletedItems),
      deletedItems
    );
  }
  return deletedItems;
}

async function getBookCollection(): Promise<BookCollection> {
  return {
    books: (await readList(BOOK_LIST_KEY)) as Book[],
    shelves: (await readList(SHELF_LIST_KEY)) as Shelf[]
  };
}

async function writeCollection(collection: BookCollection): Promise<void> {
  writeList(BOOK_LIST_KEY, collection.books);
  writeList(SHELF_LIST_KEY, collection.shelves);
}

async function readList(key: string): Promise<BookOrShelf[]> {
  const listJson = await AsyncStorage.getItem(key);
  return listJson ? JSON.parse(listJson) : [];
}

async function writeList(key: string, list: object[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(list));
}
