// Step ownership
// Owns: Agent B / Agent C / Lead A login and status steps
//       transfer-to-agent, transfer-to-team, withdraw, reject, visibility steps
//       "the chat should appear in the Queue List as Pending" (also reused by chat-reassign)
// Borrows from: chat-resolution (Background: agent login, customer join, accept from queue)

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../../../../data/fixtures.js';
import {
  AGENT_DISPLAY_NAME,
  AGENT_B_USERNAME,
  AGENT_B_PASSWORD,
  AGENT_B_DISPLAY_NAME,
  AGENT_C_USERNAME,
  AGENT_C_PASSWORD,
  AGENT_C_DISPLAY_NAME,
  LEAD_A_USERNAME,
  LEAD_A_PASSWORD,
  LEAD_A_DISPLAY_NAME,
  randomTeam,
} from '../../../../../data/data/helpers.js';
import { LoginPage } from '../../../../pages/chat/login.page.js';
import { LoginValidator } from '../../../../pages/chat/login.validators.js';

const { Given, When, Then } = createBdd(test);

// ---------- Steps ----------
// Note: "the agent is logged into Moniedesk and online in the Chat module",
// "a customer joins the live chat queue", and "the agent accepts the
// customer's chat from the queue" are defined in
// modules/chat-resolution/steps/agent_chat_resolution.steps.js and reused
// here via the shared Background.

Given('Agent B is logged into Moniedesk and online', async ({ agentBPage, agentBDashboard }) => {
  await new LoginPage(agentBPage).login({ username: AGENT_B_USERNAME, password: AGENT_B_PASSWORD });
  // Validate login landed on Chat module (fails if account settings are wrong)
  await LoginValidator.validateChatModuleLoaded(agentBPage, 10000);
  await agentBDashboard.ensureOnlineConfirmed();
});

Given('Agent C is logged into Moniedesk and online on a different team', async ({ agentCPage, agentCDashboard }) => {
  await new LoginPage(agentCPage).login({ username: AGENT_C_USERNAME, password: AGENT_C_PASSWORD });
  await agentCDashboard.ensureOnlineConfirmed();
});

Given('Lead A is logged into Moniedesk and online', async ({ leadAPage, leadADashboard }) => {
  await new LoginPage(leadAPage).login({ username: LEAD_A_USERNAME, password: LEAD_A_PASSWORD });
  await leadADashboard.ensureOnlineConfirmed();
});

Given('Agent B sets their status to Away with reason {string}', async ({ agentBDashboard }, reason) => {
  await agentBDashboard.setAway(reason);
});

When('the agent transfers the chat to Agent B with reason {string}', async ({ dashboard }, reason) => {
  const modal = await dashboard.openTransferModal();
  await modal.transferTo(AGENT_B_DISPLAY_NAME, reason, 'Active');
});

When('the agent transfers the away Agent B the chat with reason {string}', async ({ dashboard }, reason) => {
  const modal = await dashboard.openTransferModal();
  await modal.transferTo(AGENT_B_DISPLAY_NAME, reason, 'Away');
});

When('Agent B opens the transferred chat', async ({ agentBDashboard, world }) => {
  await agentBDashboard.openTransferredChat(world.customerName);
});

When('Agent B accepts the transferred chat', async ({ agentBDashboard }) => {
  await agentBDashboard.acceptTransferredChat();
});

Then('Agent B should have accepted the chat successfully', async ({ agentBPage }) => {
  await expect(agentBPage.getByText(/has just connected you with/i).last()).toBeVisible();
});

When('Agent B rejects the transferred chat with reason {string}', async ({ agentBDashboard }, reason) => {
  await agentBDashboard.rejectTransferredChat(reason);
});

Then('the agent should see a transfer rejected notice with reason {string}', async ({ dashboard }, reason) => {
  await dashboard.assertTransferRejectedNotice(reason);
});

When('the agent acknowledges the rejection notice', async ({ dashboard }) => {
  await dashboard.acknowledgeTransferRejectedNotice();
});

Then('the rejection notice should be dismissed', async ({ page }) => {
  await expect(page.locator('[role="dialog"]', { hasText: 'Transfer Request Rejected' })).toHaveCount(0);
});

When('the agent withdraws the transfer', async ({ dashboard }) => {
  await dashboard.withdrawTransfer();
});

Then("the chat should no longer appear in Agent B's Transferred tab", async ({ agentBDashboard, world }) => {
  await agentBDashboard.assertChatNotInTransferredTab(world.customerName);
});

When('the agent opens the select agent dropdown on the {string} tab', async ({ dashboard, world }, tab) => {
  const modal = await dashboard.openTransferModal();
  await modal.openAgentDropdown(tab);
  world.transferModal = modal;
  world.transferDropdownTab = tab;
});

Then('Agent B should be visible and Agent C should not be visible', async ({ page, world }) => {
  await world.transferModal.assertAgentVisible(world.transferDropdownTab, AGENT_B_DISPLAY_NAME);
  await expect(page.getByText(AGENT_C_DISPLAY_NAME, { exact: true })).toHaveCount(0);
});

When('the agent closes the transfer modal', async ({ world }) => {
  await world.transferModal.cancel();
});

// ---------- Transfer to Lead A ----------
// Lead A shows up in the agent's Transfer modal exactly like a peer agent - the
// same-team visibility rules and dropdown structure apply identically.

When('the agent transfers the chat to Lead A with reason {string}', async ({ dashboard }, reason) => {
  const modal = await dashboard.openTransferModal();
  await modal.transferTo(LEAD_A_DISPLAY_NAME, reason, 'Active');
});

When('Lead A opens the transferred chat', async ({ leadADashboard, world }) => {
  await leadADashboard.openTransferredChat(world.customerName);
});

When('Lead A accepts the transferred chat', async ({ leadADashboard }) => {
  await leadADashboard.acceptTransferredChat();
});

Then('Lead A should have accepted the chat successfully', async ({ leadAPage }) => {
  await expect(leadAPage.getByText(/has just connected you with/i).last()).toBeVisible();
});

// ---------- Transfer/Reassign to a TEAM ----------
// Shared between this feature (agent's Transfer) and
// modules/chat-reassign (a Lead's Reassign) - both land the chat back in the
// Queue List as Pending rather than going straight into anyone's inbox.
// world.actingDashboard/actingDisplayName let the same Then step below work
// for whichever side performed the send.

When('the agent transfers the chat to a team', async ({ dashboard, world }) => {
  const modal = await dashboard.openTransferModal();
  await modal.transferToTeam(randomTeam(), 'Routing to the appropriate team.');
  world.actingDashboard = dashboard;
  world.actingDisplayName = AGENT_DISPLAY_NAME;
});

Then('the chat should appear in the Queue List as Pending', async ({ world }) => {
  await world.actingDashboard.assertPendingInQueueList(world.customerName, world.actingDisplayName);
});
