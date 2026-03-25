# Architecture

## High-Level System

Research Friend is a Next.js full-stack app with App Router.

- UI Layer: route pages and co-located components.
- Server Layer: API routes + server-side modules + selected server actions.
- Data Layer: Prisma + PostgreSQL.
- External Providers:
  - yahoo-finance2 for raw finance/company datasets.
  - OpenAI for section-level structured synthesis.

## Key Pages

1. Auth: login and registration.
2. Search: ticker/company discovery.
3. Dashboard: compact analytics and company snapshot.
4. Report: multi-section narrative + metrics.

## Implemented Read/Write Routes

- Dashboard read: `GET /api/dashboard/:symbol`
- Report section read/generate: `GET /api/report/:symbol/sections/:sectionKey`
- Report section enhancement: `POST /api/report/:symbol/sections/:sectionKey/enhance`

## Report Retrieval/Generation Flow (Section-Wise Lazy)

```text
User opens /report for symbol
  -> UI requests each section independently
     -> GET /api/report/:symbol/sections/:sectionKey
        -> Read section from DB
           -> Found: return section
           -> Not found:
              -> Fetch/build section input datasets
              -> OpenAI call for requested section
              -> Validate/normalize section output
              -> Persist section in report
              -> Return section
```

## Section Generation Strategy

- Each report section should be generated independently.
- OpenAI calls are separated by section.
- UI renders only available section payloads.
- Missing/failed sections are hidden (no heading/body rendered).
- Section skeleton loaders are shown while section load/enhancement is in progress.
- Section taxonomy should align with the sample equity-research style provided by the project owner (AJ Bell-style report structure).

## API Strategy (Current)

- GET operations via API routes.
- Mutations use a mixed strategy:
  - Server Actions for existing auth/vote/search write paths.
  - API route mutation for section enhancement to support client-driven updates.

## Data Model Expectations

At minimum, support these concepts:

- User identity
- Company metadata/ticker identity
- Report entity
- Report sections (versionable or updatable)
- Audit fields (`createdAt`, `updatedAt`)

## Reliability Requirements

- DB lookup before generation to avoid duplicate OpenAI costs.
- Provider errors should fail gracefully and return actionable error states.
- Persist only validated structured output.
- Dashboard route should avoid hard navigation failures; prefer in-route fallback UI on fetch failure.
