# MET Automation CCAI - Moniedesk Agent Chat Suite

A comprehensive QA automation suite for testing the Moniedesk Agent Chat module, including chat operations, admin functions, and team-lead workflows.

## Project Structure

```
qa-moniedesk/
├── documentation/       # Process docs, strategies, guidelines, templates
├── config/             # Environment configs, credentials, browser settings
├── test-data/          # Global and feature-specific test data
├── common-utils/       # Shared scripts and utilities
├── web-tests/          # Web automation (Playwright) - Main test suite
├── reports/            # Centralized test reports
├── ci-cd/              # CI/CD configurations and scripts
└── .vscode/            # IDE configuration
```

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests in headed mode (visible browser)
npm run test:headed
```

## Test Modules

- **chat/**: Agent chat operations (active/inactive, resolution, transfer, reassign, queue counter)
- **admin/**: Admin functions (filters, assignments, status management)
- **smoke/**: Smoke tests for critical paths
- **team-lead-queue-assign/**: Team lead queue assignment workflows

## Key Documentation

- [Test Data Management](./test-data/README.md)
- [Configuration Guide](./config/README.md)
- [Common Utilities](./common-utils/README.md)

## Environment Setup

Copy `.env.example` to `.env` and set your credentials:
```bash
cp config/environments/.env.example .env
```

## Reports

Test results are generated in:
- `reports/` - HTML reports and historical data

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
