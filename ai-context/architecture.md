# Architecture

## High-Level System

Research Friend is a Next.js full-stack app with App Router.

- UI Layer: route pages and co-located components.
- Server Layer: server actions and API routes.
- Data Layer: Prisma + PostgreSQL.
- External Providers:
  - yahoo-finance2 for raw finance/company datasets.
  - OpenAI for section-level structured synthesis.

## Key Pages

1. Auth: login and registration.
2. Search: ticker/company discovery.
3. Dashboard: compact analytics and company snapshot.
4. Report: multi-section narrative + metrics.

## Report Retrieval/Generation Flow

```text
User opens /report for symbol
  -> Check DB for existing report
     -> Found: return report
     -> Not found:
        -> Fetch raw datasets (yahoo-finance2)
        -> Build section input payloads
        -> OpenAI call per section
        -> Validate/normalize section output
        -> Persist report + sections with Prisma
        -> Return report
```

## Section Generation Strategy

- Each report section should be generated independently.
- OpenAI calls are separated by section.
- Store each section in a structured shape that supports:
  - Partial refresh
  - Retry of failed section
  - Incremental rendering
- Section taxonomy should align with the sample equity-research style provided by the project owner (AJ Bell-style report structure).

## API Strategy (Target State)

- GET operations via API routes.
- Mutations via Server Actions.

This may be reached incrementally while preserving existing behavior.

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
