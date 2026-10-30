import { expect } from '@playwright/test';
import { SaveFilterModalSelectors as S } from './save-filter-modal.selectors.js';

// Confirmed via a real save - note the capitalization ("Saved", not "saved").
export const FILTER_SAVED_TOAST = 'Filter Saved Successfully';

/** The "Save Filter" dialog, opened via the Inbox result header's Save Filter link. */
export class SaveFilterModal {
  constructor(page) {
    this.page = page;
    this.dialog = S.dialog(page);
  }

  async fillName(name) {
    await S.nameInput(this.dialog).fill(name);
  }

  /** Opens a field's multi-select dropdown (react-select) - same pattern as InboxFilterPage. */
  async openMultiSelect(fieldLabel) {
    const control = S.fieldControl(this.dialog, fieldLabel);
    const box = await control.boundingBox();
    await control.click({ position: { x: 10, y: box.height / 2 } });
  }

  async selectMultiOptions(fieldLabel, values) {
    const { page } = this;
    for (const value of values) {
      await this.openMultiSelect(fieldLabel);
      await page.getByRole('option', { name: value, exact: true }).click();
    }
  }

  async save() {
    await S.saveButton(this.dialog).click();
    await expect(this.page.getByText(FILTER_SAVED_TOAST, { exact: false })).toBeVisible({ timeout: 10000 });
  }

  /** Saves the current filter visible only to the creator ("Myself" - the default mode). */
  async saveForMyself(name) {
    await this.fillName(name);
    await this.save();
  }

  /**
   * Saves the current filter visible to agents matching the given role(s) and team(s).
   * Both Role and Team are multi-select (react-select) fields - `roles`/`teams` each
   * accept one or more values.
   */
  async saveForOthers(name, { roles, teams } = {}) {
    await S.othersRadio(this.dialog).click();
    await this.fillName(name);
    if (roles?.length) {
      await this.selectMultiOptions('Role', roles);
    }
    if (teams?.length) {
      await this.selectMultiOptions('Team', teams);
    }
    await this.save();
  }
}
