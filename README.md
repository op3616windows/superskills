# SuperSkills: Production-Grade Agent Skills & Guardrails

[![CI / Stress Tests](https://img.shields.io/badge/tests-15%20passed-brightgreen.svg)](scripts/stress-test-skills.mjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/github-op3616windows%2Fsuperskills-blue.svg)](https://github.com/op3616windows/superskills)

A comprehensive suite of agent skills, automated verification harnesses, and strictly binding production engineering guardrails for coding agents. Built for real engineering, not vibe coding.

Originally based on Matt Pocock's skills repository, **SuperSkills** elevates agent workflows with industrial-strength safety: zero-downtime database migrations, WCAG AA frontend craft, concurrency stress testing, distributed observability, pre-implementation threat modeling, automated end-to-end tracer verification, and controlled releases.

---

## The Core Engineering Flow

Coding agents excel when work travels through disciplined, sequential gates rather than loose, unconstrained edits:

```txt
brownfield-onboard → grill-with-docs → to-spec → red-team → to-tickets → implement (tdd + contract-concurrency + ui-craft + observability + e2e-tracer) → code-review (security-audit) → ship → retro
```

1. **Understand & Align**: Bootstrap legacy terminology with `/brownfield-onboard` and drill into domain requirements with `/grill-with-docs`.
2. **Spec & Threat Model**: Synthesize requirements into `/to-spec` and run adversarial security analysis with `/red-team`.
3. **Plan Vertically**: Slice the spec into tracer-bullet tasks with `/to-tickets`, with feature flags planned via `release-safety`.
4. **Implement Disciplined**: Build tickets with `/implement`, driving `/tdd`, verifying adapter contracts with `contract-concurrency`, upholding WCAG AA UI with `ui-craft`, logging structured context with `observability`, and validating live behavior with `e2e-tracer`.
5. **Review & Land**: Run three-axis review with `/code-review` (Standards, Spec, and Security via `security-audit`), push and open PRs with `/ship`, and improve the agent environment with `/retro`.

---

## Production Engineering Guardrails

SuperSkills enforces strictly binding guardrails on coding agents across every session:

- **Database Evolution (`safe-migrations`)**: Direct destructive DDL (`DROP COLUMN`, `RENAME COLUMN`, in-place type alterations) is strictly forbidden. Breaking changes require Expand-and-Contract (Parallel Change). Indexes must be created non-blocking (`CREATE INDEX CONCURRENTLY`), and migrations must enforce short lock timeouts (2 to 5 seconds).
- **Frontend & UI Craft (`ui-craft`)**: Components must handle the 5-State Completeness Matrix (Loading skeleton, Empty with CTA, Error with retry, Partial/Optimistic, Populated). Enforce established design tokens (such as `shadcn/ui`) and WCAG AA accessibility (4.5:1 text contrast, visible focus rings, semantic labels).
- **Testing Seams & Concurrency (`contract-concurrency`)**: Multiple adapters (e.g. in-memory test fake vs real database) must satisfy identical parameterized contract test suites. Modules managing contested state (balances, bookings, inventories) must pass concurrent stress tests (`Promise.all`) verifying row-level locks or atomic versions.
- **Telemetry & Boundaries (`observability`)**: Telemetry belongs at system seams and I/O boundaries. Every log entry and trace span carries `correlationId`, `tenantId`, `entityId`, and `durationMs`. Raw generic error catches are forbidden in favor of typed error taxonomies.
- **Security Audit (`security-audit`)**: In `/code-review`, a dedicated parallel security subagent audits the diff for authorization checks (AuthZ), mutation locking, DTO leakage, and input validation.
- **Threat Modeling (`/red-team`)**: Probes specs for race conditions (TOCTOU), IDOR, negative/overflow numbers, denial of wallet, and state machine smuggling before ticketing.
- **Release Safety (`release-safety`)**: Multi-ticket features require a feature flag seam in ticket #1, pre-flight `.env` schema validation, and a flag cleanup ticket at the end.
- **Legacy Onboarding (`/brownfield-onboard`)**: Audits legacy schemas and bootstraps `GLOSSARY.md` and initial ADRs before new work starts.
- **Production Incidents (`/incident`)**: Mitigate first, investigate later. Halts impact via rollback or flag disable, gathers live evidence, then hands off to `/diagnosing-bugs`.
- **End-to-End Tracer Verification (`e2e-tracer`)**: Automates each ticket's `Demo path` into a single lean, deterministic Playwright test verifying the vertical stack (UI, auth, API, real DB) with zero arbitrary sleeps.
- **Ship & PR Lifecycle (`ship`)**: Validates branch hygiene, formats the pull request body with `/pr` (summary, visual before/after evidence, and merge danger assessment), closes linked tickets, and surfaces the next frontier.

See [Production Guardrails Documentation](docs/agents/production-guardrails.md) for full specifications.

---

## Installation & Setup

Install SuperSkills directly into your coding agents or symlink them into your local workspace.

### 1. Install the skills

<details>
<summary><strong>Claude Code</strong></summary>

Install from GitHub or clone locally:

```bash
git clone https://github.com/op3616windows/superskills.git
cd superskills && ./scripts/link-skills.sh
```

Or configure the plugin in `.claude-plugin/plugin.json`:

```json
{
  "skills": [
    "./skills/engineering/*",
    "./skills/productivity/*"
  ]
}
```

</details>

<details>
<summary><strong>Codex</strong></summary>

```bash
codex plugin marketplace add op3616windows/superskills
codex plugin add superskills@op3616windows
```

Updates itself at startup.

</details>

<details>
<summary><strong>GitHub Copilot (CLI & VS Code)</strong></summary>

```bash
copilot plugin marketplace add op3616windows/superskills
copilot plugin install superskills@op3616windows
```

Add to `~/.copilot/settings.json` for automatic updates:

```json
{
  "extraKnownMarketplaces": {
    "op3616windows": {
      "source": { "source": "github", "repo": "op3616windows/superskills" },
      "autoUpdate": true
    }
  }
}
```

In VS Code, run **Chat: Install Plugin From Source** and enter `https://github.com/op3616windows/superskills`.

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

```bash
gemini skills install https://github.com/op3616windows/superskills.git --path skills/engineering
gemini skills install https://github.com/op3616windows/superskills.git --path skills/productivity
```

Re-run both commands to pull updates.

</details>

<details>
<summary><strong>Cursor, Windsurf, OpenCode, Devin & other agents</strong></summary>

```bash
npx skills@latest add op3616windows/superskills -a <agent>
```

Replace `<agent>` with your tool (e.g. `cursor`, `windsurf`, `devin`, `opencode`), or omit `-a` to select interactively. Run `npx skills@latest update` to update.

</details>

### 2. Run Setup Once Per Project

In your agent session, run:

```bash
/setup-matt-pocock-skills
```

This configuration step:
- Identifies your preferred issue tracker (GitHub, GitLab, Jira, or local Markdown files).
- Sets up standard triage labels and paths for domain documentation (`GLOSSARY.md`, `docs/adr/`).
- Writes the binding production engineering guardrails into your project's `CLAUDE.md` and `AGENTS.md`.

---

## Why These Skills Exist

Coding agents fail in predictable ways when left to raw generation. SuperSkills addresses each failure mode with structured, repeatable discipline:

### 1. Misalignment: The Agent Built The Wrong Thing
- **The Problem**: Developers and product owners often have unstated assumptions. Agents rush ahead and build the wrong feature.
- **The Fix**: [`/grill-me`](./skills/productivity/grill-me/SKILL.md) and [`/grill-with-docs`](./skills/engineering/grill-with-docs/SKILL.md) run structured interviews that probe requirements and edge cases before a line of code is written.

### 2. Inconsistency: The Agent Uses Confusing Jargon
- **The Problem**: Agents invent inconsistent variable names and hallucinate concepts when dropped into a new codebase without domain context.
- **The Fix**: [`/brownfield-onboard`](./skills/engineering/brownfield-onboard/SKILL.md) and [`/domain-modeling`](./skills/engineering/domain-modeling/SKILL.md) build a shared ubiquitous language captured in `GLOSSARY.md` and architecture decision records (ADRs).

### 3. Fragility: The Generated Code Breaks Under Pressure
- **The Problem**: Agent code frequently passes happy-path tests but fails on race conditions, missing edge cases, or database deadlocks.
- **The Fix**: A layered verification stack:
  - [`/tdd`](./skills/engineering/tdd/SKILL.md) enforces red-green-refactor loops.
  - [`contract-concurrency`](./skills/engineering/contract-concurrency/SKILL.md) stress-tests contested state under concurrent load.
  - [`e2e-tracer`](./skills/engineering/e2e-tracer/SKILL.md) automates Playwright tracer bullets verifying the full vertical slice.
  - [`/diagnosing-bugs`](./skills/engineering/diagnosing-bugs/SKILL.md) provides a disciplined diagnostic loop.

### 4. Software Entropy: The Codebase Becomes A Ball Of Mud
- **The Problem**: Rapid AI coding without structural discipline leads to shallow modules, tight coupling, and runaway complexity.
- **The Fix**: [`codebase-design`](./skills/engineering/codebase-design/SKILL.md) guides deep module design (simple interfaces hiding complex behavior), [`/to-spec`](./skills/engineering/to-spec/SKILL.md) maps module dependencies, and [`/improve-codebase-architecture`](./skills/engineering/improve-codebase-architecture/SKILL.md) identifies refactoring opportunities.

### 5. Production Hazards: Dangerous Migrations and Unchecked Security
- **The Problem**: Agents suggest destructive schema changes (`DROP COLUMN`), expose sensitive DTO fields, miss authorization gates, or ship untested configuration drift.
- **The Fix**: Strictly binding guardrails:
  - [`safe-migrations`](./skills/engineering/safe-migrations/SKILL.md) guarantees zero-downtime database evolution.
  - [`security-audit`](./skills/engineering/security-audit/SKILL.md) and [`/red-team`](./skills/engineering/red-team/SKILL.md) audit AuthZ, row locks, and input sanitization.
  - [`observability`](./skills/engineering/observability/SKILL.md) injects correlation IDs and typed error taxonomies at boundaries.
  - [`release-safety`](./skills/engineering/release-safety/SKILL.md) limits blast radius through feature flags and environment validation.

---

## Skills Reference

Skills are grouped into two categories based on invocation:
- **User-invoked**: Invoked explicitly by the user (e.g. `/grill-with-docs`, `/implement`, `/ship`). They orchestrate end-to-end workflows.
- **Model-invoked**: Called autonomously by the agent when the task context requires it, or invoked directly by the user. They enforce reusable discipline.

### Engineering

Skills for daily software design, implementation, testing, review, and operations.

#### User-invoked

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)**: Router that maps every user-reachable skill in this repository and guides which flow fits your situation.
- **[brownfield-onboard](./skills/engineering/brownfield-onboard/SKILL.md)**: Survey an existing codebase, detect conflicting domain terminology, and bootstrap `GLOSSARY.md` and foundational ADRs.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)**: Deep requirement interview that sharpens terminology and updates `GLOSSARY.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)**: Move issues through a state machine of triage roles and criteria.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)**: Scan a codebase for deep-module opportunities and present them as a visual report.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)**: Configure repository issue tracking, triage labels, and production engineering guardrails.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)**: Synthesize current conversation and requirements into an engineering specification.
- **[red-team](./skills/engineering/red-team/SKILL.md)**: Adversarial security and threat modeling review of a specification before ticketing.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)**: Break a specification into tracer-bullet tickets with explicit blocking dependencies.
- **[implement](./skills/engineering/implement/SKILL.md)**: Build ticket work by driving `/tdd`, adhering to guardrails, and closing out with `/code-review`.
- **[implement-spec](./skills/engineering/implement-spec/SKILL.md)**: Implement a full specification on an integration branch with parallel subagents across the task graph.
- **[ship](./skills/engineering/ship/SKILL.md)**: Validate branch status, open or update a pull request with `/pr`, close completed tickets, and route next steps.
- **[incident](./skills/engineering/incident/SKILL.md)**: Production incident response: mitigate first with rollbacks or feature flag disables, then hand off to diagnosis.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)**: Structure complex initiatives into a shared map of decision tickets resolved sequentially.
- **[retro](./skills/engineering/retro/SKILL.md)**: Review recent sessions and improve the agent environment (checks, standards, steering files, tooling).

#### Model-invoked

- **[prototype](./skills/engineering/prototype/SKILL.md)**: Build a lightweight prototype to answer design, state, or UI questions quickly.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)**: Disciplined diagnosis loop for complex bugs and regressions: reproduce, minimize, hypothesize, instrument, and verify.
- **[research](./skills/engineering/research/SKILL.md)**: Investigate questions against authoritative primary sources and capture cited Markdown findings.
- **[tdd](./skills/engineering/tdd/SKILL.md)**: Test-driven development with a red-green-refactor loop across vertical slices.
- **[contract-concurrency](./skills/engineering/contract-concurrency/SKILL.md)**: Adapter contract parity tests and concurrency stress harnesses for contested mutations.
- **[e2e-tracer](./skills/engineering/e2e-tracer/SKILL.md)**: Automate ticket Demo Paths into lean Playwright tracer-bullet tests verifying the vertical stack.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)**: Actively build domain models, validate terms against the glossary, and record ADRs.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)**: Shared discipline for deep modules with simple interfaces hiding rich behavior.
- **[ui-craft](./skills/engineering/ui-craft/SKILL.md)**: Frontend visual craft, 5-state completeness, design token reuse, and WCAG AA standards.
- **[safe-migrations](./skills/engineering/safe-migrations/SKILL.md)**: Zero-downtime database schema evolution and parallel change without table locks.
- **[observability](./skills/engineering/observability/SKILL.md)**: Structured logging with correlation IDs, OpenTelemetry tracing, and typed error taxonomies at system boundaries.
- **[security-audit](./skills/engineering/security-audit/SKILL.md)**: Automated security audit for missing authorization, race conditions, DTO leaks, and input validation.
- **[code-review](./skills/engineering/code-review/SKILL.md)**: Three-axis review of diffs: Standards, Specification compliance, and Security via parallel subagents.
- **[release-safety](./skills/engineering/release-safety/SKILL.md)**: Feature flag seams, pre-flight environment checks, and blast radius control for releases.
- **[pr](./skills/engineering/pr/SKILL.md)**: Structured pull request body with visual summary, verification evidence, and merge danger assessment.
- **[wizard](./skills/engineering/wizard/SKILL.md)**: Interactive terminal wizards for human-only tasks such as credential provisioning or manual cutovers.

### Productivity

Skills for general thinking, communication, knowledge transfer, and agent collaboration.

#### User-invoked

- **[grill-me](./skills/productivity/grill-me/SKILL.md)**: In-depth interview that explores every branch of a decision or design tree.
- **[handoff](./skills/productivity/handoff/SKILL.md)**: Compact conversation state into a structured handoff document for another session.
- **[teach](./skills/productivity/teach/SKILL.md)**: Interactive teaching workspace for learning new concepts and tools across sessions.
- **[to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md)**: Transform complex decisions into targeted questionnaires for stakeholders.
- **[wait-what](./skills/productivity/wait-what/SKILL.md)**: Reframe confusing explanations in plain language using project glossary terminology.

#### Model-invoked

- **[grilling](./skills/productivity/grilling/SKILL.md)**: The reusable interview engine powering `grill-me`, `grill-with-docs`, `triage`, and `wayfinder`.
- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)**: Guidelines for writing clear documentation, steering files, and specifications consumed by AI agents.

---

## Automated Verification & Stress Testing

SuperSkills includes an automated conformance and stress test suite to verify structural and behavioral invariants:

```bash
node scripts/stress-test-skills.mjs
```

The test runner verifies:
1. **Structural & Manifest Integrity**: Manifest registration across `.claude-plugin/plugin.json`, invocation parity between `SKILL.md` and `openai.yaml`, documentation conformance, and symlink health.
2. **Behavioral Engines**: Automated verification of rule engines (`safe-migrations`, `red-team`, `security-audit`, `ui-craft`, `release-safety`, `e2e-tracer`, `ship`).
3. **Executable Concurrency Tests**: Live verification of concurrent mutation safety under high load.
4. **Executable E2E Simulations**: Multi-context Playwright tracer-bullet execution verifying error handling and semantic locators.

---

## Local Development & Linking

To symlink all promoted skills into your local agent directories (`~/.claude/skills` and `~/.agents/skills`):

```bash
./scripts/link-skills.sh
```

Because links point directly to this repository, updating your skills is as simple as running `git pull`.
