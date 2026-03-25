# Coding Guidelines

## Language and Framework

- TypeScript-first.
- Next.js App Router patterns.
- Prisma for all DB access.

## File Organization

- Keep page-specific components in route folder.
- Keep reusable components under `components/`.
- Keep shared server logic in dedicated server/lib modules.

## Type Safety

- Avoid `any` unless isolated and justified.
- Define explicit interfaces/types for section payloads.
- Use Zod (or equivalent) at external boundaries.

## Data Handling

- Normalize yahoo-finance2 outputs before business logic.
- Validate OpenAI outputs before persistence.
- Ensure deterministic section IDs/keys for DB updates.

## API/Action Conventions

- Reads: API routes by default.
- Writes/mutations: choose transport based on caller and UX.
- Current implemented rule:
  - Dashboard/report section reads via API routes.
  - Report enhancement via API route.
  - Existing auth/search/vote writes may remain as Server Actions.
- Keep transport layer thin; business logic should be reusable.

## UI Conventions

- Report page should render from structured data only.
- Avoid embedding transformation logic directly in presentation components.
- Keep loading and error states explicit.
- For report sections:
  - Show skeleton while loading/enhancing.
  - Hide section heading/body if section fetch fails or data is missing.

## Error Handling

- Convert provider/parse/validation failures into user-safe errors.
- Log technical details on server side only.

## Performance

- Avoid unnecessary re-generation calls.
- Cache/persist expensive outputs.
- Keep section calls independent and parallelizable where safe.
- Avoid hard throws in route server components when recoverable API failures can be shown as in-page fallback UI.

## Testing and Checks

When code changes occur, run mandatory quality gates:

1. Prettier
2. Spellcheck
3. ESLint
4. Typecheck

If only markdown/docs changed, checks may be skipped.
