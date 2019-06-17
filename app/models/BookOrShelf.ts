import { currentLang } from "../i18n/i18n";
import { BookCollection } from "./BookCollection";
import { nameFromPath } from "../util/FileUtil";

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
  modifiedAt: number;
  tags: string[];
}

export type BookOrShelf = Book | Shelf;

export function isShelf(bookOrShelf: BookOrShelf): bookOrShelf is Shelf {
  return !!(<Shelf>bookOrShelf).id;
}

// If you update this interface, increment COLLECTION_FORMAT_VERSION in BookCollection.ts
export enum BookFeatures {
  talkingBook = "talkingBook",
  blind = "blind",
  signLanguage = "signLanguage",
  motion = "motion"
  // Other possible unverified elements of meta.json.features:
  // quizzes = "quizzes",
  // otherInteractiveActivities = "other interactive activities"
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
export function collectionForShelf(
  shelf: Shelf | undefined,
  collection: BookCollection
): BookCollection {
  return {
    shelves: collection.shelves.filter(subShelf =>
      goesOnShelf(subShelf, shelf, collection.shelves)
    ),
    books: collection.books.filter(book =>
      goesOnShelf(book, shelf, collection.shelves)
    )
  };
}

// Includes contents of sub-shelves
export function recursiveListForShelf(
  shelf: Shelf,
  collection: BookCollection
): BookOrShelf[] {
  const shelfCollection = collectionForShelf(shelf, collection);
  let extendedList = shelfCollection.shelves.reduce(
    (list, shelf) => list.concat(recursiveListForShelf(shelf, collection)),
    [] as BookOrShelf[]
  );
  return [shelf, ...shelfCollection.books, ...extendedList];
}

export function sortedListForShelf(
  shelf: Shelf | undefined,
  collection: BookCollection
): BookOrShelf[] {
  const shelfCollection = collectionForShelf(shelf, collection);
  const list = (shelfCollection.shelves as BookOrShelf[]).concat(
    shelfCollection.books
  );
  const prunedList = removeDuplicateBooks(list);
  return prunedList.sort((a, b) =>
    displayName(a).localeCompare(displayName(b))
  );
}

// The book collection is sourced from multiple directories, and there may
// be duplicates between them. Only show the newest of two books with the same
// filename
function removeDuplicateBooks(items: BookOrShelf[]): BookOrShelf[] {
  return items.reduce(
    (items, item) => {
      if (!isShelf(item)) {
        const duplicateIndex = items.findIndex(
          i => nameFromPath(i.filepath) == nameFromPath(item.filepath)
        );
        if (duplicateIndex >= 0) {
          const duplicate = items[duplicateIndex];
          const winner =
            item.modifiedAt > duplicate.modifiedAt ? item : duplicate;
          items[duplicateIndex] = winner;
          return items;
        }
      }
      items.push(item);
      return items;
    },
    [] as BookOrShelf[]
  );
}
