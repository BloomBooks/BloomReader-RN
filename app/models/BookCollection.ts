import { Book, Shelf } from "./BookOrShelf";

export interface BookCollection {
  books: Book[];
  shelves: Shelf[];
  newBook?: Book; // This would be a recently imported book that we want to auto-open
}

export function emptyBookCollection(): BookCollection {
  return {
    books: [],
    shelves: []
  };
}
