// playwright.config.js — iQuizPros E2E test configuration
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  // Run each test file in isolation (no parallel workers by default to keep CI stable)
  fullyParallel: false,
  // Retry once on CI; no retries locally
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',

  use: {
    // Base URL for all page.goto('/') calls
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5000',
    // Viewport matching the CSS layout breakpoints
    viewport: { width: 1280, height: 800 },
    // Collect trace on first retry
    trace: 'on-first-retry',
    // Screenshots on failure
    screenshot: 'only-on-failure',
    // Don't slow down tests
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Spin up the webpack dev server before running tests
  // Comment out if you prefer to start `npm start` manually
  webServer: {
    command: 'npm start',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
