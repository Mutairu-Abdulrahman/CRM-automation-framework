#!/bin/bash

RESULTS_FILE="regression_results_chromium_$(date +%Y%m%d_%H%M%S).log"

{
  echo "╔════════════════════════════════════════════════════════════════════╗"
  echo "║     REGRESSION TEST RESULTS - CHROMIUM (SERIAL EXECUTION)          ║"
  echo "╚════════════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Browser: Chromium Only"
  echo "Execution Mode: Serial (One module after another)"
  echo ""
} > "$RESULTS_FILE"

echo "Starting regression test suite..."
echo "Running with: npm test --project=chromium"
echo ""
echo "═════════════════════════════════════════════════════════════════════"

# Run the full test suite on chromium only
{
  echo "FULL TEST SUITE - CHROMIUM"
  echo "═════════════════════════════════════════════════════════════════════"
  echo "Start Time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""
} >> "$RESULTS_FILE"

npm test -- --project=chromium 2>&1 | tee -a "$RESULTS_FILE"
EXIT_CODE=$?

{
  echo ""
  echo "═════════════════════════════════════════════════════════════════════"
  echo "End Time: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Exit Code: $EXIT_CODE"
  echo "Status: $([ $EXIT_CODE -eq 0 ] && echo '✅ ALL TESTS PASSED' || echo '❌ SOME TESTS FAILED')"
  echo "═════════════════════════════════════════════════════════════════════"
} >> "$RESULTS_FILE"

echo ""
echo "Results saved to: $RESULTS_FILE"
exit $EXIT_CODE
