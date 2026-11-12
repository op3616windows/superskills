# Production Engineering Guardrails

These guardrails are strictly binding on coding agents across all sessions.

## 1. Database Schema and Data Evolution (`safe-migrations`)

Before writing or planning any database schema, column, or migration changes in `/to-tickets` or `/implement`:

- The agent MUST Call the Skill tool with "safe-migrations".
- Direct destructive DDL is forbidden: no direct `DROP COLUMN`, `RENAME COLUMN`, or in-place `ALTER COLUMN TYPE`.
- Mandatory Expand-and-Contract (Parallel Change) across three distinct phases (Expand, Backfill, Contract) for breaking changes.
- All indexes must use non-blocking creation (e.g. `CREATE INDEX CONCURRENTLY`).
- Migrations must set an explicit short `lock_timeout` (2 to 5 seconds).

## 2. Frontend and User Interface Quality (`ui-craft`)

Before creating or editing any UI components or styles (`.tsx`, `.jsx`, CSS) in `/implement`:

- The agent MUST Call the Skill tool with "ui-craft".
- Five-State Completeness Matrix: components must explicitly handle Loading (skeleton matching layout dimensions), Empty (with actionable CTA), Error (with retry mechanism), Partial/Optimistic, and Populated states.
- Re-use established design system tokens and primitives (such as `shadcn/ui`); never invent arbitrary hex codes or magic pixel dimensions.
- Enforce WCAG AA accessibility: 4.5:1 text contrast, visible focus rings, semantic tags, and screen reader labels on icon buttons.

## 3. Testing Seams and Concurrency (`contract-concurrency`)

When testing seams with multiple adapters or contested state in `/implement` or `/tdd`:

- The agent MUST Call the Skill tool with "contract-concurrency".
- Contract Parity: every seam with two or more adapters (e.g. in-memory test fake and database adapter) must pass the exact same parameterized contract test suite (`describeStoreContract`).
- Concurrency Stress Testing: modules managing contested state (balances, inventory, bookings, auctions) must have at least one test launching concurrent requests (`Promise.all`) against the real adapter to prove locking invariants (`SELECT ... FOR UPDATE` or atomic version checks).

## 4. Telemetry and System Boundaries (`observability`)

When implementing API endpoints, webhooks, or handlers in `/implement`:

- The agent MUST Call the Skill tool with "observability".
- Telemetry belongs at seams and I/O boundaries, not scattered through pure domain functions.
- Structured Context: every log and trace span must carry `correlationId`, `tenantId`, `entityId`, and `durationMs`.
- Explicit Error Taxonomy: generic catch blocks logging raw errors are forbidden; classify errors into domain types with typed machine-readable codes and chained causes (`cause: err`).

## 5. Security Code Review (`security-audit`)

In `/code-review`:

- The agent MUST spawn a third parallel subagent for Security, instructing it to Call the Skill tool with "security-audit".
- Audits entrypoints for query-level authorization (AuthZ), row-level mutation locking, sensitive DTO data exposure, and strict schema validation.

## 6. Pre-Implementation Threat Modeling (`/red-team`)

When completing `/to-spec`:

- The agent MUST instruct the user to run `/red-team` before `/to-tickets`.
- Adversarially probes the spec for race conditions (TOCTOU), IDOR/BOLA, negative/overflow numbers, denial of wallet, and state machine smuggling, updating the spec directly with security constraints.

## 7. Release Engineering and Blast Radius (`release-safety`)

When breaking specs into tickets in `/to-tickets` or preparing pull requests in `pr`:

- If a spec has three or more tracer-bullet tickets or touches critical flows, the agent MUST Call the Skill tool with "release-safety" to place a Feature Flag Seam in ticket #1.
- Pre-flight environment validation: every new environment variable must be documented in `.env.example` and validated via a strict runtime schema.
- Always schedule a Flag Cleanup ticket at the end of the ticket graph.

## 8. Legacy Codebase Onboarding (`/brownfield-onboard`)

On an existing or legacy repository lacking `GLOSSARY.md` or ADRs:

- Instruct the user to run `/brownfield-onboard` before `/grill-with-docs`.
- Surveys schemas and core types, resolves naming collisions via grilling, and bootstraps `GLOSSARY.md` and initial ADRs.

## 9. Production Incident Response (`/incident`)

On active outages, critical regressions, or 5xx spikes:

- Instruct the user to run `/incident` to mitigate first before `/diagnosing-bugs`.
- Adheres to Mitigate First, Investigate Later: halts impact via feature flag disable or rollback, gathers production evidence, and hands off to `diagnosing-bugs` for local reproduction.
