export const AdminEngagementSelectors = {
  // Plain text match on the customer/contact name in the chat list - same ambiguity risk
  // documented for react-select options elsewhere in this module (the name can also appear
  // in the detail panel once opened), so callers should click the .first() match, which is
  // always the list row since it renders above the (still-closed) detail panel.
  engagementRowByCustomer: (page, name) => page.getByText(name, { exact: false }).first(),
  // The "Pending" status pill's own wrapper span (has a distinguishing class, unlike the
  // plain-text span nested directly inside it which would double-count matches per row).
  // NOTE: the queue mixes engagements from every team (Live Chat, Support Email, WhatsApp,
  // etc.), and Channel isn't a reliable proxy for Team (multiple teams can handle the same
  // channel) - callers must first filter the Inbox to Team "Live Chat" (via InboxFilterPage)
  // before using this to assign to a Live-Chat-only agent like Agent B, or picking the first
  // Pending row can land on an engagement with no valid agent to assign to ("No agents
  // online" isn't a bug in that case - it's this scoping gap).
  pendingBadge: (page) => page.locator('span.bg-feedback-neutral-ghost-default').filter({ hasText: 'Pending' }),
  // From a Pending badge, the customer name sits in a sibling paragraph under the nearest
  // "flex-col" ancestor row container - this must be the *nearest* single ancestor (an XPath
  // walk-up), not a page-wide `div.flex-col` CSS filter: that also matches broader wrapper
  // divs several levels up that happen to contain "Pending" text somewhere in their whole
  // subtree, so `.first()` on it can silently resolve to a wrapper spanning many rows instead
  // of one - confirmed live via a "resolved to 19 elements" strict-mode violation.
  pendingRowCustomerName: (page, index = 0) =>
    AdminEngagementSelectors.pendingBadge(page)
      .nth(index)
      .locator('xpath=ancestor::div[contains(@class,"flex-col")][1]')
      .locator('p[class*="max-w-[11rem]"]'),
  // The list row's own "headline" label - usually the customer name, but once an
  // engagement has an associated ticket, the headline becomes "Ticket #NNNN" instead and
  // the customer name is demoted to a smaller line within the row. Don't rely on this for
  // the true customer name in a status-filtered view (Open/Resolved/Unresolved commonly
  // have tickets attached) - open the row, then read detailCustomerNameHeading instead.
  firstRowLabel: (page) => page.locator('p[class*="max-w-[11rem]"]').first(),
  // The detail panel's own customer-name heading, reliable regardless of whether the list
  // row's headline was a ticket number - confirmed via geometry-scoped DOM dump (only
  // element in the top-left of the detail pane matching this class combination).
  detailCustomerNameHeading: (page) =>
    page.locator('p.typography-body-default-untrimmed.font-semibold.leading-trim.truncate.py-units-unit2').first(),
  assignButton: (page) => page.getByRole('button', { name: 'Assign', exact: true }),
  reassignButton: (page) => page.getByRole('button', { name: 'Reassign', exact: true }),
  // A Resolved engagement has no Reassign action at all - only "Move to Active" (confirmed
  // live: Team=Live Chat+Channel=Webchat+Status=Resolved reliably shows this button and no
  // Reassign/More Actions instead). Reassignment only becomes possible again after this.
  moveToActiveButton: (page) => page.getByRole('button', { name: 'Move to Active', exact: true }),
  // Real toast text confirmed live: identical wording ("Assigned chat successfully") for
  // both a fresh Assign (queued engagement -> named agent) and an Assign-to-team action;
  // Reassign (already-assigned engagement, "Send Request" button) instead confirms with
  // "Chat transferred successfully" - a genuinely different toast, not a typo/variant.
  assignedChatToast: (page) => page.getByText('Assigned chat successfully', { exact: false }),
  chatTransferredToast: (page) => page.getByText('Chat transferred successfully', { exact: false }),
  sortByMenuItem: (page) => page.getByText('Sort By', { exact: true }),
  latestUpdatedSortOption: (page) => page.getByText('Latest Updated', { exact: false }),
};
