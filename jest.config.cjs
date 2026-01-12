module.exports = {
  testEnvironment: "node",
  testRunner: "jest-circus/runner",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};
