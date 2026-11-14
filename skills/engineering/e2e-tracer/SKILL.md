---
name: e2e-tracer
description: Automate the Demo Path of a tracer-bullet ticket into a single lean, deterministic Playwright E2E test verifying vertical integration across UI, auth, API, and database. Use when completing ticket implementation, automating demo paths, writing Playwright browser tests, testing vertical integration, verifying full-stack wiring, or debugging UI hydration and serialization boundaries.
---

# E2E Tracer

Automate a ticket's Demo Path into exactly one lean, deterministic Playwright tracer-bullet test.

The `tdd` skill tests business logic and combinatorial edge cases inside deep modules against fast in-memory doubles (20ms to 100ms). But in modern full-stack applications, unit tests cannot detect fractures across the vertical wiring layer: browser, auth cookies, server actions or tRPC routers, serialization boundaries, and real database persistence.

`e2e-tracer` bridges this gap with the "90% Seam TDD + 10% Tracer-Bullet E2E" model. It converts the text Demo Path of a ticket into an automated regression guard without slowing down the development loop.

## The Blind Spots of Seam TDD

A ticket with 100% green unit tests can still fail completely in the browser due to four categories of wiring defects:

1. **Serialization Boundary Failures**: Deep modules passing rich JavaScript instances (`Date`, `Decimal`, `BigInt`, `Map`, `Set`) work in memory, but throw runtime errors when crossing Server/Client Component boundaries or JSON/SuperJSON network payloads.
2. **UI Wiring and Cache Invalidation**: Backend mutations succeed, but React Query or SWR caches fail to invalidate, dialog forms pass inverted props that disable submission buttons, or client-side validation schemas reject valid payloads before the network call.
3. **Middleware, Auth, and Routing**: Deep modules know nothing about `middleware.ts`, CORS headers, session cookies, or redirect loops.
4. **Demo Path Regression Over Time**: Manual verification of a demo path during an initial ticket leaves no automated regression guard. Subsequent tickets can break earlier flows undetected.

## The Four Iron Rules

To keep browser tests fast, stable, and token-efficient, every tracer test must adhere to four strict rules:

### Rule 1: 1:1 Mapping to the Ticket Demo Path

Never test combinatorial business logic or edge cases in E2E.

- If an auction feature has 12 pricing rules and 5 error conditions, all 17 cases belong in `tdd` unit tests.
- The Playwright test in `e2e-tracer` automates only the exact user steps declared in the ticket's `Demo path`: one happy path and at most one critical visible error state.
- Keep the test concise (typically 25 to 50 lines of execution code).

### Rule 2: Mandatory Semantic Locators

Never use CSS structural selectors or brittle DOM paths (for example, `page.locator('div.flex > button:nth-child(2)')`), and avoid excessive reliance on `data-testid`.

- Always use Playwright semantic user-facing locators: `page.getByRole()`, `page.getByLabel()`, `page.getByPlaceholder()`, and `page.getByText()`.
- Dual benefit: If `getByRole('button', { name: 'Submit' })` fails to locate an element, the interface violates accessibility (WCAG) standards. Furthermore, during failures, the agent inspects concise text accessibility snapshots (`ariaSnapshot`) instead of wading through thousands of lines of raw HTML.

### Rule 3: State Initialization via API or Database Seeding

Never use the browser interface to prepare test preconditions.

- If a test requires an existing user, tenant, or auction lot, do not automate registration, login, and item creation forms in the UI.
- Use `storageState` to load pre-authenticated browser sessions.
- Seed database records and dependencies directly via API or ORM helpers in `test.beforeEach` using isolated, unique identifiers (e.g. UUID prefixes).
- Tests must run in under 3 to 5 seconds and remain safe for parallel test runners.

### Rule 4: Zero-Sleep Discipline and Immediate Error Trapping

Never introduce arbitrary pauses with `page.waitForTimeout()`.

- All waits must use web-first, auto-retrying assertions (such as `await expect(page.getByText('Success')).toBeVisible()`).
- Every test must register listeners for uncaught exceptions, page crashes, and framework errors. If the UI appears to render but throws an unhandled error or React hydration mismatch in the console, the test must immediately fail.

```typescript
page.on("pageerror", (err) => {
  throw new Error(`Uncaught page exception: ${err.message}`);
});

page.on("console", (msg) => {
  if (msg.type() === "error") {
    const text = msg.text();
    if (text.includes("Hydration failed") || text.includes("Minified React error")) {
      throw new Error(`Client runtime hydration error: ${text}`);
    }
  }
});
```

## Multi-Context Execution Pattern

When verifying collaborative or real-time workflows (such as auction bidding, real-time chat, or permission changes), use isolated browser contexts rather than separate test files.

```typescript
import { test, expect } from "@playwright/test";
import { seedOpenLot, getAuthStorageState } from "./helpers/seed";

test("Proxy bidding automatically outbids competing buyer across browser contexts", async ({
  browser,
}) => {
  // 1. Seed test data directly via backend helper
  const lot = await seedOpenLot({
    startingPrice: 50_000_000,
    bidIncrement: 5_000_000,
  });

  // 2. Open isolated contexts with pre-seeded auth states
  const buyerAContext = await browser.newContext({
    storageState: await getAuthStorageState("buyer-a"),
  });
  const buyerBContext = await browser.newContext({
    storageState: await getAuthStorageState("buyer-b"),
  });

  const pageA = await buyerAContext.newPage();
  const pageB = await buyerBContext.newPage();

  // Attach error listeners
  for (const page of [pageA, pageB]) {
    page.on("pageerror", (err) => {
      throw new Error(`Page error detected: ${err.message}`);
    });
  }

  await Promise.all([
    pageA.goto(`/lots/${lot.id}`),
    pageB.goto(`/lots/${lot.id}`),
  ]);

  // 3. User A configures proxy ceiling
  await pageA.getByRole("switch", { name: "Enable proxy ceiling" }).click();
  await pageA.getByLabel("Maximum ceiling").fill("100000000");
  await pageA.getByRole("button", { name: "Confirm proxy" }).click();

  await expect(pageA.getByText("Current price: 55,000,000")).toBeVisible();
  await expect(pageA.getByText("Your ceiling: 100,000,000")).toBeVisible();
  await expect(pageB.getByText("100,000,000")).toBeHidden();

  // 4. User B places a standard bid
  await pageB.getByLabel("Bid amount").fill("70000000");
  await pageB.getByRole("button", { name: "Place bid" }).click();

  // 5. Verify real-time UI synchronization across both contexts
  await expect(pageB.getByText("You were automatically outbid")).toBeVisible();
  await expect(pageA.getByText("Current price: 75,000,000")).toBeVisible();
  await expect(pageA.getByText("Winning")).toBeVisible();

  await buyerAContext.close();
  await buyerBContext.close();
});
```

## Debugging Protocol for Test Failures

When a tracer-bullet test fails, do not guess or modify business logic blindly. Follow this diagnostic sequence:

1. **Inspect Accessibility Snapshot**: Capture `await page.accessibility.snapshot()` or check the aria tree. If an expected role or label is missing, fix the UI accessibility attributes.
2. **Review Console and Network Logs**: Check for failed API calls, 401/403 status codes, serialization crashes, or hydration errors.
3. **Isolate Wiring vs Logic**:
   - If the failure is a wiring defect (missing cache invalidation, bad route, broken prop), fix the wiring in the UI or controller layer.
   - If the failure reveals a business domain miscalculation, return to `tdd` and reproduce the edge case with an in-memory unit test first.
