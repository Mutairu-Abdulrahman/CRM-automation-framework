export const AdminNavSelectors = {
  // The grid-menu icon that opens the Admin/Support/Escalations dropdown, in the top header
  // next to the entity name/member count. It has no accessible name or role of its own, so
  // it's identified by its distinctive SVG path (a small rounded square, part of a 2x2 grid
  // icon) rather than by role/text.
  roleDropdownTrigger: (page) => page.locator('path[d^="M8.4 14H4.6C4.03995 14"]').locator('xpath=ancestor::button[1]'),
  adminOption: (page) => page.getByText('Admin', { exact: true }),
  supportOption: (page) => page.getByText('Support', { exact: true }),
  escalationsOption: (page) => page.getByText('Escalations', { exact: true }),
};
