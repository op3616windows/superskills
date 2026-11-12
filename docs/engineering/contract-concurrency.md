## What it does

`contract-concurrency` verifies that multiple adapter implementations satisfy the identical behavioral contract, and validates that contested state mutations remain consistent under concurrent load.

The defining constraint is that it runs an identical parameterized test suite across both in-memory and real persistence adapters, and subjects real database adapters to parallel stress tests. Fast in-memory fakes run single-threaded in memory and conceal production issues like database deadlocks, transaction isolation flaws, and race conditions.

## When to reach for it

Type `/contract-concurrency`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

| Scenario | What to run |
| --- | --- |
| Building an in-memory adapter and a database/Redis adapter for the same seam | `/contract-concurrency` |
| Writing standard unit tests for pure domain logic | [tdd](https://aihero.dev/skills-tdd) |
| Designing deep module seams and interface boundaries | [codebase-design](https://aihero.dev/skills-codebase-design) |
| Investigating intermittent race conditions or deadlocks | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |

## Preventing semantic drift

When code relies on an in-memory adapter for unit testing and a database adapter in production, subtle behavioral differences inevitably arise. The in-memory version might return `undefined` where the database adapter returns `null`, or handle sorting order differently.

To eliminate this drift, `contract-concurrency` packages test assertions into a parameterized function: `describeStoreContract(createStore)`.

This suite executes against the in-memory adapter on every rapid [tdd](https://aihero.dev/skills-tdd) loop, and against the real infrastructure adapter before a ticket is completed.

## Testing under contention

Sequential tests cannot uncover race conditions. When testing operations that manipulate shared counters, inventory, or financial balances, `contract-concurrency` requires writing a concurrency stress test using parallel requests (for example, `Promise.all` launching 50 simultaneous transactions against 10 inventory items).

This guarantees that database row-locking (`SELECT ... FOR UPDATE`), atomic increments, or optimistic versioning logic prevent double-allocation and maintain data invariants under peak load.

## Common questions

**Does running contract tests against a real database slow down local TDD?**
No. During your rapid red-green loop, execute the contract suite only against the in-memory adapter. Run the suite against real database containers or local services once at the end of the ticket, right before opening a pull request.

**Which modules need concurrency stress tests?**
Modules that handle contested shared state: balances, seat bookings, inventory reservations, auction bids, or sequence generators. Read-only queries and uncontested updates do not require concurrent stress tests.

## It's working if

- A single parameterized test suite validates both in-memory and production adapter implementations.
- Edge cases (duplicate keys, not found responses, boundary limits) behave identically across all adapters.
- At least one test executes concurrent parallel mutations to prove locking invariants hold without data corruption.

## Where it fits

A model-invoked engineering skill that extends [tdd](https://aihero.dev/skills-tdd) and builds upon [codebase-design](https://aihero.dev/skills-codebase-design). It operates during [implement](https://aihero.dev/skills-implement) whenever an issue introduces multi-adapter seams or contested mutations. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
