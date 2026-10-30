import { test as base } from 'playwright-bdd';
import { AgentDashboardPage } from '../pages/chat/agent-dashboard.page.js';
import { CustomerWidgetPage } from '../pages/chat/customer-widget.page.js';
import { AdminEntityPage } from '../pages/admin/admin-entity.page.js';
import { AdminNavPage } from '../pages/admin/admin-nav.page.js';
import { InboxFilterPage } from '../pages/admin/inbox-filter.page.js';
import { AdminEngagementPage } from '../pages/admin/admin-engagement.page.js';
import { attachPageDiagnostics } from '../utils/page-diagnostics.js';

/**
 * Creates a fresh browser context/page for a secondary role (Agent B/C, Lead
 * A, the customer widget), wired with the same failure diagnostics the
 * primary agent's default `page` fixture gets from playwright.config.js
 * (screenshot/video/network/socket) - Playwright's own screenshot/video
 * config only covers the default context, so contexts we create ourselves
 * here have to opt into the same behavior explicitly. See
 * src/shared/hooks/page-diagnostics.js for what gets captured and why.
 */
async function newDiagnosedPage(browser, label, testInfo, use) {
  const context = await browser.newContext({ recordVideo: { dir: testInfo.outputDir } });
  const page = await context.newPage();
  const attachIfFailed = attachPageDiagnostics(page, label);

  await use(page);

  await attachIfFailed(testInfo);
  const video = page.video();
  await context.close(); // must close before the video file is finalized/readable
  if (video) {
    if (testInfo.status === testInfo.expectedStatus) {
      await video.delete().catch(() => {}); // test passed - don't keep it
    } else {
      await testInfo.attach(`${label}-video`, { path: await video.path(), contentType: 'video/webm' });
    }
  }
}

/**
 * Plain state bag shared across steps in a single scenario. All fields are
 * optional - each step only sets/reads the fields relevant to its scenario.
 *
 * @typedef {Object} World
 * @property {string}  [customerName]         - Display name of the customer for the active engagement.
 * @property {string}  [assignedCustomerName] - Customer name captured during admin assign/reassign flows.
 * @property {import('../../pages/chat/transfer-chat-modal.page.js').TransferChatModal} [transferModal]
 * @property {string}  [transferDropdownTab]  - Which agent-status tab ("Active"|"Away") was last opened.
 * @property {import('../../pages/chat/agent-dashboard.page.js').AgentDashboardPage} [actingDashboard]
 * @property {string}  [actingDisplayName]    - Display name of the agent/lead who sent the team transfer.
 * @property {import('../../pages/chat/reassign-chat-modal.page.js').ReassignChatModal} [reassignModal]
 * @property {string}  [savedFilterName]      - Name of the filter saved in admin-save-filter scenarios.
 * @property {string}  [othersFilterName]     - Name of the "Others" scoped filter in visibility scenarios.
 * @property {string}  [myselfFilterName]     - Name of the "Myself" scoped filter in visibility scenarios.
 */

// Shared Playwright-BDD test instance (this project's "World" equivalent -
// playwright-bdd uses Playwright fixtures instead of a Cucumber World object).
// Every step file must import this same `test` (not define its own) so
// fixtures and step registrations merge correctly across files within one
// scenario.
export const test = base.extend({
  // The primary agent's own default page also gets network/socket diagnostics
  // (screenshot/video/trace for it are already handled by playwright.config.js).
  page: async ({ page }, use, testInfo) => {
    const attachIfFailed = attachPageDiagnostics(page, 'agentA');
    await use(page);
    await attachIfFailed(testInfo);
  },
  // A second, independent browser context/page acting as the customer.
  customerPage: async ({ browser }, use, testInfo) => {
    await newDiagnosedPage(browser, 'customer', testInfo, use);
  },
  // A second, independent customer - used to fire two near-simultaneous
  // queue-join events (LIST_COUNTER race scenarios) without the timing being
  // limited by one customer widget's own sequential bot-conversation flow.
  customerPage2: async ({ browser }, use, testInfo) => {
    await newDiagnosedPage(browser, 'customer2', testInfo, use);
  },
  // A second agent's browser context/page (transfer recipient). Only
  // instantiated by scenarios that actually reference it.
  agentBPage: async ({ browser }, use, testInfo) => {
    await newDiagnosedPage(browser, 'agentB', testInfo, use);
  },
  // A third agent's browser context/page, on a different team - used to
  // confirm cross-team agents never appear as transfer targets.
  agentCPage: async ({ browser }, use, testInfo) => {
    await newDiagnosedPage(browser, 'agentC', testInfo, use);
  },
  // A Lead-role account's browser context/page - a valid transfer target like a
  // peer agent, but with Reassign (not Transfer) in her own More Actions menu.
  leadAPage: async ({ browser }, use, testInfo) => {
    await newDiagnosedPage(browser, 'leadA', testInfo, use);
  },
  // Page Object instances, one per underlying page fixture above. Each just
  // wraps its page - constructing it is free, no navigation happens here.
  dashboard: async ({ page }, use) => {
    await use(new AgentDashboardPage(page));
  },
  agentBDashboard: async ({ agentBPage }, use) => {
    await use(new AgentDashboardPage(agentBPage));
  },
  agentCDashboard: async ({ agentCPage }, use) => {
    await use(new AgentDashboardPage(agentCPage));
  },
  leadADashboard: async ({ leadAPage }, use) => {
    await use(new AgentDashboardPage(leadAPage));
  },
  customerWidget: async ({ customerPage }, use) => {
    await use(new CustomerWidgetPage(customerPage));
  },
  customerWidget2: async ({ customerPage2 }, use) => {
    await use(new CustomerWidgetPage(customerPage2));
  },
  // Admin-role page objects (new module) - all wrap the primary `page`, since Action 1
  // (Inbox filters) only needs a single Super Admin/Team Lead session.
  adminEntity: async ({ page }, use) => {
    await use(new AdminEntityPage(page));
  },
  adminNav: async ({ page }, use) => {
    await use(new AdminNavPage(page));
  },
  inboxFilter: async ({ page }, use) => {
    await use(new InboxFilterPage(page));
  },
  adminEngagement: async ({ page }, use) => {
    await use(new AdminEngagementPage(page));
  },
  /** @type {import('@playwright/test').Fixtures<{ world: World }>['world']} */
  world: async ({}, use) => {
    await use({});
  },
});
