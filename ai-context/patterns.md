# Patterns

Reusable implementation patterns for this project.

## 1. Report Fetch-or-Generate Pattern

```text
getOrGenerateReportSection(symbol, sectionKey):
  existing = db.readSection(symbol, sectionKey)
  if existing:
    return existing

  input = buildSectionInput(symbol, sectionKey) // yahoo-finance2-backed
  generated = generateSection(sectionKey, input)
  validated = validateSection(sectionKey, generated)
  saved = db.persistSection(symbol, sectionKey, validated)
  return saved
```

## 2. Section Generator Pattern

```text
generateSection(sectionKey, sectionInput):
  prompt = buildPrompt(sectionKey, sectionInput)
  output = openai.responses.create(...)
  parsed = validateWithSchema(sectionKey, output)
  return parsed
```

## 3. Section Enhancement Pattern

```text
POST /api/report/:symbol/sections/:sectionKey/enhance
  -> validate input improvementNeeded
  -> run section-specific enhancement logic (web search enabled)
  -> persist updated section
  -> return updated section data
```

## 4. API Mutation Pattern

- Reads: API routes (`/api/dashboard/:symbol`, `/api/report/:symbol/sections/:sectionKey`).
- Mutations: API routes for search selection, votes, comments, auth flows, and report enhancement.

## 5. UI Section Rendering Pattern

```text
ReportPage
  -> fetch each section independently (react-query)
  -> render only if section data exists
  -> hide section entirely if request fails/missing
  -> show skeleton while loading or enhancing that section
```

## 6. Prisma Persistence Pattern

- Persist report at root level.
- Persist section data in related report section models/relations.
- Include timestamps and source metadata.
- Upsert by company + report identity to avoid duplicates.

## 7. Failure Handling Pattern

- If a section fails generation:
  - return non-200 for that section API call
  - keep other sections available
  - render no heading/body for failed section

## 8. Agent Session Pattern

1. Read context docs.
2. Locate relevant code path.
3. Implement minimal patch.
4. Run required checks for code changes.
5. Update docs/contracts if behavior changed.
