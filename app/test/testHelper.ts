import { Book, Shelf } from "../models/BookOrShelf";

export function bookFactory(book: any): Book {
  const emptyBook = {
    filename: "/br/mock.bloomd",
    title: "Mock Book",
    allTitles: {},
    modifiedAt: 1,
    tags: []
  };
  return Object.assign(emptyBook, book);
}

export function shelfFactory(shelf: any): Shelf {
  const emptyShelf = {
    isShelf: true,
    id: "mock/shelf",
    label: [{ en: "Mock Shelf" }],
    color: "ffffff",
    tags: []
  };
  return Object.assign(emptyShelf, shelf);
}
