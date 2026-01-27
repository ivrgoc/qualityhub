# QualityHub Development Setup Guide

This guide will help you set up QualityHub for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.11.0 or later
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions
  - Run `nvm use` in the project root to use the correct version
- **pnpm** 8.0.0 or later
  - Install with `npm install -g pnpm`
- **Docker** and **Docker Compose**
  - Required for running PostgreSQL, Redis, and other services
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/qualityhub.git
cd qualityhub
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all workspaces (frontend, backend, AI service, and shared packages).

### 3. Set Up Environment Variables

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

Key environment variables:

```bash
# Database
DATABASE_URL=postgresql://qualityhub:qualityhub_secret@localhost:5432/qualityhub

# Redis
REDIS_URL=redis://localhost:6379

# JWT (generate your own secret for production)
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AI Service (optional for basic functionality)
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=sk-...

# App URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:3001
NODE_ENV=development
```

### 4. Start Infrastructure Services

Start PostgreSQL, Redis, and MailHog (for email testing):

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

### 5. Run Database Migrations

```bash
pnpm run db:migrate
```

### 6. Start Development Servers

Start all services in development mode:

```bash
pnpm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

Alternatively, start services individually:

```bash
# Frontend only
pnpm run dev --filter @qualityhub/web

# Backend only
pnpm run dev --filter @qualityhub/api

# AI service only
cd apps/ai-service && uvicorn app.main:app --reload
```

## Project Structure

```
qualityhub/
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # React frontend
│   └── ai-service/   # Python FastAPI AI service
├── packages/
│   ├── shared-types/ # TypeScript type definitions
│   └── eslint-config/# Shared ESLint configuration
├── infrastructure/   # Docker and deployment configs
├── docs/             # Documentation
└── scripts/          # Build and utility scripts
```

## Common Development Tasks

### Running Tests

```bash
# Run all tests
pnpm run test

# Run frontend tests
pnpm run test --filter @qualityhub/web

# Run backend tests
pnpm run test --filter @qualityhub/api

# Run tests with coverage
pnpm run test:coverage

# Run E2E tests
pnpm run test:e2e --filter @qualityhub/web
```

### Linting and Formatting

```bash
# Lint all files
pnpm run lint

# Format code
pnpm run format
```

### Building for Production

```bash
pnpm run build
```

### Database Commands

```bash
# Run migrations
pnpm run db:migrate

# Generate new migration
cd apps/api && pnpm run migration:generate -- -n MigrationName

# Revert last migration
cd apps/api && pnpm run migration:revert
```

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

1. Ensure Docker containers are running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify connection string in `.env` matches Docker configuration.

### Node Version Mismatch

Ensure you're using the correct Node.js version:

```bash
node --version  # Should be v20.11.0 or later
nvm use         # Switch to project's Node version
```

### Clear Build Cache

If you encounter strange build issues:

```bash
pnpm run clean
pnpm install
pnpm run build
```

### Redis Connection Issues

1. Check Redis is running:
   ```bash
   docker-compose logs redis
   ```

2. Test connection:
   ```bash
   docker exec -it qualityhub-redis redis-cli ping
   # Should return: PONG
   ```

## IDE Setup

### VS Code Extensions

Recommended extensions (`.vscode/extensions.json`):
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer
- GitLens
- REST Client

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Getting Help

- Check [CLAUDE.md](../CLAUDE.md) for AI assistance guidelines
- Review [Architecture Documentation](./architecture.md)
- Browse [API Documentation](./api.md)
- Open an issue on GitHub for bugs or feature requests

## Next Steps

Once your environment is set up:

1. Review the [Architecture Guide](./architecture.md) to understand the system
2. Check the [API Documentation](./api.md) for backend endpoints
3. Browse existing code to understand patterns and conventions
4. Pick up a task from the project board and start coding!
