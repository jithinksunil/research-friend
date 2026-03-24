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

When user opens report page:

1. Check if report already exists in DB.
2. If found: return cached data and render.
3. If not found:
   1. Fetch required raw datasets from yahoo-finance2.
   2. Run separate OpenAI call per report section.
   3. Normalize and validate data shape.
   4. Save to PostgreSQL via Prisma.
   5. Render report.

Never skip DB lookup before regeneration.

## 4. Architecture Preferences

- Next.js App Router.
- Reads should move toward API routes.
- Mutations should move toward Server Actions.
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
