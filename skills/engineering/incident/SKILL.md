---
name: incident
description: Production incident response and mitigation. Triage active outages, execute rollbacks or feature flag disables to stop bleeding, then hand off to diagnosing-bugs.
disable-model-invocation: true
---

# Incident

Production incident response, rapid mitigation, and operational triage.

When an outage or critical regression hits production, normal debugging practices are too slow. `diagnosing-bugs` requires building a local feedback loop that goes red, but active production failures demand stopping user impact immediately before spending hours investigating root causes.

The core principle of `incident` is **Mitigate First, Investigate Later**.

## Process

### 1. Rapid triage and blast radius assessment

Gather live evidence quickly to assess the severity and scope of the failure:

- **Collect live error signals**: Review recent logs and error monitoring (Sentry, Datadog, Cloudflare, Render, AWS CloudWatch).
- **Determine blast radius**:
  - What percentage of users or requests are affected?
  - Is data being corrupted or permanently lost?
  - Are external third-party integrations (payments, webhooks) failing?
- **Assign severity**:
  - **Sev-1**: Total service outage, data corruption, or critical core path failure (e.g. checkout completely broken).
  - **Sev-2**: Major feature degraded or elevated error rate with workaround available.
  - **Sev-3**: Minor edge-case or non-critical background job delay.

### 2. Immediate mitigation (stop the bleeding)

Do not attempt to write code fixes directly on production during an active Sev-1 or Sev-2 incident. Focus exclusively on restoring availability:

1. **Check recent deployments and changes**:
   - Inspect commits deployed in the last 1 to 4 hours: `git log -n 10 --oneline`.
   - Identify recent configuration changes, environment variable updates, or database migrations.
2. **Evaluate mitigation actions**:
   - **Action A: Toggle Feature Flag**: If the failing functionality is guarded behind a feature flag (see `release-safety`), disable the flag immediately in the production management console.
   - **Action B: Rollback Code**: If the issue was introduced in the latest release and cannot be toggled off, immediately roll back to the previous known-good deployment artifact or commit tag.
   - **Action C: Restart or Scale**: If memory exhaustion, queue backlog, or database connection pool exhaustion is observed, restart unhealthy instances or temporarily increase worker capacity.
3. **Handle database migrations cautiously**:
   - If a database migration was deployed, verify backward compatibility before rolling back application code (see `safe-migrations`).
   - Never run destructive down-migrations in panic that drop tables or delete user data.

### 3. Verify stabilization

After executing the mitigation:

- Confirm error rates decline and health checks return to green.
- Verify core user journeys succeed via smoke testing.
- Announce operational status to the team.

### 4. Hand off to deep diagnosis

Once production is stable, preserve the incident evidence and hand off for engineering investigation:

1. **Export incident bundle**: Save sample correlation IDs, error stack traces, and request payloads into `.scratch/incidents/<date>-<incident-name>.md`.
2. **Hand off to `diagnosing-bugs`**:
   - Tell the user to run `/diagnosing-bugs` using the exported evidence.
   - `diagnosing-bugs` builds a reproducible local test loop that replicates the production failure, minimises it, and writes a permanent regression test.
3. **Conduct post-mortem with `/retro`**:
   - Run `/retro` to document the incident timeline (Detection, Mitigation, Resolution).
   - Record root cause findings and define preventive automated CI checks or architectural guardrails in `CODING_STANDARDS.md` and `AGENTS.md`.
