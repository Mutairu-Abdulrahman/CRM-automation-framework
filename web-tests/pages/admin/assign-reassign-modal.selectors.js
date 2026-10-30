export const AssignReassignModalSelectors = {
  // Both "Assign Chat" (queued/unassigned engagement) and "Reassign Chat"/"Reassign Email"
  // (already-assigned engagement) render as the first-opened [role="dialog"] on the page -
  // the Active/Away agent-list and Team-list popovers below open as their own, separate
  // dialogs stacked on top, so this main one must stay scoped to .first().
  dialog: (page) => page.locator('[role="dialog"]').first(),
  agentModeRadio: (page) => AssignReassignModalSelectors.dialog(page).getByText('Agent', { exact: true }),
  teamModeRadio: (page) => AssignReassignModalSelectors.dialog(page).getByText('Team', { exact: true }),
  selectAgentField: (page) => page.getByPlaceholder('Select Agent'),
  selectTeamField: (page) => page.getByPlaceholder('Select Team'),
  // The agent picker popover is its own dialog, opened on top of the main one - scope to
  // .last() to reach it (mirrors the Active/Away tab structure discovered live in the UI).
  popover: (page) => page.locator('[role="dialog"]').last(),
  awayTabButton: (page) => AssignReassignModalSelectors.popover(page).getByText('Away', { exact: true }),
  agentOption: (page, name) => AssignReassignModalSelectors.popover(page).getByText(name, { exact: true }),
  teamOption: (page, name) => AssignReassignModalSelectors.popover(page).getByText(name, { exact: true }),
  // The confirm button's own label varies by context ("Assign" for a queued engagement,
  // "Send Request" for reassigning an already-assigned one) - it is reliably the last of
  // the dialog's two footer buttons (Cancel is always first) regardless of wording, so
  // target it structurally instead of by text.
  confirmButton: (page) => AssignReassignModalSelectors.dialog(page).locator('button').last(),
};
