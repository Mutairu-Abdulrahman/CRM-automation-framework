Feature: Admin logs in and applies filters on the Inbox page

  As a Super Admin, I want to log in, select the entity I manage, reach the Support/
  Engagement area, and filter the Inbox by fields like Channel so I can narrow down to
  the engagements I care about.

  This covers the Entry Flow (login -> entity selection -> Admin/Support/Escalations ->
  Inbox) shared by every admin action, plus a first verified filter field (Channel).
  Other filter fields (Owner, Team, Status, Engagement State/Type, Issue Name, Customer
  Type/Name/Email/Phone/ID, Sentiment, Toxicity, Tags, SLA) are not covered yet - see
  project memory for what's confirmed vs. still to explore.

  Background:
    Given the super admin is logged into Moniedesk and has selected the "Moniepoint MFB" entity
    And the super admin is on the Inbox page

  Scenario: Admin applies a single-field filter by Channel
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Webchat" and "Appchat"
    And the admin applies the filter
    Then the Inbox shows the filter has been applied

  Scenario: Admin applies a multi-field filter across Channel, Team and Status
    When the admin opens the Inbox filter panel
    And the admin filters by Channel "Webchat" and "Appchat"
    And the admin filters by Team "Live Chat" and "WhatsApp Team"
    And the admin filters by Status "Open" and "Pending"
    And the admin applies the filter
    Then the Inbox shows the filter has been applied
