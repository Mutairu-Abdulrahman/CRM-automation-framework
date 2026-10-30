Feature: Saved filter visibility across roles, and deletion

  A filter saved for "Others" (a role + team) should reach exactly the agents it was scoped
  to; a filter saved for "Myself" should reach no one else. Deleting a saved filter should
  remove it for everyone it was visible to.

  Background:
    Given the super admin is logged into Moniedesk and has selected the "Moniepoint MFB" entity
    And the super admin is on the Inbox page
    And Agent B is logged into Moniedesk and online

  Scenario: A filter saved for Others is visible to a matching agent, and one saved for Myself is not
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Email"
    And the admin applies the filter
    And the admin saves an Others filter for role "Mdr Online Entity Agent" and team "Live Chat"
    Then Agent B should see the Others filter in their sidebar
    When the admin returns to a fresh Inbox view
    And the admin opens the Inbox filter panel
    And the admin filters by Channel "Facebook"
    And the admin applies the filter
    And the admin saves a Myself filter
    Then Agent B should not see the Myself filter in their sidebar

  Scenario: Admin deletes a saved filter
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Instagram"
    And the admin applies the filter
    And the admin saves a Myself filter
    And the admin deletes the active saved filter
    Then that filter no longer appears anywhere on the page
