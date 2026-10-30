Feature: Admin reassigns Live Chat engagements from the Inbox page, across statuses

  Reassignment from the Inbox page is exercised across every status a live chat
  engagement can be in. Resolved is a special case: it has no direct Reassign action
  at all, only "Move to Active" - reassignment only becomes possible again once it's
  active. (Pending/queued engagements are covered separately via the existing Assign
  flow in admin-assign-reassign and team-lead-queue-assign - the Inbox page's own
  Status filter has no matching data for "Pending" specifically.)

  Unresolved/Resolved have an abundant, naturally-occurring pool of matching staging
  data. Open sometimes runs dry from this suite's own repeated testing - a freshly
  seeded-and-accepted chat was tried as a fix, but it doesn't reliably show up in the
  admin Inbox's own search within any practical test timeout (a real backend gap
  between the agent dashboard and the admin Inbox's index, not just a short lag - see
  project memory). Falls back to whatever's already Open, same as Unresolved/Resolved;
  this scenario is skipped if that pool happens to be empty when it runs.

  Background:
    Given the super admin is logged into Moniedesk and has selected the "Moniepoint MFB" entity
    And the super admin is on the Inbox page
    And Agent B is logged into Moniedesk and online

  Scenario: Admin reassigns an Open engagement to another agent
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Webchat"
    And the admin filters by Status "Open"
    And the admin applies the filter
    And the admin reassigns the next listed engagement to agent "Mutairu Oshioke"
    Then the reassignment succeeds
    And Agent B sees that engagement in their Active tab in real time, manually assigned by "Parichay Parichay"

  Scenario: Admin reassigns an Unresolved engagement to another agent
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Webchat"
    And the admin filters by Status "Unresolved"
    And the admin applies the filter
    And the admin reassigns the next listed engagement to agent "Mutairu Oshioke"
    Then the reassignment succeeds
    And Agent B sees that engagement in their Active tab in real time, manually assigned by "Parichay Parichay"

  Scenario: Resolved engagements cannot be reassigned directly
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Webchat"
    And the admin filters by Status "Resolved"
    And the admin applies the filter
    And the admin opens the next listed engagement
    Then reassignment is not available - only Move to Active
