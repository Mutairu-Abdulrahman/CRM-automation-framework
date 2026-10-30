/**
 * Login validation helpers to ensure all agent/lead logins land on the Chat module.
 * This prevents the issue where staging account settings redirect to wrong modules.
 */

export class LoginValidator {
  /**
   * Validates that a page is on the Chat module after login.
   * If not on Chat, navigates there explicitly.
   *
   * @param {Page} page - Playwright page object
   * @param {string} [agentName="Agent"] - Display name for error messages
   * @returns {Promise<boolean>} - true if on Chat module, false if had to redirect
   */
  static async ensureOnChatModule(page, agentName = 'Agent') {
    const currentUrl = page.url();

    if (currentUrl.includes('/v2/chat')) {
      return true; // Already on Chat module
    }

    console.warn(
      `⚠️  ${agentName} was redirected to ${currentUrl.split('/').pop() || 'unknown'} instead of Chat. ` +
        `Redirecting to Chat module...`
    );

    // Force navigate to Chat module
    const chatUrl = 'https://v3.moniedesk.staging.moniepoint.com/v2/chat/active-chat/All-Messages';
    await page.goto(chatUrl, { waitUntil: 'networkidle' });

    // Verify we made it to Chat
    if (!page.url().includes('/v2/chat')) {
      throw new Error(`${agentName} login validator failed: Could not redirect to Chat module. Final URL: ${page.url()}`);
    }

    return false; // Indicates we had to redirect (not ideal but handled)
  }

  /**
   * Validates that a page loaded the Chat module's primary navigation.
   * Checks for the presence of key Chat module elements.
   *
   * @param {Page} page - Playwright page object
   * @param {number} [timeout=10000] - Timeout in milliseconds
   * @returns {Promise<void>} - Throws if Chat module is not properly loaded
   */
  static async validateChatModuleLoaded(page, timeout = 10000) {
    const chatIndicators = page.getByText('Chats', { exact: true });
    await chatIndicators.waitFor({ timeout, state: 'visible' });
  }

  /**
   * Full login validation: ensures both URL and UI elements confirm Chat module.
   * Use this after all login steps to guarantee we're on Chat before proceeding.
   *
   * @param {Page} page - Playwright page object
   * @param {string} [agentName="Agent"] - Display name for logs/errors
   * @param {number} [uiTimeout=10000] - UI element timeout in ms
   * @returns {Promise<void>}
   */
  static async validateLoginToChat(page, agentName = 'Agent', uiTimeout = 10000) {
    // Step 1: Ensure URL is on /v2/chat
    await this.ensureOnChatModule(page, agentName);

    // Step 2: Validate Chat module UI is loaded
    try {
      await this.validateChatModuleLoaded(page, uiTimeout);
    } catch (error) {
      throw new Error(
        `${agentName} login validation failed: Chat module UI did not load. ` +
          `URL: ${page.url()}, Error: ${error.message}`
      );
    }
  }
}
