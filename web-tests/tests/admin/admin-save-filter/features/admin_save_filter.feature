Feature: Admin saves a filter for reuse

  Once a filter is applied, the admin can save it either for themselves only, or for other
  agents matching a chosen role and team.

  Background:
    Given the super admin is logged into Moniedesk and has selected the "Moniepoint MFB" entity
    And the super admin is on the Inbox page
    And the admin opens the Inbox filter panel
    And the admin filters by Channel "Webchat"
    And the admin applies the filter

  Scenario: Admin saves a filter for themselves only
    When the admin saves the filter for themselves
    Then the saved filter appears in the sidebar

  Scenario: Admin saves a filter for others matching a role and team
    When the admin saves the filter for others with role "Mdr Online Entity Agent" and team "Live Chat"
    Then the saved filter appears in the sidebar
