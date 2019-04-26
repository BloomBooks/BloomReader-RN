import { currentLang } from "../i18n/i18n";
import { BookCollection } from "../storage/BookCollection";

// If you update this interface, increment COLLECTION_FORMAT_VERSION in BookCollection.ts
export interface Book {
  filepath: string; // Used as the unique identifier
  title: string;
  allTitles: { [localeName: string]: string };
  features: BookFeatures[];
  thumbPath?: string;
  modifiedAt: number;
  tags: string[];
}

// If you update this interface, increment COLLECTION_FORMAT_VERSION in BookCollection.ts
export interface Shelf {
  id: string; // Used as the unique identifier
  label: Array<{ [localeName: string]: string }>;
  color: string;
  filepath: string;
  tags: string[];
}

export type BookOrShelf = Book | Shelf;

export function isShelf(bookOrShelf: BookOrShelf): bookOrShelf is Shelf {
  return !!(<Shelf>bookOrShelf).id;
}

// If you update this interface, increment COLLECTION_FORMAT_VERSION in BookCollection.ts
export enum BookFeatures {
  audio = "audio",
  imageDescriptions = "image descriptions",
  motion = "motion",
  signLanguage = "sign language",
  quizzes = "quizzes",
  otherInteractiveActivities = "other interactive activities"
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
  return isShelf(bookOrShelf)
    ? shelfDisplayName(bookOrShelf, language)
    : bookDisplayName(bookOrShelf, language);
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
export function recursiveListForShelf(
  shelf: Shelf,
  collection: BookCollection
): BookOrShelf[] {
  const list = listForShelf(shelf, collection);
  let extendedList: BookOrShelf[] = [];
  for (let i = 0; i < list.length; ++i) {
    const item = list[i];
    if (isShelf(item))
      extendedList = extendedList.concat(
        recursiveListForShelf(item, collection)
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
