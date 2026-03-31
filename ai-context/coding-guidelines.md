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
- Prefer `interface` for object-shaped contracts, props, payloads, and other extensible structures.
- Use `type` for complex compositions where `interface` is a worse fit, such as unions, mapped types, conditional types, or utility-type-heavy contracts.
- Define explicit interfaces/types for section payloads.
- Do not derive application-facing contracts from `ReturnType`, indexed-access lookups, `NonNullable`, or interface inheritance when an explicit named contract can be declared in `interfaces/**`.
- Prefer importing explicit named contracts from `interfaces/**` over recreating local shape aliases in implementation files.
- Props-specific interfaces belong in the owning `.tsx` file, colocated with the component or page that consumes them.
- Child interfaces that exist only to support a local props contract may also live in that same `.tsx` file.
- Non-prop interfaces must stay in `interfaces/**` and should not be moved into implementation files.
- Agents do not need to enforce `import type` usage. Type-only imports may use `import` or `import type`, and agents should not churn files just to switch between them.
- Non-component functions should declare explicit return types.
- Non-component functions should prefer a single typed object parameter over positional primitive arguments.
- Allowed exceptions:
  - Framework-mandated entrypoints/signatures such as Next.js route handlers.
  - React components.
  - Callback/HOF signatures where the surrounding API dictates positional parameters.
- Use Zod (or equivalent) at external boundaries.

## Data Handling

- Normalize yahoo-finance2 outputs before business logic.
- Validate OpenAI outputs before persistence.
- Ensure deterministic section IDs/keys for DB updates.

## API/Action Conventions

- Reads: API routes by default.
- Writes/mutations: API routes.
- Current implemented rule:
  - Dashboard/report section reads via API routes.
  - Report enhancement via API route.
  - Search selection and vote flows should also use API routes.
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
