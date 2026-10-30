// Step ownership
// Owns: Lead A reassign-agent-dropdown visibility step, Lead A reassign-to-team step
// Borrows from: chat-resolution (Background: agent login, customer join, accept from queue)
//               chat-transfer (Background: Lead A login, agent→Lead A transfer + accept;
//                              also "Agent B / Agent C login" and
//                              "the chat should appear in the Queue List as Pending")

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../../../../data/fixtures.js';
import { AGENT_B_DISPLAY_NAME, AGENT_C_DISPLAY_NAME, LEAD_A_DISPLAY_NAME, randomTeam } from '../../../../../data/data/helpers.js';

const { When, Then } = createBdd(test);

// ---------- Steps ----------
// Note: "the agent is logged into Moniedesk and online in the Chat module" and
// "a customer joins the live chat queue" / "the agent accepts the customer's
// chat from the queue" are defined in
// modules/chat-resolution/steps/agent_chat_resolution.steps.js. "Lead A is
// logged into Moniedesk and online", "Agent B is logged into Moniedesk and
// online", "Agent C is logged into Moniedesk and online on a different team",
// "the agent transfers the chat to Lead A with reason ...", "Lead A opens the
// transferred chat", and "Lead A accepts the transferred chat" are defined in
// modules/chat-transfer/steps/agent_chat_transfer.steps.js. All are reused
// here via this feature's shared Background.
//
// "the chat should appear in the Queue List as Pending" (shared with the
// agent-to-team transfer scenario) is also defined in
// modules/chat-transfer/steps/agent_chat_transfer.steps.js.

When('Lead A opens the reassign agent dropdown on the {string} tab', async ({ leadADashboard, world }, tab) => {
  const modal = await leadADashboard.openReassignModal();
  await modal.openAgentDropdown(tab);
  world.reassignModal = modal;
});

Then("Agent B should be visible and Agent C should not be visible in Lead A's reassign dropdown", async ({ leadAPage, world }) => {
  await world.reassignModal.assertAgentVisible('Active', AGENT_B_DISPLAY_NAME);
  await expect(leadAPage.getByText(AGENT_C_DISPLAY_NAME, { exact: true })).toHaveCount(0);
});

When('Lead A reassigns the chat to a team', async ({ leadADashboard, world }) => {
  const modal = await leadADashboard.openReassignModal();
  await modal.reassignToTeam(randomTeam(), 'Reassigning to the appropriate team.');
  world.actingDashboard = leadADashboard;
  world.actingDisplayName = LEAD_A_DISPLAY_NAME;
});
