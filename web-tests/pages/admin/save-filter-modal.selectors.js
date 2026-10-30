export const SaveFilterModalSelectors = {
  dialog: (page) => page.locator('[role="dialog"]').last(),
  myselfRadio: (dialog) => dialog.getByText('Myself', { exact: true }),
  othersRadio: (dialog) => dialog.getByText('Others', { exact: true }),
  nameInput: (dialog) => dialog.getByPlaceholder('Enter a filter name'),
  // Same react-select "-control" class-suffix pattern as InboxFilterSelectors.fieldSelectControl
  // (see that file's comment for why), scoped to the dialog so it can't collide with the
  // Filter By panel's own same-named fields (e.g. "Team") still mounted behind the modal.
  fieldControl: (dialog, label) => dialog.getByText(label, { exact: true }).locator('xpath=following::div[contains(@class,"-control")][1]'),
  saveButton: (dialog) => dialog.getByRole('button', { name: 'Save', exact: true }),
  cancelButton: (dialog) => dialog.getByRole('button', { name: 'Cancel', exact: true }),
};
