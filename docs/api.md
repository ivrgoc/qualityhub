# QualityHub API Documentation

Base URL: `http://localhost:3001/api/v1`

Interactive documentation available at: `http://localhost:3001/api/docs`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### POST /auth/register

Register a new user and organization.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "organizationName": "Acme Corp"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "org_admin",
  "organizationId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "tester",
    "orgId": "uuid"
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### POST /auth/logout

Logout and invalidate refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current user profile.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "tester",
  "organizationId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Projects

### GET /projects

List all projects for the current organization.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "organizationId": "uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
]
```

### POST /projects

Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Optional description"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "New Project",
  "description": "Optional description",
  "organizationId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /projects/:id

Get a project by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Project Name",
  "description": "Description",
  "settings": {},
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

### PATCH /projects/:id

Update a project.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`

### DELETE /projects/:id

Delete a project (soft delete).

**Response:** `204 No Content`

---

## Test Cases

### GET /projects/:projectId/cases

List test cases for a project.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 25, max: 100)
- `search` (string): Search in title
- `priority` (string): Filter by priority
- `sectionId` (string): Filter by section

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Login with valid credentials",
    "templateType": "steps",
    "priority": "high",
    "version": 1,
    "projectId": "uuid",
    "sectionId": "uuid",
    "createdBy": "uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /projects/:projectId/cases

Create a new test case.

**Request Body:**
```json
{
  "title": "Test Case Title",
  "templateType": "steps",
  "priority": "high",
  "preconditions": "User is logged in",
  "steps": [
    {
      "step": "Navigate to page",
      "expectedResult": "Page is displayed"
    }
  ],
  "expectedResult": "Overall expected result",
  "estimate": 15,
  "sectionId": "uuid"
}
```

**Response:** `201 Created`

### GET /projects/:projectId/cases/:id

Get a test case by ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Test Case Title",
  "templateType": "steps",
  "priority": "high",
  "preconditions": "Prerequisites",
  "steps": [...],
  "expectedResult": "Expected outcome",
  "estimate": 15,
  "version": 1,
  "projectId": "uuid",
  "sectionId": "uuid",
  "createdBy": "uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

### PATCH /projects/:projectId/cases/:id

Update a test case (creates new version).

**Request Body:**
```json
{
  "title": "Updated Title",
  "priority": "critical"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "version": 2,
  ...
}
```

### DELETE /projects/:projectId/cases/:id

Delete a test case (soft delete).

**Response:** `204 No Content`

### GET /projects/:projectId/cases/:id/history

Get version history for a test case.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "testCaseId": "uuid",
    "version": 1,
    "data": {...},
    "changedBy": "uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /projects/:projectId/cases/bulk

Bulk create test cases.

**Request Body:**
```json
{
  "testCases": [
    { "title": "Test 1", "priority": "high" },
    { "title": "Test 2", "priority": "medium" }
  ]
}
```

**Response:** `201 Created`

### DELETE /projects/:projectId/cases/bulk

Bulk delete test cases.

**Request Body:**
```json
{
  "ids": ["uuid1", "uuid2"]
}
```

**Response:** `200 OK`

---

## Test Runs

### GET /projects/:projectId/runs

List test runs for a project.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Regression Run",
    "status": "in_progress",
    "projectId": "uuid",
    "assigneeId": "uuid",
    "startedAt": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-15T00:00:00Z"
  }
]
```

### POST /projects/:projectId/runs

Create a new test run.

**Request Body:**
```json
{
  "name": "Sprint 5 Regression",
  "description": "Regression testing for sprint 5",
  "testPlanId": "uuid",
  "assigneeId": "uuid"
}
```

**Response:** `201 Created`

### GET /projects/:projectId/runs/:id

Get a test run with results.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Regression Run",
  "status": "in_progress",
  "progress": {
    "total": 20,
    "passed": 12,
    "failed": 3,
    "blocked": 2,
    "untested": 3
  },
  "results": [...]
}
```

### POST /projects/:projectId/runs/:id/results

Add or update test result.

**Request Body:**
```json
{
  "testCaseId": "uuid",
  "status": "passed",
  "comment": "Test passed successfully",
  "elapsedSeconds": 120,
  "defects": ["BUG-123"]
}
```

**Response:** `201 Created`

### PATCH /projects/:projectId/runs/:id/close

Close a test run.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "completed",
  "completedAt": "2024-01-16T15:00:00Z"
}
```

---

## Reports

### GET /projects/:projectId/reports/summary

Get project summary report.

**Response:** `200 OK`
```json
{
  "totalTestCases": 150,
  "totalTestRuns": 12,
  "passRate": 87.5,
  "byPriority": {
    "critical": 20,
    "high": 45,
    "medium": 60,
    "low": 25
  },
  "byStatus": {
    "passed": 100,
    "failed": 15,
    "blocked": 10,
    "skipped": 5,
    "untested": 20
  }
}
```

### GET /projects/:projectId/reports/coverage

Get requirements coverage report.

**Response:** `200 OK`
```json
{
  "totalRequirements": 50,
  "covered": 42,
  "partial": 5,
  "uncovered": 3,
  "coveragePercent": 84.0
}
```

### POST /projects/:projectId/reports/export

Export report in specified format.

**Request Body:**
```json
{
  "format": "pdf",
  "reportType": "summary",
  "dateRange": {
    "from": "2024-01-01",
    "to": "2024-01-31"
  }
}
```

**Response:** `200 OK` (Binary file download)

---

## Dashboard

### GET /dashboard

Get dashboard data for current user.

**Response:** `200 OK`
```json
{
  "stats": {
    "totalProjects": 5,
    "totalTestCases": 250,
    "totalTestRuns": 30,
    "passRate": 85.2
  },
  "recentActivity": [...],
  "todoItems": [...],
  "recentRuns": [...]
}
```

---

## AI Service

### POST /ai/generate-tests

Generate test cases from requirements.

**Request Body:**
```json
{
  "requirement": "User should be able to reset their password via email",
  "projectId": "uuid",
  "count": 5
}
```

**Response:** `200 OK`
```json
{
  "testCases": [
    {
      "title": "Reset password with valid email",
      "steps": [...],
      "priority": "high"
    }
  ]
}
```

### POST /ai/generate-bdd

Generate BDD scenarios.

**Request Body:**
```json
{
  "feature": "User Registration",
  "description": "New users should be able to create accounts"
}
```

**Response:** `200 OK`
```json
{
  "scenarios": [
    {
      "name": "Successful registration",
      "gherkin": "Feature: User Registration\n  Scenario: ..."
    }
  ]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 204  | No Content |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Duplicate resource |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error |

---

## Rate Limiting

API requests are rate limited:
- **Anonymous**: 100 requests per minute
- **Authenticated**: 1000 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```
