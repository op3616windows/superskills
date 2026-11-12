---
name: safe-migrations
description: Disciplined zero-downtime database schema migrations and data evolution. Use when modifying database schemas, writing SQL or ORM migrations (Prisma, Drizzle, TypeORM), running ALTER TABLE, adding or dropping columns, renaming fields, altering column types, or adding indexes without table locks.
---

# Safe Migrations

Zero-downtime database schema evolution and data migration discipline.

Applying schema changes in production environments with live web traffic and concurrent workers requires strict backward compatibility. A direct destructive change (dropping a column, renaming a field, changing a type in-place) triggers immediate failures: running application instances crash when querying obsolete columns, or long table locks stall transaction pools.

This skill governs schema changes during `/to-tickets` and `/implement`.

## The Three Rules of Safe Migrations

### 1. Destructive DDL is forbidden

Never execute destructive or blocking DDL in a single deployment:

- **Do not `DROP COLUMN` directly**: Old application workers still running during a rolling deployment will fail when selecting or writing to the dropped column.
- **Do not `RENAME COLUMN` directly**: Renaming is a drop and re-add in disguise. It instantly breaks all currently running code.
- **Do not `ALTER COLUMN TYPE` in place**: Changing a type requires a full table rewrite and an exclusive table lock in most engines (such as PostgreSQL or MySQL).
- **Do not add `NOT NULL` without a safe default**: Adding a `NOT NULL` constraint to an existing table without a default forces a full-table validation scan under an exclusive lock.
- **Never add indexes without concurrency**: In PostgreSQL, always use `CREATE INDEX CONCURRENTLY`. Never create indexes or foreign key constraints without non-blocking options on high-traffic tables.
- **Always specify a short lock timeout**: Configure a lock timeout (for example: `SET lock_timeout = '3s';`) so migration transactions abort quickly instead of queueing behind long-running queries and starving web traffic.

### 2. Enforce Expand-and-Contract (Parallel Change)

Any breaking schema modification (renaming a column, splitting data, changing data types, or introducing mandatory relationships) must be decomposed into three separate deployment phases across tickets:

#### Phase 1: Expand
- Add the new column as `nullable` (or with a safe default value).
- Update the persistence adapter or repository to perform a **dual-write**: every write operation writes identical data to both the old and the new columns.
- Keep reads pointed at the old column (or read from the new column with a fallback to the old column if null).
- Deploy and verify that writes successfully populate both columns.

#### Phase 2: Backfill
- Write an idempotent, batched background migration script to copy legacy data from the old column to the new column.
- Process rows in small batches (e.g., 500 to 1000 records per transaction with sleep intervals) to prevent lock contention, transaction log saturation, or replication lag.
- Once backfill completion is verified at 100%, update the adapter to read exclusively from the new column while continuing the dual-write.
- Deploy and observe read stability.

#### Phase 3: Contract
- Remove the dual-write logic from the application code; write only to the new column.
- Deploy the updated application code and verify that no running code touches the old column.
- In a final, dedicated migration, drop the deprecated column or remove temporary database triggers.

### 3. Encapsulate schema details behind Adapters

Keep schema mechanics and dual-write logic inside persistence adapters (repositories or stores). Never leak dual-write concerns into core domain entities or UI layers:

- The domain model sees only clean entity properties.
- The repository adapter handles the mapping to old and new table columns.
- Contract parity tests must verify that both read fallback and dual-write operate identically across persistence boundaries.

## Checklist for Ticket Breakdown in `/to-tickets`

When `/to-tickets` processes a feature requiring database schema evolution, it must verify:

1. Is any column renamed, dropped, or re-typed? If yes, split into Expand, Backfill, and Contract tickets.
2. Does the migration include `CREATE INDEX CONCURRENTLY` or appropriate non-blocking options?
3. Is an idempotent backfill script required for existing rows?
4. Is there a short `lock_timeout` configured in the migration runner?
