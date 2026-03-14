# AI Agent Instructions

This repository includes **Model Context Protocol (MCP)** servers to enhance AI-assisted development.

Configuration file:

```
.vscode/mcp.json
```

## Enabled MCP Servers

### filesystem

Provides access to the repository files.

Used by AI agents to:

* inspect Next.js components
* analyze server actions
* read Prisma schemas
* debug application logic

### npm

Allows AI agents to inspect package metadata and APIs.

Useful for:

* `yahoo-finance2`
* `zod`
* `prisma`
* `lightweight-charts`

### http

Allows agents to call HTTP APIs.

Primarily used for debugging or inspecting finance APIs such as:

```
https://query2.finance.yahoo.com
```

### docs (server-fetch)

Allows AI agents to retrieve external documentation pages.

### context7

Provides semantic search across documentation sources.

### yahoo-finance2 Docs

Provides access to the source repository and documentation for:

```
gadicc/yahoo-finance2
```

This helps AI agents understand the library used to fetch financial data.

## Project Context

This application is a **Next.js fullstack stock analytics platform**.

Key stack:

* Next.js
* Prisma
* PostgreSQL
* Zod
* yahoo-finance2
* lightweight-charts

Main workflow:

1. User searches for a company.
2. Search results are retrieved via Yahoo Finance.
3. Selecting a company opens a dashboard with stock data.
4. A report page transforms financial data using Zod.
5. Processed reports are stored in PostgreSQL via Prisma.

AI agents may use MCP tools to inspect this flow.
