Feature: A Lead reassigning a chat she has been handed

  As a Lead who has been handed a chat via transfer from an agent, I want to
  reassign it onward using Reassign - the action that replaces "Transfer" in
  a Lead's own More Actions menu (a Lead also has Move to Inactive and Resolve
  Manually there, but no plain "Transfer" option). Reassign works the same
  way Transfer does: either to a specific agent, respecting the same
  team-scoped visibility rules a regular agent's Transfer has, or to a whole
  team when no one individual is the right owner.

  Background:
    Given the agent is logged into Moniedesk and online in the Chat module
    And Lead A is logged into Moniedesk and online
    And a customer joins the live chat queue
    And the agent accepts the customer's chat from the queue
    And the agent transfers the chat to Lead A with reason "Escalating to the team lead for review."
    And Lead A opens the transferred chat
    And Lead A accepts the transferred chat

  Scenario: Lead A cannot see agents outside their team in the reassign dropdown
    Given Agent B is logged into Moniedesk and online
    And Agent C is logged into Moniedesk and online on a different team
    When Lead A opens the reassign agent dropdown on the "Active" tab
    Then Agent B should be visible and Agent C should not be visible in Lead A's reassign dropdown

  Scenario: Lead A reassigns the chat to a team instead of a specific agent
    When Lead A reassigns the chat to a team
    Then the chat should appear in the Queue List as Pending
