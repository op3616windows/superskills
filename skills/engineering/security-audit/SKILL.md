---
name: security-audit
description: Security audit for code changes, APIs, and data access. Use when auditing code diffs for vulnerabilities, reviewing authorization and tenant isolation (AuthZ, IDOR, BOLA), validating database row locking (SELECT FOR UPDATE), checking DTO sensitive data exposure, or enforcing input schema strictness.
---

# Security Audit

Examine code diffs and entrypoints for authorization flaws, race conditions, sensitive data leakage, and improper input validation.

`security-audit` acts as the third axis in `code-review` (alongside Standards and Spec) or runs independently over any diff between `HEAD` and a fixed point. When dispatched as a subagent, always start it with a fresh context window.

## Inspection Checklist

Inspect every entrypoint in the diff (API routes, tRPC procedures, Server Actions, GraphQL resolvers, background job handlers, and webhook receivers) against four critical security areas:

### 1. Authorization and Object Ownership (AuthZ)

- **Tenant and user scoping**: Does every database query enforce ownership at the query level (for example: `where: { id, organizationId }`), rather than fetching the object first and checking permissions in application memory?
- **Authentication context integrity**: Is the actor identity derived securely from trusted server session context rather than from client-supplied parameters in request bodies or query strings?
- **Privilege boundaries**: Do admin-only procedures explicitly enforce role checks before executing business logic?

### 2. Concurrency and Mutation Locking

- **Contested state mutations**: When updating account balances, inventory counts, reservations, or auction bids, does the code guard against concurrent race conditions?
- **Row-level locking or optimistic checks**: Is there an explicit `SELECT ... FOR UPDATE`, an atomic database decrement with `RETURNING`, or an optimistic concurrency check (comparing a `version` or `updatedAt` field)?
- **Transaction boundaries**: Are multi-step state transitions wrapped in a database transaction with appropriate isolation levels?

### 3. Sensitive Data Exposure in DTOs

- **Leaking internal fields**: Are database entities returned directly to client callers without filtering?
- **Secret exposure**: Ensure hashed passwords, password reset tokens, internal flags, PII, payment secrets, and third-party API keys are never included in serialized client responses.
- **Strict serialization**: Use explicit response DTO mappers or schema-based output serializers to ensure only intended fields leave the server.

### 4. Input Validation and Injection Prevention

- **Strict schema validation**: Are incoming payloads validated with strict schemas (such as Zod with `.strict()`) to prevent mass assignment, unrecognized properties, or prototype pollution?
- **SQL and command injection**: Are all database queries parameterized? Check that no SQL queries or shell commands use unescaped string interpolation with user input.
- **Webhook verification**: Are incoming webhooks from external providers (Stripe, GitHub, payment gateways) validated using cryptographic signature verification before payload processing?

## Output Format

Report findings grouped by severity:

### Critical
Vulnerabilities that allow unauthorized data access, privilege escalation, account takeover, or arbitrary data mutation without credentials.

### High
Race conditions leading to double spending or state corruption, missing ownership checks on mutation endpoints, or plain-text leakage of sensitive credentials.

### Medium
Missing input strictness, potential information disclosure in error messages, or missing rate limiting on public routes.

For each finding, provide:
1. **File and line reference**: exact path and line numbers.
2. **The Vulnerability**: concise explanation of what is exploitable.
3. **Remediation**: specific code change to resolve the issue.

If no security issues are found, state "Security audit: no vulnerabilities identified in the diff." Under 400 words.
