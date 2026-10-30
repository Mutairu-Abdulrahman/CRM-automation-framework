export const InboxFilterSelectors = {
  inboxSidebarLink: (page) => page.getByText('Inbox', { exact: true }).first(),
  actionButton: (page) => page.getByRole('button', { name: 'Action' }).first(),
  filterByMenuItem: (page) => page.getByText('Filter By', { exact: true }),
  fieldLabel: (page, label) => page.getByText(label, { exact: true }),
  // The react-select control for a given field - react-select's hashed classes aren't
  // stable, but every instance's outer control div consistently ends in "-control"
  // regardless of the hash prefix, so target that suffix directly rather than trying to
  // count DOM levels up from the label (fragile - breaks once a placeholder is replaced
  // by a picked value's chip). A child of this control intercepts clicks at its default
  // (center) point, so openMultiSelect() clicks near the left edge instead, away from the
  // dropdown-arrow icon.
  fieldSelectControl: (page, label) =>
    InboxFilterSelectors.fieldLabel(page, label).locator('xpath=following::div[contains(@class,"-control")][1]'),
  option: (page, name) => page.getByRole('option', { name, exact: true }),
  applyFilterButton: (page) => page.getByRole('button', { name: 'Apply Filter' }),
  clearButton: (page) => page.getByRole('button', { name: 'Clear', exact: true }),
  // Confirmed via DOM text dump: the real label reads "SHOWINGN FILTER RESULT" - a genuine
  // product typo (extra "N"), not a Playwright/matching issue. Matched verbatim rather than
  // "corrected", since asserting the real text is what actually protects against regressions.
  showingFilterResult: (page) => page.getByText('SHOWINGN FILTER RESULT', { exact: false }),
  clearAllLink: (page) => page.getByText('Clear All', { exact: true }),
  saveFilterLink: (page) => page.getByText('Save Filter', { exact: true }),

  // The active (saved) filter's name heading in the main content header has a stable class,
  // unlike the sidebar's saved-filter links which use a different element/class entirely.
  activeFilterNameHeading: (page) => page.locator('p.typography-body-large-untrimmed').first(),
  // The edit/delete icon row is the next sibling div after the name heading; delete is the
  // last (2nd) of the two icons in that row. Selecting the delete icon directly by its own
  // SVG path data proved unreliable (the exact path was confirmed present via page.evaluate,
  // but page.locator('path[d...=...]') consistently resolved to 0 elements for reasons not
  // fully understood). An xpath `following-sibling::div[1]//svg` from the heading locator
  // *also* consistently resolves to 0 despite the DOM genuinely having that structure
  // (confirmed via page.evaluate) - some quirk chaining Playwright's xpath engine off a
  // locator that was itself resolved via a CSS selector. The plain CSS adjacent-sibling
  // combinator does work reliably, so use that instead of xpath here.
  activeFilterDeleteIcon: (page) => page.locator('p.typography-body-large-untrimmed + div svg').last(),
  deleteConfirmButton: (page) => page.getByRole('button', { name: 'Delete', exact: true }),
  filterDeletedToast: (page) => page.getByText('Saved filter deleted successfully', { exact: false }),
};
