## What it does

`security-audit` inspects code diffs and API entrypoints for vulnerabilities, broken object-level authorization (BOLA/IDOR), concurrent race conditions, sensitive data leakage, and improper input validation.

The defining constraint is that it audits the diff specifically for exploitable security flaws and missing server-side invariants rather than general code style or specification fidelity. While standard review catches formatting and logic gaps, this audit focuses strictly on security boundaries and transaction integrity.

## When to reach for it

Type `/security-audit`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

| Scenario | What to run |
| --- | --- |
| Running full code review before opening a pull request | [code-review](https://aihero.dev/skills-code-review) (spawns this audit in parallel) |
| Auditing an active git diff for security regressions | `/security-audit` |
| Reviewing a feature spec before implementation starts | [red-team](https://aihero.dev/skills-red-team) |
| Standard code styling and smell checks | [code-review](https://aihero.dev/skills-code-review) |

## The three-axis review

In high-assurance engineering, code review evaluates three distinct dimensions:

1. **Standards**: Does the code match repository standards and clean architecture heuristics?
2. **Spec**: Does the code implement what the issue requested without scope creep?
3. **Security**: Does the code protect tenant boundaries, guard against concurrent mutations, and prevent data leakage?

When running [code-review](https://aihero.dev/skills-code-review), `security-audit` executes as a parallel [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent) with a fresh [context window](https://www.aihero.dev/ai-coding-dictionary/context-window). Its findings appear in a dedicated section so security risks are never masked by stylistic debates.

## Core security checks

- **Query-level AuthZ**: Ensures every query verifies user and organization ownership directly in database filters rather than relying on in-memory checks after loading.
- **Row-level locking**: Verifies that operations updating balances, inventory, or reservations use database transactions with `SELECT ... FOR UPDATE` or optimistic concurrency checks.
- **DTO sanitization**: Ensures internal fields, password hashes, and administrative flags are stripped before serialization.
- **Strict schema validation**: Requires input schemas to reject unrecognised keys and enforce numerical bounds.

## Common questions

**Does this replace automated static analysis tools?**
No. Linters, SAST tools, and dependency vulnerability scanners catch known pattern violations. `security-audit` complements them by reasoning about business logic flaws, such as missing row locks on balances or tenant isolation leaks across relational joins.

**Can it be run on older code not currently in the diff?**
Yes. You can pass a reference commit or run the audit against specific files before undertaking major refactors.

## It's working if

- Every exposed mutation endpoint has an explicit ownership and authorization verification.
- Balance and inventory mutations use transactions with row locking or optimistic version checks.
- Sensitive internal fields are excluded from public API responses.
- Output reports cite exact file paths and lines with concrete remediation advice.

## Where it fits

A model-invoked skill that runs as the third axis in [code-review](https://aihero.dev/skills-code-review), or standalone over any diff during [implement](https://aihero.dev/skills-implement). It pairs with [red-team](https://aihero.dev/skills-red-team), which audits specs before code is written. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
