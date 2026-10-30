Feature: Agent live chat engagement and resolution

  As an agent in the LiveChat team, I want to accept a queued customer chat,
  converse with the customer, and resolve the engagement so that customer
  issues are tracked and closed correctly in Moniedesk.

  Background:
    Given the agent is logged into Moniedesk and online in the Chat module
    And a customer joins the live chat queue
    And the agent accepts the customer's chat from the queue

  # "Log & Close" was removed from the staging "External Resolution" issue-type
  # workflow — the only available first-step button is now "Log & Escalate".
  # This scenario verifies the end-to-end ticket resolution flow still completes
  # and removes the chat from the Active list; the full escalation lifecycle
  # (move back to Active) is covered by the next scenario.
  Scenario: Agent ends the chat via the ticket resolution flow
    When the agent and customer exchange messages during the chat
    And the agent ends the chat and resolves it using "Log & Escalate"
    Then the chat should no longer appear in the agent's active chat list
    And the chat should appear in the Escalated tab

  Scenario: Agent escalates the chat using Log and Escalate, then moves it back to Active
    When the agent and customer exchange messages during the chat
    And the agent ends the chat and resolves it using "Log & Escalate"
    Then the chat should no longer appear in the agent's active chat list
    And the chat should appear in the Escalated tab
    When the agent moves the chat back to Active
    Then the chat should appear in the Active tab

  Scenario: Customer ends the chat
    When the agent and customer exchange messages during the chat
    And the customer ends the chat from the widget and confirms
    Then the chat should no longer appear in the agent's active chat list
    And the engagement should be marked as "RESOLVED" in the agent's inbox

  Scenario: Customer ends chat and rates the experience as Good
    When the agent and customer exchange messages during the chat
    And the customer ends the chat from the widget and confirms
    Then the customer sees the rating screen
    When the customer rates the experience as "Good"
    Then the chat should no longer appear in the agent's active chat list
    And the engagement should be marked as "RESOLVED" in the agent's inbox

  Scenario: Customer ends chat and rates as Bad with predefined reason
    When the agent and customer exchange messages during the chat
    And the customer ends the chat from the widget and confirms
    Then the customer sees the rating screen
    When the customer rates the experience as "Bad"
    And the customer selects a predefined reason
    Then the feedback is submitted successfully
    And the chat should no longer appear in the agent's active chat list
    And the engagement should be marked as "RESOLVED" in the agent's inbox

  Scenario: Customer ends chat and rates as Bad with custom reason
    When the agent and customer exchange messages during the chat
    And the customer ends the chat from the widget and confirms
    Then the customer sees the rating screen
    When the customer rates the experience as "Bad"
    And the customer selects "Other" as the reason
    And the customer provides custom feedback "Not happy with the engagement with the agent"
    And the customer submits the feedback
    Then the chat should no longer appear in the agent's active chat list
    And the engagement should be marked as "RESOLVED" in the agent's inbox
