import { BookOrShelf, Book, Shelf } from "../models/BookOrShelf";
import * as BookStorage from "./BookStorage";
import Share from "react-native-share";

export async function share(item: BookOrShelf): Promise<void> {
  if (item.isShelf) shareShelfBundle(item as Shelf);
  else shareBook(item as Book);
}

export async function shareAll(): Promise<void> {
  const bundlePath = await BookStorage.bundleAll();
  shareBundle(bundlePath);
}

async function shareShelfBundle(shelf: Shelf): Promise<void> {
  const bundlePath = await BookStorage.bundleShelf(shelf);
  shareBundle(bundlePath);
}

function shareBundle(bundlePath: string): void {
  Share.open({
    url: `file://${bundlePath}`,
    type: "application/*", // This gets us a better selection of apps to share with than "application/bloom" and seems to work just the same
    subject: "My Bloom Books.bloombundle"
  });
}

function shareBook(book: Book): void {
  const path = BookStorage.bookPath(book);
  Share.open({
    url: `file://${path}`,
    type: "application/*", // This gets us a better selection of apps to share with than "application/bloom" and seems to work just the same
    subject: book.filename
  });
}
