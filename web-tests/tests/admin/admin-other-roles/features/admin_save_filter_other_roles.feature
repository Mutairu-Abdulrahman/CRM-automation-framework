Feature: Save Filter also works for other admin roles, not just Super Admin

  The Save Filter action isn't Super-Admin-only - a Team Lead admin on either a
  chat-channel team (LiveChat) or a post-channel team (Social Media) can filter the
  Inbox and save that filter for themselves too. Unlike Super Admin, these accounts
  land directly on their team's chat dashboard and reach Support without an entity
  selection step.

  Scenario: LiveChat Admin TeamLead saves a filter for themselves
    Given the LiveChat Admin TeamLead is logged into Moniedesk and on the Inbox page
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Webchat"
    And the admin applies the filter
    And the admin saves the filter for themselves
    Then the saved filter appears in the sidebar

  Scenario: Social Media Admin TeamLead saves a filter for themselves
    Given the Social Media Admin TeamLead is logged into Moniedesk and on the Inbox page
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Facebook Post"
    And the admin applies the filter
    And the admin saves the filter for themselves
    Then the saved filter appears in the sidebar
