import { LoginPage } from '../chat/login.page.js';
import { ADMIN_INBOX_URL } from '../../data/helpers.js';
import { AdminNavSelectors as S } from './admin-nav.selectors.js';

/**
 * The Admin/Support/Escalations role switcher, opened via the grid-menu icon in the top
 * header once an entity is selected.
 */
export class AdminNavPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Opens the dropdown and clicks Support, landing on the Inbox/Engagement page.
   *
   * Real product bug (see docs/bug-reports/admin-support-nav-session-loss.md): clicking
   * Support reliably bounces the page to an insecure http:// /auth/login URL. This looks
   * like a client-side rendering glitch rather than a genuine server-side logout - the
   * session is often still valid, so try a direct re-navigation to the Inbox URL first
   * (cheap, and avoids re-authenticating against a page that can itself hang on a fresh
   * login attempt right after this glitch). Only fall back to a full re-login if that
   * direct nav also lands back on /auth/login.
   */
  async goToSupport(credentials) {
    const { page } = this;
    // Explicit, bounded timeouts here too (not just the recovery loop below) - the
    // session-loss bug can also strike before this method even starts (we can already be
    // back on /auth/login when goToSupport() is called), in which case this dropdown
    // trigger will never appear. Without a bound, that click would hang until the whole
    // test's global timeout, leaving the caller-level retry (see admin_inbox_filters.steps.js)
    // no chance to actually run.
    await S.roleDropdownTrigger(page).click({ timeout: 20000 });
    await S.supportOption(page).click({ timeout: 20000 });
    await page.waitForTimeout(2000);

    // The direct re-nav below can itself throw (the glitch sometimes interrupts navigation
    // mid-flight rather than cleanly landing on /auth/login), so re-check the URL after each
    // recovery attempt rather than trusting whichever branch happened to run. The bounce to
    // /auth/login can also be a *delayed* client-side redirect that fires a few seconds after
    // we appear to have landed successfully, so re-verify after a short stabilization wait too.
    for (let attempt = 0; attempt < 3; attempt++) {
      if (page.url().includes('/auth/login')) {
        await page.goto(ADMIN_INBOX_URL, { waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(1000);
      }
      if (page.url().includes('/auth/login')) {
        await new LoginPage(page).login(credentials, ADMIN_INBOX_URL).catch(() => {});
      }
      await page.waitForTimeout(3000); // let any delayed redirect glitch fire before trusting this
      if (!page.url().includes('/auth/login')) return;
    }
    throw new Error(`AdminNavPage.goToSupport: still on the login page after recovery attempts (url=${page.url()})`);
  }
}
