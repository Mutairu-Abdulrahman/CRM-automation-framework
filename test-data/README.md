# Test Data Repository

Centralized management of all test data for the automation suite.

## Structure

```
test-data/
├── global/              # Shared test data across all products
│   ├── users/          # User accounts and credentials
│   └── reference-data/ # Countries, currencies, transaction types
├── api/                # API-specific test data
│   ├── payloads/       # Request payloads
│   └── mock-responses/ # Mock API responses
├── web/                # Web-specific test data
│   ├── web-test-users.csv
│   └── web-form-data/
├── mobile/             # Mobile-specific test data
└── pos/                # POS-specific test data
```

## Usage

### Test Users

File: `global/users/test-users.csv`

```csv
username,password,role,display_name
agent1@test.com,password@1,Agent,Agent One
agent2@test.com,password@1,Agent,Agent Two
admin1@test.com,password@1,Admin,Admin One
```

Load in fixtures:
```javascript
import fs from 'fs';
import csv from 'csv-parser';

const users = [];
fs.createReadStream('../../test-data/global/users/test-users.csv')
  .pipe(csv())
  .on('data', (row) => users.push(row));
```

### API Payloads

File: `api/payloads/payments/create-payment.json`

```json
{
  "amount": 1000,
  "currency": "NGN",
  "recipient": "08012345678",
  "narration": "Test payment"
}
```

### Reference Data

File: `global/reference-data/countries.json`

```json
[
  { "code": "NG", "name": "Nigeria" },
  { "code": "US", "name": "United States" }
]
```

## Adding New Test Data

1. Choose appropriate directory based on type and product
2. Use consistent format (CSV for tabular, JSON for structured)
3. Add `.gitignore` entries for sensitive data
4. Document usage in comments
5. Never commit real credentials - use placeholders

## Credential Management

### Local Development

Create `.env` file in project root:
```bash
AGENT_USERNAME=your-test-account@example.com
AGENT_PASSWORD=your-password
AGENT_B_USERNAME=agent-b@example.com
AGENT_B_PASSWORD=agent-b-password
```

See `../.env.example` for all variables.

### CI/CD

Set secrets in GitLab CI:
- Go to Project Settings → CI/CD → Variables
- Add `AGENT_USERNAME`, `AGENT_PASSWORD`, etc.
- Mark as protected and masked

### Never Commit

Add to `.gitignore`:
```
.env
*.pem
*.key
credentials.json
```

## Data Formats

### CSV Format
- Use for tabular data (users, accounts, transactions)
- Include headers
- Keep consistent encoding (UTF-8)

### JSON Format
- Use for complex structures
- Use for mock API responses
- Validate against schema

### YAML Format
- Use for configuration
- Used by Maestro flows

## Maintenance

- Review quarterly for stale data
- Remove test accounts no longer needed
- Update credentials when changed
- Document data dependencies
- Keep backups of production-like data

## Examples

See `web/web-form-data/` for example web form inputs and `api/payloads/` for example API request bodies.
