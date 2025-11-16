# AI Coding Agent Instructions - RequirmentDrive Frontend

## Project Overview
**RequirmentDrive** is an Angular 20 standalone components application for managing job postings, candidate profiles, and job applications. The system supports both HR and candidate roles with a hierarchical structure: Jobs → Candidates → Applications.

## Architecture

### Standalone Components Pattern
- **No NgModules**: Uses Angular 20 standalone components exclusively
- **Feature-based organization**: Features grouped in `src/app/features/` with self-contained component bundles
- **Lazy loading**: Dashboard and child routes enable code splitting
- **Routing config**: `app.routes.ts` defines all routes; dashboard is the main container with nested routes

### Core Service Layer
Located in `src/app/core/services/`:
- **ApiService**: HTTP wrapper with query param serialization (dates converted to ISO strings)
- **JobService, CandidateService, ApplicationService**: Domain-specific services extending ApiService
- **Auth service**: Placeholder (`src/app/core/services/auth.ts`) - implementation pending

### Data Models
All models in `src/app/shared/models/`:
- **Interface patterns**: Separate `*` for read, `Create*Dto` for creation, `Update*Dto` for updates
- **Paging**: `PagedResult<T>` wraps responses with `items[]`, `totalCount`, `totalPages`
- **Enums**: `ApplicationStatus` (New, Shortlisted, Rejected, Hired) drives UI badge styling
- **Soft deletes**: Candidates use `isDeleted` flag; jobs use `isActive`
- **Concurrency**: `rowVersion` field for optimistic updates (backend-enforced)

### Common Patterns Observed
1. **Pagination**: `pageNumber` (1-indexed), `pageSize` (default 10) in filter objects
2. **Sorting**: `sortBy` + `sortOrder` ('asc'|'desc') passed through filters
3. **Filtering**: Filter DTOs accumulate criteria, cleared via explicit `clearFilters()` methods
4. **Status styling**: Map enum values to Bootstrap badge classes (`badge bg-{primary|info|success|danger}`)

## Development Workflow

### Commands
```bash
npm start          # ng serve, runs on http://localhost:4200
npm run build      # Production build to dist/
npm run watch      # Watch mode for dev (ng build --watch --config development)
npm test           # Karma + Jasmine suite
```

### Testing Strategy
- **Unit tests**: Jasmine + Karma, config in `tsconfig.spec.json`
- **E2E tests**: Not yet configured (see README)
- **File naming**: `*.spec.ts` for test files

### Code Style
- **Prettier config**: 100 char line width, single quotes, Angular HTML parser
- **File structure**: Components typically 4 files (`.ts`, `.html`, `.css`, `.spec.ts`)
- **Imports**: Bootstrap CSS included globally in `angular.json`, bootstrap-icons for UI

## Key Integration Points

### Backend API
- **Base URL**: `http://localhost:5199/api` (configured in `src/environments/environment.ts`)
- **Endpoints used**:
  - `GET /api/jobs` → returns `PagedResult<Job>`
  - `GET /api/candidates` → returns `PagedResult<Candidate>`
  - `GET /api/candidates/search` → query param based search
  - `GET /api/applications` → accepts `ApplicationFilter` (status, jobId, dates, pagination)
  - CRUD operations: `/jobs/{id}`, `/candidates/{id}`, `/applications`
- **Error handling**: Components log errors to console, display user-facing messages via `error` string properties

### Feature Modules (Examples)
- **applications**: Create/list/status management with multi-filter capability
- **jobs**: CRUD with reusable create form for create/edit
- **candidates**: List, create, details views + new **candidate-dashboard** for tracking applications
- **candidate-dashboard**: Dedicated dashboard for candidates to track all their applications by status
- **auth**: Login routes exist but Auth service unimplemented

## Critical Implementation Gotchas

1. **Date serialization**: ApiService converts Date objects to ISO strings in query params—ensure models use Date type
2. **Soft deletes vs hard**: Candidate filtering sometimes requires `.filter(c => !c.isDeleted)` in components—don't rely on API
3. **Stats loading**: Dashboard loads stats sequentially via multiple subscriptions; consider refactoring to forkJoin for performance
4. **Pagination math**: `getPageNumbers()` in application-list uses complex logic; preserve when modifying
5. **Route redirection**: Missing `/dashboard` guard—any user can access if they know the URL

## File Organization Quick Reference
```
src/app/
  core/                    # Singleton services, guards, interceptors
    services/              # ApiService subclasses (job, candidate, application)
    guards/                # Route guards (auth.guard.ts - empty)
  features/                # Feature modules (applications, candidates, jobs, auth)
  layout/                  # Shell components (dashboard, header, footer)
  shared/                  # Models, shared components
    models/                # Interface definitions (job, candidate, application, paged-result)
```

## Common Tasks

**Adding a new service method**: Extend `ApiService`, follow pattern in `JobService` (single responsibility per method)

**Creating a new list component**: 
- Import service + models
- Use `ApplicationListComponent` as template
- Implement filter object + pagination logic
- Map enum to CSS classes for status displays

**Modifying models**: Update interface in `src/app/shared/models/*`, cascade to service method signatures, update API calls in services

**Adding a feature route**: Update `app.routes.ts` with component import and child route definition

---
**Last Updated**: November 2025 | Angular 20 | Standalone Components
