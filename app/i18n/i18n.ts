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

// Strip off the dash and following from the locale to get lang code
export function currentLang(): string {
  return I18n.currentLocale().replace(/-.*/, "");
}

export default I18n;
