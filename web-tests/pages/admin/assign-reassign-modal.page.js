import { AssignReassignModalSelectors as S } from './assign-reassign-modal.selectors.js';

/**
 * The "Assign Chat"/"Reassign Chat" (or "...Email") modal, opened from an engagement's
 * detail panel on the admin Inbox page via its "Assign" (queued/unassigned engagement) or
 * "Reassign" (already-assigned engagement) button. Agent mode defaults to selected; the
 * agent picker has its own Active/Away sub-tabs (Active is the default tab).
 */
export class AssignReassignModal {
  constructor(page) {
    this.page = page;
  }

  /** Assigns/reassigns to a named agent. Pass `away: true` if the agent is in the Away tab. */
  async assignToAgent(agentName, { away = false } = {}) {
    const { page } = this;
    await S.selectAgentField(page).click();
    if (away) {
      await S.awayTabButton(page).click();
    }
    await S.agentOption(page, agentName).click();
    await S.confirmButton(page).click();
  }

  /** Reassigns to a team - switches the modal into Team mode first. */
  async reassignToTeam(teamName) {
    const { page } = this;
    await S.teamModeRadio(page).click();
    await S.selectTeamField(page).click();
    await S.teamOption(page, teamName).click();
    await S.confirmButton(page).click();
  }
}
