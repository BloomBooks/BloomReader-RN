import I18n from "../i18n/i18n";

export default {
  goesOnShelf: goesOnShelf,
  displayName: displayName
};

function goesOnShelf(item, shelf, shelves) {
  const tags = item.isShelf ? item.tags : item.metaData.tags;
  const parentShelfId = getParentShelfId(tags);
  if (shelf) return shelf.id == parentShelfId;
  else
    return !parentShelfId || !shelves.some(shelf => shelf.id == parentShelfId);
}

function getParentShelfId(tags) {
  if (!tags) return null;
  let shelfTag = tags.find(tag => tag.startsWith("bookshelf:"));
  return shelfTag ? shelfTag.replace(/^bookshelf:/, "") : null;
}

function displayName(bookOrShelf) {
  if (bookOrShelf.isShelf) {
    let label = bookOrShelf.label.find(aLabel => !!aLabel[I18n.currentLang()]);
    return label
      ? label[I18n.currentLang()]
      : bookOrShelf.label[0][Object.keys[bookOrShelf.label[0]]];
  } else {
    return bookOrShelf.name;
  }
}
