# Chat Module Landing Requirement

## Critical Rule

**ALL agent/lead logins MUST land on the Chat module (`/v2/chat/...`)**

This is enforced at multiple levels to prevent regression of the Agent B login issue.

---

## Why This Matters

In September 2026, Agent B's account was misconfigured on staging to have "Tickets" as the default landing module instead of "Chat". This caused:

- 11 test failures across 8 modules
- 39.4% pass rate (13/33 tests)
- 4+ hours of investigation and fixing

This issue can happen again if:
1. Account default modules change
2. Role/permission assignments change
3. New agents are added with wrong default module
4. Staging environment is reset and re-provisioned

**Prevention is built into code, but vigilance is required.**

---

## Enforcement Layers

### Layer 1: LoginPage.login() Method

**File:** `src/pages/chat/login.page.js`

The LoginPage automatically detects if the server redirected the user to a non-Chat module and:
1. Detects the redirect
2. Logs a warning
3. Forcefully navigates back to Chat module
4. Validates the final URL contains `/v2/chat`

**Code:**
```javascript
await LoginValidator.ensureOnChatModule(page);
```

### Layer 2: LoginValidator Helper

**File:** `src/pages/chat/login.validators.js`

Provides three validation methods:

1. **ensureOnChatModule(page, agentName)**
   - Checks if URL contains `/v2/chat`
   - Auto-redirects if wrong
   - Logs warnings for debugging

2. **validateChatModuleLoaded(page, timeout)**
   - Waits for "Chats" text to appear
   - Confirms Chat module UI is loaded
   - Throws if timeout exceeded

3. **validateLoginToChat(page, agentName, timeout)**
   - Combines both validations
   - Full post-login validation

**Usage:**
```javascript
// In login steps
await LoginValidator.validateChatModuleLoaded(agentBPage, 10000);

// Or for full validation
await LoginValidator.validateLoginToChat(agentBPage, 'Agent B', 10000);
```

### Layer 3: Login Step Validation

**Files:**
- `src/modules/chat-transfer/steps/agent_chat_transfer.steps.js`
- `src/modules/admin-assign-reassign/steps/admin_assign_reassign.steps.js`

All Agent B/Lead login steps now explicitly validate Chat module:

**Code:**
```javascript
Given('Agent B is logged into Moniedesk and online', async ({ agentBPage, agentBDashboard }) => {
  await new LoginPage(agentBPage).login({ username: AGENT_B_USERNAME, password: AGENT_B_PASSWORD });
  // Validate login landed on Chat module (fails if account settings are wrong)
  await LoginValidator.validateChatModuleLoaded(agentBPage, 10000);
  await agentBDashboard.ensureOnlineConfirmed();
});
```

---

## Staging Account Configuration Checklist

Before running tests or after any staging reset:

### For Each Agent/Lead Account

- [ ] **Username:** mutty@moniepoint.com (Agent A)
- [ ] **Default Module:** Chat (`/v2/chat`)
- [ ] **Default Team:** Live Chat
- [ ] **Status:** Active
- [ ] **Roles:** Chat Agent (or appropriate role)

**For Agent B:**
- [ ] **Username:** muttyabdul@moniepoint.com
- [ ] **Default Module:** Chat (`/v2/chat`) ⚠️ **CRITICAL**
- [ ] **Default Team:** Live Chat
- [ ] **Status:** Active
- [ ] **Roles:** Chat Agent (same as Agent A)
- [ ] **Permissions:** Transfer, Reassign

**For Agent C:**
- [ ] **Username:** abdulrahman@moniepoint.com
- [ ] **Default Module:** Chat (`/v2/chat`)
- [ ] **Default Team:** Email (NOT Live Chat)
- [ ] **Status:** Active
- [ ] **Roles:** Chat Agent

**For Lead A:**
- [ ] **Username:** adebimpe.ola@moniepoint.com
- [ ] **Default Module:** Chat (`/v2/chat`)
- [ ] **Default Team:** Live Chat
- [ ] **Status:** Active
- [ ] **Roles:** Team Lead or Lead
- [ ] **Permissions:** Reassign (not Transfer)

---

## How to Verify Account Settings

### Manual Check (Staging Admin Panel)

1. Log into: https://v3.moniedesk.staging.moniepoint.com/
2. Navigate to: Admin > Users Management
3. For each agent/lead:
   - [ ] Search by username or name
   - [ ] Click Edit
   - [ ] Check "Default Module" = Chat
   - [ ] Check "Team" = Correct team
   - [ ] Verify status is Active
   - [ ] Save if any changes made

### Automated Check (CLI Command - Future Enhancement)

```bash
# Future: Add script to verify account configurations
npm run verify:staging-accounts
```

---

## What Happens If This Fails

If an account is misconfigured:

1. **Test Failure:** Immediately visible
   ```
   Error: expect(locator).toBeVisible() failed
   Locator: getByText('Chats', { exact: true })
   Expected: visible
   Timeout: 5000ms
   ```

2. **Diagnosis:** Check test screenshots/error-context
   - If page shows "Tickets", "Requests", etc. → account misconfigured
   - If page shows Chat → timeout on Chat-specific element

3. **Fix:** Update account default module in staging admin panel

---

## Adding New Agents/Roles

When adding new test accounts:

1. **Create account in staging**
2. **Set default module to Chat** (not Tickets or other)
3. **Assign to correct team** (Live Chat for most)
4. **Test with sample scenario**
5. **Add credentials to `.env.example`** (no secrets, just metadata)
6. **Document in team wiki**

---

## Testing the Chat Module Requirement

### Quick Verification (5 minutes)

```bash
# Run one Agent B login test to verify Chat module handling
npm run test -- --project=chromium --grep "Admin assigns a queued engagement to an online agent"
```

Expected output:
```
✅ [chromium] Admin assigns a queued engagement to an online agent
```

### Full Regression (10-15 minutes)

```bash
# Run all tests with chromium
npm run test -- --project=chromium
```

Expected: 33/33 tests pass (or close to it)

---

## Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| **LoginPage** | `src/pages/chat/login.page.js` | Auto-detect & fix wrong module |
| **LoginValidator** | `src/pages/chat/login.validators.js` | Validation helpers |
| **Login Steps** | `src/modules/*/steps/*_steps.js` | Explicit module validation |
| **This Doc** | `CHAT_MODULE_REQUIREMENT.md` | Knowledge & procedures |
| **Staging Config** | Manually managed in admin panel | Account setup |

---

## Questions?

If a test fails with Chat module issues:
1. Check test error context for the landing page URL
2. Verify account settings in staging admin
3. Run diagnostic test to confirm fix
4. Document if it's a new variant of the issue
