import { expect } from '@playwright/test';
import { AdminEntitySelectors as S } from './admin-entity.selectors.js';

/** The "All Entities" page an admin lands on right after login (/admin/entity). */
export class AdminEntityPage {
  constructor(page) {
    this.page = page;
  }

  /** Selects the given entity via its three-dot menu > Select, landing on the Admin page. */
  async selectEntity(entityName) {
    const { page } = this;
    const heading = S.entityHeading(page, entityName);
    await expect(heading).toBeVisible();
    await heading.scrollIntoViewIfNeeded();
    const card = S.entityCard(heading);
    await S.cardMenuButton(card).click();
    await S.selectMenuOption(page).click();
  }
}
