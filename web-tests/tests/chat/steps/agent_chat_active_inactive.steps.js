// Step ownership
// Owns: sorted-queue accept, Move to Inactive / Move to Active steps and assertions
// Borrows from: chat-resolution (Background: agent login, customer join)

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../../../data/fixtures.js';
import { MOVE_TO_INACTIVE_REJECTION } from '../../../pages/chat/agent-dashboard.page.js';

const { Given, When, Then } = createBdd(test);

// ---------- Steps ----------
// Note: "the agent is logged into Moniedesk and online in the Chat module"
// and "a customer joins the live chat queue" are defined in
// modules/chat-resolution/steps/agent_chat_resolution.steps.js and reused
// here via the shared Background.

Given("the agent accepts the customer's chat from the sorted queue list", async ({ dashboard, world }) => {
  await dashboard.acceptChatFromSortedQueue(world.customerName);
});

When('the agent tries to move the chat to Inactive before replying', async ({ dashboard }) => {
  await dashboard.assertMoveToInactiveRejected();
});

Then('the move should be rejected with {string}', async ({ page }, message) => {
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});

When('the agent sends a reply to the customer', async ({ dashboard }) => {
  await dashboard.sendMessage('Following up - let me know if you need anything else.');
});

When('the agent tries to move the chat to Inactive again', async ({ dashboard }) => {
  await dashboard.assertMoveToInactiveSucceeds();
});

Then('the move should succeed', async ({ page }) => {
  // The stable counterpart to the negative case: no rejection toast present.
  // (The success toast itself is transient and may have already dismissed.)
  await expect(page.getByText(MOVE_TO_INACTIVE_REJECTION)).not.toBeVisible();
});

Then('the chat should appear in the Inactive tab', async ({ page, dashboard, world }) => {
  await dashboard.findChatInTab('Inactive', world.customerName);
  await expect(page.getByText(world.customerName, { exact: true }).first()).toBeVisible();
});

When('the agent moves the chat back to Active', async ({ dashboard }) => {
  await dashboard.assertMoveToActiveSucceeds();
});

Then('the chat should appear in the Active tab', async ({ page, dashboard, world }) => {
  await dashboard.findChatInTab('Active', world.customerName);
  await expect(page.getByText(world.customerName, { exact: true }).first()).toBeVisible();
});

// ---------- Customer-reply auto-return scenario ----------

When('the agent moves the chat to Inactive', async ({ dashboard }) => {
  await dashboard.assertMoveToInactiveSucceeds();
});

When('the customer sends a message while the chat is Inactive', async ({ customerWidget }) => {
  await customerWidget.send('Are you still there?');
});

Then('the chat should automatically return to the Active tab', async ({ dashboard, world }) => {
  // This scenario has more steps than the others (reply + inactive + customer
  // reply + return to active), so extend the budget from this point forward.
  test.setTimeout(360_000);
  const socketFrames = await dashboard.waitForChatAutoReturnedToActive(world.customerName);
  await test.info().attach('socket-events-inactive-to-active', {
    body: JSON.stringify(socketFrames, null, 2),
    contentType: 'application/json',
  });
  const { page } = dashboard;
  await expect(page.getByText(world.customerName, { exact: true }).first()).toBeVisible();
});
