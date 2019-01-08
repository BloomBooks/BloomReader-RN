import I18n from "react-native-i18n";
const en = require("./locales/en.json");
const fr = require("./locales/fr.json");

I18n.fallbacks = true;
I18n.translations = { en, fr };

// Strip off the dash and following from the locale to get lang code
I18n.currentLang = function() {
  return this.currentLocale().replace(/-.*/, "");
};

export default I18n;
