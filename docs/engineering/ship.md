## What it does

`ship` takes reviewed local commits across the finish line into a live Pull Request. It checks working tree sanity, audits the diff for one-way door hazards, constructs the PR description using [pr](https://aihero.dev/skills-pr), pushes the branch, opens or updates the PR, links completed implementation tickets to close automatically, and points you at the next tickets on the ready frontier.

It is an orchestrator, not a code author. It writes no feature code and invents no PR body format of its own. Its entire job is to handle the outward-facing boundary safely, ensuring that irreversible actions like database migrations and secret rotations require explicit human confirmation while routine steps like ticket reconciliation and CI sanity checks run deterministically.

## When to reach for it

You invoke this by typing `/ship`, and the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own. It ships with `disable-model-invocation: true`, so no other skill can call it either.

| Your situation | Reach for |
| --- | --- |
| Commits are reviewed locally and ready to push and open a PR | `/ship` |
| You want to draft a PR body without touching git remote or tickets | [pr](https://aihero.dev/skills-pr) |
| Code is written but not yet reviewed against spec and standards | [code-review](https://aihero.dev/skills-code-review) first, then `/ship` |
| You want to build a ticket from a spec | [implement](https://aihero.dev/skills-implement) |
| Work is shipped, and you want to lock in environment lessons | [retro](https://aihero.dev/skills-retro) |

## Prerequisites

`ship` requires a clean working tree and an upstream git remote with push permissions. Opening or updating PRs requires the GitHub CLI (`gh`) or GitLab CLI (`glab`) to be authenticated.

If tickets are linked, [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) configured the tracker doc (`docs/agents/issue-tracker.md`), which `ship` reads to decide between GitHub issue closing syntax, GitLab merge request references, or local markdown files in `.scratch/`.

## The last-mile orchestrator

In standard workflows, [implement](https://aihero.dev/skills-implement) stops at a local commit on the current branch. That boundary keeps the agent safe from making irrevocable remote side effects, but leaves a manual gap: pushing branches, drafting PR bodies, linking issue numbers, checking CI pipelines, and calculating what to work on next.

`ship` acts as the conductor across that gap:

1. **Pre-flight guardrails:** Verifies that `git status` is clean and shifts commits off the default branch if you accidentally committed straight to `main`.
2. **Review verification:** Confirms that [code-review](https://aihero.dev/skills-code-review) ran on the diff, or invokes it before pushing.
3. **Drafting and gating:** Calls [pr](https://aihero.dev/skills-pr) for the visual summary and evidence, then subjects the diff to a mandatory one-way door audit.
4. **Publishing:** Pushes the branch, creates or updates the PR in place, and monitors initial CI build checks.
5. **Handoff:** Reconciles completed tracer bullets and directs you to the next startable items.

## Guarding one-way doors

The most critical check inside `ship` is the **Merge Danger** audit. When an agent grades its own changes, it is naturally optimistic, often calling destructive migrations or irreversible configuration edits "two-way doors".

`ship` forces a hard scan of the diff for:

- Database schema alters, column drops, or non-additive migrations
- New required environment variables or secrets
- Public API deprecations or contract deletions
- External irreversible side effects (sending bulk emails, billing events, webhook payloads)

If any of these exist, `ship` overrides the assessment to a **One-way door**, includes explicit rollback or mitigation notes, and halts execution. It will not push code or open the PR until you give explicit human confirmation.

## Ticket reconciliation and the ready frontier

When working through a [spec](https://www.aihero.dev/ai-coding-dictionary/spec) split by [to-tickets](https://aihero.dev/skills-to-tickets), each ticket is a vertical tracer bullet designed to fit a single [context window](https://www.aihero.dev/ai-coding-dictionary/context-window).

`ship` enforces the golden rule of ticket closing:

- **Child implementation tickets:** Automatically prepends `Closes #<id>` (or marks `[x]` in local `.scratch/` markdown) so that merging the PR resolves the finished slice.
- **Parent spec issues:** Never adds a `Closes` keyword for the parent spec issue unless every child ticket in the entire spec graph is complete.

After publishing the PR, `ship` evaluates the remaining task graph and reports the **Ready Frontier**: the exact list of downstream tickets whose blockers are now cleared. This tells you precisely what to feed to [implement](https://aihero.dev/skills-implement) in your next fresh [session](https://www.aihero.dev/ai-coding-dictionary/session).

## Common questions

**Why doesn't `implement` or `pr` push the branch automatically?**

Safety and human control. Committing locally is easy to undo with `git reset`. Pushing to a remote repository triggers webhooks, CI/CD runners, notification emails, and shared team visibility. The design deliberately separates `pr` as a format reference from workflow orchestration so that the decision to broadcast code to the outside world remains an intentional act. `ship` automates that step while preserving the necessary confirmation gate for risky changes.

**What happens if a PR already exists for the branch?**

`ship` updates the existing PR in place using `gh pr edit` (or `glab mr update`). When you add subsequent commits or address review feedback, running `/ship` regenerates the Summary, Evidence, and Merge Danger so the PR description stays fresh rather than going stale after the first push.

**Will `/ship` close my parent spec issue prematurely?**

No. Closing keywords (`Closes #...` or `Fixes #...`) are strictly applied only to the specific child tracer-bullet tickets completed in the branch's commit log. The parent spec issue remains open until the last ticket in the task graph finishes.

**What if the diff has database migrations but the draft calls it a two-way door?**

`ship` overrides the draft. If the diff touches migration directories, alters database tables, or drops columns, `ship` automatically elevates the Merge Danger rating to a One-way door, writes out explicit rollback precautions, and pauses for your approval before running `git push`.

**Can I run `/ship` when using local markdown tickets in `.scratch/`?**

Yes. It inspects `docs/agents/issue-tracker.md`. On local setups, it marks completed ticket files with `Status: resolved` or ticks checklist items in `spec.md`, committing those tracker updates alongside your code before pushing.

## It's working if

- Running `/ship` on uncommitted edits warns you to commit or stash before doing anything else.
- Commits made directly on `main` are automatically moved to a descriptive feature branch before pushing.
- The PR description includes a visual summary, before and after evidence, and a clear Merge Danger classification.
- Changes involving migrations, external webhooks, or environment variables pause and prompt for your confirmation before pushing.
- The output displays the live PR URL and names which tickets on the Ready Frontier are now unblocked.

## Where it fits

`ship` is the release orchestrator of the main flow:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review → ship → retro
```

Its neighbours are [implement](https://aihero.dev/skills-implement), which builds and commits the work locally; [code-review](https://aihero.dev/skills-code-review), which audits the diff before shipping; [pr](https://aihero.dev/skills-pr), which defines the template for the PR body; and [retro](https://aihero.dev/skills-retro), which reflects on friction in the completed session.

[ask-matt](https://aihero.dev/skills-ask-matt) routes across the whole set when you are unsure which skill your situation wants.
