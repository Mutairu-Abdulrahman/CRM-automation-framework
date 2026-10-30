import { expect } from '@playwright/test';
import { TicketResolutionSelectors as S } from './ticket-resolution.selectors.js';

/**
 * The "End Chat" ticketing flow, reached from the agent dashboard. Uses a
 * doubly-nested iframe: `iframe#ticketEscalationIframe-*` (stable by ID
 * prefix, not `src`, since it client-side-routes internally between
 * `/tickets/create` and `/escalate-issue` without changing its `src`
 * attribute) containing a further nested
 * `iframe[src*="moniedesk-external-resolution"]` where the actual
 * Log & Close / Log & Escalate buttons and the customer-identification
 * (First/Last name, phone) form live.
 */
export class TicketResolutionPage {
  constructor(page) {
    this.page = page;
  }

  get ticketFrame() {
    return this.page.frameLocator('iframe[id^="ticketEscalationIframe"]');
  }

  get resolutionFrame() {
    return this.ticketFrame.frameLocator('iframe[src*="moniedesk-external-resolution"]');
  }

  /**
   * Runs the full "End Chat" flow via either the Log & Close or the
   * Log & Escalate path, and confirms the End Chat modal.
   * @param {'Log & Close' | 'Log & Escalate'} resolutionType
   */
  async resolve(resolutionType) {
    const { page } = this;
    const tickets = this.ticketFrame;
    const resolution = this.resolutionFrame;

    await S.endChatButton(page).click();

    const issueTypeField = S.issueTypeField(tickets);
    await expect(issueTypeField).toBeVisible({ timeout: 15000 });
    await issueTypeField.click();
    await page.keyboard.type('External Resolution');

    const issueOption = S.issueOption(tickets);
    await expect(issueOption).toBeVisible();
    await issueOption.click();

    await expect(S.channelInput(tickets)).toBeVisible({ timeout: 10000 });

    const confirmToProceed = S.confirmToProceedButton(tickets);
    await expect(confirmToProceed).toBeVisible({ timeout: 10000 });
    await confirmToProceed.click();

    const logEscalateBtn = S.logEscalateButton(resolution);
    await expect(logEscalateBtn).toBeVisible({ timeout: 15000 });
    await logEscalateBtn.click();

    // Customer identification form.
    await S.firstNameField(resolution).fill('Ada');
    await S.lastNameField(resolution).fill('Tester');
    await S.phoneNumberField(resolution).fill('8012345678');
    await S.continueButton(resolution).click();

    await S.confirmButton(tickets, 'Yes, Escalate Issue').click();

    // Final ticket details form.
    await S.descriptionField(tickets).fill('Escalating this issue for further investigation.');
    await S.submitButton(tickets, 'Escalate').click();

    const endChatDialog = S.endChatDialog(page);
    await S.endChatDialogButton(endChatDialog).click();
  }
}
