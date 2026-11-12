---
name: brownfield-onboard
description: Survey an existing brownfield codebase, detect conflicting domain terminology, and bootstrap GLOSSARY.md and foundational ADRs.
disable-model-invocation: true
---

# Brownfield Onboard

Survey an existing, undocumented, or legacy codebase to bootstrap a shared domain language and foundational architecture records before starting feature work.

Running `/grill-with-docs` on an existing codebase without onboarding risks inventing novel terms that clash with existing code. `brownfield-onboard` excavates the existing implicit domain model, detects naming collisions, resolves canonical terms through grilling, and establishes `GLOSSARY.md` and initial ADRs.

## Process

### 1. Static codebase survey

Scan the existing repository to discover implicit domain models and architectural patterns.

Do not write or refactor code during this step. Focus purely on discovery:

1. **Schema and persistence**:
   - Inspect database schemas and migration files (`prisma/schema.prisma`, `migrations/`, `drizzle/`, raw SQL schema files, ORM entities).
   - List the primary database tables, collections, foreign key relationships, and enum definitions.
2. **Core domain types and DTOs**:
   - Search for type declarations (`types/`, `models/`, `entities/`, `interfaces/`, `dto/`).
   - Note key entity shapes, status fields, and state transitions.
3. **Repository structure and entrypoints**:
   - Inspect directory layout (`src/`, `lib/`, `packages/`, `api/`).
   - Identify primary entrypoints (HTTP routes, server actions, background workers, event consumers).
4. **Recent commit and PR history**:
   - Inspect recent merges via `git log --merges -n 30 --oneline` to identify actively evolving domains and architectural shifts.

### 2. Extract implicit concepts and detect naming clashes

Cluster the discovered entities and check for **semantic collisions**:

- **One concept with multiple names**: Detect where different files or layers use varying names for the same domain entity (for example: `User` vs `Account` vs `Member`, or `Buyer` vs `Bidder` vs `Customer`, or `Order` vs `Booking` vs `Reservation`).
- **One name with multiple meanings**: Detect where a single word is overloaded across different contexts (for example: `Status` meaning payment status in one module but shipping status in another).
- **Ubiquitous acronyms and abbreviations**: Note shortened labels that lack explicit definitions in code comments.

Compile a draft list of candidate domain terms and flagged naming collisions.

### 3. Settle canonical vocabulary with the user

Call the Skill tool with "grilling" to interview the user about the discovered terminology.

In the interview:

1. Present the discovered naming clashes and clusters of synonyms.
2. Ask which name is the **canonical domain term** to use in all future specs, tickets, and code.
3. Identify which existing names are **legacy terms** that must be treated as deprecated synonyms.
4. Clarify core business rules attached to status enums or lifecycle states.

Iterate until all major domain entities have agreed canonical names.

### 4. Bootstrap GLOSSARY.md

Create or update `GLOSSARY.md` in the repository root. Structure it as follows:

```markdown
# Glossary

Domain vocabulary for this project. Keep definitions concise.

## Core Domain Terms

### <Canonical Term>
<One or two sentence definition of the business concept.>
- Code mappings: `<files or classes where this lives>`
- Invariants: `<key rules, constraints, or states>`

## Synonyms & Legacy Terms

| Deprecated / Legacy Term | Canonical Term | Where Encountered in Codebase |
| ------------------------ | -------------- | ----------------------------- |
| `Bidder`                 | `Buyer`        | `src/legacy/auction_store.ts` |
| `Member`                 | `Account`      | `src/auth/session.ts`         |
```

### 5. Recover foundational ADRs

Identify implicit, undocumented architectural decisions that already govern the repository:

- Multi-tenant data isolation strategy (row-level security, tenant ID columns, separate databases)
- Asynchronous task processing (queues, database polling, temporal workflows)
- Authentication and session boundaries (JWTs, session cookies, third-party provider)
- External third-party integrations and storage boundaries

For each recovered decision, write a foundational ADR under `docs/adr/` (for example: `docs/adr/0001-recovered-multi-tenant-isolation.md`). Format the ADR with:
- **Status**: Accepted (Implicit / Recovered)
- **Context**: How the codebase historically solved this requirement.
- **Decision**: The recovered convention that existing code adheres to.
- **Consequences**: Rules that future changes must respect.

### 6. Verify and hand off

Present the newly created `GLOSSARY.md` and ADR list to the user.

Once approved, future feature work can safely begin at `/grill-with-docs` or `/to-spec` using the established vocabulary.
