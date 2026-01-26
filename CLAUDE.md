# CLAUDE.md - QualityHub Project Intelligence

> This file provides context for Claude AI when working on the QualityHub codebase.
> It should be kept up-to-date as the project evolves.

---

## 🎯 Project Overview

**QualityHub** is an AI-powered test management platform for QA teams. It enables centralized test case management, test execution tracking, defect management, and advanced reporting with full traceability from requirements to delivery.

### Core Value Proposition

- **90% faster test creation** with AI-powered generation
- **Unified platform** for manual, exploratory, and automated testing
- **Full traceability** from requirements → tests → defects → fixes
- **Real-time visibility** into testing progress and quality metrics

### Target Users

- QA Engineers (daily users)
- Test Leads / QA Managers
- Developers (defect collaboration)
- Product Owners (release decisions)
- DevOps Engineers (CI/CD integration)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (SPA)                         │
│                   React + TypeScript + Vite                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│                    (Rate Limiting, Auth)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌───────────┐ ┌───────────────┐
│   Core API      │ │ AI Service│ │  Integrations │
│   (NestJS)      │ │ (FastAPI) │ │    Service    │
└────────┬────────┘ └─────┬─────┘ └───────┬───────┘
         │                │               │
         └────────────────┼───────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  PostgreSQL │ Redis │ Elasticsearch │ S3 │ RabbitMQ        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
qualityhub/
├── apps/
│   ├── web/                    # React frontend application
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   │   ├── ui/         # Base components (Button, Input, Modal)
│   │   │   │   └── features/   # Feature-specific components
│   │   │   ├── pages/          # Route pages
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── store/          # Redux store, slices, RTK Query
│   │   │   ├── services/       # API service definitions
│   │   │   ├── utils/          # Helper functions
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   └── constants/      # App constants
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── api/                    # NestJS backend application
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── projects/
│   │   │   │   ├── test-cases/
│   │   │   │   ├── test-runs/
│   │   │   │   ├── test-plans/
│   │   │   │   ├── milestones/
│   │   │   │   ├── requirements/
│   │   │   │   ├── reports/
│   │   │   │   └── integrations/
│   │   │   ├── common/         # Shared utilities
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   └── pipes/
│   │   │   ├── config/
│   │   │   └── database/
│   │   └── package.json
│   │
│   └── ai-service/             # Python AI service
│       ├── app/
│       │   ├── api/
│       │   ├── services/
│       │   │   ├── test_generator.py
│       │   │   └── bdd_generator.py
│       │   ├── models/
│       │   └── core/
│       └── requirements.txt
│
├── packages/                   # Shared packages (monorepo)
│   ├── shared-types/           # Shared TypeScript types
│   ├── eslint-config/          # Shared ESLint configuration
│   └── ui-components/          # Shared UI component library
│
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
│
├── docs/                       # Documentation
│   ├── PRD.md
│   ├── api/
│   └── architecture/
│
├── scripts/                    # Build and utility scripts
├── .github/                    # GitHub Actions workflows
├── docker-compose.yml
├── package.json                # Root package.json (workspaces)
├── turbo.json                  # Turborepo configuration
├── config.yaml                 # Ralphy configuration
└── CLAUDE.md                   # This file
```

---

## 🛠️ Tech Stack

### Frontend

| Technology       | Version | Purpose                     |
| ---------------- | ------- | --------------------------- |
| React            | 18.x    | UI framework                |
| TypeScript       | 5.x     | Type safety                 |
| Vite             | 5.x     | Build tool                  |
| Redux Toolkit    | 2.x     | State management            |
| RTK Query        | 2.x     | API data fetching & caching |
| React Router     | 6.x     | Routing                     |
| Tailwind CSS     | 3.x     | Styling                     |
| Radix UI         | Latest  | Accessible UI primitives    |
| React Hook Form  | 7.x     | Form handling               |
| Zod              | 3.x     | Schema validation           |
| TanStack Table   | 8.x     | Data tables                 |
| TanStack Virtual | 3.x     | List virtualization         |
| Recharts         | 2.x     | Charts                      |
| TipTap           | 2.x     | Rich text editor            |

### Backend (NestJS)

| Technology      | Version | Purpose           |
| --------------- | ------- | ----------------- |
| NestJS          | 10.x    | API framework     |
| TypeScript      | 5.x     | Type safety       |
| TypeORM         | 0.3.x   | ORM               |
| PostgreSQL      | 16      | Primary database  |
| Redis           | 7.x     | Caching, sessions |
| Passport        | 0.7.x   | Authentication    |
| class-validator | 0.14.x  | DTO validation    |
| Swagger         | 7.x     | API documentation |

### AI Service (Python)

| Technology         | Version | Purpose           |
| ------------------ | ------- | ----------------- |
| FastAPI            | 0.109.x | API framework     |
| Python             | 3.11+   | Runtime           |
| Pydantic           | 2.x     | Data validation   |
| OpenAI / Anthropic | Latest  | LLM integration   |
| LangChain          | 0.1.x   | LLM orchestration |

### Infrastructure

| Technology        | Purpose              |
| ----------------- | -------------------- |
| Docker            | Containerization     |
| Kubernetes        | Orchestration        |
| AWS / Azure / GCP | Cloud provider       |
| CloudFlare        | CDN, DDoS protection |
| RabbitMQ          | Message queue        |
| Elasticsearch     | Full-text search     |

---

## 📊 Database Schema (Key Entities)

### Core Entities

```sql
-- Organizations (multi-tenant)
organizations: id, name, slug, settings, plan, created_at

-- Users
users: id, org_id, email, password_hash, name, role, settings, created_at

-- Projects
projects: id, org_id, name, description, settings, created_at, deleted_at

-- Test Suites
test_suites: id, project_id, name, description, parent_id, position, created_at

-- Sections
sections: id, suite_id, name, description, parent_id, position, created_at

-- Test Cases
test_cases: id, section_id, title, template_type, preconditions, steps (JSONB),
            expected_result, priority, estimate, custom_fields (JSONB),
            references (JSONB), version, created_by, created_at, updated_at, deleted_at

-- Test Case History (versioning)
test_case_versions: id, test_case_id, version, data (JSONB), changed_by, created_at

-- Milestones
milestones: id, project_id, name, description, due_date, completed, created_at

-- Test Plans
test_plans: id, project_id, milestone_id, name, description, created_at

-- Test Runs
test_runs: id, project_id, plan_id, suite_id, name, description,
           config (JSONB), assignee_id, started_at, completed_at, created_at

-- Test Results
test_results: id, run_id, case_id, case_version, status, comment,
              elapsed_seconds, defects (JSONB), attachments (JSONB),
              executed_by, executed_at, created_at

-- Requirements
requirements: id, project_id, external_id, title, description,
              source, status, custom_fields (JSONB), created_at

-- Attachments
attachments: id, entity_type, entity_id, filename, path, size,
             mime_type, uploaded_by, created_at
```

### Status Enums

```typescript
enum TestStatus {
  UNTESTED = 'untested',
  PASSED = 'passed',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  RETEST = 'retest',
  SKIPPED = 'skipped',
}

enum TestCaseTemplate {
  STEPS = 'steps',
  TEXT = 'text',
  BDD = 'bdd',
  EXPLORATORY = 'exploratory',
}

enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

### Projects

```
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Test Cases

```
GET    /api/v1/projects/:projectId/cases
POST   /api/v1/projects/:projectId/cases
GET    /api/v1/projects/:projectId/cases/:id
PUT    /api/v1/projects/:projectId/cases/:id
DELETE /api/v1/projects/:projectId/cases/:id
POST   /api/v1/projects/:projectId/cases/bulk
GET    /api/v1/projects/:projectId/cases/:id/history
```

### Test Runs

```
GET    /api/v1/projects/:projectId/runs
POST   /api/v1/projects/:projectId/runs
GET    /api/v1/projects/:projectId/runs/:id
PUT    /api/v1/projects/:projectId/runs/:id
DELETE /api/v1/projects/:projectId/runs/:id
POST   /api/v1/projects/:projectId/runs/:id/results
GET    /api/v1/projects/:projectId/runs/:id/results
```

### AI Service

```
POST   /api/v1/ai/generate-tests
POST   /api/v1/ai/generate-bdd
POST   /api/v1/ai/suggest-coverage
```

### Reports

```
GET    /api/v1/projects/:projectId/reports/summary
GET    /api/v1/projects/:projectId/reports/coverage
GET    /api/v1/projects/:projectId/reports/defects
GET    /api/v1/projects/:projectId/reports/activity
POST   /api/v1/projects/:projectId/reports/export
```

---

## 🎨 UI Component Patterns

### Component Structure

```tsx
// components/features/test-cases/TestCaseCard.tsx
import { type FC } from 'react';
import { cn } from '@/utils/cn';

interface TestCaseCardProps {
  testCase: TestCase;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export const TestCaseCard: FC<TestCaseCardProps> = ({
  testCase,
  isSelected = false,
  onSelect,
  className,
}) => {
  return (
    <div
      className={cn(
        'p-4 border rounded-lg cursor-pointer transition-colors',
        isSelected && 'border-primary bg-primary/5',
        className
      )}
      onClick={() => onSelect?.(testCase.id)}
    >
      {/* Component content */}
    </div>
  );
};
```

### Hook Pattern

```tsx
// hooks/useTestCases.ts
import { useGetTestCasesQuery, useCreateTestCaseMutation } from '@/store/api';

export function useTestCases(projectId: string, filters?: TestCaseFilters) {
  const { data, isLoading, error, refetch } = useGetTestCasesQuery({
    projectId,
    ...filters,
  });

  const [createTestCase, { isLoading: isCreating }] = useCreateTestCaseMutation();

  return {
    testCases: data?.items ?? [],
    totalCount: data?.total ?? 0,
    isLoading,
    isCreating,
    error,
    refetch,
    createTestCase,
  };
}
```

### RTK Query API Slice

```tsx
// store/api/testCasesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const testCasesApi = createApi({
  reducerPath: 'testCasesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['TestCase', 'TestRun'],
  endpoints: (builder) => ({
    getTestCases: builder.query<PaginatedResponse<TestCase>, GetTestCasesParams>({
      query: ({ projectId, ...params }) => ({
        url: `/projects/${projectId}/cases`,
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.items.map(({ id }) => ({ type: 'TestCase' as const, id })), 'TestCase']
          : ['TestCase'],
    }),
    createTestCase: builder.mutation<TestCase, CreateTestCaseDto>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/cases`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TestCase'],
    }),
  }),
});
```

---

## 🔒 Authentication & Authorization

### JWT Token Structure

```typescript
// Access Token Payload
{
  sub: string; // User ID
  email: string;
  orgId: string; // Organization ID
  role: UserRole;
  iat: number;
  exp: number; // 15 minutes
}

// Refresh Token - stored in httpOnly cookie
// Rotated on each refresh, 7-day expiry
```

### Role-Based Access Control

```typescript
enum UserRole {
  VIEWER = 'viewer',       // Read-only access
  TESTER = 'tester',       // Execute tests, add results
  LEAD = 'lead',           // + Create/edit tests, manage runs
  PROJECT_ADMIN = 'project_admin',  // + Manage project settings
  ORG_ADMIN = 'org_admin', // Full access
}

// Permission decorator usage
@Permissions(Permission.CREATE_TEST_CASE)
@UseGuards(JwtAuthGuard, PermissionsGuard)
async createTestCase() { }
```

---

## 🧪 Testing Guidelines

### Frontend Tests

```tsx
// TestCaseCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TestCaseCard } from './TestCaseCard';

describe('TestCaseCard', () => {
  const mockTestCase = {
    id: '1',
    title: 'Login with valid credentials',
    priority: 'high',
    status: 'passed',
  };

  it('should render test case title', () => {
    render(<TestCaseCard testCase={mockTestCase} />);
    expect(screen.getByText('Login with valid credentials')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<TestCaseCard testCase={mockTestCase} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('article'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### Backend Tests

```typescript
// test-cases.service.spec.ts
describe('TestCasesService', () => {
  let service: TestCasesService;
  let repository: MockType<Repository<TestCase>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TestCasesService,
        { provide: getRepositoryToken(TestCase), useFactory: repositoryMockFactory },
      ],
    }).compile();

    service = module.get(TestCasesService);
    repository = module.get(getRepositoryToken(TestCase));
  });

  describe('create', () => {
    it('should create a test case with version 1', async () => {
      const dto: CreateTestCaseDto = { title: 'Test', sectionId: '1' };
      repository.save.mockResolvedValue({ ...dto, id: '1', version: 1 });

      const result = await service.create(dto, 'user-1');

      expect(result.version).toBe(1);
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
```

---

## 📝 Coding Conventions

### TypeScript

```typescript
// ✅ DO: Explicit types, interfaces for objects
interface TestCase {
  id: string;
  title: string;
  steps: TestStep[];
}

// ❌ DON'T: Use 'any'
const data: any = response; // NEVER

// ✅ DO: Use const assertions for literals
const STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
} as const;

// ✅ DO: Use discriminated unions
type Result = { success: true; data: TestCase } | { success: false; error: string };
```

### React

```tsx
// ✅ DO: Destructure props, use explicit return types
const Button: FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  return (
    <button className={cn('btn', `btn-${variant}`)} {...props}>
      {children}
    </button>
  );
};

// ❌ DON'T: Use inline functions in render for event handlers that don't need closure
<button onClick={() => handleClick(item.id)} />; // Creates new function each render

// ✅ DO: Use useCallback for stable references
const handleItemClick = useCallback(
  (id: string) => {
    // handler logic
  },
  [dependencies]
);
```

### NestJS

```typescript
// ✅ DO: Use DTOs with validation
export class CreateTestCaseDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @IsUUID()
  sectionId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestStepDto)
  steps?: TestStepDto[];
}

// ✅ DO: Use proper response DTOs
@Get(':id')
@ApiOkResponse({ type: TestCaseResponseDto })
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TestCaseResponseDto> {
  return this.testCasesService.findOne(id);
}
```

---

## 🚀 Common Tasks

### Adding a New Feature Module (Backend)

1. Generate module: `nest g module modules/feature-name`
2. Generate controller: `nest g controller modules/feature-name`
3. Generate service: `nest g service modules/feature-name`
4. Create entity in `modules/feature-name/entities/`
5. Create DTOs in `modules/feature-name/dto/`
6. Add to `app.module.ts` imports
7. Create migration: `npm run migration:generate -- -n AddFeatureName`

### Adding a New Page (Frontend)

1. Create page component in `pages/`
2. Add route in `router.tsx`
3. Create feature components in `components/features/`
4. Add API endpoints to RTK Query slice
5. Create custom hooks if needed
6. Add to navigation if applicable

### Adding a New Integration

1. Create integration module in `modules/integrations/`
2. Implement adapter interface
3. Add OAuth flow if needed
4. Create webhook handlers
5. Add to integration registry
6. Document in API docs

---

## ⚠️ Important Notes

### Performance Considerations

- Always paginate list endpoints (default: 25, max: 100)
- Use `select` in TypeORM to fetch only needed columns
- Virtualize long lists in UI (TanStack Virtual)
- Debounce search inputs (300ms)
- Use Redis for caching frequently accessed data

### Security Checklist

- [ ] Validate all input with DTOs
- [ ] Check resource ownership before operations
- [ ] Use parameterized queries (TypeORM handles this)
- [ ] Sanitize user-generated content
- [ ] Rate limit sensitive endpoints
- [ ] Log security-relevant events

### Multi-tenancy

- All queries MUST include organization/project context
- Use guards to verify resource access
- Tenant ID should be extracted from JWT, not from request

### Soft Deletes

- Use `deleted_at` timestamp, never hard delete
- Filter out deleted records in queries by default
- Provide admin endpoints for permanent deletion if needed

---

## 🐛 Debugging Tips

### Backend

```bash
# Enable debug logging
DEBUG=* npm run start:dev

# Check database queries
# In TypeORM config: logging: true

# Test specific endpoint
curl -X GET http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Frontend

```tsx
// Use React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Redux DevTools is enabled by default in dev

// Log RTK Query cache
console.log(store.getState().testCasesApi);
```

---

## 📚 Resources

- [PRD Document](./docs/PRD.md)
- [API Documentation](http://localhost:3000/api/docs)
- [Figma Designs](https://figma.com/...)
- [Architecture Decision Records](./docs/architecture/adr/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/TICKET-description`
2. Make changes following coding standards
3. Write/update tests
4. Run `npm run lint` and `npm run test`
5. Create PR with description and screenshots
6. Request review from at least 1 team member
7. Address feedback and merge

---

_Last updated: January 2026_
