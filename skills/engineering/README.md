# Engineering

Skills I use daily for code work.

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[ask-matt](./ask-matt/SKILL.md)**: Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[brownfield-onboard](./brownfield-onboard/SKILL.md)**: Survey an existing brownfield codebase, detect conflicting domain terminology, and bootstrap `GLOSSARY.md` and foundational ADRs.
- **[grill-with-docs](./grill-with-docs/SKILL.md)**: Grilling session that also builds your project's domain model, sharpening terminology and updating `GLOSSARY.md` and ADRs inline.
- **[triage](./triage/SKILL.md)**: Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)**: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./setup-matt-pocock-skills/SKILL.md)**: Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo.
- **[to-spec](./to-spec/SKILL.md)**: Turn the current conversation into a spec and publish it to the issue tracker.
- **[red-team](./red-team/SKILL.md)**: Adversarial security and threat modeling review of a spec before ticketing.
- **[to-tickets](./to-tickets/SKILL.md)**: Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges, whether as text in a local file or as native blocking links on a real tracker.
- **[implement](./implement/SKILL.md)**: Build the work described by a spec or set of tickets, driving `/tdd` at pre-agreed seams and closing out with `/code-review` before committing.
- **[implement-spec](./implement-spec/SKILL.md)**: Implement a whole spec on one integration branch. Works the tickets as a task graph, running implementer subagents across the ready frontier for maximum concurrency, then closes out with `/code-review`.
- **[ship](./ship/SKILL.md)**: Push the current branch, open or update a pull request using the pr skill template, link completed tickets, and route to the next unlocked ticket or /retro.
- **[incident](./incident/SKILL.md)**: Production incident response and mitigation: triage outages, execute rollbacks or feature flag disables to stop bleeding, then hand off to `diagnosing-bugs`.
- **[wayfinder](./wayfinder/SKILL.md)**: Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on the issue tracker, resolved one at a time until the way to the destination is clear.
- **[retro](./retro/SKILL.md)**: Suggest improvements to the coding agent's environment (navigation, automated checks, coding standards, steering files, tooling) after a session, most severe first.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[prototype](./prototype/SKILL.md)**: Build a throwaway prototype to answer a design question: a single shareable HTML file for state/logic, or several toggleable UI variations.
- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)**: Disciplined diagnosis loop for hard bugs and performance regressions: build a feedback loop that goes red on this bug → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./research/SKILL.md)**: Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./tdd/SKILL.md)**: Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[contract-concurrency](./contract-concurrency/SKILL.md)**: Adapter contract parity test suites across implementations and concurrency stress harnesses for contested mutations.
- **[e2e-tracer](./e2e-tracer/SKILL.md)**: Automate ticket Demo Paths into lean Playwright tracer-bullet tests, verifying vertical wiring across UI, auth, API, and database.
- **[domain-modeling](./domain-modeling/SKILL.md)**: Actively build and sharpen a project's domain model by challenging terms, stress-testing with scenarios, and updating `GLOSSARY.md` and ADRs inline.
- **[codebase-design](./codebase-design/SKILL.md)**: Shared discipline and vocabulary for designing deep modules: small interfaces, clean seams, testable through the interface.
- **[ui-craft](./ui-craft/SKILL.md)**: Frontend visual craft, 5-state completeness (loading skeleton, empty, error, optimistic, populated), and WCAG AA standards.
- **[safe-migrations](./safe-migrations/SKILL.md)**: Zero-downtime database schema evolution and parallel change without table locks or service interruptions.
- **[observability](./observability/SKILL.md)**: Structured logging with correlation IDs, OpenTelemetry tracing, and typed error taxonomies at system seams and I/O boundaries.
- **[security-audit](./security-audit/SKILL.md)**: Automated security and authorization audit of code diffs and entrypoints for missing AuthZ, race conditions, and data leakage.
- **[code-review](./code-review/SKILL.md)**: Three-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?), **Spec** (does it faithfully implement the originating issue/spec?), and **Security** (does it protect authorization, concurrency, DTOs, and input validation?), run as parallel sub-agents.
- **[release-safety](./release-safety/SKILL.md)**: Feature flag seams, pre-flight environment checks, and blast radius control for multi-ticket releases.
- **[pr](./pr/SKILL.md)**: The shape a pull request body should take: a summary as the smallest visual that makes the change clear, before/after evidence that it works, and a merge-danger call (one-way or two-way door, plus blast radius).
- **[wizard](./wizard/SKILL.md)**: Generate an interactive bash wizard that walks a human through steps only they can perform: provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover.
