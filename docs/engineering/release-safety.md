## What it does

`release-safety` governs feature gating, pre-flight configuration validation, and blast radius control for software releases.

The defining constraint is that it requires multi-ticket features to be gated behind feature flags from the first ticket and validates runtime environment schemas before release. When vertical slices are merged into the main trunk across multiple sessions, ungated intermediate tickets risk exposing unfinished features to real users before the full workflow is complete.

## When to reach for it

Type `/release-safety`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

| Scenario | What to run |
| --- | --- |
| Slicing a spec into three or more tracer-bullet tickets | `/release-safety` (called via [to-tickets](https://aihero.dev/skills-to-tickets)) |
| Preparing a pull request for production deployment | [pr](https://aihero.dev/skills-pr) |
| Managing database schema changes without downtime | [safe-migrations](https://aihero.dev/skills-safe-migrations) |
| Handling an active production outage | [incident](https://aihero.dev/skills-incident) |

## Turning one-way doors into two-way doors

A release that cannot be reversed without an emergency code deployment is a one-way door. Gating features behind flags converts them into two-way doors that can be enabled or disabled instantaneously.

Whenever [to-tickets](https://aihero.dev/skills-to-tickets) breaks down a feature spanning three or more tickets, `release-safety` mandates establishing a feature flag seam in ticket #1. Subsequent tickets can then be merged to trunk without risking premature exposure.

## Pre-flight validation and flag cleanup

To prevent startup crashes and configuration drift, `release-safety` enforces two automated checks:

1. **Pre-flight environment verification**: Every new configuration parameter must be defined in `.env.example` and validated using strict runtime schemas (such as Zod). Missing variables fail fast during application boot.
2. **Automated flag cleanup tickets**: Whenever a feature flag is created, a final cleanup ticket is automatically appended to the ticket graph to delete the flag and its obsolete branch once production verification succeeds.

## Common questions

**Does every ticket require a feature flag?**
No. Standalone bug fixes, internal refactors, and small changes that fit within one or two tickets do not require feature flags unless they touch high-risk billing or authentication flows.

**How does this interact with the PR skill?**
`release-safety` feeds into [pr](https://aihero.dev/skills-pr). The PR description must explicitly document whether the change is a one-way or two-way door, citing the feature flag gate and confirming that `.env.example` has been updated.

## It's working if

- Multi-ticket specs include a feature flag seam ticket as ticket #1.
- A flag cleanup ticket is scheduled at the end of the ticket graph.
- Every new environment variable is declared in `.env.example` and validated via schema.
- Deploying intermediate tickets causes zero disruptions to active users.

## Where it fits

A model-invoked skill integrated into [to-tickets](https://aihero.dev/skills-to-tickets) during ticket breakdown, and into [pr](https://aihero.dev/skills-pr) during release preparation. It pairs with [safe-migrations](https://aihero.dev/skills-safe-migrations) to ensure complete deployment safety. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
