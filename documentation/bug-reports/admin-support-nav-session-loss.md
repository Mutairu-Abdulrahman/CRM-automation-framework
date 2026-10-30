# Bug Report: Clicking "Support" in the Admin/Support/Escalations dropdown loses the session

**Status:** Open — confirmed reproducible, workaround in place in the test suite
**Reported:** 2026-09-08/09
**Reported by:** QA / Test Automation (Moniedesk admin-role Playwright/BDD suite)
**Area:** Moniedesk Admin — role switcher (top header, next to the entity name)
**Environment:** Staging (`v3.moniedesk.staging.moniepoint.com`)
**Severity:** Low-Medium — annoying and consistently reproducible, but a page reload/re-navigation recovers cleanly with no data loss.

## Summary

After a Super Admin logs in, selects an entity, and lands on the Admin page (`/admin/...`),
clicking the grid-menu icon in the top header to open the Admin/Support/Escalations
dropdown, then clicking **Support**, reliably drops the session: the browser ends up on
`http://v3.moniedesk.staging.moniepoint.com/auth/login` (note **http, not https**) instead
of the expected Inbox/Engagement page. This reproduced on every attempt during exploration
(multiple runs, both headed and headless).

This is the same general class of issue as an already-known agent-login quirk (the app's
own post-login client redirect intermittently bounces through an insecure URL and loses
the session), but triggered by a different action - navigating from Admin to Support, not
the initial login.

## Steps to Reproduce

1. Log in as a Super Admin (or Team Lead admin).
2. On the "All Entities" page, select an entity (e.g. "Moniepoint MFB") via its three-dot
   menu > Select.
3. On the resulting Admin page, click the grid-menu icon in the top header (next to the
   entity name/member count) to open the Admin/Support/Escalations dropdown.
4. Click **Support**.

**Expected:** Lands on the Inbox/Engagement (chat) page, still logged in.

**Actual:** Lands on `http://.../auth/login` (insecure scheme), logged out.

## Workaround (test suite)

`AdminNavPage.goToSupport()` (`src/pages/admin/admin-nav.page.js`) detects the redirect to
`/auth/login` and recovers in two steps:
1. First, a direct re-navigation to the known Inbox URL over `https://` - this alone
   usually recovers, suggesting the session itself is often still valid server-side and
   the insecure bounce is a client-side rendering glitch rather than a true logout.
2. Only if that also lands back on `/auth/login`, a full re-login is attempted.

Note: a fresh login attempt made immediately after hitting this bug can itself hang
waiting on `networkidle` (observed once during exploration) - possibly a lingering
background connection from the broken page state. The direct-nav-first approach avoids
depending on a fresh login succeeding quickly.

## Suggested Follow-up

- Confirm with the frontend/backend team whether this is the same root cause as the
  existing post-login insecure-redirect quirk, or a separate one specific to the
  Admin-to-Support navigation path.
- Check whether this also affects the other two dropdown options (**Admin**, **Escalations**)
  or is specific to Support.
