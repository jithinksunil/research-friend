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
- Prefer `interface` over `type` for most object-shaped contracts, and only introduce `type` aliases when the contract is complex enough to justify it.
- Keep application-facing contracts explicit. Avoid deriving reusable interfaces from `ReturnType`, indexed-access lookups, `NonNullable`, or interface inheritance when the shape should instead live as a named contract in `interfaces/**`.
- Keep props interfaces colocated with the owning `.tsx` file. If a child interface exists only to support that local props contract, keep it there too.
- Keep all non-prop interfaces in `interfaces/**`; do not move them into implementation files.
- Do not spend time normalizing `import` versus `import type`. Either is acceptable for type-only symbols unless a tool or compiler setting specifically requires one form.
- Give non-component functions explicit return types.
- Prefer a single typed object parameter for non-component functions instead of positional primitive arguments.
- Keep exceptions narrow and intentional: React components, framework-required entrypoints, and callback/HOF signatures constrained by external APIs.
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
2. Prefer `interface` for standard object contracts unless `type` is clearly the better tool.
3. Prefer explicit return types and object-style parameters for non-component functions unless a framework/API signature prevents it.
4. Choose the one with clearer DB idempotency.
5. Choose the one that minimizes OpenAI token/cost waste.
6. Choose the one that preserves existing API contracts and route behavior.
7. Choose the one easiest for future agents to reason about.

## Execution Checklist

- Confirm read path for requested feature.
- Confirm write path and validation boundary.
- Confirm fallback path when external data is missing.
- Ensure route-level UX still functions.
- For report updates, confirm section-specific cache/state refresh only.
- Run quality gates when code changed.
