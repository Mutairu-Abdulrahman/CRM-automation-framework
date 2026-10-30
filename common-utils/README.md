# Common Utilities

Shared scripts, utilities, and Docker configurations used across the test suite.

## Structure

```
common-utils/
├── scripts/             # Standalone utility scripts
│   ├── database/       # Database utilities
│   ├── test-data/      # Test data generation
│   ├── environment/    # Environment setup
│   └── ci-cd/          # CI/CD helpers
└── docker/             # Docker configurations
    ├── test-containers/
    └── docker-compose/
```

## Database Scripts

### Database Cleanup

File: `scripts/database/db-cleanup.sh`

Cleans test data from database:

```bash
./scripts/database/db-cleanup.sh
```

Options:
- `--full`: Full cleanup (use with caution)
- `--tables`: Specify tables to clean
- `--host`: Database host

### Database Seed

File: `scripts/database/db-seed.py`

Seeds database with test data:

```bash
python3 scripts/database/db-seed.py --environment=staging
```

### Database Restore

File: `scripts/database/db-restore.sh`

Restores database from backup:

```bash
./scripts/database/db-restore.sh --backup=/path/to/backup.sql
```

## Test Data Scripts

### Generate Test Users

File: `scripts/test-data/generate-test-users.py`

Generates test user accounts:

```bash
python3 scripts/test-data/generate-test-users.py \
  --count=10 \
  --output=../../test-data/global/users/generated-users.csv
```

### Generate Test Accounts

File: `scripts/test-data/generate-test-accounts.py`

Generates test bank/business accounts:

```bash
python3 scripts/test-data/generate-test-accounts.py \
  --count=5 \
  --account-type=business
```

### Data Masking

File: `scripts/test-data/data-masking.js`

Masks sensitive data in test results:

```javascript
const mask = require('./data-masking.js');
const masked = mask.maskCredentials(testResults);
```

### Synthetic Data Generator

File: `scripts/test-data/synthetic-data-generator.py`

Generates realistic synthetic data:

```bash
python3 scripts/test-data/synthetic-data-generator.py \
  --schema=customer \
  --count=100
```

## Environment Scripts

### Health Check

File: `scripts/environment/health-check.sh`

Verifies environment readiness:

```bash
./scripts/environment/health-check.sh
```

Checks:
- Database connectivity
- API endpoints
- Required services
- Network access

### Setup Environment

File: `scripts/environment/setup-env.sh`

Sets up local development environment:

```bash
./scripts/environment/setup-env.sh
```

Does:
- Installs dependencies
- Creates databases
- Seeds test data
- Configures credentials

### Teardown Environment

File: `scripts/environment/teardown-env.sh`

Cleans up environment:

```bash
./scripts/environment/teardown-env.sh
```

## CI/CD Scripts

### Pipeline Jobs

File: `scripts/ci-cd/pipeline-jobs.md`

Documents all CI/CD pipeline stages:
- Linting
- Unit tests
- Integration tests
- Deployment

### Artifact Publisher

File: `scripts/ci-cd/artifact-publisher.js`

Publishes test artifacts:

```javascript
const publisher = require('./artifact-publisher.js');
await publisher.publish({
  reports: 'reports/',
  environment: process.env.CI_ENVIRONMENT_NAME
});
```

## Docker Utilities

### Test Containers

Directory: `docker/test-containers/`

Pre-built containers for:
- Database (PostgreSQL, MySQL)
- Cache (Redis)
- Message queue (RabbitMQ)

### Docker Compose

File: `docker/docker-compose/docker-compose.yml`

Complete test environment:

```bash
docker-compose -f docker/docker-compose/docker-compose.yml up
```

Services:
- Database
- API server
- Redis cache
- Test runner

## Best Practices

- ✅ Keep scripts focused and single-purpose
- ✅ Add error handling
- ✅ Document parameters
- ✅ Log execution steps
- ✅ Make scripts idempotent
- ❌ Don't hardcode paths
- ❌ Don't require interactive input
- ❌ Don't modify production data

## Examples

### Run Health Check Before Tests

```bash
./scripts/environment/health-check.sh && npm test
```

### Generate and Seed Test Data

```bash
python3 scripts/test-data/generate-test-users.py --count=5
python3 scripts/database/db-seed.py --environment=staging
npm test
```

### Docker-based Testing

```bash
cd docker/docker-compose
docker-compose up -d
sleep 10  # Wait for services to be ready
npm test
docker-compose down
```

## Troubleshooting

- **Script not executable**: `chmod +x scripts/**/*.sh`
- **Python not found**: Install Python 3
- **Docker issues**: Check Docker daemon is running
- **Permission denied**: Check file permissions
- **Port conflicts**: Modify ports in docker-compose.yml
