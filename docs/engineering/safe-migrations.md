## What it does

`safe-migrations` governs database schema modifications to guarantee zero downtime and prevent blocking table locks during deployments. It guides both the breakdown of schema changes into non-breaking tickets and the implementation of backward-compatible persistence adapters.

The defining constraint is that it prohibits single-step destructive schema changes: breaking schema modifications must be sequenced through expand, backfill, and contract phases across multiple deployments. In high-traffic environments, running a migration that renames a column or adds an index synchronously will lock tables or immediately crash older container instances still serving live traffic.

## When to reach for it

Type `/safe-migrations`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

| Scenario | Guidance |
| --- | --- |
| Modifying an existing database column or table | Follow the expand-and-contract sequence |
| Adding an index to a populated table | Always use non-blocking creation options such as `CONCURRENTLY` |
| Adding a new nullable column or new standalone table | Safe in a single migration, but enforce a short lock timeout |
| Pure domain logic changes with no database alterations | [tdd](https://aihero.dev/skills-tdd) |

## The expand-and-contract sequence

When altering schema structure, work must be split into three distinct phases:

1. **Expand**: Add the new column as nullable or with a default. Update persistence adapters to write concurrently to both old and new columns, while continuing to read from the old column.
2. **Backfill**: Run an idempotent background job to copy historical rows into the new column in small batches, avoiding transaction log bloat. Once complete, switch adapter reads to the new column.
3. **Contract**: Stop writing to the old column, and in a separate migration, drop the deprecated column.

This pattern guarantees that whether old application code or new application code runs against the database during a rolling deployment, neither version encounters missing columns or broken queries.

## Lock timeouts and non-blocking DDL

Even innocent DDL statements like adding a nullable column can stall a production database if they wait for long-running read queries to finish. While waiting, the DDL acquires a lock queue that blocks all subsequent read and write traffic.

`safe-migrations` requires setting a short lock timeout (typically 2 to 5 seconds) before running DDL. If the lock cannot be acquired immediately, the migration aborts safely rather than causing an outage for incoming user traffic.

## Common questions

**Can small or early-stage projects skip the three-phase migration?**
If a project runs a single instance and can tolerate brief maintenance downtime, single-step migrations may be acceptable. However, adopting safe migration habits early prevents catastrophic outages as soon as multiple server instances, background queues, or serverless workers are introduced.

**Where does dual-write logic belong?**
Exclusively inside the persistence adapter or repository. The domain layer should only know about the canonical entity, keeping the migration mechanics hidden from business logic.

## It's working if

- No migration file contains direct `DROP COLUMN` or `RENAME COLUMN` statements alongside application code changes.
- Every index on a production table uses `CONCURRENTLY` or non-blocking syntax.
- Migrations set an explicit `lock_timeout`.
- Breaking changes are represented in [to-tickets](https://aihero.dev/skills-to-tickets) as separate expand, backfill, and contract tickets.

## Where it fits

A model-invoked engineering discipline called automatically during [to-tickets](https://aihero.dev/skills-to-tickets) when breaking down database work, and during [implement](https://aihero.dev/skills-implement) when writing schema files and persistence adapters. It works alongside [release-safety](https://aihero.dev/skills-release-safety) to ensure safe production rollouts. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
