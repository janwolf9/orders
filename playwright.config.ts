import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E-Commerce Orders Management System
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:8080',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Capture video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // Note: Start backend manually with: cd backend && npm start
  // Note: Start frontend manually with: cd frontend && python3 -m http.server 8080
  // webServer: [
  //   {
  //     command: 'cd backend && npm start',
  //     url: 'http://127.0.0.1:3000',
  //     reuseExistingServer: true,
  //     timeout: 120 * 1000,
  //   },
  //   {
  //     command: 'cd frontend && python3 -m http.server 8080',
  //     url: 'http://127.0.0.1:8080',
  //     reuseExistingServer: true,
  //     timeout: 30 * 1000,
  //   },
  // ],
});
