export const TransferChatModalSelectors = {
  // Shared with ReassignChatModal.open() - both are triggered from the same menu.
  moreActionsButton: (page) => page.getByRole('button', { name: 'More Actions' }).first(),
  transferOption: (page) => page.getByText('Transfer', { exact: true }).first(),
  lastDialog: (page) => page.locator('[role="dialog"]').last(),
  transferChatDialogTitle: (dialog) => dialog.getByText('Transfer Chat', { exact: true }),

  selectAgentInput: (dialog) => dialog.getByPlaceholder('Select Agent'),
  tabButtonLast: (page, tab) => page.getByRole('button', { name: tab, exact: true }).last(),
  agentOption: (dialog, agentDisplayName) => dialog.getByText(agentDisplayName, { exact: true }),

  reasonTextarea: (dialog) => dialog.locator('textarea'),
  sendRequestButton: (dialog) => dialog.getByRole('button', { name: 'Send Request' }),
  transferSentToast: (page, text) => page.getByText(text),

  teamModeOption: (dialog) => dialog.getByText('Team', { exact: true }).first(),
  selectTeamInput: (dialog) => dialog.getByPlaceholder('Select Team'),
  teamOption: (dialog, teamName) => dialog.getByText(teamName, { exact: true }).last(),

  cancelOption: (dialog) => dialog.getByText('Cancel', { exact: true }),
};
