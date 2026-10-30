import { expect } from '@playwright/test';
import { TransferChatModalSelectors as S } from './transfer-chat-modal.selectors.js';

export const TRANSFER_SENT_TOAST = 'Transfer Request Sent, Pending Approval.';
// Shown after sending to a TEAM (not a named agent) - same toast text for both
// TransferChatModal (agent-side) and ReassignChatModal (lead-side), since it's the
// same underlying Send Request action. Unlike TRANSFER_SENT_TOAST, a team-targeted
// send doesn't need anyone to accept it - the chat lands straight in the Queue List
// with status "Pending". See AgentDashboardPage.assertPendingInQueueList.
export const TEAM_SEND_TOAST = 'Chat transferred successfully';

/**
 * The Transfer Chat dialog opened via More Actions > Transfer, including its
 * nested Select Agent popup - a second, separately-rendered `[role="dialog"]`
 * (the picker is not nested inside the transfer dialog's own DOM subtree).
 */
export class TransferChatModal {
  constructor(page) {
    this.page = page;
    this.dialog = S.lastDialog(page);
  }

  /** Opens the modal via More Actions > Transfer and waits for it to render. */
  async open() {
    const { page } = this;
    await S.moreActionsButton(page).click();
    await S.transferOption(page).click();
    this.dialog = S.lastDialog(page);
    await expect(S.transferChatDialogTitle(this.dialog)).toBeVisible();
    return this;
  }

  /**
   * Opens the Select Agent dropdown and switches to the given sub-tab. The
   * dropdown lists only teammates on the agent's own team - agents on other
   * teams never appear here.
   * @param {'Active' | 'Away'} tab
   */
  async openAgentDropdown(tab = 'Active') {
    const { page, dialog } = this;
    await S.selectAgentInput(dialog).click();
    await expect(S.tabButtonLast(page, 'Active')).toBeVisible();
    if (tab === 'Away') {
      await S.tabButtonLast(page, 'Away').click();
    }
  }

  /** Picks a teammate by their exact display name from an already-open dropdown. */
  async pickAgent(agentDisplayName) {
    await S.agentOption(this.dialog, agentDisplayName).click();
  }

  /**
   * Asserts a teammate is visible in the dropdown's given tab. An agent's
   * Online/Away status can take a moment to propagate on the backend, so
   * this toggles to the other tab and back a few times - a re-click on an
   * already-active tab doesn't force a refetch - rather than failing fast.
   */
  async assertAgentVisible(tab, agentDisplayName) {
    const { page, dialog } = this;
    const target = S.agentOption(dialog, agentDisplayName);
    const otherTab = tab === 'Away' ? 'Active' : 'Away';
    for (let attempt = 0; attempt < 8; attempt++) {
      if (await target.isVisible().catch(() => false)) return;
      await S.tabButtonLast(page, otherTab).click();
      await page.waitForTimeout(600);
      await S.tabButtonLast(page, tab).click();
      await page.waitForTimeout(2500);
    }
    await expect(target).toBeVisible({ timeout: 10000 });
  }

  async fillReason(reason) {
    await S.reasonTextarea(this.dialog).fill(reason);
  }

  async sendRequest() {
    await S.sendRequestButton(this.dialog).click();
    await expect(S.transferSentToast(this.page, TRANSFER_SENT_TOAST)).toBeVisible();
  }

  /** End-to-end: picks the target agent from the given sub-tab, fills the reason, and sends. */
  async transferTo(agentDisplayName, reason, tab = 'Active') {
    await this.openAgentDropdown(tab);
    await this.pickAgent(agentDisplayName);
    await this.fillReason(reason);
    await this.sendRequest();
  }

  /** Switches the modal from Agent mode to Team mode and opens the Select Team dropdown. */
  async openTeamDropdown() {
    const { dialog } = this;
    await S.teamModeOption(dialog).click();
    const teamInput = S.selectTeamInput(dialog);
    await expect(teamInput).toBeVisible();
    await teamInput.click();
  }

  /** Picks a team by its exact name from an already-open Select Team dropdown. */
  async pickTeam(teamName) {
    await S.teamOption(this.dialog, teamName).click();
  }

  async sendTeamRequest() {
    await S.sendRequestButton(this.dialog).click();
    await expect(S.transferSentToast(this.page, TEAM_SEND_TOAST)).toBeVisible();
  }

  /**
   * End-to-end: switches to Team mode, picks the team, fills the reason, and sends.
   * Unlike transferTo (which needs the target agent to accept), this lands the chat
   * back in the Queue List with status "Pending" - nobody needs to accept it directly.
   *
   * Unlike Agent mode, Team mode's reason field isn't guaranteed to be present, so the
   * reason is filled only if a textarea actually rendered (fillReason() would otherwise
   * hang indefinitely waiting for a textarea that never appears).
   */
  async transferToTeam(teamName, reason) {
    await this.openTeamDropdown();
    await this.pickTeam(teamName);
    const reasonBox = S.reasonTextarea(this.dialog);
    if (await reasonBox.count()) {
      await reasonBox.fill(reason);
    }
    await this.sendTeamRequest();
  }

  /**
   * Closes the modal via Cancel. Cancel is not a real <button> (unlike
   * Withdraw / Send Request, which are), so it's matched by text, not role.
   * If the Select Agent dropdown is still expanded, its popup can visually
   * cover Cancel and block the click - Escape collapses just the dropdown
   * (not the whole modal) first.
   */
  async cancel() {
    await this.page.keyboard.press('Escape');
    await S.cancelOption(this.dialog).click();
    await expect(this.dialog).toBeHidden();
  }
}
