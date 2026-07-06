const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // run tests sequentially to avoid database race conditions
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3009',
    trace: 'on-first-retry',
    // channel: 'chrome', // use system Chrome to bypass downloading binaries
    headless: true,
  },
  webServer: {
    command: 'npx next start -p 3009',
    url: 'http://localhost:3009',
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 120 * 1000,
  },
});
