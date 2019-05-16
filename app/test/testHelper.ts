import { Book, Shelf } from "../models/BookOrShelf";

export function bookFactory(bookParams: any): Book {
  const emptyBook = {
    filepath: "/br/mock.bloomd",
    title: "Mock Book",
    allTitles: {},
    modifiedAt: 1,
    tags: []
  };
  return Object.assign(emptyBook, bookParams);
}

export function shelfFactory(shelfParams: any): Shelf {
  const emptyShelf = {
    isShelf: true,
    filepath: "/br/mock.bloomshelf",
    id: "mock/shelf",
    label: [{ en: "Mock Shelf" }],
    color: "ffffff",
    tags: []
  };
  return Object.assign(emptyShelf, shelfParams);
}
