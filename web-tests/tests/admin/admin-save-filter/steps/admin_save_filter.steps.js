// Step ownership
// Owns: "save filter for themselves" and "save filter for others" steps,
//       "saved filter appears in the sidebar" assertion
// Borrowed by: admin-other-roles (reuses the "save for themselves" step)
// Borrows from: admin-inbox-filters (Background: entry flow + filter/apply steps)

import { createBdd } from 'playwright-bdd';
import { test } from '../../../../data/fixtures.js';

const { When, Then } = createBdd(test);

// Note: the Entry Flow steps ("the super admin is logged in...", "the super admin is on
// the Inbox page") and the filter steps ("the admin opens the Inbox filter panel", "the
// admin filters by Channel...", "the admin applies the filter") are defined in
// src/modules/admin-inbox-filters/steps/admin_inbox_filters.steps.js and reused here via
// this feature's shared Background.

When('the admin saves the filter for themselves', async ({ inboxFilter, world }) => {
  world.savedFilterName = `QA Myself Filter ${Date.now()}`;
  const modal = await inboxFilter.openSaveFilter();
  await modal.saveForMyself(world.savedFilterName);
});

When(
  'the admin saves the filter for others with role {string} and team {string}',
  async ({ inboxFilter, world }, role, team) => {
    world.savedFilterName = `QA Others Filter ${Date.now()}`;
    const modal = await inboxFilter.openSaveFilter();
    await modal.saveForOthers(world.savedFilterName, { roles: [role], teams: [team] });
  }
);

Then('the saved filter appears in the sidebar', async ({ inboxFilter, world }) => {
  await inboxFilter.assertSavedFilterInSidebar(world.savedFilterName);
});
