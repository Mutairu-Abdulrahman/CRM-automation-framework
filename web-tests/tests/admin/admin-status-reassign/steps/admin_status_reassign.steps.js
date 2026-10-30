import { createBdd } from 'playwright-bdd';
import { test } from '../../../../data/fixtures.js';

const { When, Then } = createBdd(test);

// Note: Entry Flow + filter steps are defined in admin-inbox-filters/steps. "Agent B is
// logged into Moniedesk and online" is defined in chat-transfer/steps. "the reassignment
// succeeds" and "Agent B sees that engagement in their Active tab in real time, manually
// assigned by {string}" are defined in admin-assign-reassign/steps and
// team-lead-queue-assign/steps respectively, and reused here.

When('the admin reassigns the next listed engagement to agent {string}', async ({ adminEngagement, world }, agentName) => {
  world.assignedCustomerName = await adminEngagement.openFirstEngagementInList();
  const modal = await adminEngagement.openReassignModal();
  await modal.assignToAgent(agentName);
});

When('the admin opens the next listed engagement', async ({ adminEngagement }) => {
  await adminEngagement.openFirstEngagementInList();
});

Then('reassignment is not available - only Move to Active', async ({ adminEngagement }) => {
  await adminEngagement.assertReassignUnavailable();
});
