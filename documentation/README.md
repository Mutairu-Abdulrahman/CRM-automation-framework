# Documentation

Comprehensive documentation for QA processes, testing strategies, guidelines, and team onboarding.

## Contents

### Processes
- `processes/test-execution-process.md` - How to execute tests
- `processes/defect-management.md` - Defect workflow
- `processes/release-sign-off.md` - Release testing criteria
- `processes/sprint-testing-workflow.md` - Sprint-based testing

### Strategies
- `strategies/Moniepoint-Overarching-Test-Strategy.md` - Overall testing strategy
- `strategies/xxx-regression-testing-strategy.md` - Regression testing approach
- `strategies/xxx-smoke-testing-strategy.md` - Smoke test scope
- `strategies/xxx-api-testing-strategy.md` - API testing approach

### Guidelines
- `guidelines/code-review-guidelines.md` - Code review standards
- `guidelines/test-design-guidelines.md` - Test design best practices
- `guidelines/Tooling-Guidelines.md` - Tool selection and usage
- `guidelines/git-workflow.md` - Git branching and commit strategy

### Architecture
- `architecture/framework-selection.md` - Why Playwright + BDD
- `architecture/test-data-management.md` - Data architecture decisions
- `architecture/reporting-architecture.md` - Reporting infrastructure

### Templates
- `templates/test-plan-template.md` - Test plan template
- `templates/bug-report-template.md` - Bug report format
- `templates/root-cause-analysis.md` - RCA template
- `templates/test-case-template.md` - Test case structure

### Onboarding
- `onboarding/new-qa-engineer.md` - Getting started guide
- `onboarding/automation-setup-guide.md` - Local setup instructions
- `onboarding/account-setup-guide.md` - Test account provisioning

## Quick Navigation

### For New Team Members
Start with:
1. [Getting Started](./onboarding/new-qa-engineer.md)
2. [Local Setup](./onboarding/automation-setup-guide.md)
3. [Test Design Guidelines](./guidelines/test-design-guidelines.md)

### For Test Execution
Refer to:
1. [Test Execution Process](./processes/test-execution-process.md)
2. [Smoke Testing Strategy](./strategies/xxx-smoke-testing-strategy.md)
3. [Regression Testing Strategy](./strategies/xxx-regression-testing-strategy.md)

### For Test Development
See:
1. [Architecture Overview](./architecture/framework-selection.md)
2. [Test Design Guidelines](./guidelines/test-design-guidelines.md)
3. [Code Review Guidelines](./guidelines/code-review-guidelines.md)

### For Defect Management
Check:
1. [Bug Report Template](./templates/bug-report-template.md)
2. [Defect Management Process](./processes/defect-management.md)
3. [Root Cause Analysis Template](./templates/root-cause-analysis.md)

## Key Concepts

### Test Pyramid
- **Unit Tests**: Component-level (handled by developers)
- **Integration Tests**: Module-level feature workflows
- **E2E Tests**: Full user workflows (our focus)

### Test Organization
- Tests grouped by **feature/module**
- Steps reused across scenarios via **Background**
- Page Objects encapsulate **UI interactions**
- Shared state managed via **world context**

### Quality Standards
- Every test has **clear acceptance criteria**
- Tests are **independent and repeatable**
- Failures have **meaningful error messages**
- All tests **run in serial** (shared staging backend)

## Contributing to Documentation

### Adding New Docs

1. Choose appropriate category (process, strategy, etc.)
2. Create file in relevant subdirectory
3. Follow template format
4. Link from this README
5. Update table of contents

### Document Format

```markdown
# Title

## Overview
Brief description of topic

## Key Points
- Point 1
- Point 2

## Examples
Practical examples

## Related Documents
- [Link](./related-file.md)
```

## Maintenance

- **Quarterly Review**: Ensure docs are current
- **Update on Change**: Revise when process changes
- **Archive Old**: Move superseded docs to `_archive/`
- **Version**: Note effective dates

## Search Tips

- Use `grep` to find topics:
  ```bash
  grep -r "smoke" . --include="*.md"
  ```

- Files follow naming: `kebab-case.md`

## Tool References

- **Playwright**: https://playwright.dev/docs/intro
- **Gherkin BDD**: https://cucumber.io/docs/gherkin/
- **Moniedesk**: Internal wiki (see onboarding)

## Questions?

Refer to:
1. Documentation index (this file)
2. Team wiki/knowledge base
3. Ask team lead for clarification

Last Updated: 2024-01-25
