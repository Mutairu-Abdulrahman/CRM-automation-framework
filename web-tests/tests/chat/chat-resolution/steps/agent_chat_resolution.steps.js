// Step ownership
// Owns: "the agent is logged into Moniedesk and online in the Chat module"
//       "a customer joins the live chat queue"
//       "the agent accepts the customer's chat from the queue"
//       message exchange, end-chat, resolution and escalation assertions
// Borrowed by: chat-transfer, chat-active-inactive, chat-reassign
//   (all three reuse the three Background Given steps above)

import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import path from 'path';
import { test } from '../../../../data/fixtures.js';
import { randomCustomerName } from '../../../../../data/data/helpers.js';
import { LoginPage } from '../../../../pages/chat/login.page.js';

const SAMPLE_IMAGE = path.join(process.cwd(), 'src', 'shared', 'fixtures', 'sample-image.png');

const { Given, When, Then } = createBdd(test);

// ---------- Steps ----------

Given('the agent is logged into Moniedesk and online in the Chat module', async ({ page, dashboard }) => {
  await new LoginPage(page).login();
  await expect(page.getByText('Chats', { exact: true })).toBeVisible();
  await dashboard.ensureOnline();
});

Given('a customer joins the live chat queue', async ({ customerWidget, world }) => {
  const customerName = randomCustomerName();
  world.customerName = customerName;
  await customerWidget.open(customerName);
  await customerWidget.joinQueue(customerName);
});

Given("the agent accepts the customer's chat from the queue", async ({ dashboard, world }) => {
  await dashboard.acceptChatFromQueue(world.customerName);
});

When('the agent and customer exchange messages during the chat', async ({ dashboard, customerWidget, world }) => {
  const customerName = world.customerName;

  await dashboard.sendMessage(`Hello ${customerName}, thanks for reaching out. How can I help you today?`);
  await customerWidget.send('Hi! I have a question about my account balance.');

  await dashboard.sendMessage('Sure, happy to help. You can reach us on 08012345678.');
  await customerWidget.send('Great, my email is customer@example.com for follow up.');

  await dashboard.sendMessage('Here is a helpful link: https://moniepoint.com/support 🙂');
  await customerWidget.send('Awesome, thank you so much! 😊👍');

  // Image attachment: attach file, confirm the preview, then send.
  await dashboard.sendImageAttachment(SAMPLE_IMAGE);
  await customerWidget.assertImageReceived();
});

When('the agent ends the chat and resolves it using {string}', async ({ dashboard }, resolutionType) => {
  await dashboard.ticketResolution().resolve(resolutionType);
});

When('the customer ends the chat from the widget and confirms', async ({ customerWidget }) => {
  await customerWidget.endChatAndConfirm();
});

Then("the chat should no longer appear in the agent's active chat list", async ({ dashboard, world }) => {
  await dashboard.assertNotInActiveList(world.customerName);
});

Then("the engagement should be marked as {string} in the agent's inbox", async ({ dashboard, world }, expectedStatus) => {
  await dashboard.assertEngagementStatus(world.customerName, expectedStatus);
});

Then('the chat should appear in the Escalated tab', async ({ page, dashboard, world }) => {
  await dashboard.findChatInTab('Escalated', world.customerName);
  await expect(page.getByText(world.customerName, { exact: true }).first()).toBeVisible();
});

// Customer rating steps
When('the customer rates the experience as "Good"', async function ({ customerWidget }) {
  await customerWidget.rateGood();
});

When('the customer rates the experience as "Bad"', async function ({ customerWidget }) {
  await customerWidget.rateBad();
});

When('the customer selects a predefined reason', async function ({ customerWidget }) {
  await customerWidget.selectReason('Poor Service');
});

When('the customer selects "Other" as the reason', async function ({ customerWidget }) {
  await customerWidget.selectReason('Other');
});

When('the customer provides custom feedback {string}', async function ({ customerWidget }, feedbackText) {
  await customerWidget.enterCustomFeedback(feedbackText);
});

When('the customer submits the feedback', async function ({ customerWidget }) {
  await customerWidget.submitFeedback();
});

Then('the customer sees the rating screen', async function ({ customerWidget }) {
  await customerWidget.customerPage.waitForTimeout(500);
});

Then('the feedback is submitted successfully', async function ({ customerWidget }) {
  await customerWidget.customerPage.waitForTimeout(500);
});
