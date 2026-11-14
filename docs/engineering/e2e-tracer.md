## What it does

`e2e-tracer` automates the Demo Path of a tracer-bullet ticket into a single lean Playwright test verifying the vertical stack.

The defining constraint is that it tests exactly the user interactions specified in the ticket's demo path and strictly forbids combinatorial business logic testing in the browser. In-memory unit tests verify algorithmic correctness and domain edge cases in milliseconds, while `e2e-tracer` confirms that the browser, authentication, API routes, serialization boundaries, and real database work together seamlessly.

## When to reach for it

Type `/e2e-tracer`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

| Scenario | What to run |
| --- | --- |
| Automating the ticket demo path to prove full-stack wiring | `/e2e-tracer` |
| Driving test-first logic and edge cases in deep modules | [tdd](https://aihero.dev/skills-tdd) |
| Testing multi-adapter seams and concurrent database locking | [contract-concurrency](https://aihero.dev/skills-contract-concurrency) |
| Diagnosing an intermittent browser flake or production regression | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |
| Verifying complete visual states and accessible component design | [ui-craft](https://aihero.dev/skills-ui-craft) |

## The 90/10 testing split

Full-stack applications fail at the boundaries between layers even when unit tests are completely green. Four common failure modes escape in-memory tests:

- **Serialization boundaries**: Objects such as `Date` or `Decimal` throw serialization exceptions when sent across Server Components or network endpoints.
- **UI wiring**: React components render successfully, but fail to invalidate query caches or disable submit buttons due to invalid props.
- **Routing and auth**: Middleware redirects, session cookies, and CORS policies block requests before reaching backend handlers.
- **Demo path decay**: Without an automated test, demo paths verified by hand in early tickets break unnoticed during later development.

`e2e-tracer` balances verification speed and test coverage by maintaining a strict division of labor: 90% of test scenarios stay in fast unit tests, while 10% run as a single end-to-end tracer bullet.

## Four iron rules of lean browser testing

To prevent test suites from becoming slow and brittle, `e2e-tracer` enforces four structural disciplines:

1. **Strict 1:1 mapping to the demo path**: Never test branching business logic in the browser. If a calculation has twenty edge cases, all twenty belong in unit tests. E2E tests only execute the single user journey outlined in the ticket.
2. **Semantic locators**: Select elements using accessible roles and labels (`getByRole`, `getByLabel`, `getByText`) rather than CSS classes or DOM hierarchy. If a semantic selector fails, the component has an accessibility bug.
3. **Database and state seeding**: Never click through signup, login, and configuration screens to set up test state. Seed the database directly through backend helpers and inject auth state using `storageState`.
4. **Zero-sleep assertions**: Never call arbitrary timers like `waitForTimeout`. Use web-first assertions that retry automatically, and fail tests immediately on uncaught page errors or framework hydration mismatches.

## Common questions

**Why not write all tests in Playwright instead of using in-memory doubles?**
Feedback loop speed determines development velocity. A unit test running against an in-memory double finishes in 20ms, allowing an agent to run tens of iterations per minute. A browser test takes seconds and produces noisy HTML logs on failure, which can derail the agent into unproductive repair loops.

**What should happen when an E2E test fails?**
Inspect the accessibility snapshot and console errors first. If the failure stems from a broken prop, missing cache invalidation, or serialization bug, fix the wiring directly. If the failure exposes a flaw in core business logic, step back to [tdd](https://aihero.dev/skills-tdd) to reproduce and resolve the issue with an in-memory test.

## It's working if

- Every tracer-bullet ticket produces exactly one fast, deterministic Playwright test matching its demo path.
- The browser test executes in under 5 seconds using pre-seeded state and stored auth credentials.
- Elements are targeted strictly by accessible roles and text rather than DOM hierarchy or CSS selectors.
- Tests fail immediately when client-side exceptions or hydration mismatches occur.

## Where it fits

A model-invoked engineering skill that bridges [tdd](https://aihero.dev/skills-tdd) and [code-review](https://aihero.dev/skills-code-review). It executes at the end of [implement](https://aihero.dev/skills-implement) once unit tests and typechecks are clean, ensuring that the full vertical slice functions before submitting code. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
