# QualityHub PRD

> **AI-Powered Test Management Platform**
>
> A modern test management solution for QA teams with AI-assisted test generation,
> real-time execution tracking, and comprehensive reporting.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit, Radix UI
- **Backend:** NestJS, TypeScript, PostgreSQL 16, Redis, TypeORM
- **AI Service:** Python 3.11, FastAPI, OpenAI/Anthropic
- **Infrastructure:** Docker, Docker Compose, pnpm workspaces

---

## Phase 1: Infrastructure Setup

### 1.1 Monorepo Foundation

- [x] Initialize pnpm workspace with `pnpm init` and create `pnpm-workspace.yaml` containing `apps/*` and `packages/*`
- [x] Create root `package.json` with scripts: dev, build, test, lint, format, and db:migrate
- [x] Create `turbo.json` with build pipeline (build → test → lint) and persistent dev task
- [x] Create `tsconfig.base.json` with strict mode, ES2022 target, and bundler module resolution
- [x] Create `.gitignore` for node_modules, dist, .env, coverage, and IDE files
- [x] Create `.prettierrc` with singleQuote, semi, tabWidth 2, and trailingComma es5
- [x] Create `.nvmrc` with Node version 20.11.0

### 1.2 Directory Structure

- [x] Create `apps/api` directory for NestJS backend
- [x] Create `apps/web` directory for React frontend
- [x] Create `apps/ai-service` directory for Python FastAPI
- [x] Create `packages/shared-types` directory for TypeScript interfaces
- [x] Create `packages/eslint-config` directory for shared ESLint rules
- [x] Create `infrastructure/docker` directory for Dockerfiles
- [x] Create `docs` directory for documentation

### 1.3 Shared Types Package

- [x] Create `packages/shared-types/package.json` with name `@qualityhub/shared-types`
- [x] Create `packages/shared-types/tsconfig.json` with declaration output enabled
- [x] Create `packages/shared-types/src/user.ts` with User interface and UserRole enum (VIEWER, TESTER, LEAD, ADMIN)
- [x] Create `packages/shared-types/src/project.ts` with Project and ProjectMember interfaces
- [x] Create `packages/shared-types/src/test-case.ts` with TestCase, TestStep interfaces and Priority, Template enums
- [x] Create `packages/shared-types/src/test-run.ts` with TestRun, TestResult interfaces and TestStatus enum
- [x] Create `packages/shared-types/src/api.ts` with ApiResponse, PaginatedResponse, ErrorResponse interfaces
- [x] Create `packages/shared-types/src/index.ts` exporting all types

### 1.4 Docker Setup

- [x] Create `docker-compose.yml` with postgres:16, redis:7, and mailhog services
- [x] Create `infrastructure/docker/Dockerfile.api` with multi-stage Node build
- [x] Create `infrastructure/docker/Dockerfile.web` with Vite build and nginx serve
- [x] Create `infrastructure/docker/Dockerfile.ai` with Python 3.11 and uvicorn
- [x] Create `.env.example` documenting DATABASE_URL, REDIS_URL, JWT_SECRET, OPENAI_API_KEY

---

## Phase 2: Backend API

### 2.1 NestJS Project Setup

- [x] Initialize NestJS in `apps/api` with Express platform
- [x] Create `apps/api/package.json` with @nestjs/\*, typeorm, pg, passport-jwt, bcrypt dependencies
- [x] Create `apps/api/tsconfig.json` with decorators and path aliases enabled
- [x] Create `apps/api/src/main.ts` with ValidationPipe, CORS, Swagger, and /api/v1 prefix
- [x] Create `apps/api/src/app.module.ts` importing Config, Database, Auth, and feature modules

### 2.2 Configuration

- [x] Create `apps/api/src/config/configuration.ts` with typed config for database, jwt, redis, app
- [x] Create `apps/api/src/config/validation.schema.ts` with Joi validation for env variables
- [x] Create `apps/api/src/config/database.config.ts` with TypeORM async configuration

### 2.3 Database Migrations

- [x] Create migration for `organizations` table (id, name, slug, plan, settings, created_at)
- [x] Create migration for `users` table (id, org_id, email, password_hash, name, role, created_at)
- [x] Create migration for `projects` table (id, org_id, name, description, settings, timestamps, deleted_at)
- [x] Create migration for `test_suites` table (id, project_id, name, description, created_at)
- [x] Create migration for `sections` table (id, suite_id, name, parent_id, position, created_at)
- [x] Create migration for `test_cases` table (id, section_id, title, template, steps, priority, version, timestamps)
- [x] Create migration for `test_case_versions` table (id, case_id, version, data, changed_by, created_at)
- [x] Create migration for `milestones` table (id, project_id, name, due_date, is_completed)
- [x] Create migration for `test_plans` table (id, project_id, milestone_id, name, created_at)
- [x] Create migration for `test_runs` table (id, project_id, plan_id, name, config, assignee_id, timestamps)
- [x] Create migration for `test_results` table (id, run_id, case_id, status, comment, elapsed, defects, executed_at)
- [x] Create migration for `requirements` table (id, project_id, external_id, title, status)
- [x] Create migration for `attachments` table (id, entity_type, entity_id, filename, path, size, mime)
- [x] Create migration to add indexes on foreign keys and commonly queried columns

### 2.4 Common Module

- [x] Create `@CurrentUser()` decorator to extract user from request
- [x] Create `@Public()` decorator to skip authentication
- [x] Create `JwtAuthGuard` extending AuthGuard with public route bypass
- [x] Create `PermissionsGuard` checking user role against required permissions
- [x] Create `HttpExceptionFilter` with consistent error response format
- [x] Create `TransformInterceptor` wrapping responses in {success, data, timestamp}
- [x] Create `PaginationDto` with page, limit, sortBy, sortOrder fields
- [x] Create password utility with bcrypt hash (12 rounds) and compare functions

### 2.5 Auth Module

- [x] Create `AuthModule` with Passport, JWT configuration
- [x] Create `AuthController` with POST /register, /login, /logout, /refresh, GET /me
- [x] Create `AuthService` with register, validateUser, login, refreshTokens, logout methods
- [x] Create `JwtStrategy` validating tokens and returning user payload
- [x] Create `LocalStrategy` for email/password authentication
- [x] Create `RegisterDto` with email, password (min 12), name, organizationName validation
- [x] Create `LoginDto` with email, password validation
- [x] Create `AuthResponseDto` with user object and tokens

### 2.6 Users Module

- [x] Create `UsersModule` with TypeORM User and RefreshToken entities
- [x] Create `User` entity with id, email, passwordHash, name, role, organization relation
- [x] Create `RefreshToken` entity with token, expiresAt, user relation
- [x] Create `UsersService` with findById, findByEmail, create, update, delete methods
- [x] Create `UsersController` with GET /, GET /:id, PATCH /:id, DELETE /:id endpoints

### 2.7 Organizations Module

- [x] Create `OrganizationsModule` with Organization entity
- [x] Create `Organization` entity with name, slug, plan, settings, users relation
- [x] Create `OrganizationsService` with create, findById, update, getMembers methods
- [x] Create `OrganizationsController` with GET /current, PATCH, GET /members endpoints

### 2.8 Projects Module

- [x] Create `ProjectsModule` with Project and ProjectMember entities
- [x] Create `Project` entity with name, description, settings, soft delete, members relation
- [x] Create `ProjectMember` entity with userId, projectId, role
- [x] Create `ProjectsService` with CRUD and member management methods
- [x] Create `ProjectsController` with full CRUD and /members endpoints
- [x] Create `CreateProjectDto` and `AddMemberDto` with validation

### 2.9 Test Suites Module

- [x] Create `TestSuitesModule` with TestSuite and Section entities
- [x] Create `TestSuite` entity with name, description, project relation
- [x] Create `Section` entity with name, parentId self-reference, position, test cases relation
- [x] Create `TestSuitesService` with suite CRUD and section tree operations
- [x] Create `TestSuitesController` with /suites and /sections endpoints

### 2.10 Test Cases Module

- [x] Create `TestCasesModule` with TestCase and TestCaseVersion entities
- [x] Create `TestCase` entity with title, template, steps (JSONB), priority, version, soft delete
- [x] Create `TestCaseVersion` entity storing historical snapshots
- [x] Create `TestCasesService` with CRUD, versioning on update, bulk operations
- [x] Create `TestCasesController` with CRUD, /history, /bulk endpoints
- [x] Create `CreateTestCaseDto` with nested TestStepDto validation
- [x] Create `BulkMoveDto` and `BulkDeleteDto` for bulk operations

### 2.11 Milestones Module

- [x] Create `MilestonesModule` with Milestone entity
- [x] Create `Milestone` entity with name, dueDate, isCompleted, test plans relation
- [x] Create `MilestonesService` with CRUD and progress calculation
- [x] Create `MilestonesController` with CRUD endpoints

### 2.12 Test Plans Module

- [x] Create `TestPlansModule` with TestPlan entity
- [x] Create `TestPlan` entity with name, milestone relation, entries
- [x] Create `TestPlansService` with CRUD and entry management
- [x] Create `TestPlansController` with CRUD and /entries endpoints

### 2.13 Test Runs Module

- [x] Create `TestRunsModule` with TestRun and TestResult entities
- [x] Create `TestRun` entity with name, config, assignee, timestamps
- [x] Create `TestResult` entity with status enum, comment, elapsed, defects (JSONB)
- [x] Create `TestRunsService` with CRUD, result recording, progress aggregation
- [x] Create `TestRunsController` with CRUD, /results, /close endpoints
- [x] Create `AddResultDto` with status, comment, elapsed, defects validation

### 2.14 Requirements Module

- [x] Create `RequirementsModule` with Requirement and coverage entities
- [x] Create `Requirement` entity with externalId, title, status, test case links
- [x] Create `RequirementsService` with CRUD and coverage calculation
- [x] Create `RequirementsController` with CRUD and /coverage endpoints

### 2.15 Reports Module

- [ ] Create `ReportsModule` aggregating data from other modules
- [ ] Create `ReportsService` with getSummary, getCoverage, getDefects, getTrends methods
- [ ] Create `ReportsController` with /summary, /coverage, /defects, /trends endpoints
- [ ] Create PDF export using pdfkit
- [ ] Create Excel export using exceljs

### 2.16 Attachments Module

- [ ] Create `AttachmentsModule` with Attachment entity and storage service
- [ ] Create `Attachment` entity with polymorphic entity_type/entity_id, filename, path
- [ ] Create storage interface with local and S3 implementations
- [ ] Create `AttachmentsController` with POST /upload, GET /:id/download, DELETE /:id

### 2.17 Dashboard Module

- [ ] Create `DashboardModule` aggregating widget data
- [ ] Create `DashboardService` with getStats, getActivity, getTodo methods
- [ ] Create `DashboardController` with GET / returning all widget data

---

## Phase 3: AI Service

### 3.1 FastAPI Setup

- [ ] Create `apps/ai-service/requirements.txt` with fastapi, uvicorn, pydantic, openai, langchain
- [ ] Create `apps/ai-service/app/main.py` with FastAPI app, CORS, health endpoint
- [ ] Create `apps/ai-service/app/core/config.py` with Settings using pydantic-settings
- [ ] Create `apps/ai-service/app/core/security.py` with API key validation dependency

### 3.2 Test Generation

- [ ] Create `apps/ai-service/app/schemas/generation.py` with request/response Pydantic models
- [ ] Create `apps/ai-service/app/prompts/test_generation.py` with system and user prompt templates
- [ ] Create `apps/ai-service/app/prompts/bdd_generation.py` with Gherkin prompt templates
- [ ] Create `apps/ai-service/app/services/llm_client.py` abstracting OpenAI/Anthropic calls
- [ ] Create `apps/ai-service/app/services/test_generator.py` with generate_tests method
- [ ] Create `apps/ai-service/app/services/bdd_generator.py` with generate_scenarios method
- [ ] Create `apps/ai-service/app/api/routes/generate.py` with POST /generate/tests and /generate/bdd

### 3.3 NestJS AI Integration

- [ ] Create `apps/api/src/modules/ai/ai.module.ts` with HttpModule
- [ ] Create `apps/api/src/modules/ai/ai.service.ts` calling FastAPI endpoints
- [ ] Create `apps/api/src/modules/ai/ai.controller.ts` with POST /ai/generate-tests, /ai/generate-bdd

---

## Phase 4: Frontend Application

### 4.1 React Project Setup

- [ ] Initialize Vite React TypeScript project in `apps/web`
- [ ] Install dependencies: react-router-dom, @reduxjs/toolkit, react-redux, tailwindcss, @radix-ui/\*, lucide-react, react-hook-form, zod, recharts, date-fns
- [ ] Create `apps/web/tailwind.config.js` with custom theme colors and Radix UI integration
- [ ] Create `apps/web/vite.config.ts` with @ path alias and API proxy
- [ ] Create `apps/web/src/styles/globals.css` with Tailwind directives and CSS variables

### 4.2 Redux Store

- [ ] Create `apps/web/src/store/index.ts` with configureStore and middleware
- [ ] Create `apps/web/src/store/hooks.ts` with typed useAppDispatch and useAppSelector
- [ ] Create `apps/web/src/store/api/baseApi.ts` with createApi, auth headers, tag types
- [ ] Create `apps/web/src/store/api/authApi.ts` with login, register, logout, getMe endpoints
- [ ] Create `apps/web/src/store/api/projectsApi.ts` with projects CRUD endpoints
- [ ] Create `apps/web/src/store/api/testCasesApi.ts` with test cases CRUD and bulk endpoints
- [ ] Create `apps/web/src/store/api/testRunsApi.ts` with runs CRUD and results endpoints
- [ ] Create `apps/web/src/store/api/reportsApi.ts` with report generation endpoints
- [ ] Create `apps/web/src/store/slices/authSlice.ts` with user state and credentials actions
- [ ] Create `apps/web/src/store/slices/uiSlice.ts` with sidebar, modal, theme state

### 4.3 Utility Functions

- [ ] Create `apps/web/src/utils/cn.ts` with clsx and tailwind-merge className utility
- [ ] Create `apps/web/src/utils/api.ts` with fetch wrapper handling auth and errors
- [ ] Create `apps/web/src/utils/storage.ts` with token get/set/remove helpers
- [ ] Create `apps/web/src/utils/date.ts` with formatDate, formatRelativeTime using date-fns
- [ ] Create `apps/web/src/utils/status.ts` with getStatusColor, getStatusIcon helpers

### 4.4 Base UI Components

- [ ] Create Button component with variants: default, destructive, outline, secondary, ghost, link
- [ ] Create Input component with error state and icon support
- [ ] Create Textarea component with auto-resize option
- [ ] Create Select component using Radix Select
- [ ] Create Checkbox component using Radix Checkbox
- [ ] Create Switch component using Radix Switch
- [ ] Create Dialog component using Radix Dialog with header, content, footer
- [ ] Create DropdownMenu component using Radix DropdownMenu
- [ ] Create Popover component using Radix Popover
- [ ] Create Tooltip component using Radix Tooltip
- [ ] Create Tabs component using Radix Tabs
- [ ] Create Avatar component with fallback initials
- [ ] Create Badge component with status variants (passed, failed, blocked, skipped)
- [ ] Create Card component with header, content, footer sections
- [ ] Create Alert component with info, success, warning, error variants
- [ ] Create Toast component using Radix Toast with useToast hook
- [ ] Create Skeleton component for loading states
- [ ] Create Spinner component with animated loader icon
- [ ] Create Progress component using Radix Progress
- [ ] Create Table components (Table, TableHeader, TableBody, TableRow, TableCell)
- [ ] Create Pagination component with page numbers and navigation
- [ ] Create EmptyState component with icon, title, description, action
- [ ] Create ConfirmDialog component for destructive actions

### 4.5 Layout Components

- [ ] Create `apps/web/src/router.tsx` with route configuration and lazy loading
- [ ] Create RootLayout with ToastProvider and global error boundary
- [ ] Create AuthLayout with centered card design for login/register
- [ ] Create DashboardLayout with Sidebar, Header, and content area
- [ ] Create Sidebar with navigation items, project switcher, user avatar
- [ ] Create Header with breadcrumbs, search, notifications, user menu
- [ ] Create Breadcrumbs generating navigation from current route
- [ ] Create AuthGuard redirecting unauthenticated users to login
- [ ] Create GuestGuard redirecting authenticated users to dashboard

### 4.6 Auth Pages

- [ ] Create LoginPage with email/password form, remember me, forgot password link
- [ ] Create RegisterPage with name, email, organization, password form
- [ ] Create ForgotPasswordPage with email input and success state
- [ ] Create ResetPasswordPage with new password form
- [ ] Create useAuth hook with login, logout, register, user state

### 4.7 Dashboard Page

- [ ] Create DashboardPage with stats grid, activity feed, todo list, recent runs
- [ ] Create StatsCard with icon, label, value, trend indicator
- [ ] Create ActivityFeed with activity items showing user, action, timestamp
- [ ] Create TodoList with assigned tests and checkbox to mark complete
- [ ] Create RecentRunsTable showing name, progress, pass rate, date
- [ ] Create useDashboard hook fetching dashboard data

### 4.8 Projects Pages

- [ ] Create ProjectsListPage with grid view of project cards and create button
- [ ] Create ProjectDetailPage with tabs navigation and nested routes
- [ ] Create ProjectOverviewPage with stats and quick actions
- [ ] Create ProjectSettingsPage with form and danger zone
- [ ] Create ProjectCard with name, stats, member count
- [ ] Create CreateProjectDialog with name and description form
- [ ] Create ProjectMembers component with member list and add/remove

### 4.9 Test Cases Pages

- [ ] Create TestCasesPage with three-column layout: tree, list, detail
- [ ] Create SectionTree with recursive rendering, expand/collapse, drag-drop
- [ ] Create TestCaseList with virtualized scrolling, search, filters, bulk select
- [ ] Create TestCaseRow with checkbox, title, priority badge, template icon
- [ ] Create TestCaseDetail showing all fields with edit button
- [ ] Create TestCaseForm with react-hook-form for all fields
- [ ] Create StepsEditor with dynamic step list and drag-drop reorder
- [ ] Create BddEditor with syntax-highlighted Gherkin textarea
- [ ] Create BulkActionsBar with move, delete buttons when items selected
- [ ] Create AiGenerateDialog with requirements input and preview
- [ ] Create useTestCases hook with CRUD operations and selection state

### 4.10 Test Runs Pages

- [ ] Create TestRunsListPage with filters and run cards
- [ ] Create TestRunDetailPage with progress stats and results table
- [ ] Create TestExecutionPage with three-pane layout for execution
- [ ] Create TestRunCard with name, progress bar, pass rate, assignee
- [ ] Create CreateRunDialog with name, suite selection, assignee
- [ ] Create RunProgress with colored segments and legend
- [ ] Create ExecutionTestList with test list and status filter
- [ ] Create ExecutionTestDetail showing test case content
- [ ] Create ExecutionResultForm with status buttons, comment, elapsed time
- [ ] Create StatusSelector with keyboard shortcut hints (P, F, B, S)
- [ ] Create useTestExecution hook managing state and keyboard navigation

### 4.11 Milestones & Plans Pages

- [ ] Create MilestonesPage with timeline or list view
- [ ] Create MilestoneDetailPage with progress and linked plans
- [ ] Create TestPlansPage with plans list and create button
- [ ] Create TestPlanDetailPage with entries and reorder
- [ ] Create MilestoneCard with name, due date, progress
- [ ] Create CreateMilestoneDialog with name, description, due date

### 4.12 Reports Pages

- [ ] Create ReportsPage with report type cards and date picker
- [ ] Create ReportViewerPage rendering report with export buttons
- [ ] Create SummaryReport with stats, pie chart, trend chart
- [ ] Create CoverageReport with gauge and requirements list
- [ ] Create PassFailChart using Recharts PieChart
- [ ] Create TrendChart using Recharts LineChart
- [ ] Create ExportDialog with format selection

### 4.13 Requirements Pages

- [ ] Create RequirementsPage with requirements table and filters
- [ ] Create RequirementDetailPage with linked test cases
- [ ] Create RequirementList with coverage status badge
- [ ] Create LinkTestsDialog with searchable test case selection
- [ ] Create TraceabilityMatrix with requirements vs tests grid

### 4.14 Settings Pages

- [ ] Create SettingsPage with tabs: Profile, Organization, Integrations
- [ ] Create ProfileSettings with name, email, avatar, password change
- [ ] Create OrganizationSettings with org name and member management
- [ ] Create IntegrationsSettings with Jira connection form
- [ ] Create NotificationSettings with email preference toggles

---

## Phase 5: Testing & Polish

### 5.1 Backend Tests

- [ ] Create test setup with database seeding and cleanup
- [ ] Create auth.service.spec.ts testing register, login, refresh
- [ ] Create test-cases.service.spec.ts testing CRUD and versioning
- [ ] Create test-runs.service.spec.ts testing execution and progress
- [ ] Create auth.e2e-spec.ts testing full authentication flow
- [ ] Create test-cases.e2e-spec.ts testing API endpoints

### 5.2 Frontend Tests

- [ ] Create test setup with MSW handlers for API mocking
- [ ] Create Button.test.tsx testing variants and click handlers
- [ ] Create TestCaseForm.test.tsx testing form submission
- [ ] Create useAuth.test.ts testing authentication flow
- [ ] Create vitest.config.ts with testing configuration

### 5.3 E2E Tests

- [ ] Create Playwright configuration in apps/web/e2e
- [ ] Create auth.spec.ts testing login and register flows
- [ ] Create test-cases.spec.ts testing CRUD operations
- [ ] Create test-execution.spec.ts testing run execution

### 5.4 Documentation

- [ ] Create docs/setup.md with local development instructions
- [ ] Create docs/architecture.md with system design overview
- [ ] Create docs/api.md with endpoint documentation
- [ ] Update root README.md with project overview and quick start

### 5.5 Final Polish

- [ ] Add loading skeletons to all pages during data fetch
- [ ] Add error boundaries with retry option
- [ ] Implement optimistic updates for test status changes
- [ ] Add keyboard shortcuts modal (press ? to show)
- [ ] Implement dark mode with system preference detection
- [ ] Add empty states with helpful actions to all list views
- [ ] Implement route-based code splitting with React.lazy
- [ ] Run accessibility audit and fix ARIA labels
- [ ] Test responsive design on mobile and tablet
- [ ] Run Lighthouse audit and optimize performance

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Start databases
docker-compose up -d

# Run migrations
pnpm run db:migrate

# Start development
pnpm run dev
```

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/qualityhub

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=sk-...

# App
APP_URL=http://localhost:5173
API_URL=http://localhost:3000
NODE_ENV=development
```
