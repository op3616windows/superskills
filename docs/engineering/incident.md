## What it does

`incident` orchestrates rapid production incident response, operational triage, and fast mitigation during live service outages.

The defining constraint is that it prioritises immediate operational mitigation over finding root causes in code: it halts active user impact via feature flag disables, traffic rerouting, or rollbacks before handing off diagnostic artifacts. Attempting to debug complex production failures interactively while users experience errors wastes critical time.

## When to reach for it

You invoke this by typing `/incident`. The [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own.

| Situation | What to run |
| --- | --- |
| Live production outage, critical regression, or 5xx error spike | `/incident` |
| Stable system with an intermittent or subtle bug to solve | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |
| Post-incident review to harden the environment against repeat failures | [retro](https://aihero.dev/skills-retro) |
| Standard feature bug reports incoming from users | [triage](https://aihero.dev/skills-triage) |

## Mitigate first, investigate later

During an active incident, engineers frequently fall into the trap of analyzing stack traces and attempting live code fixes. `incident` redirects focus to immediate containment:

1. **Assess blast radius and severity**: Determine affected services and error rates.
2. **Identify recent changes**: Inspect the last 1 to 4 hours of deployments, configuration changes, and migrations.
3. **Execute rapid mitigation**:
   - Toggle off the offending feature flag if available.
   - Roll back application code to the last known-good tag.
   - Restart failing processes or scale resource limits if memory or connections are exhausted.

## The handoff to diagnosis

Once production error rates return to normal and service health is verified, `incident` compiles the collected logs, correlation IDs, and stack traces into an incident archive under `.scratch/incidents/`.

It then hands off the evidence to [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs), which reproduces the failure in a controlled local environment and builds a permanent regression test. The process concludes with [retro](https://aihero.dev/skills-retro) to prevent recurrence.

## Common questions

**What if rolling back requires reverting a database migration?**
Never rush destructive database rollbacks during an incident. If migrations followed [safe-migrations](https://aihero.dev/skills-safe-migrations), the new schema is backward-compatible with the older application code, allowing the application to roll back safely while leaving the new database columns intact.

**Can incident triage run autonomously?**
No. Production mitigation involves high-impact decisions like toggling feature flags or rolling back releases. The skill presents clear options and recommended commands, but execution is guided with explicit human confirmation.

## It's working if

- Mitigation actions (flag disable or rollback) occur within minutes of incident declaration.
- Production error rates decline and health checks return to green.
- Error payloads and correlation IDs are captured before context is lost.
- A clean handoff is made to [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) for root cause analysis.

## Where it fits

An emergency user-invoked operational on-ramp that precedes [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs). It bridges live alerts with engineering resolution, concluding with [retro](https://aihero.dev/skills-retro). See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
