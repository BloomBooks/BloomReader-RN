import { Book, Shelf } from "./BookOrShelf";

export interface BookCollection {
  books: Book[];
  shelves: Shelf[];
  book?: Book; // This would be a recently imported book that we want to auto-open
}
