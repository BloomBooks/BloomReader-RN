import { BookOrShelf, Book, Shelf } from "../models/BookOrShelf";
import * as BookStorage from "./BookStorage";
import Share from "react-native-share";

export async function share(item: BookOrShelf): Promise<void> {
  if (item.isShelf) shareShelfBundle(item as Shelf);
  else shareBook(item as Book);
}

export function shareAll(): void {
  // Share the whole collection
}

function shareBook(book: Book): void {
  const path = BookStorage.bookPath(book);
  Share.open({
    url: `file://${path}`,
    type: "application/zip", // This gets us a better selection of apps to share with than "application/bloom" and seems to work just the same
    subject: book.filename
  });
}

async function shareShelfBundle(shelf: Shelf): Promise<void> {
  // Bundle up the shelf and then share it
}
