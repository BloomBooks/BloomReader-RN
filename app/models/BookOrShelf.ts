import { currentLang } from "../i18n/i18n";
import { BookCollection } from "./BookCollection";

export interface BookOrShelf {
  isShelf?: boolean;
  tags: string[];
}

export interface Book extends BookOrShelf {
  filename: string; // Used as the unique identifier
  title: string;
  allTitles: { [localeName: string]: string };
  thumbPath?: string;
  modifiedAt: number; // millis UTC
}

export interface Shelf extends BookOrShelf {
  id: string; // Used as the unique identifier
  label: Array<{ [localeName: string]: string }>;
  color: string;
}

export function goesOnShelf(
  item: BookOrShelf,
  shelf: Shelf | undefined,
  shelves: Shelf[]
): boolean {
  const parentShelfId = getParentShelfId(item.tags);
  if (shelf) return shelf.id == parentShelfId;
  else
    return !parentShelfId || !shelves.some(shelf => shelf.id == parentShelfId);
}

function getParentShelfId(tags: string[]): string | null {
  if (!tags) return null;
  let shelfTag = tags.find(tag => tag.startsWith("bookshelf:"));
  return shelfTag ? shelfTag.replace(/^bookshelf:/, "") : null;
}

export function displayName(bookOrShelf: BookOrShelf): string {
  const language = currentLang();
  return bookOrShelf.isShelf
    ? shelfDisplayName(bookOrShelf as Shelf, language)
    : bookDisplayName(bookOrShelf as Book, language);
}

function shelfDisplayName(shelf: Shelf, language: string): string {
  const label = shelf.label.find(aLabel => !!aLabel[language]);
  return label ? label[language] : Object.values(shelf.label[0])[0];
}

function bookDisplayName(book: Book, language: string): string {
  const name = book.allTitles[language];
  return name ? name : book.title;
}

// Only includes direct children of shelf
export function listForShelf(
  shelf: Shelf | undefined,
  collection: BookCollection
): BookOrShelf[] {
  return (collection.shelves as BookOrShelf[])
    .filter(subShelf => goesOnShelf(subShelf, shelf, collection.shelves))
    .concat(
      collection.books.filter(book =>
        goesOnShelf(book, shelf, collection.shelves)
      )
    );
}

// Includes contents of sub-shelves
export function completeListForShelf(
  shelf: Shelf,
  collection: BookCollection
): BookOrShelf[] {
  const list = listForShelf(shelf, collection);
  let extendedList: BookOrShelf[] = [];
  for (let i = 0; i < list.length; ++i) {
    if (list[i].isShelf)
      extendedList = extendedList.concat(
        completeListForShelf(list[i] as Shelf, collection)
      );
  }
  return list.concat(extendedList);
}

export function sortedListForShelf(
  shelf: Shelf | undefined,
  collection: BookCollection
): BookOrShelf[] {
  return listForShelf(shelf, collection).sort((a, b) =>
    displayName(a).localeCompare(displayName(b))
  );
}
