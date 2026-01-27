# QualityHub Architecture Overview

This document provides an overview of the QualityHub system architecture.

## System Overview

QualityHub is an AI-powered test management platform built as a monorepo with three main applications:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│            Web Browser │ Mobile │ API Consumers                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                                │
│                React 18 + TypeScript + Vite                      │
│          Tailwind CSS + Radix UI + Redux Toolkit                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST API
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                 │
│            (Rate Limiting, Auth, Request Logging)                │
└───────────┬─────────────────────────────────┬───────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│     Core API          │         │    AI Service         │
│      NestJS           │ ──────► │     FastAPI           │
│    TypeScript         │         │     Python            │
└───────────┬───────────┘         └───────────┬───────────┘
            │                                 │
            ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  PostgreSQL 16 │ Redis 7 │ Elasticsearch │ S3 │ RabbitMQ       │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS + Radix UI primitives
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router 6
- **Charts**: Recharts 2

### Directory Structure

```
apps/web/src/
├── components/
│   ├── ui/           # Base UI components (Button, Input, Modal, etc.)
│   ├── features/     # Feature-specific components
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── test-cases/
│   │   ├── test-runs/
│   │   └── ...
│   ├── layouts/      # Layout components (RootLayout, DashboardLayout)
│   └── routing/      # Route guards and routing utilities
├── hooks/            # Custom React hooks
├── pages/            # Route page components
├── store/
│   ├── api/          # RTK Query API slices
│   └── slices/       # Redux state slices
├── utils/            # Helper functions
├── types/            # TypeScript type definitions
├── constants/        # App constants
└── test/             # Test utilities and mocks
```

### State Management Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                        Components                            │
└────────────────────────┬──────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  Hooks   │   │ Selectors│   │  Actions │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
              ┌─────────────────┐
              │   Redux Store   │
              │  ├── auth       │
              │  ├── ui         │
              │  └── api cache  │
              └─────────────────┘
```

**RTK Query** handles:
- API request caching
- Automatic re-fetching
- Optimistic updates
- Request deduplication

## Backend Architecture

### Technology Stack
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 with TypeORM
- **Cache**: Redis 7
- **Authentication**: Passport.js with JWT
- **Documentation**: Swagger/OpenAPI

### Module Structure

```
apps/api/src/
├── modules/
│   ├── auth/         # Authentication (login, register, JWT)
│   ├── users/        # User management
│   ├── organizations/# Multi-tenant organizations
│   ├── projects/     # Project CRUD and members
│   ├── test-suites/  # Test suites and sections
│   ├── test-cases/   # Test case management
│   ├── test-plans/   # Test planning
│   ├── test-runs/    # Test execution and results
│   ├── milestones/   # Milestone tracking
│   ├── requirements/ # Requirements traceability
│   ├── reports/      # Report generation
│   ├── attachments/  # File attachments
│   ├── dashboard/    # Dashboard aggregations
│   ├── ai/           # AI service integration
│   └── health/       # Health check endpoint
├── common/
│   ├── decorators/   # Custom decorators (@CurrentUser, @Public)
│   ├── guards/       # Auth guards
│   ├── filters/      # Exception filters
│   ├── interceptors/ # Response transformers
│   └── pipes/        # Validation pipes
├── config/           # Configuration and database setup
└── database/
    └── migrations/   # TypeORM migrations
```

### Request Flow

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Middleware    │  CORS, Rate Limiting, Logging
└────────┬────────┘
         ▼
┌─────────────────┐
│   Auth Guard    │  JWT Validation
└────────┬────────┘
         ▼
┌─────────────────┐
│  Permissions    │  Role-based access control
│     Guard       │
└────────┬────────┘
         ▼
┌─────────────────┐
│   Validation    │  DTO validation with class-validator
│     Pipe        │
└────────┬────────┘
         ▼
┌─────────────────┐
│   Controller    │  Route handling
└────────┬────────┘
         ▼
┌─────────────────┐
│    Service      │  Business logic
└────────┬────────┘
         ▼
┌─────────────────┐
│  Repository     │  Data access (TypeORM)
└────────┬────────┘
         ▼
┌─────────────────┐
│   Database      │  PostgreSQL
└─────────────────┘
```

## Database Schema

### Core Entities

```
┌──────────────┐     ┌──────────────┐
│ Organization │────<│    User      │
└──────────────┘     └──────────────┘
       │                    │
       │              ┌─────┴─────┐
       ▼              ▼           ▼
┌──────────────┐ ┌─────────┐ ┌─────────┐
│   Project    │ │TestRun  │ │Milestone│
└──────────────┘ │(assignee)│ └─────────┘
       │         └─────────┘      │
       │              │           │
       ▼              ▼           ▼
┌──────────────┐ ┌─────────┐ ┌─────────┐
│  TestSuite   │ │TestResult│ │ TestPlan│
└──────────────┘ └─────────┘ └─────────┘
       │              │
       ▼              │
┌──────────────┐      │
│   Section    │      │
└──────────────┘      │
       │              │
       ▼              │
┌──────────────┐◄─────┘
│   TestCase   │
└──────────────┘
       │
       ▼
┌──────────────┐
│TestCaseVersion│
└──────────────┘
```

### Key Relationships

- **Organization** → has many **Users** (multi-tenant)
- **Project** → belongs to **Organization**, has many **TestSuites**
- **TestSuite** → has many **Sections** (hierarchical)
- **Section** → has many **TestCases**
- **TestCase** → has many **TestCaseVersions** (versioning)
- **TestRun** → has many **TestResults**
- **TestResult** → references **TestCase** at specific version

## Authentication Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Client  │                    │   API   │                    │Database │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  POST /auth/login            │                              │
     │  {email, password}           │                              │
     │────────────────────────────►│                              │
     │                              │  Validate credentials        │
     │                              │─────────────────────────────►│
     │                              │◄─────────────────────────────│
     │                              │                              │
     │  {accessToken, refreshToken, │                              │
     │   user}                      │                              │
     │◄────────────────────────────│                              │
     │                              │                              │
     │  GET /protected-resource     │                              │
     │  Authorization: Bearer token │                              │
     │────────────────────────────►│                              │
     │                              │  Validate JWT                │
     │                              │  Extract user payload        │
     │  {data}                      │                              │
     │◄────────────────────────────│                              │
```

### Token Strategy
- **Access Token**: Short-lived (15 minutes), stored in memory
- **Refresh Token**: Long-lived (7 days), rotated on each use
- **Token Rotation**: Old refresh tokens are invalidated after use

## AI Service Architecture

The AI service provides:
- **Test Generation**: Generate test cases from requirements
- **BDD Generation**: Create Gherkin scenarios from descriptions
- **Coverage Suggestions**: Recommend additional test coverage

```
┌────────────────┐
│  NestJS API    │
└───────┬────────┘
        │ HTTP
        ▼
┌────────────────┐
│ FastAPI Service│
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ LLM Provider   │  OpenAI / Anthropic
└────────────────┘
```

## Security Considerations

### Authentication & Authorization
- JWT-based authentication with refresh token rotation
- Role-based access control (RBAC)
- Organization-scoped data isolation

### Data Protection
- Password hashing with bcrypt (cost factor 12)
- HTTPS enforcement in production
- SQL injection prevention via parameterized queries
- XSS prevention with proper output encoding

### API Security
- Rate limiting per IP and user
- Request size limits
- CORS configuration
- Input validation with DTOs

## Scalability Patterns

### Horizontal Scaling
- Stateless API design allows horizontal scaling
- Redis for session/cache storage
- Load balancer distributes traffic

### Caching Strategy
- Redis for frequently accessed data
- RTK Query for client-side caching
- Entity-level cache invalidation

### Performance Optimizations
- Database indexing on foreign keys and common queries
- Pagination for list endpoints (default: 25, max: 100)
- Selective field queries with TypeORM
- Frontend list virtualization for large datasets

## Deployment Architecture

### Production Stack
```
┌─────────────────────────────────────────────────────────────┐
│                      CloudFlare CDN                          │
│                 (SSL, DDoS Protection, Caching)              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                    Load Balancer                             │
└────────────────────────┬────────────────────────────────────┘
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐     ┌─────────┐     ┌─────────┐
    │ API Pod │     │ API Pod │     │ API Pod │
    └─────────┘     └─────────┘     └─────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│    PostgreSQL (Primary)│   PostgreSQL (Replica)             │
│         Redis          │   Elasticsearch                    │
│    S3 (Attachments)    │   RabbitMQ (Queue)                │
└─────────────────────────────────────────────────────────────┘
```

### Container Strategy
- Docker images for each service
- Kubernetes for orchestration
- Helm charts for deployment configuration
- CI/CD with GitHub Actions

## Monitoring & Observability

### Logging
- Structured JSON logging
- Request/response logging in development
- Error tracking with stack traces

### Metrics
- API response times
- Database query performance
- Error rates and status codes

### Health Checks
- `/api/v1/health` endpoint
- Database connectivity check
- Redis connectivity check
