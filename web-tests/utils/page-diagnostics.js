/**
 * Failure diagnostics for a single page.
 *
 * These are real multi-hop E2E flows against live staging, several of which
 * involve backend timing/race conditions (see docs/bug-reports/) that are
 * only visible at the network/socket level - a bare assertion failure like
 * "Transferred tab not visible" doesn't say whether the transfer event ever
 * arrived, or whether some API call failed outright. Instead of re-diagnosing
 * that by hand every time (as happened before this existed - see
 * .scratch/diag-socket-capture.js), every page attaches this once, and a
 * failing test gets the evidence automatically:
 *   - every failed HTTP request/response on that page (status >= 400, or a
 *     network-level failure)
 *   - every WebSocket frame sent/received on that page, with a timestamp
 *   - a full-page screenshot at the moment the test ended
 * all as attachments on the failing test in the HTML report. Passing tests
 * pay only the (cheap) cost of the event listeners - nothing is attached.
 *
 * Usage in a fixture:
 *   const page = await context.newPage();
 *   const attachIfFailed = attachPageDiagnostics(page, 'agentB');
 *   await use(page);
 *   await attachIfFailed(testInfo);
 */
export function attachPageDiagnostics(page, label) {
  const startedAt = Date.now();
  const elapsed = () => Date.now() - startedAt;

  const failedRequests = [];
  page.on('requestfailed', (request) => {
    failedRequests.push({
      t: elapsed(),
      method: request.method(),
      url: request.url(),
      failure: request.failure()?.errorText ?? 'unknown network failure',
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push({
        t: elapsed(),
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
      });
    }
  });

  const socketEvents = [];
  page.on('websocket', (ws) => {
    const url = ws.url();
    socketEvents.push({ t: elapsed(), type: 'open', url });
    ws.on('framereceived', (frame) => {
      socketEvents.push({ t: elapsed(), type: 'received', payload: framePayload(frame) });
    });
    ws.on('framesent', (frame) => {
      socketEvents.push({ t: elapsed(), type: 'sent', payload: framePayload(frame) });
    });
    ws.on('close', () => socketEvents.push({ t: elapsed(), type: 'close', url }));
    ws.on('socketerror', (error) => socketEvents.push({ t: elapsed(), type: 'error', url, error: String(error) }));
  });

  /** Call from the fixture's teardown, after `use()` returns, with the test's TestInfo. */
  return async function attachIfFailed(testInfo) {
    if (testInfo.status === testInfo.expectedStatus) return; // test passed - nothing to attach

    if (failedRequests.length) {
      await testInfo.attach(`${label}-failed-requests`, {
        body: JSON.stringify(failedRequests, null, 2),
        contentType: 'application/json',
      });
    }
    if (socketEvents.length) {
      await testInfo.attach(`${label}-socket-events`, {
        body: JSON.stringify(socketEvents, null, 2),
        contentType: 'application/json',
      });
    }
    if (!page.isClosed()) {
      const screenshot = await page.screenshot({ fullPage: true }).catch(() => null);
      if (screenshot) {
        await testInfo.attach(`${label}-screenshot`, { body: screenshot, contentType: 'image/png' });
      }
    }
  };
}

function framePayload(frame) {
  return typeof frame.payload === 'string' ? frame.payload : '[binary frame]';
}
