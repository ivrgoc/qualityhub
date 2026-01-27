# QualityHub

**AI-Powered Test Management Platform**

A modern test management solution for QA teams with AI-assisted test generation, real-time execution tracking, and comprehensive reporting.

## Features

- **Test Case Management** - Create, organize, and version test cases with multiple templates (steps, BDD, text, exploratory)
- **Test Execution** - Run tests with keyboard shortcuts, track results, and link defects
- **AI-Powered Generation** - Generate test cases from requirements using AI
- **Requirements Traceability** - Link tests to requirements and track coverage
- **Real-time Reporting** - Dashboards, charts, and exportable reports
- **Team Collaboration** - Multi-project support with role-based access control

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit |
| Backend | NestJS, TypeScript, PostgreSQL 16, Redis, TypeORM |
| AI Service | Python 3.11, FastAPI, OpenAI/Anthropic |
| Infrastructure | Docker, Docker Compose, pnpm workspaces |

## Quick Start

### Prerequisites

- Node.js 20.11.0+
- pnpm 8.0.0+
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/qualityhub.git
cd qualityhub

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start database services
docker-compose up -d

# Run migrations
pnpm run db:migrate

# Start development servers
pnpm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

## Project Structure

```
qualityhub/
├── apps/
│   ├── api/           # NestJS backend
│   ├── web/           # React frontend
│   └── ai-service/    # Python AI service
├── packages/
│   ├── shared-types/  # TypeScript types
│   └── eslint-config/ # Shared ESLint config
├── infrastructure/    # Docker configs
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## Available Scripts

```bash
pnpm run dev          # Start all services in development mode
pnpm run build        # Build all packages
pnpm run test         # Run tests
pnpm run lint         # Lint code
pnpm run db:migrate   # Run database migrations
```

## Documentation

- [Setup Guide](./docs/setup.md) - Development environment setup
- [Architecture](./docs/architecture.md) - System design overview
- [API Reference](./docs/api.md) - REST API documentation
- [CLAUDE.md](./CLAUDE.md) - AI assistant guidelines

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes following project conventions
4. Run tests: `pnpm run test`
5. Commit with conventional format: `git commit -m "feat: add feature"`
6. Push and create a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built with care by the QualityHub team.
