// @ts-check
export default {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  coverageThreshold: {
    global: {
      branches: 4,
      functions: 5,
      lines: 5,
      statements: 5
    }
  },
  collectCoverageFrom: [
    "pinterest-scraper.js",
    "src/**/*.{js,ts}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/coverage/**",
    "!**/*.config.{js,ts}",
    "!**/*.d.ts"
  ],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  rootDir: "."
}; 