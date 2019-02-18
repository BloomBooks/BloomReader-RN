import I18n from "react-native-i18n";
const en = require("./locales/en.json");
const fr = require("./locales/fr.json");

I18n.fallbacks = true;
I18n.translations = { en, fr };
I18n.defaultLocale = "en";
I18n.missingBehaviour = "guess";

// Strip off the dash and following from the locale to get lang code
export function currentLang() {
  return I18n.currentLocale().replace(/-.*/, "");
}

export default I18n;
