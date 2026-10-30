# Regression Test Results - September 17, 2026

## Executive Summary

**Total Tests Run:** 99  
**Passed:** 29 (29.3%)  
**Failed:** 70 (70.7%)  
**Duration:** 28.3 minutes  
**Status:** 🔴 CRITICAL - Multiple blockers preventing feature functionality

---

## Test Results Overview

```
PASSED:  29 tests  ✅
FAILED:  70 tests  🔴
SUCCESS RATE: 29.3%
```

---

## Critical Issues (by severity & frequency)

### 1. 🔴 BLOCKER: Admin Module Login Redirect (46 failures)

**Error Count:** 46 test failures from single root cause

**Error Messages:**
- "Agent login validator failed: Could not redirect to Chat module. Final URL: /admin/entity" (38x)
- "Agent login validator failed: Could not redirect to Chat module. Final URL: /v2/tickets/with-views/..." (8x)

**Affected Modules:**
- admin-inbox-filters (4 failures)
- admin-save-filter (4 failures)
- admin-saved-filter-visibility (4 failures)
- admin-status-reassign (6 failures)
- admin-assign-reassign (9 failures)
- admin-other-roles (1 failure)
- team-lead-queue-assign (1 failure)

**Impact:** ALL admin-related functionality is broken
- Cannot apply filters
- Cannot reassign engagements
- Cannot save filters
- Cannot manage admin operations

**Root Cause:** Login validator fails to redirect authenticated users to `/v2/chat` module; users get stuck at `/admin/entity` or `/v2/tickets/with-views/`

**Fix Location:** `src/pages/chat/login.validators.js:33`

---

### 2. 🔴 BLOCKER: Chat Transfer Module (17 failures)

**Error Types:**
- `expect(locator).toBeVisible() failed` (8 failures)
- `element(s) not found` (6 failures) 
- `locator.click: Test timeout of 240000ms exceeded` (2 failures)
- `expect(locator).toHaveAttribute(expected) failed` (2 failures)

**Failed Scenarios:**
1. Agent visibility filtering in transfer dropdown (3 failures)
   - "Agent A cannot see agents outside their team in transfer dropdown"
   - "Agent B should be visible and Agent C should not be visible"

2. Agent Away status not updating (4 failures)
   - Away button `aria-selected` attribute not updating
   - Affects: "Agent A transfers chat to Agent B while Agent B is Away"

3. Transfer acceptance/rejection flow (3 failures)
   - "Agent A withdraws transfer before Agent B responds"
   - "Agent B rejects transferred chat and Agent A sees rejection reason"

4. Transfer to team (2 failures)
   - "Agent A transfers chat to team instead of specific agent"

5. Lead transfer acceptance (2 failures)
   - "Agent A transfers chat to Lead A and Lead A accepts it"

**Root Cause:** 
- Transfer UI dropdown visibility logic broken
- Agent filtering/visibility not working correctly
- Away status state not persisting
- Aria attributes not updating on state changes

**Fix Location:** Likely in `src/modules/chat-transfer/` and agent state management

---

### 3. 🔴 BLOCKER: Queue Counter Race Condition (5 failures)

**Error Messages:**
- "Expected Queue List count to reach 1 within 3s of a single normal queue join, but it was 0"
- "Expected Queue List count to go from 0 to 2 (delta of 2), but it landed on 0"

**Scenarios:**
- Single queue join updates counter (2 failures)
- Two rapid queue joins updates counter (3 failures)

**Root Cause:** Real-time queue updates not being reflected in the counter UI; counter remains at 0 despite queue joins

**Fix Location:** `src/modules/chat-queue-counter/`

---

### 4. 🟠 MAJOR: Chat Resolution (4 failures)

**Error Types:**
- Execution flow failures in Log & Close operation
- Execution flow failures in Log & Escalate operation

**Failed Scenarios:**
- "Agent resolves chat using Log and Close" (2 failures)
- "Agent escalates chat using Log and Escalate, then moves it back to Active" (1 failure)
- "Customer ends the chat" (1 failure)

**Root Cause:** Chat resolution workflow broken; engagement closing/escalation not working

**Fix Location:** `src/modules/chat-resolution/`

---

### 5. 🟠 MAJOR: Chat Reassign (3 failures)

**Error Types:**
- `element(s) not found` (2 failures)
- `toBeVisible()` failed (1 failure)

**Failed Scenarios:**
- "Lead A cannot see agents outside their team in reassign dropdown" (2 failures)
- "Lead A reassigns chat to team instead of specific agent" (1 failure)

**Root Cause:** Similar to transfer module - agent visibility/filtering broken in reassign dropdown

**Fix Location:** `src/modules/chat-reassign/`

---

### 6. 🟠 MAJOR: Chat Active/Inactive Toggle (2 failures)

**Error Type:** `expect(locator).toHaveAttribute(expected) failed`

**Failed Scenario:**
- "Move to Inactive is rejected until agent's reply is last message, then chat can be moved back to Active"

**Root Cause:** State attribute not updating correctly on toggle; aria-selected not reflecting state changes

**Fix Location:** `src/modules/chat-active-inactive/`

---

### 7. 🟡 MINOR: Test Data Issues (5 failures)

**Error Messages:**
- "Could not find engagement for customer 'Segun Okoro68896' in the chat search"
- "Could not find engagement for customer 'Segun Nwachukwu77751' in the chat search"
- Similar errors for: Segun Eze99823, Chinedu Yusuf90674, Bola Uche87379

**Root Cause:** Test data setup issue or customer search not working in staging environment

---

## Module Health Summary

| Module | Passed | Failed | Pass Rate | Status |
|--------|--------|--------|-----------|--------|
| smoke | 2 | 0 | 100% | ✅ Healthy |
| admin-other-roles | 10 | 1 | 91% | 🟡 Minor Issues |
| chat-active-inactive | 1 | 2 | 33% | 🟠 Failing |
| chat-reassign | 1 | 3 | 25% | 🟠 Failing |
| chat-resolution | 5 | 4 | 56% | 🟠 Failing |
| chat-queue-counter | 1 | 4 | 20% | 🔴 Broken |
| admin-inbox-filters | 0 | 4 | 0% | 🔴 Blocked |
| admin-save-filter | 0 | 4 | 0% | 🔴 Blocked |
| admin-status-reassign | 0 | 7 | 0% | 🔴 Blocked |
| admin-assign-reassign | 0 | 9 | 0% | 🔴 Blocked |
| admin-saved-filter-visibility | 0 | 4 | 0% | 🔴 Blocked |
| chat-transfer | 4 | 13 | 24% | 🔴 Critical |

---

## Error Distribution

### By Error Type:
```
38  - Agent login validator: Could not redirect to Chat module (/admin/entity)
 8  - Agent login validator: Could not redirect to Chat module (/v2/tickets)
 8  - expect(locator).toBeVisible() failed
 8  - element(s) not found
 3  - locator.click: Test timeout exceeded
 3  - Expected Queue List count assertion failed
 2  - expect(locator).toHaveAttribute() failed
 2  - Expected Queue List count within time assertion
 5  - Could not find engagement for customer (data issue)
 1  - Page closed unexpectedly
 1  - Other
```

---

## Priority Action Items

### 🔴 **Priority 1 - IMMEDIATE (blocks 46 tests)**
**Issue:** Admin login redirect bug  
**Fix:** Investigate login validator in `src/pages/chat/login.validators.js:33`  
**Impact:** Unblocks all admin module tests  

### 🔴 **Priority 2 - URGENT (blocks 17 tests)**
**Issue:** Chat transfer UI visibility and state management  
**Fix:** Debug dropdown visibility logic and agent state persistence  
**Impact:** Unblocks transfer, team visibility features  

### 🔴 **Priority 3 - HIGH (blocks 5 tests)**
**Issue:** Queue counter real-time updates  
**Fix:** Investigate WebSocket/real-time update mechanism  
**Impact:** Unblocks queue counter accuracy  

### 🟠 **Priority 4 - MEDIUM (blocks 4 tests)**
**Issue:** Chat resolution workflow  
**Fix:** Debug Log & Close, Log & Escalate flows  
**Impact:** Unblocks chat resolution feature  

### 🟡 **Priority 5 - LOW (blocks 5 tests)**
**Issue:** Test data setup issues  
**Fix:** Verify customer data in staging environment  
**Impact:** Improves test reliability  

---

## Browser Coverage

Tests run across multiple browser engines:
- Chromium ✅
- WebKit (Safari) ✅
- Firefox ✅

Failures appear across all browsers, indicating backend/logic issues rather than browser-specific problems.

---

## Recommendations

1. **Immediate Action:** Focus on Priority 1 (login redirect) - this single fix would unblock 46 tests
2. **Root Cause Analysis:** Schedule session to debug login validator and chat transfer UI
3. **Staging Validation:** Verify staging environment is properly configured
4. **Test Data:** Regenerate/verify test customer data in staging
5. **Next Run:** After fixes, run regression again to validate improvements

---

**Generated:** 2026-09-17 01:10 UTC  
**Test Run Duration:** 28 minutes 18 seconds  
**Test Framework:** Playwright BDD (playwright-bdd)
