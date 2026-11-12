---
name: contract-concurrency
description: Test adapter contract parity across multiple implementations and stress-test concurrent state mutations. Use when building seams with InMemory and real database/cache adapters (Postgres, Redis), testing race conditions, writing concurrent Promise.all stress tests, verifying transaction isolation, or testing row locking.
---

# Contract Concurrency

Discipline for adapter contract parity and concurrent stress testing.

The `codebase-design` and `tdd` skills recommend isolating external systems behind clean seams (such as `OrderStoreAdapter`) and writing business logic tests against fast in-memory adapters (`InMemoryOrderStore`).

However, in-memory adapters run synchronously in single-threaded JavaScript, masking production realities: transaction isolation levels, connection pooling limits, foreign key constraints, deadlocks, and race conditions. A test suite that passes 100% on an in-memory adapter can fail catastrophically when deployed against PostgreSQL or Redis.

`contract-concurrency` extends `tdd` with two mandatory testing practices.

## 1. Contract Parity Test Suite

Whenever a seam has two or more implementations (for example, `InMemoryStore` for local development and unit tests, and `PostgresStore` for production), both adapters must pass the exact same contract test suite.

### The Shared Contract Runner Pattern

Define the test suite inside a shared factory function that accepts an adapter factory:

```typescript
export function describeStoreContract(createStore: () => Promise<Store>) {
  describe("Store Contract Parity", () => {
    let store: Store;

    beforeEach(async () => {
      store = await createStore();
    });

    it("returns null when item does not exist", async () => {
      const result = await store.getById("non-existent");
      expect(result).toBeNull();
    });

    it("rejects duplicate keys with a typed EntityConflictError", async () => {
      await store.insert({ id: "item-1", name: "Alpha" });
      await expect(store.insert({ id: "item-1", name: "Beta" })).rejects.toThrow(
        EntityConflictError
      );
    });

    it("preserves ordering and handles boundary pagination", async () => {
      // Verifies identical sorting and offset behavior across both adapters
    });
  });
}
```

### Execution Strategy

- **Local unit tests**: Run `describeStoreContract(() => new InMemoryStore())` during rapid red-green loops. It runs in milliseconds.
- **Integration verification**: Run `describeStoreContract(() => createTestPostgresStore())` against a real database instance before closing the ticket.
- **Invariant**: If `InMemoryStore` and `PostgresStore` disagree on behavior (such as error types, null vs undefined, or sorting order), fix the drift immediately.

## 2. Concurrency Stress Harness

For deep modules that manage contested state (such as account balances, inventory reservation, ticket allocations, or auction bids), unit tests with sequential calls are insufficient. You must write at least one concurrent stress test against the real infrastructure adapter.

### Writing a Concurrency Test

Use `Promise.all` to launch concurrent operations simultaneously against the shared resource:

```typescript
it("prevents inventory overselling under concurrent load", async () => {
  const store = await createTestPostgresStore();
  const itemId = "limited-item";
  const initialStock = 10;
  await store.initItem(itemId, initialStock);

  // Attempt 50 simultaneous purchases for 10 available items
  const attempts = Array.from({ length: 50 }, (_, i) => ({
    userId: `user-${i}`,
    quantity: 1,
  }));

  const results = await Promise.allSettled(
    attempts.map((req) => store.purchase(itemId, req.userId, req.quantity))
  );

  const successfulPurchases = results.filter((r) => r.status === "fulfilled");
  const failedPurchases = results.filter((r) => r.status === "rejected");

  // Invariant verification:
  expect(successfulPurchases).toHaveLength(10);
  expect(failedPurchases).toHaveLength(40);

  const finalItem = await store.getItem(itemId);
  expect(finalItem.remainingStock).toBe(0);
});
```

### Concurrency Invariants to Verify

- **No negative balances or stock**: Ensure inventory or balances never drop below zero.
- **Idempotency**: Repeated or simultaneous executions with the same idempotency key must result in exactly one mutation.
- **No unhandled deadlocks**: Ensure database transaction retries or row-locking (`SELECT ... FOR UPDATE`) cleanly handle lock contention without unhandled database driver crashes.
