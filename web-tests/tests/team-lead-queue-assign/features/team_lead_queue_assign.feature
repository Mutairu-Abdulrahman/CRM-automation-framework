Feature: Team lead assigns Pending engagements from the Queue List

  A team lead can assign a Pending (queued) engagement to an agent on their team
  directly from the Queue List, regardless of whether that agent is Online or Away.
  This is an assignment, not a transfer - it should complete without needing the
  receiving agent to accept, and must reach them live over the websocket connection,
  with no page refresh required.

  Background:
    Given Lead A is logged into Moniedesk and online
    And a customer is waiting in the Live Chat queue
    And the team lead is on the Live Chat Queue List

  Scenario: Team lead assigns a queued engagement to an online agent
    Given Agent B is logged into Moniedesk and online
    When the team lead assigns the next queued engagement to agent "Mutairu Oshioke"
    Then the team lead's assignment succeeds
    And Agent B sees that engagement in their Active tab in real time, manually assigned by "Adebimpe Product"

  Scenario: Team lead assigns a queued engagement to an away agent
    Given Agent B is logged into Moniedesk and away
    When the team lead assigns the next queued engagement to away agent "Mutairu Oshioke"
    Then the team lead's assignment succeeds
    And Agent B sees that engagement in their Active tab in real time, manually assigned by "Adebimpe Product"
