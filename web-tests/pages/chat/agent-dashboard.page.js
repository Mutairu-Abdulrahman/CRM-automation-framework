import { expect } from '@playwright/test';
import { TicketResolutionPage } from './ticket-resolution.page.js';
import { TransferChatModal } from './transfer-chat-modal.page.js';
import { ReassignChatModal } from './reassign-chat-modal.page.js';
import { AgentDashboardSelectors as S } from './agent-dashboard.selectors.js';
import { AssignReassignModal } from '../admin/assign-reassign-modal.page.js';

// Confirmed via captured accessibility snapshot - not "Unable to move chat to
// inactive" as originally assumed during exploration.
export const MOVE_TO_INACTIVE_REJECTION = 'Last message must be from an agent in order to mark as inactive';

/**
 * The main agent dashboard: chat module, chat list/tabs (Active, Inactive,
 * Queue List, Escalated, Transferred, ...), and the currently open
 * engagement's message pane and actions.
 */
export class AgentDashboardPage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Confirms a filter an admin just saved (scoped to this agent's role/team) shows up in
   * this agent's own SAVED FILTER sidebar section. The sidebar was rendered at this
   * session's login time, before the admin created the filter, so it can take a moment
   * (and a reload) to catch up - retry rather than trusting a single check.
   */
  async assertSavedFilterVisible(name) {
    const { page } = this;
    const target = page.getByText(name, { exact: true }).first();
    for (let attempt = 0; attempt < 5; attempt++) {
      if (await target.isVisible().catch(() => false)) return;
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
    }
    await expect(target).toBeVisible();
  }

  /** Confirms a filter (e.g. one saved for "Myself", or since deleted) is NOT visible to this agent. */
  async assertSavedFilterNotVisible(name) {
    const { page } = this;
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByText(name, { exact: true })).toHaveCount(0);
  }

  // ---------- Presence status ----------

  async ensureOnline() {
    const { page } = this;
    const onlineToggle = S.onlineButton(page);
    await expect(onlineToggle).toBeVisible();
    if ((await onlineToggle.getAttribute('aria-selected')) !== 'true') {
      await onlineToggle.click();
      await expect(onlineToggle).toHaveAttribute('aria-selected', 'true');
    }
  }

  /**
   * Confirms the agent's status is genuinely Online. The optimistic toggle
   * (its own aria-selected) can flip before the change is actually
   * confirmed server-side - other sessions (e.g. a teammate's transfer
   * dropdown) can keep observing the old status for a while after. Reload
   * and re-check rather than trusting a single client-side click.
   */
  async ensureOnlineConfirmed() {
    const { page } = this;
    const onlineBtn = S.onlineButton(page);
    for (let attempt = 0; attempt < 4; attempt++) {
      await expect(onlineBtn).toBeVisible();
      if ((await onlineBtn.getAttribute('aria-selected')) !== 'true') {
        await onlineBtn.click();
        await expect(onlineBtn).toHaveAttribute('aria-selected', 'true');
      }
      await page.waitForTimeout(1500);
      await page.reload({ waitUntil: 'networkidle' });
      if ((await S.onlineButton(page).getAttribute('aria-selected')) === 'true') return;
    }
    await expect(S.onlineButton(page)).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Sets status to Away with a reason (e.g. "On Break"). Same backend-lag
   * caveat as ensureOnlineConfirmed - the Save Status modal can close
   * before the change is actually confirmed server-side, so this reloads
   * and re-checks before trusting it, retrying the whole flow if needed.
   * The "Set status as away" reason dialog doesn't always appear (observed:
   * an account switching Away again shortly after a prior Away/Online cycle
   * can skip it and toggle directly) - handle both, don't assume it's there.
   */
  async setAway(reason) {
    const { page } = this;
    const awayBtn = S.awayButton(page);
    for (let attempt = 0; attempt < 4; attempt++) {
      await awayBtn.click();
      const dialog = S.lastDialog(page);
      if (await S.setAwayDialogTitle(dialog).isVisible({ timeout: 3000 }).catch(() => false)) {
        await S.awayReasonCombobox(dialog).click();
        await S.awayReasonOption(page, reason).click();
        await S.saveStatusButton(dialog).click();
        await expect(dialog).toBeHidden();
      }
      await page.waitForTimeout(1500);
      await page.reload({ waitUntil: 'networkidle' });
      if ((await S.awayButton(page).getAttribute('aria-selected')) === 'true') return;
    }
    await expect(S.awayButton(page)).toHaveAttribute('aria-selected', 'true');
  }

  // ---------- Messaging ----------

  get editor() {
    return S.editor(this.page);
  }

  async sendMessage(text) {
    const editor = this.editor;
    await editor.click();
    await editor.fill(text);
    await editor.press('Enter');
    await expect(S.sentMessageText(this.page, text)).toBeVisible();
  }

  /** Attaches a file, confirms the upload preview, then sends it. */
  async sendImageAttachment(filePath) {
    const { page } = this;
    await S.fileInput(page).setInputFiles(filePath);
    await S.continueButton(page).click();
    await expect(S.fileUploadedToast(page)).toBeVisible();
    await S.attachmentPreviewCloseButton(page).click();
    await expect(S.lastImage(page)).toBeVisible();
  }

  /**
   * Asserts a chat is gone from the top-level Active tab. Removal can lag
   * slightly behind the ending action on the backend, so this re-clicks the
   * tab a few times with waits rather than checking just once.
   */
  async assertNotInActiveList(customerName) {
    const { page } = this;
    const activeTab = S.activeTabButton(page);
    await expect(activeTab).toBeVisible();
    for (let attempt = 0; attempt < 5; attempt++) {
      await activeTab.click();
      if ((await S.customerText(page, customerName).count()) === 0) break;
      await page.waitForTimeout(2000);
    }
    await expect(S.customerText(page, customerName)).toHaveCount(0);
  }

  // ---------- LIST_COUNTER tab badges ----------

  /**
   * Reads the numeric badge on a tab (Queue List <- liveChatCount, Active <-
   * myChatCount). Returns 0 if the badge isn't rendered at all - some tabs
   * hide their badge entirely at a count of 0 rather than showing "0".
   */
  async getTabCount(tabPattern) {
    const button = this.page.getByRole('button', { name: tabPattern }).first();
    if (!(await button.count())) return 0;
    // The badge span is a SIBLING of the <button>, not a child — both live
    // inside a shared wrapper div (data-tab-value="..."). Walking the button's
    // own descendants never finds the badge; walk the parent's children instead.
    return button.evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      for (const sib of parent.children) {
        if (sib === el) continue;
        const t = (sib.textContent ?? '').trim();
        if (/^\d+$/.test(t)) return Number(t);
      }
      return 0;
    });
  }

  /** Queue List tab count - driven by LIST_COUNTER's data.liveChatCount field. */
  async getQueueListCount() {
    return this.getTabCount(/Queue List/);
  }

  /** Active tab count - driven by LIST_COUNTER's data.myChatCount field. */
  async getActiveTabCount() {
    return this.getTabCount(/Active/);
  }

  /**
   * Confirms a customer's engagement is visible in the Queue List (All
   * sub-tab) via search, without opening/accepting it - a read-only
   * source-of-truth check independent of the tab's counter badge.
   */
  async assertCustomerVisibleInQueueList(customerName) {
    const { page } = this;
    // Clear any active search first: search mode hides the main tab bar so the
    // Queue List button is not accessible until the overlay is dismissed.
    const searchBox = S.searchBox(page);
    if (await searchBox.count()) {
      await searchBox.fill('');
    }
    await S.queueListButton(page).click();
    const allTab = S.allSubTabButton(page);
    if (await allTab.count()) {
      await allTab.click();
    }
    // The search index can lag, so retry a few times before giving up.
    for (let attempt = 0; attempt < 4; attempt++) {
      await searchBox.fill('');
      await searchBox.fill(customerName);
      const visible = await S.customerText(page, customerName)
        .first()
        .isVisible()
        .catch(() => false);
      if (visible) return;
      await page.waitForTimeout(2000);
    }
    // Final attempt — let expect() produce the failing assertion message.
    await searchBox.fill('');
    await searchBox.fill(customerName);
    await expect(S.customerText(page, customerName).first()).toBeVisible({ timeout: 5000 });
  }

  // ---------- Finding / opening / accepting engagements ----------

  /** Search the agent's chat list for the customer's engagement and open it. */
  async openEngagementByCustomerName(customerName) {
    const { page } = this;
    const searchBox = S.searchBox(page);
    // The search index can lag behind backend state changes (new queue entry,
    // resolution status, etc.), so retry generously instead of failing fast.
    for (let attempt = 0; attempt < 8; attempt++) {
      await searchBox.fill('');
      await searchBox.fill(customerName);
      const engagementTab = S.engagementTabButton(page);
      if (await engagementTab.count()) {
        await engagementTab.click();
      }
      const result = S.customerText(page, customerName).first();
      if (await result.count()) {
        await result.click();
        return;
      }
      await page.waitForTimeout(2000);
    }
    throw new Error(`Could not find engagement for customer "${customerName}" in the chat search`);
  }

  /** Accepts a queued customer's chat via the search box (Queue List > All > search). */
  async acceptChatFromQueue(customerName) {
    const { page } = this;
    await S.queueListButton(page).click();
    const allTab = S.allSubTabButton(page);
    if (await allTab.count()) {
      await allTab.click();
    }
    await this.openEngagementByCustomerName(customerName);

    await S.acceptButton(page).click();
    await S.dialogAcceptButton(page).click();
    await expect(S.chatAcceptedToast(page)).toBeVisible();
    await expect(S.endChatButton(page)).toBeVisible();
  }

  /**
   * Selects the Queue List's "All" sub-tab, sorts by "Latest Updated" so the
   * just-joined customer surfaces at the top, then opens and accepts their
   * chat directly from the list - no search box involved.
   */
  async acceptChatFromSortedQueue(customerName) {
    const { page } = this;
    await S.queueListButton(page).click();

    await S.allSpanSubTab(page).click();

    await S.actionButtonFirst(page).click();
    await S.sortByOption(page).click();
    // This click triggers a client-side navigation (sortBy=LAST_UPDATED) as a
    // side effect, which sometimes races Playwright's navigation-wait and hangs
    // the click promise even though the sort already applied - swallow that and
    // rely on the customer-visibility assertion below instead of the click
    // itself resolving.
    await S.latestUpdateOption(page).click({ timeout: 4000 }).catch(() => {});

    const customerEntry = S.customerText(page, customerName).first();
    await expect(customerEntry).toBeVisible({ timeout: 15000 });
    await customerEntry.click();

    await S.acceptButton(page).click();
    await S.dialogAcceptButton(page).click();
    await expect(S.chatAcceptedToast(page)).toBeVisible();
    await expect(S.endChatButton(page)).toBeVisible();
  }

  /**
   * Finds a chat by name in a given Chats tab (Active, Inactive, Escalated,
   * etc). Right after a state change (e.g. a Move to Inactive or an
   * escalation), the list can lag the backend, so this refreshes before each
   * attempt - and again on failure - rather than trusting the first search.
   */
  async findChatInTab(tabName, customerName, { maxAttempts = 3 } = {}) {
    const { page } = this;
    const tabPattern = new RegExp(`^${tabName}`);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await page.reload({ waitUntil: 'networkidle' });
      await S.chatTabButton(page).click();
      await S.tabButtonMatching(page, tabPattern).click();

      const searchBox = S.searchBox(page);
      await searchBox.fill(customerName);
      const target = S.customerText(page, customerName).first();
      if (await target.count()) {
        await target.click();
        return;
      }
      await page.waitForTimeout(1000);
    }
    // Final attempt's own assertion produces the real failure message.
    await expect(S.customerText(page, customerName).first()).toBeVisible();
  }

  async assertEngagementStatus(customerName, expectedStatus) {
    const { page } = this;
    const statusField = S.statusField(page);
    // The resolved/escalated status can take a moment to propagate on the backend
    // after ending the chat, so reload My Inbox and re-check until it reflects.
    for (let attempt = 0; attempt < 5; attempt++) {
      await S.savedFilterMyInbox(page).click();
      await this.openEngagementByCustomerName(customerName);
      await S.engagementDetailsIcon(page).click();
      await expect(statusField).toBeVisible();
      if ((await statusField.inputValue()) === expectedStatus) break;
      await page.waitForTimeout(2000);
      await page.reload({ waitUntil: 'networkidle' });
    }
    await expect(statusField).toHaveValue(expectedStatus);
  }

  // ---------- Move to Inactive / Active ----------

  async _clickMoveToInactive() {
    const { page } = this;
    await S.moreActionsButton(page).click();
    await S.moveToInactiveOption(page).click();
    await S.dialogMoveButton(page).click();
  }

  /** Attempts Move to Inactive and asserts it is rejected (last message isn't the agent's). */
  async assertMoveToInactiveRejected() {
    await this._clickMoveToInactive();
    await expect(this.page.getByText(MOVE_TO_INACTIVE_REJECTION)).toBeVisible();
  }

  /**
   * Attempts Move to Inactive and asserts it succeeds. The backend can take a
   * moment to register the agent's message as the new "last message sender"
   * even though the UI already shows it sent, so retry a few times with waits
   * rather than failing on the first rejection.
   */
  async assertMoveToInactiveSucceeds() {
    const { page } = this;
    const rejectionToast = page.getByText(MOVE_TO_INACTIVE_REJECTION);
    for (let attempt = 0; attempt < 5; attempt++) {
      await rejectionToast.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
      await this._clickMoveToInactive();
      if (!(await rejectionToast.isVisible().catch(() => false))) {
        await expect(S.inactiveSuccessToast(page)).toBeVisible();
        return;
      }
      await page.waitForTimeout(3000);
    }
    await expect(rejectionToast).not.toBeVisible();
  }

  /**
   * Moves the currently-open Inactive chat back to Active and asserts success.
   * Unlike Move to Inactive, this is a direct button on the Inactive chat view -
   * no "More Actions" dropdown involved.
   */
  async assertMoveToActiveSucceeds() {
    const { page } = this;
    await S.moveToActiveButton(page).click();
    await S.dialogMoveButton(page).click();
    await expect(S.movedToActiveToast(page)).toBeVisible();
  }

  /**
   * Waits for a chat to appear in the Active tab triggered by a customer action
   * (not an agent "Move to Active" click). Captures WebSocket frames received
   * during the wait — each reload opens a fresh socket connection whose initial
   * burst includes the updated ACTIVE_CHAT_LIST, showing the moment the backend
   * registered the auto-return. Returns the captured frames for the caller to
   * attach to the test report.
   */
  async waitForChatAutoReturnedToActive(customerName) {
    const { page } = this;
    const startTime = Date.now();
    const socketFrames = [];
    const onWs = (ws) => {
      ws.on('framereceived', (frame) => {
        socketFrames.push({
          t: Date.now() - startTime,
          payload: typeof frame.payload === 'string' ? frame.payload : '[binary]',
        });
      });
    };
    page.on('websocket', onWs);

    try {
      for (let attempt = 0; attempt < 6; attempt++) {
        // First attempt: check without reloading to catch a WS-pushed auto-return.
        // Subsequent attempts: reload first, then check.
        if (attempt > 0) {
          await page.reload({ waitUntil: 'load' });
          // Cap networkidle at 10s — the app sustains continuous WS traffic so
          // networkidle may never settle, but 10s is enough for React to re-render.
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
        }
        await S.chatTabButton(page).click();
        await S.tabButtonMatching(page, /^Active/).click();
        const searchBox = S.searchBox(page);
        await searchBox.fill('');
        await searchBox.fill(customerName);
        // Click the Engagement filter tab in search results (same as openEngagementByCustomerName).
        const engagementTab = S.engagementTabButton(page);
        if (await engagementTab.count()) await engagementTab.click();
        const target = S.customerText(page, customerName).first();
        if (await target.count()) {
          await target.click();
          return socketFrames;
        }
        await page.waitForTimeout(3000);
      }
      throw new Error(
        `"${customerName}" did not appear in Active tab after customer reply — expected auto-return from Inactive`
      );
    } finally {
      page.off('websocket', onWs);
    }
  }

  // ---------- Ending a chat / ticket resolution ----------

  /** Returns a TicketResolutionPage for driving the End Chat flow. */
  ticketResolution() {
    return new TicketResolutionPage(this.page);
  }

  // ---------- Chat transfer ----------

  /** Opens the Transfer Chat modal via More Actions > Transfer. */
  async openTransferModal() {
    return new TransferChatModal(this.page).open();
  }

  /** Opens the Reassign Chat modal via More Actions > Reassign (Lead role only - a
   * regular agent's More Actions has Transfer instead, not Reassign). */
  async openReassignModal() {
    return new ReassignChatModal(this.page).open();
  }

  /**
   * Confirms a chat sent to a TEAM (via Transfer or Reassign, as opposed to a named
   * agent/lead) has landed back in the Queue List with status "Pending" and a
   * "Manual Assign by <sender>" banner - unlike an agent/lead-targeted transfer,
   * it does not go straight into anyone's inbox as accept-ready.
   */
  async assertPendingInQueueList(customerName, assignedByDisplayName) {
    const { page } = this;
    await S.queueListButton(page).click();
    const allTab = S.allSubTabButton(page);
    if (await allTab.count()) {
      await allTab.click();
    }
    await this.openEngagementByCustomerName(customerName);
    await expect(S.pendingText(page)).toBeVisible();
    if (assignedByDisplayName) {
      await expect(S.manualAssignByText(page, assignedByDisplayName)).toBeVisible();
    }
  }

  /**
   * Confirms a chat manually assigned to this agent by an admin/lead (via the admin
   * Inbox page's Assign action, as opposed to Reassign-to-team above) landed directly in
   * the Active tab as accept-ready "Open" work, tagged "Manual Assign by <assigner>" -
   * unlike a queued customer chat, it does not need Accept. Reload-retries since a
   * just-assigned chat can lag behind the admin-side confirmation, consistent with the
   * backend-lag pattern documented throughout this suite.
   */
  async assertActiveWithManualAssign(customerName, assignedByDisplayName) {
    const { page } = this;
    for (let attempt = 0; attempt < 5; attempt++) {
      await S.activeTabButton(page).click();
      if (await S.customerText(page, customerName).count()) break;
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
    }
    await this.openEngagementByCustomerName(customerName);
    await expect(S.openStatusText(page)).toBeVisible();
    await expect(S.manualAssignByText(page, assignedByDisplayName)).toBeVisible();
  }

  /**
   * Same check as assertActiveWithManualAssign, but WITHOUT any reload - for flows whose
   * spec explicitly requires proving real-time (websocket-pushed) delivery, reload-retrying
   * would defeat the point of the check. Relies entirely on Playwright's own expect() polling
   * within a generous timeout instead.
   */
  async assertActiveWithManualAssignRealtime(customerName, assignedByDisplayName) {
    const { page } = this;
    // .first() - a customer can have more than one past engagement sharing the same display
    // name (confirmed live: "resolved to 2 elements" hit when the same customer had an
    // earlier, unrelated chat already sitting in this agent's Active tab), so an exact,
    // unscoped match isn't guaranteed unique here the way it is for a freshly-created saved
    // filter name elsewhere in this suite.
    await expect(S.customerText(page, customerName).first()).toBeVisible({ timeout: 15000 });
    await this.openEngagementByCustomerName(customerName);
    await expect(S.openStatusText(page)).toBeVisible();
    await expect(S.manualAssignByText(page, assignedByDisplayName)).toBeVisible({ timeout: 10000 });
  }

  // ---------- Team Lead: Assign from Queue List ----------

  /** Opens the Queue List's team-scoped sub-tab (e.g. "Live Chat"). */
  async openQueueListTeamTab(teamName) {
    const { page } = this;
    await S.queueListButton(page).click();
    await S.queueListTeamSubTab(page, teamName).click();
  }

  /**
   * Opens the first Pending (queued/unassigned) engagement in the current Queue List view
   * and returns its customer name. Same finite/shared-pool caveat as the admin Inbox's
   * equivalent method (AdminEngagementPage.openFirstPendingEngagement) - picking whichever
   * is first rather than a hardcoded name keeps this repeatable as the pool gets consumed.
   */
  async openFirstPendingEngagement() {
    const nameEl = S.pendingRowCustomerName(this.page, 0);
    const customerName = (await nameEl.innerText()).trim();
    await nameEl.click();
    return customerName;
  }

  /** Opens the Assign modal for the currently-open Pending engagement. */
  async openAssignModal() {
    await S.assignButton(this.page).click();
    return new AssignReassignModal(this.page);
  }

  async assertAssignedSuccessfully() {
    await expect(S.assignedChatToast(this.page)).toBeVisible({ timeout: 10000 });
  }

  /**
   * On the receiving agent's page: reloads, opens the Transferred tab (only
   * rendered once at least one transfer is pending), finds the customer's
   * chat there, and opens it - landing on the view with Accept/Reject buttons.
   * The live-notification that surfaces this tab can lag noticeably on an
   * account with a lot of accumulated test data, so this reloads a few times
   * rather than trusting a single check. Widened from 3 to 6 attempts, with an
   * explicit pause before each reload after the first, to check whether the
   * notification does eventually arrive given more time rather than genuinely
   * never landing within the original ~60s budget.
   */
  async openTransferredChat(customerName) {
    const { page } = this;
    const transferredTab = S.transferredTab(page);
    for (let attempt = 0; attempt < 6; attempt++) {
      if (attempt > 0) {
        // Give the live transfer-notification event more time to arrive -
        // reloading immediately doesn't help if the backend simply hasn't
        // pushed/registered the transfer yet.
        await page.waitForTimeout(5000);
      }
      await page.reload({ waitUntil: 'networkidle' });
      if (await transferredTab.isVisible({ timeout: 20000 }).catch(() => false)) break;
    }
    await expect(transferredTab).toBeVisible({ timeout: 20000 });
    await transferredTab.click();
    const entry = S.customerText(page, customerName).first();
    await expect(entry).toBeVisible({ timeout: 15000 });
    await entry.click();
  }

  async acceptTransferredChat() {
    const { page } = this;
    await S.acceptButton(page).click();
    await expect(S.chatAcceptedGenericToast(page)).toBeVisible();
  }

  /** Rejects the currently-open transferred chat with a reason via the Reject Chat modal. */
  async rejectTransferredChat(reason) {
    const { page } = this;
    await S.rejectButton(page).click();
    const dialog = S.lastDialog(page);
    await expect(S.rejectChatDialogTitle(dialog)).toBeVisible();
    await S.dialogTextarea(dialog).fill(reason);
    await S.dialogRejectChatButton(dialog).click();
    await expect(S.chatRejectedToast(page)).toBeVisible();
  }

  /**
   * On the transferring agent's page: asserts the "Transfer Request Rejected"
   * notice appears (pushed live, no reload needed) showing the rejection
   * reason, without dismissing it yet.
   */
  async assertTransferRejectedNotice(rejectionReason) {
    const { page } = this;
    const dialog = S.lastDialog(page);
    await expect(S.transferRejectedDialogTitle(dialog)).toBeVisible({ timeout: 20000 });
    await expect(S.transferRejectedReasonText(dialog, rejectionReason)).toBeVisible();
    return dialog;
  }

  async acknowledgeTransferRejectedNotice() {
    const dialog = S.transferRejectedDialog(this.page);
    await S.okayNotedButton(dialog).click();
    await expect(dialog).toBeHidden();
  }

  /** Withdraws a pending transfer via More Actions > Withdraw Transfer > Withdraw. */
  async withdrawTransfer() {
    const { page } = this;
    await S.moreActionsButton(page).click();
    await S.withdrawTransferOption(page).click();
    const dialog = S.lastDialog(page);
    await expect(S.withdrawTransferDialogTitle(dialog)).toBeVisible();
    await S.withdrawButton(dialog).click();
    await expect(dialog).toBeHidden();
  }

  /**
   * On the receiving agent's page: confirms the chat is not (or no longer) in
   * their Transferred tab. The tab itself only renders while at least one
   * transfer is pending, so its absence also satisfies this check.
   */
  async assertChatNotInTransferredTab(customerName) {
    const { page } = this;
    await page.reload({ waitUntil: 'networkidle' });
    const transferredTab = S.transferredTab(page);
    if (await transferredTab.count()) {
      await transferredTab.click();
    }
    await expect(S.customerText(page, customerName)).toHaveCount(0);
  }
}
