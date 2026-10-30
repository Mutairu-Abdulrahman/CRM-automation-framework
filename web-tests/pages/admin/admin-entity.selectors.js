export const AdminEntitySelectors = {
  entityHeading: (page, name) => page.getByText(name, { exact: true }),
  // The entity card is the nearest ancestor div that also contains the "ACTIVE" status
  // pill - there's no dedicated card container class/testid to key off directly.
  entityCard: (heading) => heading.locator('xpath=ancestor::div[.//text()[contains(., "ACTIVE")]][1]'),
  cardMenuButton: (card) => card.locator('button').last(),
  selectMenuOption: (page) => page.getByText('Select', { exact: true }).first(),
};
