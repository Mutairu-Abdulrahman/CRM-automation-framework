// Step ownership
// Owns: Super Admin entry flow (login → entity selection → Support → Inbox page)
//       Inbox filter panel steps (open, select Channel/Team/Status, apply, assert applied)
// Borrowed by: admin-save-filter, admin-saved-filter-visibility,
//              admin-assign-reassign, admin-other-roles
//   (all four reuse the entry flow and filter steps via their shared Background)

import { createBdd } from 'playwright-bdd';
import { test } from '../../../../data/fixtures.js';
import { LoginPage } from '../../../../pages/chat/login.page.js';
import { SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD, ADMIN_ENTITY_URL } from '../../../../../data/data/helpers.js';

const { Given, When, Then } = createBdd(test);

const SUPER_ADMIN_CREDENTIALS = { username: SUPER_ADMIN_USERNAME, password: SUPER_ADMIN_PASSWORD };

// ---------- Entry Flow (shared by every admin action) ----------

Given(
  'the super admin is logged into Moniedesk and has selected the {string} entity',
  async ({ page, adminEntity }, entityName) => {
    await new LoginPage(page).login(SUPER_ADMIN_CREDENTIALS, ADMIN_ENTITY_URL);
    await adminEntity.selectEntity(entityName);
  }
);

// The Support-click session-loss bug (docs/bug-reports/admin-support-nav-session-loss.md)
// can bounce back to /auth/login via a *delayed* client-side redirect that fires after
// goToSupport()'s own stabilization wait already passed - i.e. mid-way through the
// subsequent goTo() call, not just within goToSupport() itself. Retry the whole
// goToSupport+goTo sequence (not just goToSupport) when this happens. Retries on any
// failure here rather than checking the URL first - a slow (but not actually broken)
// splash-screen load can also trip goTo()'s own timeout, and is just as safe to retry.
Given('the super admin is on the Inbox page', async ({ adminNav, inboxFilter }) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await adminNav.goToSupport(SUPER_ADMIN_CREDENTIALS);
      await inboxFilter.goTo();
      return;
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
});

// ---------- Action 1: Inbox filters ----------

When('the admin opens the Inbox filter panel', async ({ inboxFilter }) => {
  await inboxFilter.open();
});

When('the admin filters by Channel {string}', async ({ inboxFilter }, value) => {
  await inboxFilter.selectChannel([value]);
});

When('the admin filters by Channel {string} and {string}', async ({ inboxFilter }, value1, value2) => {
  await inboxFilter.selectChannel([value1, value2]);
});

When('the admin filters by Team {string}', async ({ inboxFilter }, value) => {
  await inboxFilter.selectTeam([value]);
});

When('the admin filters by Team {string} and {string}', async ({ inboxFilter }, value1, value2) => {
  await inboxFilter.selectTeam([value1, value2]);
});

When('the admin filters by Status {string}', async ({ inboxFilter }, value) => {
  await inboxFilter.selectStatus([value]);
});

When('the admin filters by Status {string} and {string}', async ({ inboxFilter }, value1, value2) => {
  await inboxFilter.selectStatus([value1, value2]);
});

When('the admin applies the filter', async ({ inboxFilter }) => {
  await inboxFilter.apply();
});

Then('the Inbox shows the filter has been applied', async ({ inboxFilter }) => {
  await inboxFilter.assertFilterApplied();
});
