import {
  displayName,
  goesOnShelf,
  listForShelf,
  completeListForShelf
} from "./BookOrShelf";
import I18n from "../i18n/i18n";
import { bookFactory, shelfFactory } from "../test/testHelper";

const moonAndCap = bookFactory({
  title: "Moon & Cap",
  allTitles: {
    en: "The Moon and the Cap",
    fr: "La Lune et la Casquette"
  }
});

test("Book display name for included language", () => {
  I18n.currentLocale = jest.fn(() => "fr-FR");
  expect(displayName(moonAndCap)).toEqual("La Lune et la Casquette");
});

test("Book display name is title if phone language not in allTitles", () => {
  I18n.currentLocale = jest.fn(() => "es-ES");
  expect(displayName(moonAndCap)).toEqual("Moon & Cap");
});

const firstGradeBooks = shelfFactory({
  label: [{ en: "First Grade Books" }, { fr: "Livres de la première année" }]
});

test("Shelf display name for included language", () => {
  I18n.currentLocale = jest.fn(() => "fr-FR");
  expect(displayName(firstGradeBooks)).toEqual("Livres de la première année");
});

test("Shelf display name is first listed if language not included", () => {
  I18n.currentLocale = jest.fn(() => "es-ES");
  expect(displayName(firstGradeBooks)).toEqual("First Grade Books");
});

const threeShelves = [1, 2, 3].map(num => shelfFactory({ id: `shelf-${num}` }));
const shelf2Book = bookFactory({ tags: ["bookshelf:shelf-2"] });
test("Book goesOnShelf if the shelf is its parent", () => {
  expect(goesOnShelf(shelf2Book, threeShelves[1], threeShelves)).toBe(true);
});

test("Book does not goesOnShelf if it has a different parent", () => {
  expect(goesOnShelf(shelf2Book, threeShelves[2], threeShelves)).toBe(false);
});

const noShelfBook = bookFactory({});
test("Book does not goesOnShelf if it has no parent", () => {
  expect(goesOnShelf(noShelfBook, threeShelves[2], threeShelves)).toBe(false);
});

test("noShelfBook goesOnShelf when shelf is undefined", () => {
  expect(goesOnShelf(noShelfBook, undefined, threeShelves)).toBe(true);
});

test("book with parent shelf does not goesOnShelf if shelf is undefined", () => {
  expect(goesOnShelf(shelf2Book, undefined, threeShelves));
});

test("book goesOnShelf if shelf is undefined and book's shelf does not exist", () => {
  expect(goesOnShelf(shelf2Book, undefined, [])).toBe(true);
});

const twoRootBooks = [1, 2].map(num =>
  bookFactory({ filename: `/br/book-${num}` })
);
const childShelfofShelf1 = shelfFactory({
  id: "childShelf",
  tags: ["bookshelf:shelf-1"]
});
const twoShelf1Books = [1, 2].map(num =>
  bookFactory({ filename: `/br/s1-book-${num}`, tags: ["bookshelf:shelf-1"] })
);
const twoChildShelfBooks = [1, 2].map(num =>
  bookFactory({
    filename: `/br/cs-book-${num}`,
    tags: ["bookshelf:childShelf"]
  })
);
const bookCollection = {
  books: [...twoRootBooks, ...twoShelf1Books, ...twoChildShelfBooks],
  shelves: [...threeShelves, childShelfofShelf1]
};
test("listForShelf lists books and shelves on that shelf", () => {
  expect(listForShelf(threeShelves[0], bookCollection)).toEqual([
    childShelfofShelf1,
    ...twoShelf1Books
  ]);
  expect(listForShelf(childShelfofShelf1, bookCollection)).toEqual(
    twoChildShelfBooks
  );
  expect(listForShelf(threeShelves[2], bookCollection)).toEqual([]);
});

test("listForShelf lists root books and shelves for undefined", () => {
  expect(listForShelf(undefined, bookCollection)).toEqual([
    ...threeShelves,
    ...twoRootBooks
  ]);
});

test("completeListForShelf includes subshelf contents", () => {
  expect(completeListForShelf(threeShelves[0], bookCollection)).toEqual([
    childShelfofShelf1,
    ...twoShelf1Books,
    ...twoChildShelfBooks
  ]);
});
