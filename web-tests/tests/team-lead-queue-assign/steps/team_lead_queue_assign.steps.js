import { createBdd } from 'playwright-bdd';
import { test } from '../../../data/fixtures.js';

const { Given, When, Then } = createBdd(test);

// Note: "Lead A is logged into Moniedesk and online" (leadAPage/leadADashboard) and
// "Agent B is logged into Moniedesk and online"/"...and away" (agentBPage/agentBDashboard)
// are defined in src/modules/chat-transfer/steps/agent_chat_transfer.steps.js and
// src/modules/admin-assign-reassign/steps/admin_assign_reassign.steps.js respectively, and
// reused here. Step wording below is deliberately distinct from the admin-side "the
// assignment succeeds"/"Agent B sees that engagement..." steps (different fixture,
// same-named steps would collide in the shared step registry).

Given('the team lead is on the Live Chat Queue List', async ({ leadADashboard }) => {
  await leadADashboard.openQueueListTeamTab('Live Chat');
});

When(
  'the team lead assigns the next queued engagement to agent {string}',
  async ({ leadADashboard, world }, agentName) => {
    world.assignedCustomerName = await leadADashboard.openFirstPendingEngagement();
    const modal = await leadADashboard.openAssignModal();
    await modal.assignToAgent(agentName);
  }
);

When(
  'the team lead assigns the next queued engagement to away agent {string}',
  async ({ leadADashboard, world }, agentName) => {
    world.assignedCustomerName = await leadADashboard.openFirstPendingEngagement();
    const modal = await leadADashboard.openAssignModal();
    await modal.assignToAgent(agentName, { away: true });
  }
);

Then("the team lead's assignment succeeds", async ({ leadADashboard }) => {
  await leadADashboard.assertAssignedSuccessfully();
});

Then(
  'Agent B sees that engagement in their Active tab in real time, manually assigned by {string}',
  async ({ agentBDashboard, world }, assignedByDisplayName) => {
    await agentBDashboard.assertActiveWithManualAssignRealtime(world.assignedCustomerName, assignedByDisplayName);
  }
);
