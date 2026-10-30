# Bug Report: "Transferred" tab does not appear despite chat data already being delivered

**Status:** Open — confirmed via WebSocket capture, root cause isolated to a backend race condition
**Reported:** 2026-09-08
**Reported by:** QA / Test Automation (Moniedesk agent live-chat Playwright/BDD suite)
**Area:** Moniedesk Agent Dashboard — Chat Transfer (specifically: transferring to an agent who is set to "Away")
**Environment:** Staging (`v3.moniedesk.staging.moniepoint.com`, socket endpoint `wss://self-service-live-chat-service-socket.staging.moniepoint.com`)
**Severity:** Medium–High — an agent can silently fail to see a chat that has genuinely been transferred to them, with no error, no retry prompt, and no visual indication anything is wrong. The only reason it isn't rated Critical is that the tab does eventually appear (unpredictably, on the order of tens of seconds to over a minute later), rather than never appearing at all.

---

## Summary

When Chat A (Agent A) transfers a live chat to Chat B (Agent B) while Agent B is set to **Away**, Agent B's WebSocket connection receives the correct transfer data (`CHAT_TRANSFERRED` and `TRANSFERRED_CHAT_LIST` events) in real time, within under a second of the transfer being sent. However, the **"Transferred" tab in Agent B's chat list sidebar does not reliably appear** when this data arrives, or on subsequent page reloads/reconnections — even though the underlying data is present and correct every time. The tab only appears once a *separate* socket event (`LIST_COUNTER`, carrying `transferredChatCount`) also arrives with a non-zero count — and that event is intermittently missing from the initial event burst sent on a fresh socket connection.

This was originally discovered as a Playwright test failure ("Agent A transfers the chat to Agent B while Agent B is Away" — a chat-transfer regression scenario) that failed **7 consecutive times** across two days of testing, including on freshly-cleaned test accounts with correct presence state, before being root-caused via direct WebSocket instrumentation.

---

## Impact

- An agent who is Away and receives a chat transfer may not see it in their Transferred tab for an unpredictable and sometimes lengthy delay (observed: still not visible after 2 full page reloads and ~30+ seconds; became visible on the 3rd reload).
- There is no error, warning, spinner, or "pending" state shown to the agent — the tab is simply absent, indistinguishable from "no transfer has happened yet."
- If the receiving agent doesn't happen to reload again, or gives up checking, a live customer chat that has already been handed to them could sit unattended indefinitely, with neither party aware there's a problem (the sending agent sees a "success" toast; the receiving agent sees nothing).
- This was only characterized for the **Away**-agent transfer path. It has not yet been confirmed whether the same race condition affects transfers to an **Online** agent (anecdotally, Online-agent transfers in this same test suite have been more reliable, but this has not been rigorously isolated/tested with the same WebSocket-capture method — see "Suggested Follow-up" below).

---

## Steps to Reproduce

1. Log in as Agent A (a "Live Chat" team agent) and as Agent B (a peer agent on the same team). Ensure both are Online.
2. Have a customer join the live chat queue (via the webchat widget) and have Agent A accept the chat.
3. Set Agent B's status to **Away** (with any reason, e.g. "On Break") via the presence toggle.
4. As Agent A, open **More Actions → Transfer** on the accepted chat, switch the picker to the **Away** tab, select Agent B, fill in a reason, and click **Send Request**.
   - Agent A's side shows the toast "Transfer Request Sent, Pending Approval." — this always succeeds.
5. As Agent B (still Away), reload the dashboard and look for the **Transferred** tab in the chat-list tab strip (next to Active / Inactive / Queue List / Escalated / Assigned).

**Expected:** The Transferred tab appears (with the correct chat inside it) promptly — ideally as soon as Agent B's client receives the transfer notification, and reliably on any subsequent reload thereafter.

**Actual:** The Transferred tab is frequently **absent** immediately after the transfer, and remains absent across one or more subsequent full page reloads, despite the underlying transferred-chat data being present and correct in the client the entire time. It eventually appears, but the delay is inconsistent (observed range: a few seconds up to 30+ seconds / multiple reload cycles in different runs).

---

## Technical Evidence

Captured directly via Playwright's `page.on('websocket', ...)` / `ws.on('framereceived')` instrumentation attached to Agent B's page for the full duration of a repro run. Socket endpoint:

```
wss://self-service-live-chat-service-socket.staging.moniepoint.com/socket.io/?entityId=...&supportId=muttyabdul@moniepoint.com&...&EIO=4&transport=websocket
```

(Socket.IO v4 protocol; application events arrive as `42["receiveMessage", {"eventType": "...", ...}]` frames.)

### Timeline of the captured run

| Time (relative to test start) | Event |
|---|---|
| t ≈ 122.0s | Agent A clicks **Send Request**; toast "Transfer Request Sent, Pending Approval." confirmed on Agent A's side. |
| t ≈ 122.6s (**+0.7s**) | Agent B's socket receives `CHAT_TRANSFERRED` — the raw transfer event, containing the correct chat/session/engagement IDs. |
| t ≈ 122.7s (**+0.7s**) | Agent B's socket receives `TRANSFERRED_CHAT_LIST` — **already containing the transferred chat** — followed immediately by `LIST_COUNTER: {"transferredChatCount": 1}`. |
| t ≈ 125.3s | **Reload #1** of Agent B's page (fresh socket.io connection opens). Initial burst includes `TRANSFERRED_CHAT_LIST` with the chat present. **No `LIST_COUNTER` event is sent in this burst at all.** |
| t ≈ 131.5s | UI check: Transferred tab **NOT visible**. |
| t ≈ 142.2s | **Reload #2**. Initial burst again includes `TRANSFERRED_CHAT_LIST` with the chat present. **`LIST_COUNTER` is again absent from this burst.** |
| t ≈ 143.4s | UI check: Transferred tab **NOT visible**. |
| t ≈ 156.2s | **Reload #3**. Initial burst includes `TRANSFERRED_CHAT_LIST` (chat present) **followed by `LIST_COUNTER: {"myChatCount":0,"transferredChatCount":1,"assignedChatCount":0,"ticketCount":0}`.** |
| t ≈ 157.3s | UI check: Transferred tab **NOW visible**. |

### Key comparison

| Reload | `TRANSFERRED_CHAT_LIST` has the chat? | `LIST_COUNTER` with `transferredChatCount` present? | Tab rendered? |
|---|:---:|:---:|:---:|
| Live push (no reload) | ✅ Yes | ✅ Yes | *(not observed directly — page was reloaded before next check)* |
| Reload #1 | ✅ Yes | ❌ **No** | ❌ No |
| Reload #2 | ✅ Yes | ❌ **No** | ❌ No |
| Reload #3 | ✅ Yes | ✅ Yes | ✅ **Yes** |

### Representative raw frames

Live push immediately after transfer (data correct, arrives promptly):

```
42["receiveMessage",{"eventType":"CHAT_TRANSFERRED","entityId":"508574b8-c651-470b-8538-f2ae88b3cd46","subEntityId":"508574b8-c651-470b-8538-f2ae88b3cd46","supportId":"muttyabdul@moniepoint.com","data":{"id":1343,"guid":"71326bdf-381d-4eb0-b78b-9e92bd0a8f1d",...,"supportName":"Mutairu Abdulrahman",...,"userName":"Segun Okoro57243",...}}]

42["receiveMessage",{"eventType":"TRANSFERRED_CHAT_LIST","entityId":"508574b8-c651-470b-8538-f2ae88b3cd46","supportId":"muttyabdul@moniepoint.com","data":[{"guid":"71326bdf-381d-4eb0-b78b-9e92bd0a8f1d",...}]}]

42["receiveMessage",{"eventType":"LIST_COUNTER","entityId":"508574b8-c651-470b-8538-f2ae88b3cd46","supportId":"muttyabdul@moniepoint.com","data":{"transferredChatCount":1}}]
```

Reload #1's initial burst — `TRANSFERRED_CHAT_LIST` present, but the burst's `LIST_COUNTER` (sent moments earlier in the same burst) reports the **stale, pre-transfer** aggregate with no `transferredChatCount` field at all:

```
42["receiveMessage",{"eventType":"TRANSFERRED_CHAT_LIST","entityId":"508574b8-c651-470b-8538-f2ae88b3cd46","supportId":"muttyabdul@moniepoint.com","data":[{"guid":"71326bdf-381d-4eb0-b78b-9e92bd0a8f1d", ...}]}]
```

*(No corresponding `LIST_COUNTER` frame with `transferredChatCount` followed this in the burst — contrast with reload #3 below.)*

Reload #3's initial burst — same list contents, but this time followed by the counter event:

```
42["receiveMessage",{"eventType":"TRANSFERRED_CHAT_LIST","entityId":"508574b8-c651-470b-8538-f2ae88b3cd46","supportId":"muttyabdul@moniepoint.com","data":[{"guid":"71326bdf-381d-4eb0-b78b-9e92bd0a8f1d", ...}]}]

42["receiveMessage",{"eventType":"LIST_COUNTER","entityId":"508574b8-c651-470b-8538-f2ae88b3cd46","data":{"myChatCount":0,"transferredChatCount":1,"assignedChatCount":0,"ticketCount":0}}]
```

---

## Root Cause Analysis

The frontend's "Transferred" tab visibility appears to be driven by the `LIST_COUNTER` event's `transferredChatCount` field, **not** by whether `TRANSFERRED_CHAT_LIST` itself has entries. These two are computed and emitted as **separate events on the backend**, and are not guaranteed to be consistent with each other on a given socket connection — the list-contents query is correct and fast every time, but the counter aggregate is being computed and/or emitted inconsistently (missing from 2 of the 3 reload bursts captured in this run).

This looks like a backend race condition between:
- the query/service that assembles `TRANSFERRED_CHAT_LIST` (fast, always correct in every observation), and
- the query/service (or cache) that assembles `LIST_COUNTER` (intermittently stale or simply not emitted on a fresh connection's initial burst).

Because the frontend apparently trusts the counter rather than deriving tab visibility from the list data it already has in hand, the tab can stay hidden indefinitely relative to when the correct underlying data actually arrived.

**This is not a client-side timing or retry issue.** The data was correct and available well before the tab became visible; no amount of additional client-side polling delay would have shortened the actual gap, since the gap is caused by an upstream event never being sent on some connections — reloading was, in effect, "retrying" for a coin-flip to land on a connection where the counter happened to be included.

---

## Suggested Areas to Investigate (Backend)

1. Identify the service/query responsible for emitting `LIST_COUNTER` on a new socket.io connection's initial burst, and compare its data source/cache against whatever populates `TRANSFERRED_CHAT_LIST` for the same connection. They should be derived from the same read (or the counter should simply be `len(list)` rather than a separately computed/cached aggregate).
2. Check whether `LIST_COUNTER` is being computed from a cache with its own TTL/invalidation path that is not reliably invoked/invalidated at the same time the transfer is processed and `TRANSFERRED_CHAT_LIST` is updated.
3. Confirm whether this race is specific to the **Away** presence state (e.g., a different code path computes/pushes state for Away vs. Online agents) or whether it also affects Online-agent transfers — not yet isolated (see Follow-up below).
4. Consider whether the frontend should derive tab visibility (and any badge counts) directly from the `*_CHAT_LIST` payloads it already receives, rather than depending on a separately-pushed counter event that can arrive late or not at all in a given connection's burst.

---

## Suggested Follow-up (QA)

- Re-run the same WebSocket-capture method against an **Online**-agent transfer to confirm whether the same `LIST_COUNTER`/`TRANSFERRED_CHAT_LIST` desync occurs there too, or whether it's specific to the Away path.
- Check whether the same class of bug affects the **Active**, **Inactive**, **Escalated**, or **Assigned** tabs/badges (i.e., is `LIST_COUNTER`'s other fields — `myChatCount`, `assignedChatCount`, `ticketCount` — similarly prone to going missing from a connection's initial burst).
- Once backend fixes this, re-run the existing Playwright regression scenario ("Agent A transfers the chat to Agent B while Agent B is Away") several times in a row to confirm it now passes consistently without needing the existing 3x-reload retry workaround in `openTransferredChat()`.

---

## Related Test Artifacts

- Failing scenario: `agent_chat_transfer.feature` → "Agent A transfers the chat to Agent B while Agent B is Away" (`src/modules/chat-transfer/features/agent_chat_transfer.feature`)
- Affected helper: `AgentDashboardPage.openTransferredChat()` (`src/pages/chat/agent-dashboard.page.js`)
- Diagnostic script used to capture the evidence above: `.scratch/diag-socket-capture.js` (ad hoc, not part of the committed suite)
- Full raw capture log: `.scratch/diag-socket-capture.log`
- This finding is also recorded in the project's internal QA notes/memory for future reference.
