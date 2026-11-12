---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

# Implement

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

## Process

### 1. Mandatory Pre-Execution Skill Invocations

Before writing or editing any code or tests, inspect what layers this ticket touches and invoke the corresponding discipline skills. You MUST execute these tool calls prior to creating or modifying files:

- **Database and Persistent Schema**: If this ticket creates or modifies database tables, columns, or migrations, Call the Skill tool with "safe-migrations" FIRST. Do not write schema or migration code until this tool has been called.
- **User Interface**: If this ticket touches `.tsx`, `.jsx`, frontend components, or styling, Call the Skill tool with "ui-craft" FIRST. Do not write UI code until this tool has been called.
- **I/O Boundaries and Handlers**: If this ticket creates or modifies API endpoints, webhooks, or external service clients, Call the Skill tool with "observability" FIRST to attach structured telemetry and error codes.
- **Test Strategy**: Call the Skill tool with "tdd" at pre-agreed seams. If the seam has multiple adapters (e.g. in-memory test double and database adapter) or handles contested state under load, also Call the Skill tool with "contract-concurrency".

### 2. Implementation Loop

1. Drive red-green-refactor loop at pre-agreed seams.
2. Run typechecking regularly, single test files regularly, and the full test suite once at the end.

### 3. Review and Commit

Once code passes all tests:
1. Call the Skill tool with "code-review" to execute the three-axis review (Standards, Spec, and Security).
2. Resolve any Critical or High findings.
3. Commit your work to the current branch.
