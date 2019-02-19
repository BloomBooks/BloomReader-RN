module.exports = {
  preset: "react-native",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)x?$",
  transform: {
    "^.+\\.(js|tsx?)$":
      "<rootDir>/node_modules/react-native/jest/preprocessor.js"
  },
  testPathIgnorePatterns: ["\\.snap$", "<rootDir>/node_modules/"],
  cacheDirectory: ".jest/cache",
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|react-navigation|react-native-safe-area-view|react-native-i18n)/)"
  ]
  // setupFiles: ["./__mocks__/react-native.js"]  // May need this in the future
};
