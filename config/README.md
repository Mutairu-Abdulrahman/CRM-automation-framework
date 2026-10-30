# Configuration

Global configuration for test execution, environments, and reporting.

## Structure

```
config/
├── environments/        # Environment-specific configs
│   ├── dev.env
│   ├── qa.env
│   ├── staging.env
│   └── prod.env
├── reporting/          # Reporting tool configs
│   ├── qmetry-config.json
│   └── reportportal-config.json
├── credentials/        # Credential templates
│   ├── .credentials.template
│   └── README.md
└── common/            # Shared configurations
    ├── timeout-config.json
    ├── browser-config.json
    └── mobile-capabilities.json
```

## Environment Configuration

### Development

File: `environments/dev.env`

```env
BASE_URL=http://localhost:3000
ENVIRONMENT=development
LOG_LEVEL=debug
```

### QA

File: `environments/qa.env`

```env
BASE_URL=https://qa.moniedesk.example.com
ENVIRONMENT=qa
LOG_LEVEL=info
```

### Staging

File: `environments/staging.env` (Default)

```env
BASE_URL=https://v3.moniedesk.staging.moniepoint.com
ENVIRONMENT=staging
LOG_LEVEL=info
AGENT_USERNAME=your-test-account
AGENT_PASSWORD=your-password
```

### Production

File: `environments/prod.env`

```env
BASE_URL=https://moniedesk.moniepoint.com
ENVIRONMENT=production
LOG_LEVEL=warn
```

## Loading Environment

In code:
```javascript
import dotenv from 'dotenv';
dotenv.config({ path: `./config/environments/${process.env.ENV || 'staging'}.env` });
```

From command line:
```bash
ENV=qa npm test
```

## Reporting Configuration

### QMetry

File: `reporting/qmetry-config.json`

```json
{
  "api_key": "${QMETRY_API_KEY}",
  "project_id": "MONIEDESK",
  "cycle_id": "v1.0.0",
  "automation_framework": "Playwright"
}
```

### ReportPortal

File: `reporting/reportportal-config.json`

```json
{
  "rp_endpoint": "https://reportportal.internal",
  "rp_token": "${RP_TOKEN}",
  "rp_project": "moniedesk-qa",
  "rp_launch": "Automation Suite"
}
```

## Browser Configuration

File: `common/browser-config.json`

```json
{
  "browsers": ["chromium", "firefox", "webkit"],
  "headless": true,
  "slow_mo": 0,
  "viewport": {
    "width": 1280,
    "height": 720
  },
  "accept_downloads": true
}
```

## Timeout Configuration

File: `common/timeout-config.json`

```json
{
  "default_timeout": 30000,
  "navigation_timeout": 30000,
  "action_timeout": 10000,
  "fixture_timeout": 600000
}
```

## Credentials

### Template

File: `credentials/.credentials.template`

```
# Copy this file to .credentials and fill in your values
AGENT_USERNAME=
AGENT_PASSWORD=
AGENT_B_USERNAME=
AGENT_B_PASSWORD=
LEAD_USERNAME=
LEAD_PASSWORD=
```

### Setup

1. Copy template:
   ```bash
   cp config/credentials/.credentials.template .credentials
   ```

2. Fill with your test accounts

3. Add to `.gitignore`:
   ```bash
   echo ".credentials" >> .gitignore
   ```

4. Load in your tests:
   ```javascript
   import fs from 'fs';
   const creds = fs.readFileSync('.credentials', 'utf-8');
   // Parse and use credentials
   ```

## Best Practices

- ✅ Use environment variables for sensitive data
- ✅ Keep templates for reference
- ✅ Document all configuration options
- ✅ Use consistent naming conventions
- ❌ Never commit actual credentials
- ❌ Don't hardcode URLs
- ❌ Don't mix config with code

## CI/CD Integration

### GitLab CI

Set variables in project settings:
- `AGENT_USERNAME`
- `AGENT_PASSWORD`
- `QMETRY_API_KEY`
- `RP_TOKEN`

Load in pipeline:
```yaml
test:
  variables:
    ENV: staging
  script:
    - npm test
```

### GitHub Actions

Add secrets in Settings → Secrets and variables:

```yaml
env:
  AGENT_USERNAME: ${{ secrets.AGENT_USERNAME }}
  AGENT_PASSWORD: ${{ secrets.AGENT_PASSWORD }}
```

## Troubleshooting

- **Config not loading**: Check file path and syntax
- **Wrong environment**: Verify `ENV` variable is set
- **Credentials missing**: Check `.credentials` file exists
- **Port conflicts**: Update `localhost` port in dev.env
