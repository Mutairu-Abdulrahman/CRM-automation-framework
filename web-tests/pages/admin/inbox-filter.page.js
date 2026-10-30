import { expect } from '@playwright/test';
import { InboxFilterSelectors as S } from './inbox-filter.selectors.js';
import { SaveFilterModal } from './save-filter-modal.page.js';
import { ADMIN_INBOX_URL } from '../../data/helpers.js';

/**
 * The "Filter By" panel on the admin Inbox page (Action > Filter By). Currently only the
 * Channel field's interaction has been verified end-to-end - the panel also has Date
 * Created, Owner, Team, Status, User Code, Engagement State/Type, Issue Name, Customer
 * Type/Name/Email/Phone/ID, Sentiment, Toxicity, Tags, and SLA Expiry/Within-Outside SLA,
 * which aren't wired up here yet (see docs/bug-reports/ and project memory for what's
 * confirmed vs. still to explore).
 */
export class InboxFilterPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigates to the Inbox page via the left sidebar. Uses an explicit timeout on the click,
   * shorter than the whole test's global timeout - if the session-loss bug
   * (docs/bug-reports/admin-support-nav-session-loss.md) has bounced us back to /auth/login,
   * this sidebar link will never appear, and without an explicit timeout here the click would
   * otherwise hang until the whole test's global timeout, leaving no room for a caller to
   * catch this and retry sooner. 8s proved too aggressive in practice - a legitimate slow
   * splash-screen load (unrelated to the bug) can still be mid-render past that point - so
   * this uses a more generous 20s instead.
   */
  async goTo() {
    const { page } = this;
    await S.inboxSidebarLink(page).click({ timeout: 20000 });
    await expect(page.getByText('Inbox', { exact: true }).first()).toBeVisible();
  }

  /** Opens the panel via Action > Filter By. */
  async open() {
    const { page } = this;
    await S.actionButton(page).click();
    await S.filterByMenuItem(page).click();
    await expect(page.getByText('Filter By', { exact: true }).first()).toBeVisible();
  }

  /** Opens a field's multi-select dropdown (react-select). */
  async openMultiSelect(fieldLabel) {
    const control = S.fieldSelectControl(this.page, fieldLabel);
    const box = await control.boundingBox();
    await control.click({ position: { x: 10, y: box.height / 2 } });
  }

  /**
   * Picks each of the given option values from a field's multi-select dropdown. The dropdown
   * closes after every single pick, so this reopens it before each one rather than assuming
   * it stays open.
   */
  async selectMultiOptions(fieldLabel, values) {
    const { page } = this;
    for (const value of values) {
      await this.openMultiSelect(fieldLabel);
      await S.option(page, value).click();
    }
  }

  /** Picks Channel values (e.g. "Webchat", "Appchat"). */
  async selectChannel(values) {
    await this.selectMultiOptions('Channel', values);
  }

  /** Picks Team values (e.g. "Live Chat", "WhatsApp Team"). */
  async selectTeam(values) {
    await this.selectMultiOptions('Team', values);
  }

  /** Picks Status values (e.g. "Open", "Pending"). */
  async selectStatus(values) {
    await this.selectMultiOptions('Status', values);
  }

  async apply() {
    const { page } = this;
    await S.applyFilterButton(page).click();
    await expect(S.showingFilterResult(page)).toBeVisible({ timeout: 15000 });
  }

  async clearAll() {
    const { page } = this;
    await S.clearAllLink(page).click();
    await expect(S.showingFilterResult(page)).toBeHidden();
  }

  /** Confirms the panel closed and the result view shows the "filtered" state. */
  async assertFilterApplied() {
    const { page } = this;
    await expect(S.showingFilterResult(page)).toBeVisible();
    await expect(S.clearAllLink(page)).toBeVisible();
    await expect(S.saveFilterLink(page)).toBeVisible();
  }

  /**
   * Once a filter has been saved, the page settles into that saved filter's "edit" view
   * (its "Save Filter" link becomes "Update Filter") - sometimes only after a short delay,
   * seemingly via a websocket update that can re-assert the named-filter view even after a
   * same-SPA "Inbox" nav click. A hard navigation back to the Inbox URL reliably clears it,
   * so start a genuinely new/unnamed filter this way rather than via the sidebar link.
   */
  async resetToFreshInbox() {
    const { page } = this;
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.goto(ADMIN_INBOX_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      const stillOnNamedFilter = await page.getByText('Update Filter', { exact: true }).isVisible().catch(() => false);
      if (!stillOnNamedFilter) return;
    }
  }

  /** Opens the Save Filter dialog for the currently-applied filter. */
  async openSaveFilter() {
    await S.saveFilterLink(this.page).click();
    return new SaveFilterModal(this.page);
  }

  /** Confirms a saved filter with the given name appears under the sidebar's SAVED FILTER section. */
  async assertSavedFilterInSidebar(name) {
    await expect(this.page.getByText(name, { exact: true }).first()).toBeVisible();
  }

  /** Confirms a saved filter with the given name does NOT appear anywhere on the page. */
  async assertSavedFilterNotInSidebar(name) {
    await expect(this.page.getByText(name, { exact: true })).toHaveCount(0);
  }

  /**
   * Deletes the currently-active saved filter (must already be the open/selected view).
   * Right after saving, the header briefly still reads "Inbox" before settling into the
   * named-filter view that shows the edit/delete icons, so wait for that icon to actually be
   * visible rather than clicking immediately.
   */
  async deleteActiveFilter() {
    const { page } = this;
    await expect(S.activeFilterDeleteIcon(page)).toBeVisible({ timeout: 10000 });
    await S.activeFilterDeleteIcon(page).click();
    await S.deleteConfirmButton(page).click();
    await expect(S.filterDeletedToast(page)).toBeVisible({ timeout: 10000 });
  }
}
