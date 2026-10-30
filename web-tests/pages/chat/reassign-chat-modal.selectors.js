export const ReassignChatModalSelectors = {
  reassignOption: (page) => page.getByText('Reassign', { exact: true }).first(),
  reassignChatDialogTitle: (dialog) => dialog.getByText('Reassign Chat', { exact: true }),
};
