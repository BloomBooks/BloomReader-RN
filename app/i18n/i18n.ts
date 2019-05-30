import I18n from "react-native-i18n";
const en = require("./locales/en.json");
const fr = require("./locales/fr.json");

I18n.fallbacks = true;
I18n.translations = { en, fr };
I18n.defaultLocale = "en";
// The advantage of this is we don't have to specify redundant strings in the .json files.
// For example, we don't need "Email Error Log": "Email Error Log" in en.json.
// And if we haven't specified a translation yet, we get English as a fallback.
// But if we used an ID rather than a string, "EmailErrorLog" would become "Email error log".
I18n.missingBehaviour = "guess";

// react-native-i18n doesn't work if the ID contains a period
const bookViewerPrefix = "BookViewer_";

// Strip off the dash and following from the locale to get lang code
export function currentLang(): string {
  return I18n.currentLocale().replace(/-.*/, "");
}

export function getBookViewerTranslationPairs(): object {
  // Gives us an array of objects which each contain one key/value pair
  let pairs = Object.keys(I18n.translations.en)
    .filter(key => key.startsWith(bookViewerPrefix))
    .map(key => {
      return { [cleanUpBookViewerL10nKey(key)]: I18n.t(key) };
    });

  // But what we really want is a single object which contains key/value pairs
  return Object.assign({}, ...pairs);
}

function cleanUpBookViewerL10nKey(key: string) {
  // Remove our internal meta prefix which lets us know this is for the book viewer
  key = key.substring(bookViewerPrefix.length);

  // The actual key in the viewer has periods,
  // but react-native-i18n doesn't work if the key contains a period.
  // So we store the key in BloomReader with an underscore instead.
  return key.replace("_", ".");
}

export default I18n;
