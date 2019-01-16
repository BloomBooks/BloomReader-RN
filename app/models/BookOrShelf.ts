import { currentLang } from "../i18n/i18n";

export interface BookOrShelf {
  isShelf?: boolean;
  tags: string[];
}

export interface Book extends BookOrShelf {
  name: string;
  filename: string;
  thumbPath?: string;
  modifiedAt: number; // millis UTC
}

export interface Shelf extends BookOrShelf {
  id: string;
  label: Array<{ [localeName: string]: string }>;
  color: string;
}

export function goesOnShelf(
  item: BookOrShelf,
  shelf: Shelf | undefined,
  shelves: Shelf[]
) {
  const parentShelfId = getParentShelfId(item.tags);
  if (shelf) return shelf.id == parentShelfId;
  else
    return !parentShelfId || !shelves.some(shelf => shelf.id == parentShelfId);
}

function getParentShelfId(tags: string[]) {
  if (!tags) return null;
  let shelfTag = tags.find(tag => tag.startsWith("bookshelf:"));
  return shelfTag ? shelfTag.replace(/^bookshelf:/, "") : null;
}

export function displayName(bookOrShelf: BookOrShelf) {
  const language = currentLang();
  return bookOrShelf.isShelf
    ? shelfDisplayName(bookOrShelf as Shelf, language)
    : bookDisplayName(bookOrShelf as Book);
}

function shelfDisplayName(shelf: Shelf, language: string) {
  let label = shelf.label.find(aLabel => !!aLabel[language]);
  return label ? label[language] : Object.values(shelf.label[0])[0];
}

function bookDisplayName(book: Book) {
  // Refactor - use list of names from MetaData and i18n
  return book.name;
}