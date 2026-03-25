# Policy

This document defines hard rules for contributors and AI agents.

## 1. Report Persistence Rule

Always check DB for existing report before generating a new one.

## 2. Section Isolation Rule

OpenAI generation must be section-specific, not one monolithic prompt for full report.

## 3. Validation Rule

Do not persist unvalidated model output.

## 4. Source Integrity Rule

Use yahoo-finance2 as the primary market/company data source unless explicitly expanded by project owners.

## 4a. Web Search Usage Rule

Use web search only for section enhancement flows unless explicitly changed by project owners.

## 5. Interface Stability Rule

Maintain stable contracts between:

- Server data shape
- DB entities
- Report UI sections

Any contract changes must be documented.

## 6. Write Path Rule

Use Prisma for DB writes. Avoid direct SQL unless a migration/performance need is explicit.

## 6a. Section API Rule

Report sections must support section-wise read/generate via API. Missing/failed sections must not render in the report UI.

## 7. Execution Quality Rule

If code was changed in a session, run:

- Prettier
- Spellcheck
- ESLint
- Typecheck

If only non-code files changed, checks may be skipped.

## 8. Change Scope Rule

Prefer minimal, reviewable changes with clear reasoning.

## 9. Security Rule

Never expose secrets in code, prompts, logs, or generated reports.
