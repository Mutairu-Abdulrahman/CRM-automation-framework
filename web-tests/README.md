# Web Tests - Playwright BDD

Comprehensive web automation suite for Moniedesk Agent Chat module using Playwright and Gherkin BDD.

## Structure

```
web-tests/
├── tests/                    # Test modules organized by feature
│   ├── chat/                # Chat agent operations
│   ├── admin/               # Admin functions
│   ├── smoke/               # Smoke tests
│   └── team-lead-queue-assign/  # Team lead workflows
├── pages/                   # Page Object Models
│   ├── chat/               # Chat UI pages
│   ├── admin/              # Admin UI pages
│   └── shared/             # Reusable components
├── data/                    # Fixtures, helpers, world context
├── fixtures/               # Test data fixtures
├── utils/                  # Test utilities and hooks
├── playwright.config.js    # Playwright configuration
└── package.json           # Dependencies (shared at root)
```

## Test Organization

### Feature Files
Located in `tests/{module}/features/`:
- `.feature` files written in Gherkin syntax
- Describe user workflows and acceptance criteria

### Step Definitions
Located in `tests/{module}/steps/`:
- Implement Gherkin steps
- Use Page Objects for UI interaction
- Import fixtures from `../../data/fixtures.js`

### Page Objects
Located in `pages/{product}/`:
- Encapsulate UI selectors and interactions
- Methods for each user action
- Exported from `pages/index.js`

## Running Tests

```bash
# Run all tests
npm test

# Run headed (visible browser)
npm run test:headed

# Run specific module
npx playwright test web-tests/tests/chat

# Run single feature
npx playwright test web-tests/tests/chat/features/agent_chat_resolution.feature

# Run with debug mode
npx playwright test --debug

# Run with specific browser
npx playwright test --project=firefox

# View HTML report
npm test && open playwright-report/index.html
```

## Test Configuration

**File**: `playwright.config.js`

Key settings:
- **baseURL**: https://v3.moniedesk.staging.moniepoint.com/
- **timeout**: 240 seconds (covers multi-hop E2E flows)
- **fullyParallel**: false (tests run serially within file, parallel across files)
- **workers**: 1 on CI, auto locally
- **reporters**: HTML report with traces

## Fixtures & Data

**File**: `data/fixtures.js`

Available fixtures:
- `test` - Playwright BDD test context
- `page` - Primary agent's browser page
- `browser` - Browser instance
- `dashboard` - AgentDashboardPage object
- `world` - Shared test state

**File**: `data/helpers.js`

Constants:
- `AGENT_USERNAME`, `AGENT_PASSWORD` - Primary agent
- `AGENT_B_USERNAME`, `AGENT_B_PASSWORD` - Secondary agent
- `ENGAGEMENT_URL` - Chat module entry point

## Important Notes

### Serial Execution
Tests run **serially** within each feature file because:
- Shared staging backend (queue, transfer state, filter visibility)
- Parallel execution causes race-condition flakes
- Playwright still runs different feature files concurrently

### Retry & Timeouts
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 240s (allows for backend propagation lag)
- Steps deliberately retry for ~80-100s to tolerate staging delays

### Diagnostics
On test failure, captures:
- Screenshots
- Video recordings
- Network logs
- Trace files (replay-able in Playwright Inspector)

See `utils/page-diagnostics.js` for implementation.

## Debugging

1. **Use Inspector**: `npx playwright test --debug`
2. **Check Traces**: Open `.zip` file from report
3. **Log State**: Use `world` object to track test state
4. **Enable Logging**: `DEBUG=pw:api npm test`

## Best Practices

- ✅ One scenario = one user workflow
- ✅ All UI interaction through Page Objects
- ✅ Reuse Background steps for setup
- ✅ Use meaningful assertion messages
- ✅ Keep test data in fixtures, not hardcoded
- ❌ Don't run tests fully in parallel
- ❌ Don't hardcode selectors in steps
- ❌ Don't skip cleanup between tests
