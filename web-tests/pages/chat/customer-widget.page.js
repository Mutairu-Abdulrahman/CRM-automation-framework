import { expect } from '@playwright/test';
import { CUSTOMER_WIDGET_BASE_URL, randomAccountNumber } from '../../data/helpers.js';
import { CustomerWidgetSelectors } from './customer-widget.selectors.js';

/** The customer-facing chat widget - a separate embedded app, rendered in an iframe. */
export class CustomerWidgetPage {
  constructor(customerPage) {
    this.customerPage = customerPage;
    this.frame = customerPage.frameLocator('iframe').first();
  }

  /** Opens the widget for the given customer name and waits for its auto-greeting. */
  async open(customerName) {
    const { customerPage } = this;
    const url = `${CUSTOMER_WIDGET_BASE_URL}?customerName=${encodeURIComponent(customerName)}`;
    await customerPage.goto(url, { waitUntil: 'networkidle' });
    this.frame = customerPage.frameLocator('iframe').first();
    await CustomerWidgetSelectors.toggleChatButton(this.frame).click();
    // Widget shows "Connecting..." briefly before its own bot auto-greeting
    // ("Hi <name>, thank you for contacting Moniepoint...") renders. Wait for
    // that greeting so the widget has fully loaded before anything is sent.
    await expect(CustomerWidgetSelectors.greetingText(this.frame)).toBeVisible({
      timeout: 15000,
    });
    return this;
  }

  /**
   * Polls for any of several possible bot replies (an OR match), returning
   * whichever one actually appeared. Used where the bot can branch into more
   * than one flow after the same message - see joinQueue().
   */
  async _waitForAnyBotText(texts, timeout) {
    const { frame, customerPage } = this;
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      for (const t of texts) {
        const loc = CustomerWidgetSelectors.botText(frame, t);
        if ((await loc.count()) && (await loc.isVisible().catch(() => false))) return t;
      }
      await customerPage.waitForTimeout(500);
    }
    return null;
  }

  /**
   * @param {string} text
   * @param {string | string[]} [waitForBotText] one reply to wait for, or several
   *   possible replies (OR match, first one seen wins) when the bot can branch.
   * @returns {Promise<string | undefined>} whichever of waitForBotText's texts
   *   actually matched, when waitForBotText was given.
   */
  async send(text, waitForBotText) {
    const { frame } = this;
    const input = CustomerWidgetSelectors.messageInput(frame);
    const sendBtn = CustomerWidgetSelectors.sendButton(frame);
    await input.fill(text);
    await sendBtn.click();
    await expect(CustomerWidgetSelectors.sentMessageText(frame, text)).toBeVisible();
    if (waitForBotText) {
      const texts = Array.isArray(waitForBotText) ? waitForBotText : [waitForBotText];
      // Staging bot responses occasionally lag; resend once rather than fail outright.
      let matched = await this._waitForAnyBotText(texts, 25000);
      if (!matched) {
        await input.fill(text);
        await sendBtn.click();
        matched = await this._waitForAnyBotText(texts, 25000);
        if (!matched) throw new Error(`No bot reply containing any of [${texts.join(', ')}] after retry`);
      }
      return matched;
    }
  }

  /**
   * Sends the scripted messages that get a customer through the bot and
   * into the live queue. "hello" gets no bot reply at all - the bot only
   * responds to actual intents like "chat with support" - so there's
   * nothing to wait for after it (the widget's own auto-greeting is already
   * on screen and would falsely match a generic wait).
   *
   * The bot has two known flows after "chat with support": it either asks for
   * account number/name before queueing, or queues the customer directly with
   * no follow-up questions - handle both rather than assuming one.
   */
  async joinQueue(customerName) {
    await this.send('hello');
    const matched = await this.send('chat with support', ['account number', 'queue']);
    if (matched === 'account number') {
      await this.send(randomAccountNumber(), 'account name');
      await this.send(customerName, 'queue');
    }
  }

  /** Asserts an image sent by the agent has arrived in the widget's message pane. */
  async assertImageReceived() {
    await expect(CustomerWidgetSelectors.lastImage(this.frame)).toBeVisible({ timeout: 15000 });
  }

  /** Ends the chat from the widget's own end-chat icon and confirms via the bot's Yes/No quick-reply. */
  async endChatAndConfirm() {
    const { frame } = this;
    await CustomerWidgetSelectors.endChatIcon(frame).click();
    await CustomerWidgetSelectors.endChatConfirmText(frame).waitFor({ state: 'visible', timeout: 15000 });
    await CustomerWidgetSelectors.endChatYesButton(frame).click();
  }

  /** Rates the chat as "Good" from the post-chat rating screen. */
  async rateGood() {
    const { frame } = this;
    const goodBtn = CustomerWidgetSelectors.ratingGoodButton(frame);
    await expect(goodBtn).toBeVisible({ timeout: 15000 });
    await goodBtn.click();
  }

  /** Rates the chat as "Bad" from the post-chat rating screen. */
  async rateBad() {
    const { frame } = this;
    const badBtn = CustomerWidgetSelectors.ratingBadButton(frame);
    await expect(badBtn).toBeVisible({ timeout: 15000 });
    await badBtn.click();
  }

  /** Selects a predefined reason from the list after clicking "Bad". */
  async selectReason(reasonText) {
    const { frame } = this;
    const reasonBtn = CustomerWidgetSelectors.reasonButton(frame, reasonText);
    await expect(reasonBtn).toBeVisible({ timeout: 15000 });
    await reasonBtn.click();
  }

  /** Enters custom feedback text in the reason/feedback field. */
  async enterCustomFeedback(feedbackText) {
    const { frame } = this;
    const reasonInput = CustomerWidgetSelectors.reasonInput(frame);
    await expect(reasonInput).toBeVisible({ timeout: 15000 });
    await reasonInput.fill(feedbackText);
  }

  /** Submits the reason/feedback form. */
  async submitFeedback() {
    const { frame } = this;
    const submitBtn = CustomerWidgetSelectors.reasonSubmitButton(frame);
    await expect(submitBtn).toBeVisible({ timeout: 15000 });
    await submitBtn.click();
  }
}
