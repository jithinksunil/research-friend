# AGENTS.md

This repository is operated as an AI-agent-first codebase.

All AI agents must follow this document before planning or editing.

## 0. Entry Point and Required Context

`AGENTS.md` is the mandatory entry point for all agent sessions in this repo.

Before starting any planning, editing, or execution, agents must read these context files:

1. `ai-context/policy.md`
2. `ai-context/architecture.md`
3. `ai-context/patterns.md`
4. `ai-context/coding-guidelines.md`
5. `ai-context/AI.md`

Do not start implementation until these files are reviewed for the current task.

## 1. Mission

Deliver and maintain a stock analytics and report-generation platform where:

- Dashboard shows key public-company data.
- Report page shows structured research sections.
- Report data is cached/persisted in PostgreSQL using Prisma.

## 2. Product Scope

Required pages:

- Login
- Registration
- Search
- Dashboard
- Report

Core engines:

- yahoo-finance2 for market/company data fetch.
- OpenAI for section-wise report structuring/synthesis.

## 3. Data Lifecycle Contract

When user selects a company from search:

1. Upsert company by normalized symbol.
2. Navigate to dashboard route.

When user opens dashboard page:

1. Fetch dashboard data through `GET /api/dashboard/:symbol`.
2. Upsert company (defensive) and fetch provider data.
3. Render dashboard from API response (with cache/revalidate).

When user opens report page:

1. UI requests each section independently via `GET /api/report/:symbol/sections/:sectionKey`.
2. Server checks section in DB.
3. If found: return cached section.
4. If not found:
   1. Build section inputs from yahoo-finance2 datasets.
   2. Run OpenAI for that section only.
   3. Validate/normalize output.
   4. Persist section with Prisma.
   5. Return section payload.

Never skip DB lookup before regeneration.

## 4. Architecture Preferences

- Next.js App Router.
- Reads are API-first.
- Mutations can be Server Actions or API routes depending on caller needs.
- Current report enhancement path is API (`POST /api/report/:symbol/sections/:sectionKey/enhance`) backed by existing server-side enhancement logic.
- Keep business logic in server-side modules, not inside UI components.

## 5. Frontend Structure

- Route-local components: inside the related page folder.
- Reusable components: `components/`.
- Keep UI composition simple, typed, and section-driven.

## 6. AI Session Workflow

For each task:

1. Start at `AGENTS.md`, then read all required `ai-context/*` files listed in Section 0.
2. Make minimal, scoped changes.
3. Preserve backward compatibility where possible.
4. Update docs when behavior contracts change.

## 7. Mandatory Quality Gates

If code was changed, the agent must run:

1. Prettier
2. Spellcheck
3. ESLint
4. Typecheck

If only non-code docs changed, these checks can be skipped.

## 8. Guardrails

- Do not invent data not supported by available sources.
- Do not bypass validation before DB writes.
- Do not couple OpenAI prompts directly to UI concerns.
- Do not regenerate an existing report unless explicitly requested.

## 9. Source of Truth

When conflicts occur, prioritize in this order:

1. Explicit user task request
2. This `AGENTS.md`
3. `ai-context/policy.md`
4. Existing code conventions
