# Patterns

Reusable implementation patterns for this project.

## 1. Report Fetch-or-Generate Pattern

```text
getReport(symbol):
  existing = db.findReport(symbol)
  if existing:
    return existing

  rawData = fetchYahooData(symbol)
  sections = generateSections(rawData) // separate OpenAI call per section
  validated = validateSections(sections)
  saved = db.saveReport(symbol, validated)
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

## 3. API + Server Action Split Pattern

- GET endpoints in API routes:
  - report retrieval
  - dashboard reads
  - search reads
- Mutations in Server Actions:
  - auth/session-bound writes
  - user actions (votes/comments/saves)
  - report regeneration triggers

## 4. UI Section Rendering Pattern

```text
ReportPage
  -> fetch structured report payload
  -> map each section key to dedicated UI component
  -> render only if section data exists
  -> show fallback placeholder if section missing
```

## 5. Prisma Persistence Pattern

- Persist report at root level.
- Persist sections as child records or structured fields.
- Include timestamps and source metadata.
- Upsert by company + report identity to avoid duplicates.

## 6. Failure Handling Pattern

- If a section fails generation:
  - mark section status as failed/pending
  - keep other valid sections
  - allow retry for failed section only

## 7. Agent Session Pattern

1. Read context docs.
2. Locate relevant code path.
3. Implement minimal patch.
4. Run required checks for code changes.
5. Update docs/contracts if behavior changed.
