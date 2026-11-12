---
name: red-team
description: Adversarial security and threat modeling review of a spec before ticketing.
disable-model-invocation: true
---

# Red Team

Adversarially probe a specification for security flaws, race conditions, authorization bypasses, and business logic vulnerabilities before tickets are created.

`code-review` verifies that code matches the spec and adheres to coding standards. If the spec itself contains design vulnerabilities or overlooks adversarial behaviour, `code-review` will give vulnerable code a clean pass because the implementation faithfully matches a flawed design.

`red-team` runs **immediately after `/to-spec` and before `/to-tickets`**. It adopts the perspective of an attacker with full internal knowledge of the system and hardens the specification.

## Process

### 1. Locate and read the specification

Read the active specification from the conversation context, or fetch the spec file or issue referenced by the user (for example: `docs/specs/<feature>.md`).

Also inspect `GLOSSARY.md` and relevant ADRs to understand established authentication, tenancy, and data isolation boundaries.

### 2. Adversarial attack simulation

Evaluate the proposed feature against five primary attack vectors:

#### Vector A: Race conditions and concurrency (TOCTOU)
- Can multiple concurrent requests exploit the gap between checking a condition and updating state (Time-of-Check to Time-of-Use)?
- Can a user double-spend account balance, claim the same reserved seat/ticket, or bypass inventory limits by firing simultaneous requests?
- Invariant required: Identify state requiring row-level locks (`SELECT ... FOR UPDATE`), atomic database increments, distributed locks, or optimistic concurrency version checks.

#### Vector B: Broken Object-Level Authorization (BOLA / IDOR)
- Can an authenticated user alter IDs in request parameters to view, modify, or delete resources belonging to another user or another tenant?
- Does the spec rely on client-provided tenant identifiers, or does it enforce tenant isolation at the query filter level?
- Invariant required: Explicit requirement that every query joins or filters by the authenticated session tenant/user context.

#### Vector C: Numeric and business rule manipulation
- What happens if numeric parameters are negative, zero, fractional, or excessively large?
- Can a user withdraw `-100` dollars, buy `0` items to trigger free gifts, or send integer values exceeding standard bounds?
- Invariant required: Strict input bounds, non-negative constraints, and decimal precision rounding definitions.

#### Vector D: Resource exhaustion and Denial of Wallet
- Can an attacker pass arbitrarily high pagination limits (`?limit=1000000`) or unindexed filter parameters that cause full table scans?
- Are there unthrottled endpoints that trigger expensive third-party API calls (SMS verification, AI completion, external payments)?
- Invariant required: Hard maximum page size limits, rate limiting rules, and asynchronous queue throttling.

#### Vector E: State machine smuggling and out-of-order execution
- Can an attacker bypass required lifecycle states (for example: invoking an order completion action directly on a newly created draft order without passing through payment verification)?
- Invariant required: Explicit state transition preconditions and cryptographic webhook signature verification.

### 3. Update the specification

Do not merely write a separate report that gets forgotten. **Update the specification document directly** by adding or updating a dedicated section:

```markdown
## Security Constraints & Threat Mitigations

- **Concurrency & Locking**: <Required locking or atomic transaction mechanisms>
- **Authorization & Tenancy**: <Explicit tenant scoping and object ownership checks>
- **Input Boundaries & Validation**: <Strict schema validation, numerical bounds, and sanitization>
- **Rate Limiting & Abuse Prevention**: <Maximum batch sizes, request throttling, and pagination bounds>
- **State Machine Integrity**: <Valid transition checks and webhook verification requirements>
```

### 4. Present findings to the user

Summarise the identified threats and the newly added defensive requirements in plain language:

- Outline the highest-risk attack vectors discovered.
- Highlight the defensive constraints added to the spec.
- Confirm with the user before proceeding to `/to-tickets`.
