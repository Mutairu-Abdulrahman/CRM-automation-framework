import { expect } from '@playwright/test';
import { AdminEngagementSelectors as S } from './admin-engagement.selectors.js';
import { InboxFilterSelectors } from './inbox-filter.selectors.js';
import { AssignReassignModal } from './assign-reassign-modal.page.js';

/** Individual-engagement actions on the admin Inbox page's detail panel: open, sort the
 * list, and Assign/Reassign to an agent or team. */
export class AdminEngagementPage {
  constructor(page) {
    this.page = page;
  }

  /** @param {{ timeout?: number }} [options] - shorten this for a caller that retries. */
  async openEngagement(customerName, options = {}) {
    await S.engagementRowByCustomer(this.page, customerName).click(options);
  }

  /**
   * Opens the first Pending (queued/unassigned) engagement in the list and returns its
   * customer name. The queued-engagement seed pool is finite and shared across test runs -
   * once assigned, an engagement leaves Pending status - so picking whichever is first
   * rather than a hardcoded name keeps this repeatable as the pool gets consumed.
   */
  async openFirstPendingEngagement() {
    const nameEl = S.pendingRowCustomerName(this.page, 0);
    const customerName = (await nameEl.innerText()).trim();
    await nameEl.click();
    return customerName;
  }

  /**
   * Opens the first engagement in the current (filtered) list and returns its true customer
   * name, read from the detail panel header rather than the list row's own "headline" label
   * (which can be a ticket number instead of the customer name once a ticket is attached -
   * common for Open/Resolved/Unresolved engagements).
   */
  async openFirstEngagementInList() {
    const { page } = this;
    // Bounded timeout, not the click default - an empty filtered list (e.g. this status's
    // shared pool of engagements has been consumed by earlier test runs) should fail with a
    // clear "no rows" error well before the whole test's global timeout, not hang silently.
    await S.firstRowLabel(page).click({ timeout: 15000 });
    return (await S.detailCustomerNameHeading(page).innerText()).trim();
  }

  /**
   * Confirms a Resolved engagement has no Reassign action available - only "Move to
   * Active". Answers the spec's "confirm who is able to carry out this reassignment" for
   * Resolved: nobody, directly, until it's moved back to Active.
   */
  async assertReassignUnavailable() {
    const { page } = this;
    await expect(S.reassignButton(page)).toHaveCount(0);
    await expect(S.moveToActiveButton(page)).toBeVisible();
  }

  /** Opens the Assign modal (queued/unassigned engagement). */
  async openAssignModal() {
    await S.assignButton(this.page).click();
    return new AssignReassignModal(this.page);
  }

  /** Opens the Reassign modal (already-assigned engagement). */
  async openReassignModal() {
    await S.reassignButton(this.page).click();
    return new AssignReassignModal(this.page);
  }

  async assertAssignedSuccessfully() {
    await expect(S.assignedChatToast(this.page)).toBeVisible({ timeout: 10000 });
  }

  async assertReassignedSuccessfully() {
    await expect(S.chatTransferredToast(this.page)).toBeVisible({ timeout: 10000 });
  }

  /** Opens Action > Sort By, revealing the sort options submenu. */
  async openSortByMenu() {
    const { page } = this;
    await InboxFilterSelectors.actionButton(page).click();
    await S.sortByMenuItem(page).click();
  }

  /**
   * Sorts the list via Action > Sort By > Latest Updated. This is already the list's
   * default sort - selecting it re-affirms rather than changes state - so this only
   * confirms the option exists and is selectable, not that ordering visibly changes.
   */
  async sortByLatestUpdated() {
    await this.openSortByMenu();
    await S.latestUpdatedSortOption(this.page).click();
  }
}
