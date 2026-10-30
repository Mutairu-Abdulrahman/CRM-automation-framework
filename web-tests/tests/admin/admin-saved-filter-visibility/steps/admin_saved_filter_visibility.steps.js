// Step ownership
// Owns: Others-filter save and visibility assertion, Myself-filter save,
//       fresh-inbox reset step, filter delete step and assertion
// Borrows from: admin-inbox-filters (Background: Super Admin entry flow + filter/apply steps)
//               chat-transfer (Background: "Agent B is logged into Moniedesk and online")

import { createBdd } from 'playwright-bdd';
import { test } from '../../../../data/fixtures.js';

const { When, Then } = createBdd(test);

// Note: the Entry Flow steps, "the admin opens the Inbox filter panel", "the admin filters
// by Channel ...", and "the admin applies the filter" are all defined in
// src/modules/admin-inbox-filters/steps/admin_inbox_filters.steps.js. "Agent B is logged
// into Moniedesk and online" is defined in
// src/modules/chat-transfer/steps/agent_chat_transfer.steps.js. All reused here via this
// feature's shared Background.

When(
  'the admin saves an Others filter for role {string} and team {string}',
  async ({ inboxFilter, world }, role, team) => {
    world.othersFilterName = `QA Others Visibility ${Date.now()}`;
    const modal = await inboxFilter.openSaveFilter();
    await modal.saveForOthers(world.othersFilterName, { roles: [role], teams: [team] });
  }
);

// Once a filter has been saved, the page stays on that saved filter's "edit" view (its
// "Save Filter" link becomes "Update Filter"). To start a genuinely new, unnamed filter,
// hard-navigate back to the plain Inbox first - this resets the view and restores "Save Filter".
When('the admin returns to a fresh Inbox view', async ({ inboxFilter }) => {
  await inboxFilter.resetToFreshInbox();
});

When('the admin saves a Myself filter', async ({ inboxFilter, world }) => {
  world.myselfFilterName = `QA Myself Visibility ${Date.now()}`;
  const modal = await inboxFilter.openSaveFilter();
  await modal.saveForMyself(world.myselfFilterName);
});

Then('Agent B should see the Others filter in their sidebar', async ({ agentBDashboard, world }) => {
  await agentBDashboard.assertSavedFilterVisible(world.othersFilterName);
});

Then('Agent B should not see the Myself filter in their sidebar', async ({ agentBDashboard, world }) => {
  await agentBDashboard.assertSavedFilterNotVisible(world.myselfFilterName);
});

When('the admin deletes the active saved filter', async ({ inboxFilter }) => {
  await inboxFilter.deleteActiveFilter();
});

Then('that filter no longer appears anywhere on the page', async ({ inboxFilter, world }) => {
  await inboxFilter.assertSavedFilterNotInSidebar(world.myselfFilterName);
});
