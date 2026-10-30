# Quick Start Guide

## Installation

```bash
# Install dependencies (one time only)
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with visible browser
npm run test:headed

# Run specific test module
npx playwright test web-tests/tests/chat

# Run specific feature file
npx playwright test web-tests/tests/chat/features/agent_chat_resolution.feature

# Run with debug mode (interactive)
npx playwright test --debug

# Run with specific browser
npx playwright test --project=firefox

# View last test report
open reports/playwright-report/index.html
```

## Project Structure

```
web-tests/              # All Playwright tests
├── tests/              # Feature files (.feature) and steps (.js)
├── pages/              # Page Object Models
├── data/               # Fixtures and test helpers
└── utils/              # Utilities and hooks
```

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `playwright.config.js` | Playwright configuration |
| `web-tests/playwright.config.js` | Alternative config (same as root) |
| `web-tests/data/fixtures.js` | Test fixtures (fixtures, page objects) |
| `web-tests/data/helpers.js` | Test constants (usernames, URLs) |

## Configuration

### Test Credentials

Create `.env` file in project root:

```bash
cp config/environments/.env.example .env
# Edit .env with your test account credentials
```

Variables:
- `AGENT_USERNAME` - Test agent login
- `AGENT_PASSWORD` - Test agent password
- `AGENT_B_USERNAME` - Secondary agent
- `AGENT_B_PASSWORD` - Secondary agent password
- etc.

### Staging Environment

Base URL: `https://v3.moniedesk.staging.moniepoint.com/`

Configured in `web-tests/playwright.config.js`

## Writing Tests

### Feature File Example

File: `web-tests/tests/feature-name/features/test-name.feature`

```gherkin
Feature: Agent can resolve customer chats

  Background:
    Given the agent is logged into Moniedesk

  Scenario: Agent resolves a chat successfully
    When the agent accepts a customer chat
    And the agent sends a reply
    Then the chat status should be updated
```

### Step Definition Example

File: `web-tests/tests/feature-name/steps/test-name.steps.js`

```javascript
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../../../data/fixtures.js';
import { AgentDashboardPage } from '../../../pages/chat/agent-dashboard.page.js';

const { Given, When, Then } = createBdd(test);

Given('the agent is logged into Moniedesk', async ({ page }) => {
  await page.goto('/');
  // Login steps
});

When('the agent accepts a customer chat', async ({ dashboard, world }) => {
  await dashboard.acceptChat(world.customerName);
});

Then('the chat status should be updated', async ({ page }) => {
  await expect(page.getByText('Resolved')).toBeVisible();
});
```

## Available Fixtures

In your step definitions, you can use:

```javascript
export const test = base.extend({
  // Primary agent's page
  page: async ({ page }, use) => { await use(page); },
  
  // Available page objects
  dashboard: async ({ page }, use) => {
    const dashboard = new AgentDashboardPage(page);
    await use(dashboard);
  },
  
  // Shared test state
  world: async ({}, use) => {
    const world = { /* shared data */ };
    await use(world);
  },
});
```

## Debugging

### Enable Debug Mode

```bash
npx playwright test --debug
```

This opens Playwright Inspector where you can:
- Step through each action
- Inspect page elements
- See network requests
- View test state

### View Test Traces

After a test failure:
1. Open HTML report: `open reports/playwright-report/index.html`
2. Click failed test
3. Download trace (.zip)
4. Open in Playwright:
   ```bash
   npx playwright show-trace path/to/trace.zip
   ```

### Check Videos/Screenshots

On failure, captures are saved:
- **Screenshots**: Point where test failed
- **Videos**: Full test video
- **Traces**: Replay-able execution

All in: `reports/playwright-report/`

## Common Issues

### Tests timeout

**Solution**: Increase timeout in `playwright.config.js`
```javascript
timeout: 240_000, // milliseconds
```

### Import errors

**Solution**: Check relative paths are correct:
- From `tests/chat/steps/*.js` → `../../../../data/fixtures.js`
- From `tests/admin/admin-*/steps/*.js` → `../../../../../data/fixtures.js`

### Staging unreachable

**Solution**: Verify base URL and network access
```bash
curl https://v3.moniedesk.staging.moniepoint.com
```

### Flaky tests

**Common cause**: Tests run in parallel on shared backend
- **Solution**: Tests run serially within each file (configured)
- Check `web-tests/README.md` for details

## Best Practices

✅ **DO**
- Use Page Objects for all UI interaction
- Keep scenarios focused (test one thing)
- Reuse steps via Background
- Use meaningful assertion messages
- Keep test data in fixtures

❌ **DON'T**
- Hardcode credentials or URLs
- Hardcode selectors in step definitions
- Run tests fully in parallel (breaks staging)
- Skip cleanup between tests
- Comment obvious code

## Documentation

Quick reference:
- **Getting Started**: See main `README.md`
- **Test Development**: See `CONTRIBUTING.md`
- **Web Tests**: See `web-tests/README.md`
- **Configuration**: See `config/README.md`
- **Test Data**: See `test-data/README.md`
- **Team Processes**: See `documentation/README.md`

## Support

For issues or questions:
1. Check relevant documentation
2. Review existing tests for examples
3. Check `playwright.dev/docs`
4. Ask team lead

---

**Ready to start?** Run `npm test` and check `reports/playwright-report/index.html` when done!
