export const AgentDashboardSelectors = {
  // ---------- Presence status ----------
  // exact:true matters here - the product recently added an "ONLINE AGENT" dropdown/filter
  // control elsewhere on the dashboard, and a substring match against plain 'Online' picks
  // that up too (a real "strict mode violation: resolved to 2 elements" hit live).
  onlineButton: (page) => page.getByRole('button', { name: 'Online', exact: true }),
  awayButton: (page) => page.getByRole('button', { name: 'Away', exact: true }),
  lastDialog: (page) => page.locator('[role="dialog"]').last(),
  setAwayDialogTitle: (dialog) => dialog.getByText('Set status as away', { exact: true }),
  awayReasonCombobox: (dialog) => dialog.locator('[role="combobox"]').first(),
  awayReasonOption: (page, reason) => page.getByText(reason, { exact: true }),
  saveStatusButton: (dialog) => dialog.getByRole('button', { name: 'Save Status' }),

  // ---------- Messaging ----------
  editor: (page) => page.locator('.ql-editor'),
  sentMessageText: (page, text) => page.getByText(text, { exact: false }).last(),
  fileInput: (page) => page.locator('input[type="file"]').first(),
  continueButton: (page) => page.getByRole('button', { name: 'Continue' }),
  fileUploadedToast: (page) => page.getByText('File uploaded successfully'),
  attachmentPreviewCloseButton: (page) => page.locator('button:has(svg path[d^="M10.4995 13.5001"])'),
  lastImage: (page) => page.locator('img').last(),
  activeTabButton: (page) => page.getByRole('button', { name: /Active/ }),
  customerText: (page, customerName) => page.getByText(customerName, { exact: true }),

  // ---------- Finding / opening / accepting engagements ----------
  searchBox: (page) => page.getByPlaceholder(/Search by ID, name/),
  engagementTabButton: (page) => page.getByRole('button', { name: 'Engagement' }),
  queueListButton: (page) => page.getByRole('button', { name: /Queue List/ }),
  allSubTabButton: (page) => page.getByRole('button', { name: 'All', exact: true }),
  acceptButton: (page) => page.getByRole('button', { name: 'Accept', exact: true }),
  dialogAcceptButton: (page) => page.locator('[role="dialog"]').getByRole('button', { name: 'Accept', exact: true }),
  chatAcceptedToast: (page) => page.getByText('Chat Accepted Successfully'),
  endChatButton: (page) => page.getByRole('button', { name: 'End Chat', exact: true }),
  // Matches the "All" sub-tab's exact markup (a styled <span>, not a plain
  // button label) - must be selected before sorting or the sort applies to
  // whatever sub-tab was previously active.
  allSpanSubTab: (page) =>
    page.locator('span.text-nowrap.px-padding2.font-medium.typography-body-small', { hasText: 'All' }).first(),
  actionButtonFirst: (page) => page.getByRole('button', { name: 'Action' }).first(),
  sortByOption: (page) => page.getByText('Sort By', { exact: true }),
  latestUpdateOption: (page) => page.getByText(/latest update/i).first(),

  // ---------- Tabs / status ----------
  chatTabButton: (page) => page.getByRole('button', { name: 'Chat', exact: true }),
  tabButtonMatching: (page, tabPattern) => page.getByRole('button', { name: tabPattern }).first(),
  statusField: (page) => page.getByLabel('Status'),
  savedFilterMyInbox: (page) => page.getByLabel('SAVED FILTER').getByText('My Inbox', { exact: true }),
  // Engagement details rail icon (as provided).
  engagementDetailsIcon: (page) => page.locator('svg path[d^="M20.5 7.27783"]'),

  // ---------- Move to Inactive / Active ----------
  moreActionsButton: (page) => page.getByRole('button', { name: 'More Actions' }).first(),
  moveToInactiveOption: (page) => page.getByText('Move to Inactive', { exact: true }),
  dialogMoveButton: (page) => page.locator('[role="dialog"]').getByRole('button', { name: 'Move', exact: true }),
  inactiveSuccessToast: (page) => page.getByText('Engagement moved to inactive'),
  moveToActiveButton: (page) => page.getByRole('button', { name: 'Move to Active', exact: true }),
  movedToActiveToast: (page) => page.getByText(/moved to active/i),

  // ---------- Transfer / Reassign to a team ----------
  pendingText: (page) => page.getByText('Pending', { exact: true }).first(),
  openStatusText: (page) => page.getByText('Open', { exact: true }).first(),
  manualAssignByText: (page, displayName) => page.getByText(`Manual Assign by ${displayName}`, { exact: false }),

  // ---------- Transferred chats ----------
  transferredTab: (page) => page.getByText('Transferred', { exact: true }).first(),
  chatAcceptedGenericToast: (page) => page.getByText('Chat Accepted', { exact: false }),
  rejectButton: (page) => page.getByRole('button', { name: 'Reject', exact: true }),
  rejectChatDialogTitle: (dialog) => dialog.getByText('Reject Chat', { exact: true }).first(),
  dialogTextarea: (dialog) => dialog.locator('textarea'),
  dialogRejectChatButton: (dialog) => dialog.getByRole('button', { name: 'Reject Chat', exact: true }),
  chatRejectedToast: (page) => page.getByText('Chat Rejected', { exact: false }),
  transferRejectedDialogTitle: (dialog) => dialog.getByText('Transfer Request Rejected', { exact: true }),
  transferRejectedReasonText: (dialog, reason) => dialog.getByText(reason, { exact: false }),
  transferRejectedDialog: (page) => page.locator('[role="dialog"]', { hasText: 'Transfer Request Rejected' }),
  okayNotedButton: (dialog) => dialog.getByRole('button', { name: 'Okay Noted', exact: true }),
  withdrawTransferOption: (page) => page.getByText('Withdraw Transfer', { exact: true }),
  withdrawTransferDialogTitle: (dialog) => dialog.getByText('Withdraw Transfer', { exact: true }).first(),
  withdrawButton: (dialog) => dialog.getByRole('button', { name: 'Withdraw', exact: true }),

  // ---------- LIST_COUNTER tab badges ----------
  // The badge is NOT inside the <button> — it is a sibling <span> in the shared
  // wrapper div (data-tab-value="..."). Reading it via button.evaluate() walks
  // parent.children for a digit-only sibling; see AgentDashboardPage.getTabCount().
  // This locator is kept for reference but is not used by getTabCount().
  tabCounterBadge: (page, tabPattern) =>
    page.getByRole('button', { name: tabPattern }).locator('xpath=following-sibling::span').first(),

  // ---------- Team Lead: Assign from Queue List ----------
  // The Queue List's team-scoped sub-tab pills (e.g. "Live Chat", "Bimps Test Facebook")
  // render as a <span>, which happens to share its exact text with an unrelated <p> in the
  // persistent left sidebar's own TEAM section - scope to the <span> tag specifically via
  // Playwright's :text-is() so this doesn't accidentally navigate away to that other view.
  queueListTeamSubTab: (page, teamName) => page.locator(`span:text-is("${teamName}")`),
  // The "Pending" status pill's own wrapper span (distinguishing class, unlike the identical
  // plain-text span nested inside it which would double-count matches per row).
  pendingBadge: (page) => page.locator('span.bg-feedback-neutral-ghost-default').filter({ hasText: 'Pending' }),
  // From a Pending badge, the customer name sits in a sibling paragraph under the nearest
  // "flex-col" ancestor row container - must be the *nearest* single ancestor (an XPath
  // walk-up), not a page-wide CSS class filter, which can resolve to a much broader wrapper
  // spanning many rows instead of one (see src/pages/admin/admin-engagement.selectors.js for
  // the same lesson learned there).
  pendingRowCustomerName: (page, index = 0) =>
    AgentDashboardSelectors.pendingBadge(page)
      .nth(index)
      .locator('xpath=ancestor::div[contains(@class,"flex-col")][1]')
      .locator('p[class*="max-w-[11rem]"]'),
  assignButton: (page) => page.getByRole('button', { name: 'Assign', exact: true }),
  assignedChatToast: (page) => page.getByText('Assigned chat successfully', { exact: false }),
};
