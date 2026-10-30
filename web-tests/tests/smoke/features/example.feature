Feature: Smoke — Moniedesk reachability

  A quick sanity check that the staging environment is up and serving the app.
  Run this before any full suite run to catch environment outages early.

  Scenario: Login page loads and shows the sign-in form
    Given I open the Moniedesk login page
    Then the login form should be visible
