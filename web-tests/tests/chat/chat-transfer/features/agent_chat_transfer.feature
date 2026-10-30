Feature: Transferring a chat to another agent

  As an agent handling a live chat, I want to transfer the conversation to a
  teammate (or a Lead) so they can continue helping the customer - including
  when that teammate is marked Away - and I want to be able to withdraw a
  transfer or see why it was rejected. Agents outside my team must never show
  up as transfer targets. I also want to be able to hand the chat to a whole
  team instead of a specific person, when no one individual is the right owner.

  Background:
    Given the agent is logged into Moniedesk and online in the Chat module
    And Agent B is logged into Moniedesk and online
    And a customer joins the live chat queue
    And the agent accepts the customer's chat from the queue

  Scenario: Agent A transfers the chat to Agent B and Agent B accepts it
    When the agent transfers the chat to Agent B with reason "Escalating to Agent B for further assistance with this account query."
    And Agent B opens the transferred chat
    And Agent B accepts the transferred chat
    Then Agent B should have accepted the chat successfully
    And the chat should no longer appear in the agent's active chat list

  Scenario: Agent B rejects the transferred chat and Agent A sees the rejection reason
    When the agent transfers the chat to Agent B with reason "Please take this billing query."
    And Agent B opens the transferred chat
    And Agent B rejects the transferred chat with reason "I am currently handling a higher priority case."
    Then the agent should see a transfer rejected notice with reason "I am currently handling a higher priority case."
    When the agent acknowledges the rejection notice
    Then the rejection notice should be dismissed

  Scenario: Agent A withdraws the transfer before Agent B responds
    When the agent transfers the chat to Agent B with reason "Need a second opinion on this - will withdraw shortly."
    And the agent withdraws the transfer
    Then the chat should no longer appear in Agent B's Transferred tab

  Scenario: Agent A transfers the chat to Agent B while Agent B is Away
    Given Agent B sets their status to Away with reason "On Break"
    When the agent transfers the away Agent B the chat with reason "Urgent follow up needed even though you're away."
    And Agent B opens the transferred chat
    And Agent B accepts the transferred chat
    Then Agent B should have accepted the chat successfully
    And the chat should no longer appear in the agent's active chat list

  Scenario: Agent A cannot see agents outside their team in the transfer dropdown
    Given Agent C is logged into Moniedesk and online on a different team
    When the agent opens the select agent dropdown on the "Active" tab
    Then Agent B should be visible and Agent C should not be visible
    When the agent closes the transfer modal
    And Agent B sets their status to Away with reason "On Break"
    And the agent opens the select agent dropdown on the "Away" tab
    Then Agent B should be visible and Agent C should not be visible

  Scenario: Agent A transfers the chat to Lead A and Lead A accepts it
    Given Lead A is logged into Moniedesk and online
    When the agent transfers the chat to Lead A with reason "Escalating to the team lead for review."
    And Lead A opens the transferred chat
    And Lead A accepts the transferred chat
    Then Lead A should have accepted the chat successfully

  Scenario: Agent A transfers the chat to a team instead of a specific agent
    When the agent transfers the chat to a team
    Then the chat should appear in the Queue List as Pending
