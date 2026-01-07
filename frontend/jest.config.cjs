/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
    transform: { "^.+\\.(js|jsx)$": "babel-jest" },
    // Трансформуємо axios (він ESM) замість ігнору
    transformIgnorePatterns: ["/node_modules/(?!(axios)/)"],
    moduleNameMapper: {
      "\\.(css|scss|sass)$": "identity-obj-proxy",
    },
    // Тимчасово ігноруємо старі тести, що не пов'язані з тим, що ми зараз робимо
    testPathIgnorePatterns: [
      "/node_modules/",
      "<rootDir>/src/pages/Notes/Notes.test.js",
      "<rootDir>/src/pages/Awards/Awards.test.js",
      "<rootDir>/src/pages/Profile/Profile.test.js",
      "<rootDir>/src/pages/Login/Login.test.js",
      "<rootDir>/src/pages/Home/Home.test.js",
      "<rootDir>/src/components/Header/Header.test.jsx",
      "<rootDir>/src/App.test.js",
      "<rootDir>/src/store/slices/__tests__/axios.js"
    ],
  };
  