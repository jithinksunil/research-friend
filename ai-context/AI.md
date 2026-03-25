# AI Context

This file defines how AI agents should reason and act in this repository.

## Objective

Build and maintain a reliable platform for public-company dashboards and report generation with deterministic persistence behavior.

## AI-First Principles

- Prefer small, verifiable changes over broad rewrites.
- Preserve contracts between UI, server logic, and persistence.
- Keep report generation section-wise and composable.
- Treat DB as cache + source of truth for rendered reports.

## Responsibilities of Agents

- Understand current route and data flow before editing.
- Reuse existing types and schemas where possible.
- Validate and normalize external provider outputs.
- Keep report sections independently regenerable.
- Preserve section-wise lazy loading contracts and per-section API boundaries.
- Ensure enhancement flows update only the targeted section state in UI.

## Non-Goals

- Do not hardcode speculative financial claims.
- Do not tightly couple prompts with rendering markup.
- Do not add hidden background jobs without explicit design.

## Decision Heuristics

When multiple implementations are possible:

1. Choose the one with stronger type safety.
2. Choose the one with clearer DB idempotency.
3. Choose the one that minimizes OpenAI token/cost waste.
4. Choose the one that preserves existing API contracts and route behavior.
5. Choose the one easiest for future agents to reason about.

## Execution Checklist

- Confirm read path for requested feature.
- Confirm write path and validation boundary.
- Confirm fallback path when external data is missing.
- Ensure route-level UX still functions.
- For report updates, confirm section-specific cache/state refresh only.
- Run quality gates when code changed.
