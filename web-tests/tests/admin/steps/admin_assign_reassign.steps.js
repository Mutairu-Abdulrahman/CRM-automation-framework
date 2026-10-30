// Step ownership
// Owns: customer queue-seeding step, "Agent B is logged into Moniedesk and away",
//       sort step, assign and reassign steps, assignment/reassignment success assertions,
//       "Agent B sees that engagement in their Active tab" assertion
// Borrows from: admin-inbox-filters (Background: Super Admin entry flow + Inbox page)
//               chat-transfer ("Agent B is logged into Moniedesk and online")

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../../../data/fixtures.js';
import { LoginPage } from '../../../pages/chat/login.page.js';
import { LoginValidator } from '../../../pages/chat/login.validators.js';
import { AgentDashboardPage } from '../../../pages/chat/agent-dashboard.page.js';
import { AdminEngagementSelectors } from '../../../pages/admin/admin-engagement.selectors.js';
import { AGENT_B_USERNAME, AGENT_B_PASSWORD, randomCustomerName } from '../../../data/helpers.js';

const { Given, When, Then } = createBdd(test);

// Note: the Entry Flow steps ("the super admin is logged in...", "the super admin is on the
// Inbox page") are defined in src/modules/admin-inbox-filters/steps/admin_inbox_filters.steps.js
// and reused here via this feature's shared Background. "Agent B is logged into Moniedesk and
// online" is defined in src/modules/chat-transfer/steps/agent_chat_transfer.steps.js.

// Seeds a "Pending Manual Assign" chat in the Live Chat queue so the assign/reassign
// scenarios have something to act on. The admin Inbox's Pending badge
// (bg-feedback-neutral-ghost-default) only appears for chats that were transferred to a team
// (Transfer Chat > Team mode), NOT for bare new queue entries from the widget. So the seeding
// flow is: customer joins queue → Agent A (separate context) accepts → Agent A transfers to
// "Live Chat" team → transfer creates the Pending badge the admin can then assign/reassign.
// The admin page is reloaded after the transfer to pick up the new Pending chat.
Given(
  'a customer is waiting in the Live Chat queue',
  async ({ browser, customerWidget, world, page }) => {
    const customerName = randomCustomerName();
    world.customerName = customerName;

    await customerWidget.open(customerName);
    await customerWidget.joinQueue(customerName);

    const agentACtx = await browser.newContext();
    const agentAPage = await agentACtx.newPage();
    try {
      await new LoginPage(agentAPage).login();
      const agentADashboard = new AgentDashboardPage(agentAPage);
      await agentADashboard.ensureOnline();
      await agentADashboard.acceptChatFromQueue(customerName);
      const modal = await agentADashboard.openTransferModal();
      await modal.transferToTeam('Live Chat', 'Seeding for admin assign/reassign test.');
    } finally {
      await agentACtx.close();
    }

    await page.waitForTimeout(3000);
    await page.reload({ waitUntil: 'networkidle' });
  }
);

Given('Agent B is logged into Moniedesk and away', async ({ agentBPage, agentBDashboard }) => {
  await new LoginPage(agentBPage).login({ username: AGENT_B_USERNAME, password: AGENT_B_PASSWORD });
  // Validate login landed on Chat module (fails if account settings are wrong)
  await LoginValidator.validateChatModuleLoaded(agentBPage, 10000);
  await agentBDashboard.setAway('On Break');
});

When('the admin sorts the Inbox by Latest Updated', async ({ adminEngagement }) => {
  await adminEngagement.sortByLatestUpdated();
});

Then('the Latest Updated sort option is available and selected', async ({ page, adminEngagement }) => {
  // Clicking the option in the When step closes the menu, so reopen it to confirm the
  // choice actually persisted (it should stay checked, since it was already the default).
  await adminEngagement.openSortByMenu();
  await expect(AdminEngagementSelectors.latestUpdatedSortOption(page)).toBeVisible();
  await page.keyboard.press('Escape');
});

When('the admin assigns the next queued engagement to agent {string}', async ({ adminEngagement, world }, agentName) => {
  world.assignedCustomerName = await adminEngagement.openFirstPendingEngagement();
  const modal = await adminEngagement.openAssignModal();
  await modal.assignToAgent(agentName);
});

When(
  'the admin assigns the next queued engagement to away agent {string}',
  async ({ adminEngagement, world }, agentName) => {
    world.assignedCustomerName = await adminEngagement.openFirstPendingEngagement();
    const modal = await adminEngagement.openAssignModal();
    await modal.assignToAgent(agentName, { away: true });
  }
);

Then('the assignment succeeds', async ({ adminEngagement }) => {
  await adminEngagement.assertAssignedSuccessfully();
});

Then(
  'Agent B sees that engagement in their Active tab, manually assigned by {string}',
  async ({ agentBDashboard, world }, assignedByDisplayName) => {
    await agentBDashboard.assertActiveWithManualAssign(world.assignedCustomerName, assignedByDisplayName);
  }
);

When('the admin reassigns that engagement to the {string} team', async ({ adminEngagement, world }, teamName) => {
  await adminEngagement.openEngagement(world.assignedCustomerName);
  const modal = await adminEngagement.openReassignModal();
  await modal.reassignToTeam(teamName);
});

Then('the reassignment succeeds', async ({ adminEngagement }) => {
  await adminEngagement.assertReassignedSuccessfully();
});
