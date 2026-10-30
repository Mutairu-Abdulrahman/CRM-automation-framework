# Documentation Index

Quick reference to all project documentation.

## 🚀 Getting Started (Start Here!)

| Document | Purpose | Audience |
|----------|---------|----------|
| [QUICK_START.md](./QUICK_START.md) | Install, configure, run tests | Everyone |
| [README.md](./README.md) | Project overview | Everyone |
| [RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md) | What changed and why | Developers |

## 📚 Core Documentation

### For Test Development
| Document | Content |
|----------|---------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Code standards, git workflow, best practices |
| [web-tests/README.md](./web-tests/README.md) | Test structure, running tests, debugging |

### For Project Setup
| Document | Content |
|----------|---------|
| [config/README.md](./config/README.md) | Environment setup, credentials, configuration |
| [test-data/README.md](./test-data/README.md) | Test data organization and management |
| [common-utils/README.md](./common-utils/README.md) | Shared scripts and utilities |

### For Operations
| Document | Content |
|----------|---------|
| [reports/README.md](./reports/README.md) | Test reports, trends, artifacts |
| [documentation/README.md](./documentation/README.md) | Team processes and strategies |

## 📖 Detailed Guides

### Process & Strategy Documents
Located in `documentation/` (to be populated):

```
documentation/
├── processes/
│   ├── test-execution-process.md
│   ├── defect-management.md
│   ├── release-sign-off.md
│   └── sprint-testing-workflow.md
├── strategies/
│   ├── Moniepoint-Overarching-Test-Strategy.md
│   ├── xxx-regression-testing-strategy.md
│   ├── xxx-smoke-testing-strategy.md
│   └── xxx-api-testing-strategy.md
├── guidelines/
│   ├── code-review-guidelines.md
│   ├── test-design-guidelines.md
│   ├── Tooling-Guidelines.md
│   └── git-workflow.md
├── architecture/
│   ├── framework-selection.md
│   ├── test-data-management.md
│   └── reporting-architecture.md
├── templates/
│   ├── test-plan-template.md
│   ├── bug-report-template.md
│   ├── root-cause-analysis.md
│   └── test-case-template.md
└── onboarding/
    ├── new-qa-engineer.md
    ├── automation-setup-guide.md
    └── account-setup-guide.md
```

## 🎯 Documentation by Role

### New Team Member
1. [QUICK_START.md](./QUICK_START.md) - 10 minutes
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - 15 minutes
3. [web-tests/README.md](./web-tests/README.md) - 20 minutes
4. Review sample tests in `web-tests/tests/smoke/`

### QA Engineer / Test Developer
1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Guidelines and best practices
2. [web-tests/README.md](./web-tests/README.md) - Test structure and execution
3. [test-data/README.md](./test-data/README.md) - Managing test data
4. [config/README.md](./config/README.md) - Test environment setup

### QA Lead / Manager
1. [documentation/README.md](./documentation/README.md) - Team processes
2. [reports/README.md](./reports/README.md) - Test metrics and reporting
3. [RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md) - Project status

### DevOps / CI Engineer
1. [config/README.md](./config/README.md) - Environment configuration
2. [ci-cd/README.md](./ci-cd/README.md) - CI/CD templates (to be created)
3. [common-utils/README.md](./common-utils/README.md) - Scripts and utilities
4. [reports/README.md](./reports/README.md) - Report integration

## 🔍 Find by Task

### "How do I run tests?"
→ [QUICK_START.md](./QUICK_START.md) → **Running Tests** section

### "How do I write a new test?"
→ [CONTRIBUTING.md](./CONTRIBUTING.md) → [web-tests/README.md](./web-tests/README.md)

### "Where do I put test data?"
→ [test-data/README.md](./test-data/README.md)

### "How do I set up my environment?"
→ [QUICK_START.md](./QUICK_START.md) → **Configuration** section

### "How do I debug a failing test?"
→ [web-tests/README.md](./web-tests/README.md) → **Debugging** section

### "What's the project structure?"
→ [README.md](./README.md) or [RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md)

### "What changed in the restructure?"
→ [RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md)

### "How do I view test results?"
→ [reports/README.md](./reports/README.md)

## 📋 Checklists

### Pre-Commit Checklist
```
□ All tests pass locally
□ New tests have meaningful names
□ Page Objects used for UI interaction
□ No hardcoded selectors in steps
□ No hardcoded credentials
□ Documentation updated if needed
□ .gitignore prevents committing .env
```

### PR Review Checklist
```
□ Tests follow naming conventions
□ Steps are reusable (not feature-specific)
□ Page Objects are well-organized
□ Imports use correct relative paths
□ No skipped tests (xonly, xit)
□ Documentation updated
□ Commits have clear messages
```

## 🔗 External Resources

### Playwright
- **Official Docs**: https://playwright.dev/docs/intro
- **API Reference**: https://playwright.dev/docs/api/class-playwright
- **Best Practices**: https://playwright.dev/docs/best-practices

### BDD / Gherkin
- **Cucumber Docs**: https://cucumber.io/docs/gherkin/
- **Playwright BDD**: https://github.com/vitalets/playwright-bdd
- **BDD Best Practices**: https://cucumber.io/docs/bdd/

### Test Organization
- **Page Object Model**: https://www.saucelabs.com/resources/articles/best-practices-in-test-automation
- **BDD Framework Pattern**: https://cucumber.io/docs/bdd/

## 📞 Support

### Within Documentation
1. Check [QUICK_START.md](./QUICK_START.md) for common issues
2. Search documentation for keywords
3. Check existing tests for examples

### Git History
```bash
# See changes made to files
git log --oneline web-tests/

# See what changed in a commit
git show <commit-hash>

# Find who/when something changed
git blame web-tests/tests/chat/features/*.feature
```

### Team Resources
- Team Wiki/Knowledge Base (internal)
- Slack channel for QA automation
- Weekly team sync meetings

## 📝 Keeping Documentation Updated

- **When adding a feature**: Update relevant README
- **When changing structure**: Update this index
- **When creating processes**: Add to `documentation/`
- **Quarterly review**: Ensure all docs are current

---

**Last Updated**: 2024-09-25  
**Restructuring Status**: ✅ Complete  
**Ready to Contribute**: Yes!

Start with [QUICK_START.md](./QUICK_START.md) →
