export const CustomerWidgetSelectors = {
  toggleChatButton: (frame) => frame.getByRole('button', { name: 'Toggle chat' }),
  greetingText: (frame) => frame.getByText('thank you for contacting Moniepoint', { exact: false }),
  botText: (frame, text) => frame.getByText(text, { exact: false }).last(),
  messageInput: (frame) => frame.locator('textarea[name="message"]'),
  sendButton: (frame) => frame.getByRole('button', { name: 'Send message' }),
  sentMessageText: (frame, text) => frame.getByText(text, { exact: false }).last(),
  lastImage: (frame) => frame.locator('img').last(),
  // Provided end-chat control inside the widget header during an active session.
  endChatIcon: (frame) => frame.locator('svg path[d^="M12.793 4.54289"]'),
  endChatConfirmText: (frame) =>
    frame.getByText('Are you sure you want to end this conversation with support agent?', { exact: false }),
  // Earlier bot messages' quick-reply chips (e.g. an earlier Yes/No prompt) stay
  // rendered in the message history, so more than one "Yes" chip can match - the
  // current prompt's is always the most recently rendered one.
  endChatYesButton: (frame) => frame.getByRole('button', { name: 'Yes', exact: true }).last(),
  // Rating screen selectors
  ratingGoodButton: (frame) => frame.getByRole('button', { name: 'Good', exact: true }).last(),
  ratingBadButton: (frame) => frame.getByRole('button', { name: 'Bad', exact: true }).last(),
  reasonButton: (frame, reason) => frame.getByRole('button', { name: reason, exact: true }),
  reasonInput: (frame) => frame.locator('textarea[placeholder*="reason" i], textarea[placeholder*="feedback" i], textarea').first(),
  reasonSubmitButton: (frame) => frame.getByRole('button', { name: /submit|send|confirm|ok/i }).last(),
};
