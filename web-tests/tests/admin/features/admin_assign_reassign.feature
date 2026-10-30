Feature: Assignment and reassignment of engagements

  Admin can sort the Inbox, assign a queued engagement directly to a named agent
  (whether Online or Away), and reassign an already-assigned engagement to a team.

  Background:
    Given the super admin is logged into Moniedesk and has selected the "Moniepoint MFB" entity
    And the super admin is on the Inbox page
    And a customer is waiting in the Live Chat queue

  Scenario: Admin sorts the Inbox by Latest Updated
    When the admin sorts the Inbox by Latest Updated
    Then the Latest Updated sort option is available and selected

  Scenario: Admin assigns a queued engagement to an online agent
    Given Agent B is logged into Moniedesk and online
    When the admin opens the Inbox filter panel
    And the admin filters by Team "Live Chat"
    And the admin applies the filter
    And the admin assigns the next queued engagement to agent "Mutairu Oshioke"
    Then the assignment succeeds
    And Agent B sees that engagement in their Active tab, manually assigned by "Parichay Parichay"

  Scenario: Admin assigns a queued engagement to an away agent
    Given Agent B is logged into Moniedesk and away
    When the admin opens the Inbox filter panel
    And the admin filters by Team "Live Chat"
    And the admin applies the filter
    And the admin assigns the next queued engagement to away agent "Mutairu Oshioke"
    Then the assignment succeeds
    And Agent B sees that engagement in their Active tab, manually assigned by "Parichay Parichay"

  Scenario: Admin reassigns an already-assigned engagement to a team
    Given Agent B is logged into Moniedesk and online
    When the admin opens the Inbox filter panel
    And the admin filters by Team "Live Chat"
    And the admin applies the filter
    And the admin assigns the next queued engagement to agent "Mutairu Oshioke"
    And the assignment succeeds
    And the admin reassigns that engagement to the "Social Media Chat" team
    Then the reassignment succeeds
