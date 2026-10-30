import { expect } from '@playwright/test';
import { TransferChatModal } from './transfer-chat-modal.page.js';
import { TransferChatModalSelectors } from './transfer-chat-modal.selectors.js';
import { ReassignChatModalSelectors as S } from './reassign-chat-modal.selectors.js';

/**
 * The Reassign Chat dialog, opened via More Actions > Reassign - the Lead-role
 * counterpart to the Transfer Chat dialog a regular agent gets. A Lead's More
 * Actions menu has Reassign, Move to Inactive, and Resolve Manually - no plain
 * "Transfer" option.
 *
 * Structurally identical to TransferChatModal (same Agent/Team radio, Select
 * Agent/Select Team inputs, Cancel/Send Request), so this reuses all of that
 * logic and only overrides the open() trigger/title.
 */
export class ReassignChatModal extends TransferChatModal {
  /** Opens the modal via More Actions > Reassign and waits for it to render. */
  async open() {
    const { page } = this;
    await TransferChatModalSelectors.moreActionsButton(page).click();
    await S.reassignOption(page).click();
    this.dialog = TransferChatModalSelectors.lastDialog(page);
    await expect(S.reassignChatDialogTitle(this.dialog)).toBeVisible();
    return this;
  }

  /**
   * End-to-end: picks the target teammate from the given sub-tab, fills the
   * reason, and sends. NOTE: unlike transferToTeam (independently verified),
   * this agent-mode send path reuses TransferChatModal's sendRequest/toast
   * assertion by inheritance - that exact toast text has not itself been
   * independently confirmed for Reassign's agent mode, only the dropdown
   * (visibility/cross-team-filtering) part of this flow has.
   */
  async reassignToAgent(agentDisplayName, reason, tab = 'Active') {
    return this.transferTo(agentDisplayName, reason, tab);
  }

  /** End-to-end: switches to Team mode, picks the team, fills the reason, and sends. */
  async reassignToTeam(teamName, reason) {
    return this.transferToTeam(teamName, reason);
  }
}
