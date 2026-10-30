// Step ownership
// Owns: LiveChat Admin TeamLead login + Inbox entry step
//       Social Media Admin TeamLead login + Inbox entry step
// Borrows from: admin-inbox-filters (filter panel, apply, assert steps)
//               admin-save-filter ("save filter for themselves", "saved filter appears in sidebar")

import { createBdd } from 'playwright-bdd';
import { test } from '../../../../data/fixtures.js';
import { LoginPage } from '../../../../pages/chat/login.page.js';
import {
  LIVECHAT_ADMIN_TEAMLEAD_USERNAME,
  LIVECHAT_ADMIN_TEAMLEAD_PASSWORD,
  SOCIAL_MEDIA_ADMIN_TEAMLEAD_USERNAME,
  SOCIAL_MEDIA_ADMIN_TEAMLEAD_PASSWORD,
  ENGAGEMENT_URL,
} from '../../../../../data/data/helpers.js';

const { Given } = createBdd(test);

const LIVECHAT_ADMIN_TEAMLEAD_CREDENTIALS = {
  username: LIVECHAT_ADMIN_TEAMLEAD_USERNAME,
  password: LIVECHAT_ADMIN_TEAMLEAD_PASSWORD,
};
const SOCIAL_MEDIA_ADMIN_TEAMLEAD_CREDENTIALS = {
  username: SOCIAL_MEDIA_ADMIN_TEAMLEAD_USERNAME,
  password: SOCIAL_MEDIA_ADMIN_TEAMLEAD_PASSWORD,
};

// Unlike Super Admin, a Team Lead admin account lands directly on their own team's chat
// dashboard (no /admin/entity selection step) and already has the Admin/Support/Escalations
// dropdown available there, so Support drops them straight onto the same Inbox page.

Given(
  'the LiveChat Admin TeamLead is logged into Moniedesk and on the Inbox page',
  async ({ page, adminNav, inboxFilter }) => {
    await new LoginPage(page).login(LIVECHAT_ADMIN_TEAMLEAD_CREDENTIALS, ENGAGEMENT_URL);
    await adminNav.goToSupport(LIVECHAT_ADMIN_TEAMLEAD_CREDENTIALS);
    await inboxFilter.goTo();
  }
);

Given(
  'the Social Media Admin TeamLead is logged into Moniedesk and on the Inbox page',
  async ({ page, adminNav, inboxFilter }) => {
    await new LoginPage(page).login(SOCIAL_MEDIA_ADMIN_TEAMLEAD_CREDENTIALS, ENGAGEMENT_URL);
    await adminNav.goToSupport(SOCIAL_MEDIA_ADMIN_TEAMLEAD_CREDENTIALS);
    await inboxFilter.goTo();
  }
);
