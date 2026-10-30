// @ts-check
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

// Intentionally uses the bare createBdd() (no shared fixtures) - the smoke
// check only needs the default Playwright `page` fixture and should stay
// decoupled from the full fixture tree so it can run independently.
const { Given, Then } = createBdd();

Given('I open the Moniedesk login page', async ({ page }) => {
  await page.goto('/auth/login', { waitUntil: 'networkidle' });
});

Then('the login form should be visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Login with Username' })).toBeVisible();
});
