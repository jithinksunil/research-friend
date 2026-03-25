# Research Friend

AI-agent-first stock research platform built with Next.js, Prisma, PostgreSQL, yahoo-finance2, and OpenAI.

This repository is intentionally structured so AI agents can implement, extend, and maintain features with minimal ambiguity.

## Vision

Research Friend helps users analyze public companies through two experiences:

1. Dashboard view with key company and market data.
2. Report view with structured long-form sections similar to institutional equity research reports.
3. Section composition should follow the sample report style provided by the project owner (for example, the AJ Bell reference PDF).

## Core Product Flow

1. User signs up or logs in.
2. User searches for a company/ticker.
3. User opens company dashboard.
4. User opens report page.
5. System checks PostgreSQL for existing structured report.
6. If report exists: fetch from DB and render immediately.
7. If report does not exist:
   1. Fetch section-level raw data from yahoo-finance2.
   2. Run separate OpenAI calls for each report section.
   3. Validate and normalize outputs.
   4. Persist section data via Prisma.
   5. Render report UI.

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma + PostgreSQL
- yahoo-finance2
- OpenAI SDK
- Zod
- Server Actions + API routes

## Routing Scope

- `login` page
- `registration` page
- `search` page
- `dashboard` page
- `report` page

## Report Section Scope

Report sections should resemble a professional equity-research document, including areas such as:

- Executive summary
- Business/company overview
- Financial and valuation analysis
- Risk and regulatory analysis
- Forward outlook and conclusion

The exact section schema should remain modular so each section can be generated, stored, and re-rendered independently.

## API and Mutation Strategy

- Preferred future direction:
  - GET/read operations via API routes.
  - Mutations via Server Actions.
- Existing project may contain both patterns; migrate incrementally toward this contract.

## Frontend Component Pattern

- Page-specific components live beside their page route.
- Reusable shared components live in `components/`.
- Keep report section components modular and data-driven.

## Agent-First Documentation

Project instructions for agents are split into:

- `AGENTS.md` - execution policy for all AI sessions.
- `ai-context/AI.md` - AI operating model and responsibilities.
- `ai-context/architecture.md` - system architecture and data flow.
- `ai-context/coding-guidelines.md` - coding conventions.
- `ai-context/policy.md` - hard rules and guardrails.
- `ai-context/patterns.md` - implementation patterns and templates.

## Quality Gate Policy

For every AI session:

- If code changes were made, run all of:
  - `prettier`
  - `spellcheck`
  - `eslint`
  - `typecheck`
- If only non-code files changed (docs/markdown), these checks may be skipped.

## Getting Started

```bash
bun install
bun run dev
```

## Environment Variables

Typical required variables:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- Any Yahoo/OpenAI related runtime keys needed by current implementation

## Prisma

- Schema: `prisma/schema.prisma`
- Use Prisma Client for all DB reads/writes.
- Persist report sections in normalized shape suitable for section-level retrieval and updates.
