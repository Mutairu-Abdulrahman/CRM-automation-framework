# Contributing to MET Automation CCAI

## Coding Standards

### Test Structure
- Feature files go in: `web-tests/tests/{module}/features/`
- Step definitions go in: `web-tests/tests/{module}/steps/`
- Page objects go in: `web-tests/pages/{product}/`
- Shared data/helpers in: `web-tests/data/`

### Writing Clean Code
1. **Keep tests focused**: Each scenario tests one thing
2. **Use Page Objects**: All UI interaction through page classes
3. **Shared Steps**: Reuse common steps via Background
4. **Naming**: Clear, descriptive names for steps and functions

### Git Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit with clear messages
3. Push and create a pull request

## Running Tests Locally

```bash
# Run specific test module
npm test -- web-tests/tests/chat

# Run in headed mode for debugging
npm run test:headed -- web-tests/tests/chat/features/agent_chat_resolution.feature

# View HTML report
npm test && open playwright-report/index.html
```

## Test Data

Test data is stored in `test-data/`. Add fixture data to:
- User accounts: `test-data/global/users/`
- API payloads: `test-data/api/payloads/`

## Environment Variables

Set these in `.env`:
- `AGENT_USERNAME` - Primary agent login
- `AGENT_PASSWORD` - Agent password
- `AGENT_B_USERNAME` - Secondary agent
- etc.

## Debugging Tips

1. **Use `--debug` flag**: `playwright test --debug`
2. **Check trace files**: Generated on failure in reports
3. **Enable verbose logging**: `DEBUG=* npm test`
4. **Inspect selectors**: Use Playwright Inspector

## Best Practices

- Don't hardcode test data - use fixtures
- Always await async operations
- Clean up state between scenarios
- Test one thing per scenario
- Use meaningful assertion messages
