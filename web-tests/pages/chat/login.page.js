import { AGENT_USERNAME, AGENT_PASSWORD, ENGAGEMENT_URL } from '../../data/helpers.js';
import { LoginSelectors } from './login.selectors.js';
import { LoginValidator } from './login.validators.js';

/** The Moniedesk login screen. */
export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Logs in and lands on `destinationUrl` (the Chat module by default - pass a
   * different URL for e.g. the admin Entity page). The app's own post-login
   * redirect intermittently bounces through an insecure URL on staging and
   * loses the session; navigating to the destination directly afterward is
   * more reliable. A brief pause reduces (but doesn't eliminate) racing that
   * in-flight client-side redirect, so the goto itself is retried if it still
   * gets interrupted.
   */
  async login(credentials = { username: AGENT_USERNAME, password: AGENT_PASSWORD }, destinationUrl = ENGAGEMENT_URL) {
    const { page } = this;
    await page.goto('https://v3.moniedesk.staging.moniepoint.com/auth/login', { waitUntil: 'networkidle' });
    await LoginSelectors.usernameInput(page).fill(credentials.username);
    await LoginSelectors.passwordInput(page).fill(credentials.password);
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/v1/login') && r.ok()),
      LoginSelectors.loginButton(page).click(),
    ]);
    await page.waitForTimeout(1000);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto(destinationUrl, { waitUntil: 'networkidle' });
        if (!page.url().includes('/auth/login')) {
          // Only enforce the Chat-module redirect for chat destinations — admin
          // logins legitimately land on /admin/entity (entity selection), and
          // calling ensureOnChatModule there bounces the admin session in a loop.
          if (destinationUrl.includes('/v2/chat')) {
            await LoginValidator.ensureOnChatModule(page);
          }
          await page.waitForLoadState('networkidle');
          return;
        }
      } catch (e) {
        if (attempt === 2) throw e;
      }
      await page.waitForTimeout(1000);
    }
    throw new Error(`LoginPage.login: still on the login page after retries (url=${page.url()})`);
  }
}
