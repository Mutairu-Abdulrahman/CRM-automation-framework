# Remaining 8 Test Failures - Detailed Analysis

**Status:** 25/33 passing (75.8%) | **8 failures** (24.2%)

---

## 📍 FAILURE #1-2: Queue Counter Sync Issues

### Test 1: Two customers join rapidly
- **Module:** `chat-queue-counter`
- **Test:** Queue List counter behavior under rapid LIST_COUNTER updates
- **Scenario:** Two customers join the queue in rapid succession and the counter reflects the true total
- **File:** `src/modules/chat-queue-counter/features/queue_counter_race.feature.spec.js:11:7`

**Error Details:**
```
Expected: Queue List count to go from 0 to 2 (delta of 2)
Actual:   0
Expected: 2
Received: 0
```

**Root Cause Analysis:**
- Backend is not sending WebSocket LIST_COUNTER updates for the second customer
- The queue widget receives first customer (count = 1) but second customer's counter update is dropped
- Likely a race condition in backend's event emission or WebSocket broadcasting

**Evidence:**
- Screenshots show Queue List with count = 0 instead of 2
- Video shows second customer joining but counter not incrementing
- Backend queue state is likely correct, but notification to agent is missing

**Why It Happens:**
- Backend WebSocket broadcast for rapid sequential events may have a timing window
- Agent's queue counter state management may not be handling concurrent updates
- Possible backend queue service bottleneck

---

### Test 2: Single customer normal queue join
- **Module:** `chat-queue-counter`
- **Test:** A single normal queue join updates the counter correctly without a noticeable delay
- **Scenario:** Counter should reach 1 within 3 seconds of a normal queue join
- **File:** `src/modules/chat-queue-counter/features/queue_counter_race.feature.spec.js:17:7`

**Error Details:**
```
Expected Queue List count to reach 1 within 3s
Actual:   0
Expected: 1
Received: 0
```

**Root Cause Analysis:**
- Even a single customer's queue join is not updating the counter
- Suggests the WebSocket subscription for LIST_COUNTER updates is not working
- May indicate the agent dashboard's queue list component is not subscribed to updates

**Evidence:**
- Counter remains at 0 after customer joins
- This is more critical than Test 1 - even single events not propagating
- Suggests baseline queue counter functionality is broken

**Impact:**
- Agents cannot see real-time queue status
- CRITICAL for queue management

**Questions for Backend Team:**
1. Is the LIST_COUNTER event being broadcast for each queue join?
2. Is the agent's WebSocket connection receiving these updates?
3. Was there a recent change to queue event broadcasting?
4. Are there any queue service errors in backend logs?

---

## 📍 FAILURE #3: Chat Resolution Status Update

### Test: Customer ends the chat
- **Module:** `chat-resolution`
- **Test:** Agent live chat engagement and resolution
- **Scenario:** Customer ends the chat, engagement should be marked as "RESOLVED" in agent's inbox
- **File:** `src/modules/chat-resolution/features/agent_chat_resolution.feature.spec.js:28:7`

**Error Details:**
```
Error: expect(locator).toBeVisible() failed
Locator: getByLabel('Status')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

**Location in Code:** `src/pages/chat/agent-dashboard.page.js:301`

**Root Cause Analysis:**
- Engagement details panel is loading but Status field is not present
- Could be:
  1. Engagement details API response doesn't include status
  2. Status field is conditionally rendered based on engagement state
  3. Backend hasn't updated engagement status to RESOLVED yet
  4. Frontend is showing wrong engagement data

**Evidence:**
- Screenshots show engagement details panel opened
- Status label/field is missing from the panel
- Customer did end the chat (action succeeded)
- Backend status update not propagated to frontend

**Likely Cause:**
- Backend lag in updating engagement status to RESOLVED
- Frontend may have stale engagement data
- Status field only appears when engagement is in certain states

**Questions for Backend Team:**
1. Is the RESOLVED status being set on the engagement?
2. What's the typical backend propagation delay for status updates?
3. Is there a backend service lag or database sync issue?

---

## 📍 FAILURE #4-5: Chat Transfer Agent A Login Issue

### Test 1: Agent A withdraws the transfer before Agent B responds
- **Module:** `chat-transfer`
- **Test:** Agent A withdraws the transfer before Agent B responds
- **Scenario:** Agent A should be able to withdraw a transfer sent to Agent B
- **File:** `src/modules/chat-transfer/features/agent_chat_transfer.feature.spec.js:30:7`

**Error Details:**
```
Error: expect(locator).toBeVisible() failed
Locator: getByText('Chats', { exact: true })
Expected: visible
Timeout: 5000ms
Location: src/modules/chat-resolution/steps/agent_chat_resolution.steps.js:24
```

**Root Cause:**
- Agent A (primary agent) login is redirecting to Tickets module instead of Chat
- **Same issue as Agent B had!** But for the primary agent
- This is at the Background setup step, not the main test

**Evidence:**
- "Chats" text not found after Agent A login
- Error happens in the shared Background step
- Similar to Agent B's module redirect issue (Sep 16)

**Likely Cause:**
- Agent A's staging account may have default module set to Tickets (like Agent B was)
- Needs same fix: Check Agent A's account settings in staging admin

---

### Test 2: Agent A cannot see agents outside their team in transfer dropdown
- **Module:** `chat-transfer`
- **Test:** Agent A cannot see agents outside their team in the transfer dropdown
- **Scenario:** When opening transfer dropdown, Agent A should only see agents from their team
- **File:** `src/modules/chat-transfer/features/agent_chat_transfer.feature.spec.js:45:7`

**Error Details:**
```
Error: expect(locator).toHaveAttribute() failed
Locator: getByRole('button', { name: 'Away', exact: true })
Expected attribute "aria-selected" to be "true"
Received: "" (empty string)
Timeout: 5000ms
Location: src/pages/chat/agent-dashboard.page.js:106
```

**Root Cause:**
- Agent B's `setAway('On Break')` call is failing
- The "Away" button is not getting the `aria-selected="true"` attribute
- This happens after Agent B logs in successfully

**Evidence:**
- Agent B can login to Chat now (not module redirect issue)
- But the "Away" button toggle is not working
- May be a UI state management issue

**Likely Cause:**
- Agent B's setAway() is not properly clicking the button
- Backend not confirming the status change
- Possible race condition in UI state update

---

## 📍 FAILURE #6-8: Admin Assign/Reassign Timeout Issues

### Test 1: Admin assigns a queued engagement to an online agent
- **Module:** `admin-assign-reassign`
- **Test:** Admin assigns a queued engagement to an online agent
- **Scenario:** After customer seeds to Live Chat queue, admin should see Pending engagement
- **File:** `src/modules/admin-assign-reassign/features/admin_assign_reassign.feature.spec.js:17:7`

**Error Details:**
```
Error: Test timeout of 240000ms exceeded
locator.innerText: Test timeout of 240000ms exceeded
Locator: span.bg-feedback-neutral-ghost-default (Pending badge) → customer name
Location: src/pages/admin/admin-engagement.page.js:26
```

**Root Cause:**
- Customer seeding flow is taking longer than 240 seconds (4 minutes!)
- The Pending engagement is never appearing in the Inbox
- Background step that seeds the customer is timing out

**What the seeding does:**
1. Customer joins queue
2. Agent A accepts chat from queue
3. Agent A transfers to "Live Chat" team
4. Should create "Pending Manual Assign" badge in admin Inbox
5. Admin should see it

**Why It's Failing:**
- Customer seeding flow is hanging
- Transfer to team not completing
- Pending badge not being created

**Evidence:**
- Takes 240 seconds before timeout
- Pending engagement never appears
- Test stops at `openFirstPendingEngagement()` trying to find the badge

**Questions for Backend Team:**
1. Is the customer-to-agent flow working in staging?
2. Is the transfer-to-team action working?
3. Is the Pending badge being created for team transfers?
4. Any backend performance issues or service lag?

---

### Test 2: Admin assigns a queued engagement to an away agent
- **Same root cause as Test 1**
- Same timeout waiting for Pending badge
- Different agent status (Away instead of Online) but same core issue

---

### Test 3: Admin reassigns an already-assigned engagement to a team
- **Same root cause as Tests 1 & 2**
- Same timeout waiting for Pending badge
- Different flow (reassign vs assign) but same outcome

---

## 📊 **Failure Summary by Category**

| Category | Tests | Root Cause | Severity | Owner |
|----------|-------|-----------|----------|-------|
| **Queue Counter WebSocket** | 2 | Backend not sending updates | CRITICAL | Backend Team |
| **Engagement Status Sync** | 1 | Backend lag in status propagation | HIGH | Backend Team |
| **Agent A Module Redirect** | 1 | Account misconfiguration | HIGH | DevOps/Admin |
| **Agent B Away Status** | 1 | UI state management or backend | MEDIUM | Frontend/Backend |
| **Customer Seeding Timeout** | 3 | Transfer to team flow broken | HIGH | Backend Team |

---

## 🎯 **Action Items**

### Immediate (This Sprint)
- [ ] **Check Agent A's account:** Default module should be Chat, not Tickets
- [ ] **Test Agent B's away status:** Run quick diagnostic on setAway() function
- [ ] **Investigate queue counter:** Backend team to check WebSocket LIST_COUNTER events

### Investigation Required
- [ ] Backend team: Review queue counter event emission in staging
- [ ] Backend team: Check engagement status update propagation lag
- [ ] Backend team: Debug customer-to-team transfer flow timeout
- [ ] Performance team: Profile staging backend for bottlenecks

### Blocked on Backend
- [ ] Queue counter updates
- [ ] Engagement status propagation
- [ ] Customer seeding flow performance
- [ ] Agent B away status toggle

---

## 💡 **Quick Diagnostic Steps**

### For Queue Counter (2 failures)
```
1. Manually add customer to queue in staging UI
2. Check if counter updates in real-time
3. If not, check backend queue service logs
4. Verify WebSocket connection is active
```

### For Customer Seeding (3 failures)
```
1. Manually perform customer → agent accept → transfer to team flow
2. Check if Pending badge appears in admin Inbox
3. Time how long it takes
4. Check backend logs for transfer operation duration
```

### For Agent A Login (1 failure)
```
1. Check Agent A account in staging admin
2. Find: Admin > Users > mutty@moniepoint.com
3. Verify Default Module = Chat (not Tickets)
4. If wrong, change it and retest
```

### For Agent B Away (1 failure)
```
1. Agent B login test separately
2. Check if Chat module loads (should now work)
3. Try setAway() step in isolation
4. Check browser console for JS errors
```

---

## 📈 **Success Criteria for Resolution**

- ✅ Queue counter updates in real-time for single and multiple customers
- ✅ Engagement status updates propagate within 5 seconds
- ✅ Customer seeding completes in < 30 seconds
- ✅ Admin sees Pending badge immediately after team transfer
- ✅ All 33 tests pass consistently

---

**Last Updated:** 2026-09-17  
**Pass Rate:** 75.8% (25/33) → Target: 100% (33/33)
