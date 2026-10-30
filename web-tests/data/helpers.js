// Shared test data/config: credentials, URLs, and random-value generators.
// All page-interaction logic lives in the Page Object classes under
// src/pages/ - see pages/index.js.
//
// Credentials are read from environment variables so they can be supplied via
// CI/CD secrets or a local .env file (see .env.example). The defaults below
// are the shared staging accounts and are kept as fallbacks so the suite runs
// without any setup on a fresh checkout.

export const AGENT_USERNAME = process.env.AGENT_USERNAME ?? 'mutty@moniepoint.com';
export const AGENT_PASSWORD = process.env.AGENT_PASSWORD ?? 'password@1';
export const AGENT_DISPLAY_NAME = 'Mutairu Abdulrahman';
export const ENGAGEMENT_URL = 'https://v3.moniedesk.staging.moniepoint.com/v2/chat/active-chat/All-Messages';

// Agent B: same "Live Chat" team as the primary agent - a valid transfer target.
export const AGENT_B_USERNAME = process.env.AGENT_B_USERNAME ?? 'muttyabdul@moniepoint.com';
export const AGENT_B_PASSWORD = process.env.AGENT_B_PASSWORD;
export const AGENT_B_DISPLAY_NAME = 'Mutairu Oshioke';

// Agent C: a different team ("Email") - must never appear as a transfer target for the primary agent.
export const AGENT_C_USERNAME = process.env.AGENT_C_USERNAME ?? 'abdulrahman@moniepoint.com';
export const AGENT_C_PASSWORD = process.env.AGENT_C_PASSWORD;
export const AGENT_C_DISPLAY_NAME = 'abdulrahman Mutty';

// Lead A: a Lead-role account on the same "Live Chat" team as the primary agent. A
// regular agent can transfer to her exactly like transferring to a peer agent, but her
// own More Actions menu shows Reassign (not Transfer) plus Move to Inactive/Resolve
// Manually - no plain "Transfer" option. Her Reassign-to-agent picker is team-scoped
// the same way Transfer is (Agent C never shows up there either).
export const LEAD_A_USERNAME = process.env.LEAD_A_USERNAME ?? 'adebimpe.ola@moniepoint.com';
export const LEAD_A_PASSWORD = process.env.LEAD_A_PASSWORD;
export const LEAD_A_DISPLAY_NAME = 'Adebimpe Product';

// Teams offered by the "Team" mode of both the Transfer and Reassign modals. Sending to
// a team (rather than a named agent/lead) lands the chat back in the Queue List with
// status "Pending" and a "Manual Assign by <sender>" banner - it does not go straight
// into anyone's inbox as accept-ready the way an agent/lead-targeted transfer does.
export const TEAMS = ['Live Chat', 'WhatsApp Team', 'Social Media Chat', 'Bimps Test Facebook'];

export function randomTeam() {
  return TEAMS[Math.floor(Math.random() * TEAMS.length)];
}

// ---------- Admin role (new module) ----------
// Unlike the agent/Lead accounts above, these log in through a different entry
// flow: Entity selection page -> Admin page -> a role dropdown (Admin/Support/
// Escalations) -> "Support" lands on the same Engagement/Inbox page an agent
// sees, but with admin-only capabilities (filters, saved filters, assign/
// reassign from the queue). See LoginPage.loginAsAdmin() / AdminEntityPage.

// Super Admin: full access, used to test admin flows generally available to any admin.
export const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME ?? 'test_crmowner';
export const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? 'pass@123';
// Display name once logged in - not derivable from the username, confirmed empirically.
export const SUPER_ADMIN_DISPLAY_NAME = 'Parichay Parichay';

// LiveChat Admin TeamLead: same account as LEAD_A above (adebimpe.ola@moniepoint.com) -
// she is both a "Lead" on the agent side and a Team Lead admin on the admin side.
export const LIVECHAT_ADMIN_TEAMLEAD_USERNAME = LEAD_A_USERNAME;
export const LIVECHAT_ADMIN_TEAMLEAD_PASSWORD = LEAD_A_PASSWORD;

// Social Media Admin TeamLead: a distinct admin account, scoped to the Social Media team.
export const SOCIAL_MEDIA_ADMIN_TEAMLEAD_USERNAME = process.env.SOCIAL_MEDIA_ADMIN_TEAMLEAD_USERNAME ?? 'afrasiyab1@moniepoint.com';
export const SOCIAL_MEDIA_ADMIN_TEAMLEAD_PASSWORD = process.env.SOCIAL_MEDIA_ADMIN_TEAMLEAD_PASSWORD;

// The entity every admin flow in this module operates on (see the Entry Flow: super admin
// selects this from the "All Entities" list after login).
export const ADMIN_ENTITY_NAME = 'Moniepoint MFB';
export const ADMIN_ENTITY_URL = 'https://v3.moniedesk.staging.moniepoint.com/admin/entity';
export const ADMIN_INBOX_URL = 'https://v3.moniedesk.staging.moniepoint.com/v2/chat/inbox/ALL';

export const CUSTOMER_WIDGET_BASE_URL =
  'https://cdn-staging.moniepoint.com/moniedesk/ticket-manager-ui-dev/dummy-app/index.html';

const FIRST_NAMES = ['Amaka', 'Tunde', 'Ifeoma', 'Segun', 'Bola', 'Chinedu', 'Ngozi', 'Kunle'];
const LAST_NAMES = ['Okoro', 'Adeyemi', 'Balogun', 'Eze', 'Uche', 'Bello', 'Nwachukwu', 'Yusuf'];

export function randomCustomerName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const suffix = Math.floor(Math.random() * 100000);
  return `${first} ${last}${suffix}`;
}

export function randomAccountNumber() {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}
