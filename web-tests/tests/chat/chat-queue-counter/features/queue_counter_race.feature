Feature: Queue List counter behavior under rapid LIST_COUNTER updates

  Context: the socket handler for LIST_COUNTER events was changed to buffer and
  "merge by accumulating counts" instead of applying each update directly. It's
  unconfirmed whether LIST_COUNTER payloads represent an authoritative running
  total (in which case accumulating them would double-count and inflate the
  displayed number) or a delta to add. This suite observes the deployed
  behavior of the Queue List tab's counter badge (driven by LIST_COUNTER's
  data.liveChatCount field) to answer that question empirically, rather than
  assuming either interpretation is correct.

  Background:
    Given the agent is logged into Moniedesk and online in the Chat module
    And the agent notes the baseline Queue List count

  Scenario: Two customers join the queue in rapid succession and the counter reflects the true total
    When two customers join the live chat queue at nearly the same time
    Then the Queue List count should increase by exactly 2 from the baseline
    And both new customers should be individually visible in the Queue List

  Scenario: A single normal queue join updates the counter correctly without a noticeable delay
    When a customer joins the live chat queue
    Then the Queue List count should increase by exactly 1 from the baseline within 3 seconds
