// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const testDir = defineBddConfig({
  features: 'web-tests/tests/*/features/*.feature',
  steps: ['web-tests/tests/*/steps/*.js', 'web-tests/data/*.js'],
});

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir,
  // These are real multi-hop E2E flows against live staging (login, customer
  // widget bot round-trips, queue sorting, accept, ticket resolution). Some
  // helpers (e.g. assertEngagementStatus, openTransferredChat) deliberately
  // retry for up to ~80-100s to tolerate backend status/notification
  // propagation lag, on top of everything before them in a scenario - 180s
  // wasn't enough headroom once openTransferredChat's retry budget widened.
  timeout: 240_000,
  // Scenarios share a live staging backend (queue, transfer state, filter
  // visibility) - running them fully in parallel causes race-condition flakes.
  // Keep serial within each file; Playwright still runs different feature files
  // concurrently (controlled by `workers` below).
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://v3.moniedesk.staging.moniepoint.com/',

    // Locally retries defaults to 0, so 'on-first-retry' would never actually
    // capture anything - these are real E2E flows against live staging where a
    // failure is expensive to reproduce, so keep full diagnostics for every
    // failure, not just retried ones. This covers the DEFAULT context/page
    // only (the primary agent) - the other roles (Agent B/C, Lead A, customer)
    // use their own manually-created contexts in src/shared/world/fixtures.js,
    // which attach the equivalent screenshot/video/socket/network diagnostics
    // themselves via src/shared/hooks/page-diagnostics.js.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
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

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

