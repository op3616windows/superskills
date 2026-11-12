---
name: release-safety
description: Safeguard deployments with feature flags, pre-flight environment checks, and blast radius control. Use when planning releases, adding feature gates, checking environment variables (.env.example validation), controlling blast radius, or merging multi-ticket specs.
---

# Release Safety

Release engineering discipline, blast radius reduction, and deployment pre-flight verification.

When `/to-tickets` divides a large spec into multiple tracer-bullet tickets, intermediate tickets are merged into the main branch continuously. Without defensive release controls, half-finished features get exposed to real users in production, or missing environment variables cause application startup crashes after deployment.

`release-safety` governs ticket breakdown in `/to-tickets` and pull request preparation in `pr`.

## The Three Rules of Release Safety

### 1. Two-Way Doors via Feature Flag Seams

A **one-way door** is a change that cannot be easily reversed if it misbehaves in production. A **two-way door** can be reversed instantly without deploying code.

- **Threshold for feature flags**: Whenever a feature is split into **three or more tracer-bullet tickets**, or touches a **critical business path** (checkout, authentication, core billing), the very first ticket must introduce a **Feature Flag Seam**.
- **Default to disabled**: New features must default to `false` or `disabled` in production.
- **Safe continuous merging**: Intermediate tickets (Tickets #2, #3, etc.) can be reviewed, tested, and merged to the main trunk continuously. Real users will not encounter incomplete workflows because the feature flag gate shields them until the full feature is verified in staging or production canary.

### 2. Pre-Flight Environment Validation

Application crashes during rolling deployments frequently stem from undeclared environment variables.

Before completing any PR or ticket introducing new configuration:

1. **Document in `.env.example`**:
   - Every new environment variable must be added to `.env.example` with clear comments detailing its purpose, expected format, and default fallback (if non-secret).
2. **Runtime schema validation**:
   - The application must validate environment variables at startup using a strict schema (such as an `env.ts` file using Zod or `@t3-oss/env-core`).
   - If a required variable is missing or malformed, the process must exit immediately during the build or startup phase rather than failing intermittently during runtime requests.

### 3. Automated Flag Cleanup Ticket

Feature flags left permanently in codebases create technical debt, dead code paths, and testing complexity.

Whenever `/to-tickets` introduces a feature flag:

- **Schedule a Flag Cleanup Ticket**: Automatically append a final ticket to the ticket graph (blocked by the release verification ticket).
- **Scope of cleanup**:
  - Remove the feature flag conditional check.
  - Delete the obsolete code path.
  - Remove the feature flag definition from the flag configuration store.

## Pre-Flight Checklist for Pull Requests (`pr`)

Before finalizing a PR for deployment, verify:

1. Are all new environment variables documented in `.env.example` and validated via schema?
2. If this is part of an ongoing multi-ticket spec, is the entrypoint safely gated behind a feature flag?
3. Does the PR clearly declare whether the deployment is a one-way door or a two-way door?
