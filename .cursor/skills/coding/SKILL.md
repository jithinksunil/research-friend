---
name: coding
description: Project-specific coding standards for the research-friend Next.js app. Use when writing, editing, or reviewing code in this repository. Covers Next.js 16 App Router, TypeScript, Prisma, server actions, and UI patterns.
---

# Coding Standards

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Prisma + PostgreSQL
- **UI**: MUI (Material UI) + Tailwind CSS
- **State**: React Query (TanStack Query)
- **Auth**: NextAuth v5

## Path Aliases

Use `@/` for imports from project root:

```ts
import { cn, formatDate } from '@/lib';
import prisma from '@/prisma';
import { getReport } from '@/app/actions/user';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
```

## Server Actions

- Add `'use server'` at the top of action files
- Use `requireRBAC(ROLES.USER)` (or other roles) to wrap actions that need auth
- Return `{ okay: true, data }` or `{ okay: false, error: { message } }` for consistent error handling

```ts
'use server';
import { ROLES } from '@/app/generated/prisma/enums';
import { requireRBAC } from '@/server';

export const getReport = requireRBAC(ROLES.USER)(async (symbol: string) => {
  try {
    // ...
    return { okay: true, data };
  } catch (e) {
    return { okay: false, error: { message: convertToErrorInstance(e).message } };
  }
});
```

## Routing & Structure

- **Use Next.js App Router only** — all routes live under `app/`
- **Colocate components**: Keep components in the same folder as the page/route that uses them
- **Promote when common**: If a component is used in 2+ places, move it to `components/` (e.g. `components/common/` or `components/form/`)

```
app/(routes)/user/dashboard/[symbol]/report/
├── page.tsx
├── Heading.tsx          # used only here
├── SectionSeparator.tsx # used only here
└── ...
```

## App Router Pages

- Page `params` are a **Promise** in Next.js 16 — await them:

```ts
interface PageProps {
  params: Promise<{ symbol: string }>;
}
async function page({ params }: PageProps) {
  const { symbol } = await params;
  // ...
}
```

## Styling

- Use `cn()` from `@/lib` for conditional/merged Tailwind classes
- Prefer Tailwind utility classes; use MUI components when needed for complex UI

```tsx
import { cn } from '@/lib';

<div className={cn('px-[26px] py-[10px] font-medium')} />
```

## Components

- Colocate in the route folder; move to `components/` when reused across routes
- Use `FC` or explicit props interfaces for typed components
- Prefer `ReactNode` for flexible children (e.g. `headings?: ReactNode[]`)

## Prisma

- Import from `@/prisma` for the client
- Use generated types from `@/app/generated/prisma`
- Enums from `@/app/generated/prisma/enums`

## Error Handling

- Use `convertToErrorInstance()` from `@/lib` when catching unknown errors
- Server actions: return `{ okay: false, error: { message } }`; callers check `!report.okay` and handle

## Conventions

- Single quotes for strings
- Trailing commas in multi-line objects/arrays
- ESLint: `@typescript-eslint/no-explicit-any` and `@typescript-eslint/ban-ts-comment` are off
