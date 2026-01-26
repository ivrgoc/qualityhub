# 📘 QUALITY_STANDARDS.md

## QualityHub – Engineering & Delivery Standards

---

## 1. Purpose

This document defines technical, architectural, security, and quality standards for the QualityHub platform.

All contributors (human and AI) must follow these rules to ensure:

* Maintainable code
* High security
* Scalability
* Consistent architecture
* Production readiness

This document is binding for all development work.

---

## 2. General Engineering Principles

### 2.1 Code Quality

* TypeScript strict mode is mandatory
* `any` type is forbidden
* All public functions must have explicit types
* Prefer `const` over `let`
* No `var`
* Max function length: **50 lines**
* Max file length: **400 lines**
* One responsibility per file
* DRY (Don’t Repeat Yourself)

### 2.2 Style

* Use meaningful names
* No abbreviations
* Self-documenting code
* Minimal comments (only for complex logic)

---

## 3. Frontend Standards (React + TypeScript)

### 3.1 Architecture

* Functional components only
* Hooks-based design
* Feature-based folder structure
* Custom hooks for logic reuse

### 3.2 State Management

* RTK Query for API
* Redux for shared state
* Local state in components
* No derived state in store

### 3.3 Styling

* Tailwind CSS only
* No inline styles
* Mobile-first
* Use `cn()` helper

### 3.4 File Structure

```
src/
├── components/
├── pages/
├── hooks/
├── store/
├── services/
├── utils/
├── types/
└── assets/
```

### 3.5 Naming

| Type       | Convention      |
| ---------- | --------------- |
| Components | PascalCase      |
| Hooks      | useCamelCase    |
| Utils      | camelCase       |
| Constants  | SCREAMING_SNAKE |
| Tests      | *.test.tsx      |

---

## 4. Backend Standards (NestJS)

### 4.1 Architecture

* Modular structure
* Service-oriented
* Controllers = HTTP only
* Services = business logic
* Repositories = DB logic

### 4.2 API Design

* RESTful
* Versioned APIs
* Proper HTTP codes
* Pagination by default
* Consistent error format

### 4.3 Validation

* DTO + class-validator
* Zod for complex cases
* Input sanitization

---

## 5. Database Standards

### 5.1 Schema

* PostgreSQL only
* UUID primary keys
* Migrations mandatory
* Soft deletes
* Timestamps

### 5.2 Naming

| Type    | Format            |
| ------- | ----------------- |
| Tables  | snake_case plural |
| Columns | snake_case        |
| Indexes | idx_*             |
| FK      | *_id              |

### 5.3 Performance

* Index foreign keys
* Avoid SELECT *
* No N+1 queries
* Use transactions

---

## 6. Security Standards

### 6.1 Authentication

* JWT (access + refresh)
* Short-lived tokens
* httpOnly cookies
* Rate limiting

### 6.2 Authorization

* RBAC enforced
* Permission checks everywhere
* Guard-based protection

### 6.3 Data Protection

* AES-256 at rest
* TLS 1.3
* No sensitive logs
* Parameterized queries

### 6.4 Secrets

* Env vars only
* No secrets in Git
* Rotate keys

---

## 7. Testing Standards

### 7.1 Coverage

* Minimum: **80%**
* Unit + Integration + E2E

### 7.2 Frontend

* RTL for components
* MSW for API
* Playwright for flows

### 7.3 Backend

* Jest
* Test DB
* Contract tests

### 7.4 Naming

```ts
describe('ComponentName', () => {})
it('should do X when Y')
```

---

## 8. Git & Workflow

### 8.1 Branching

```
main
develop
feature/*
bugfix/*
hotfix/*
release/*
```

### 8.2 Commits (Conventional)

```
feat:
fix:
docs:
refactor:
test:
chore:
```

### 8.3 Pull Requests

* Linked ticket
* Screenshots if UI
* CI green
* 1+ reviewer

---

## 9. Documentation Standards

### 9.1 Code

* JSDoc for public APIs
* README per module

### 9.2 API

* Swagger/OpenAPI
* Examples
* Versioned

### 9.3 Project

* ADRs
* Setup guides
* Changelog

---

## 10. Performance Targets

### Frontend

* FCP < 1.5s
* Bundle < 500KB
* Lazy loading

### Backend

* p95 < 200ms
* Caching
* Async jobs

### Database

* EXPLAIN ANALYZE
* Materialized views

---

## 11. Forbidden Practices ❌

* Using `any`
* Committing secrets
* console.log in prod
* Plaintext passwords
* eval()
* Disabling strict mode
* Skipping reviews
* Hardcoding configs
* Ignoring security warnings

---

## 12. Code Review Checklist

Before merging:

* ✅ Standards followed
* ✅ Tests added
* ✅ Security reviewed
* ✅ Performance ok
* ✅ Docs updated

---

## 13. Definition of Done

A feature is done when:

* Builds successfully
* Tests pass
* Coverage ≥ 80%
* Reviewed
* Documented
* Deployed to staging
* Approved

---

## 14. AI Usage Policy

When using AI tools:

* Generated code must follow this document
* Human review required
* No blind merges
* Security-sensitive code must be audited

---

## 15. Ownership

Maintainer: **Project Lead / Tech Lead**

This document is reviewed quarterly.

---

# ✅ Compliance

All contributors agree to follow this standard.

---


