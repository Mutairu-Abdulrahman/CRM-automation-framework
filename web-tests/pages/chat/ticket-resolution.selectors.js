export const TicketResolutionSelectors = {
  endChatButton: (page) => page.getByRole('button', { name: 'End Chat', exact: true }),
  issueTypeField: (tickets) => tickets.getByPlaceholder('Select Issue Type'),
  issueOption: (tickets) => tickets.getByText('External Resolution', { exact: true }).first(),
  // Channel is a readonly select whose chosen value lives in the input's value
  // attribute, not as visible text - match on the attribute directly.
  channelInput: (tickets) => tickets.locator('input[value="Live Chat"]'),
  confirmToProceedButton: (tickets) => tickets.getByRole('button', { name: 'Confirm to Proceed' }),
  logEscalateButton: (resolution) => resolution.getByRole('button', { name: 'Log & Escalate' }),
  logCloseButton: (resolution) => resolution.getByRole('button', { name: 'Log & Close' }),
  firstNameField: (resolution) => resolution.getByPlaceholder('First Name'),
  lastNameField: (resolution) => resolution.getByPlaceholder('Last Name'),
  phoneNumberField: (resolution) => resolution.locator('input[placeholder="Phone Number"]'),
  continueButton: (resolution) => resolution.getByRole('button', { name: 'Continue' }),
  confirmButton: (tickets, name) => tickets.getByRole('button', { name }),
  descriptionField: (tickets) => tickets.getByPlaceholder('Enter your description...'),
  submitButton: (tickets, name) => tickets.getByRole('button', { name, exact: true }),
  endChatDialog: (page) => page.locator('[role="dialog"]', { hasText: 'End Chat' }),
  endChatDialogButton: (dialog) => dialog.getByRole('button', { name: 'End Chat', exact: true }),
};
