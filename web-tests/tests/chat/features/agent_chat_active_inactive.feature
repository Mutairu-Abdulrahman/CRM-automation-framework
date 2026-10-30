Feature: Moving a chat between Active and Inactive

  As an agent in the LiveChat team, I want the "Move to Inactive" action to
  only succeed once my own reply is the most recent message in the chat, so
  that a chat can't be parked as inactive while a customer's message is still
  awaiting a response. I also want to be able to move a chat back to Active
  afterwards.

  Background:
    Given the agent is logged into Moniedesk and online in the Chat module
    And a customer joins the live chat queue
    And the agent accepts the customer's chat from the sorted queue list

  Scenario: Chat automatically returns to Active when customer replies while Inactive
    When the agent sends a reply to the customer
    And the agent moves the chat to Inactive
    Then the chat should appear in the Inactive tab
    When the customer sends a message while the chat is Inactive
    Then the chat should automatically return to the Active tab

  Scenario: Move to Inactive is rejected until the agent's reply is the last message, then the chat can be moved back to Active
    When the agent tries to move the chat to Inactive before replying
    Then the move should be rejected with "Last message must be from an agent in order to mark as inactive"
    When the agent sends a reply to the customer
    And the agent tries to move the chat to Inactive again
    Then the move should succeed
    And the chat should appear in the Inactive tab
    When the agent moves the chat back to Active
    Then the chat should appear in the Active tab
