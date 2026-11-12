---
name: observability
description: Design and implement structured logging, OpenTelemetry spans, correlation IDs, and operational metrics at seams and I/O boundaries. Use when adding telemetry, instrumenting HTTP endpoints, queues, or handlers, creating typed error taxonomies, or improving system observability.
---

# Observability

Discipline for production telemetry, structured logging, and distributed tracing at system boundaries.

When an application fails in production (such as intermittent timeouts, memory leaks, or third-party API rejections), bugs cannot be reproduced locally without runtime operational data. Relying on unstructured `console.error` calls produces unsearchable log dumps that lack request context, entity identifiers, and execution duration.

`observability` integrates telemetry into `codebase-design` and `/implement`.

## The Four Rules of Observability

### 1. Instrument at Seams and I/O Boundaries

Telemetry belongs at the edges and seams of your system, never scattered through pure domain functions:

- **Where to instrument**: HTTP handlers, background job processors, database repository adapters, queue listeners, and external API clients.
- **Where to keep clean**: Pure mathematical calculations, domain entity validation, and in-memory business algorithms should remain free of logging clutter.

### 2. Mandatory Structured Context

Every log entry and trace span must be emitted as structured data (JSON or OpenTelemetry attributes) containing:

- **`correlationId` / `requestId`**: Propagated across network calls to trace a request throughout its lifecycle.
- **`tenantId` and `userId`**: Mandatory for multi-tenant systems to isolate incidents to specific customer organizations.
- **`entityId` and `action`**: The domain object being operated on (for example: `orderId: "ord_123"`, `action: "process_payment"`).
- **`durationMs`**: Measured execution duration for all I/O calls to track latency regressions.

### 3. Explicit Error Taxonomy

Generic error handling is forbidden:

- **Never write bare catch blocks**: `catch (e) { console.error(e); }` without contextual attributes is prohibited.
- **Classify errors with typed codes**: Categorize errors into explicit domain error types with machine-readable codes (for example: `INVALID_PAYMENT_METHOD`, `INSUFFICIENT_FUNDS`, `UPSTREAM_GATEWAY_TIMEOUT`, `RECORD_NOT_FOUND`).
- **Preserve error causation**: Always chain the underlying exception using error cause options (`new OrderProcessingError("Payment failed", { cause: err })`) so stack traces remain intact.
- **Distinguish client faults from system failures**: Separate 4xx operational errors (invalid user input) from 5xx server exceptions (database connection dropped) to keep alert channels actionable.

### 4. Golden Signal Metrics

At every critical seam, provide measurements for the four golden signals:

- **Latency**: Time taken to service requests and queries.
- **Traffic**: Request rate and volume across the boundary.
- **Errors**: Rate of failed requests, categorized by error code.
- **Saturation**: Resource utilization, such as connection pool capacity and queue depth.

## Example: Instrumented Seam Adapter

```typescript
export class PostgresOrderStore implements OrderStore {
  constructor(
    private readonly pool: DbPool,
    private readonly logger: Logger,
    private readonly tracer: Tracer
  ) {}

  async save(order: Order, ctx: RequestContext): Promise<void> {
    const span = this.tracer.startSpan("PostgresOrderStore.save", {
      attributes: {
        "order.id": order.id,
        "tenant.id": ctx.tenantId,
        "correlation.id": ctx.correlationId,
      },
    });

    const startTime = Date.now();
    try {
      await this.pool.query(
        "INSERT INTO orders (id, tenant_id, total_amount) VALUES ($1, $2, $3)",
        [order.id, ctx.tenantId, order.totalAmount]
      );
      this.logger.info("Order saved successfully", {
        orderId: order.id,
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        durationMs: Date.now() - startTime,
      });
    } catch (err) {
      this.logger.error("Failed to save order to database", {
        orderId: order.id,
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        durationMs: Date.now() - startTime,
        errorCode: "DATABASE_WRITE_FAILURE",
        error: err instanceof Error ? err.message : String(err),
      });
      span.recordException(err as Error);
      throw new DatabaseStoreError("Database persistence failed", { cause: err });
    } finally {
      span.end();
    }
  }
}
```
