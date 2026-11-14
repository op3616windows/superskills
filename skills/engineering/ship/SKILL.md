---
name: ship
description: "Push the current branch, open or update a pull request using the pr skill template, link completed tickets, and route to the next unlocked ticket or /retro."
disable-model-invocation: true
---

# Ship

Take reviewed local commits across the finish line into a live Pull Request without losing tracker state or bypassing human sign-off on risky changes.

## 1. Pre-flight and branch sanity

1. Run `git status`. If uncommitted changes exist, stop and ask the user whether to commit them via `/implement` or stash them before proceeding.
2. Check the current branch name against the default branch (`main` or `master`). If commits were made directly on the default branch:
   - Create and switch to a descriptive feature branch (`feat/<slug>` or `fix/<slug>`).
   - Reset the local default branch to match `origin/<default>`.
3. Ensure the branch is rebased or merged with the latest upstream default branch so that no conflicts exist.
4. If `code-review` has not been run against the current diff in this session, Call the Skill tool with "code-review" first and resolve any blocking findings (Critical or High).

## 2. Reconcile issue tracker and tickets

Read `docs/agents/issue-tracker.md` to identify the issue tracker and inspect `git log <default-branch>..HEAD`:

1. Identify all tracer-bullet tickets completed in this branch.
2. **GitHub or GitLab tracker:**
   - Prepare `Closes #<ticket-number>` lines for each completed implementation ticket.
   - **Golden rule:** Never add `Closes` for the parent Spec issue unless every child ticket in the spec's task graph is complete.
3. **Local markdown tracker (`.scratch/`):**
   - Mark completed tickets as `[x]` in the local tracker file (`.scratch/<feature>/issues/<NN>-<slug>.md` or `spec.md`).
   - Include that tracker update in the commit before pushing.

## 3. Draft PR body with `pr` and verify Merge Danger

1. Call the Skill tool with "pr" to construct the pull request body (`Summary`, `Evidence`, `Merge Danger`).
2. **Hard One-Way Door Check:**
   - Inspect the diff for database migrations, schema drops or alters, environment variable additions, external webhook or email side effects, or public contract removals.
   - If any are present and the draft marked it as a two-way door, override and escalate `Merge Danger` to a **One-way door** with explicit rollback or migration instructions.
3. Present the proposed PR title, body, linked tickets, and the `Merge Danger` assessment to the user.
4. If the change is a **One-way door**, pause and wait for explicit confirmation from the user before pushing.

## 4. Push and open or update the Pull Request

1. Push the branch to remote: `git push -u origin HEAD`.
2. Check if a PR already exists for this branch (`gh pr view` or `glab mr view`):
   - **If no PR exists:** Create the PR with the generated title and body (`gh pr create`).
   - **If a PR already exists:** Update its title and body in place (`gh pr edit`) so the `Summary`, `Evidence`, and `Merge Danger` never go stale.
3. Check the initial status of CI checks (`gh pr checks`) to verify the PR does not fail build immediately upon opening.
4. If the change introduces manual setup steps (new secrets, third-party dashboard actions, one-off migrations), Call the Skill tool with "wizard" or instruct the user to run the generated wizard before merging.

## 5. Post-ship handoff

Output the PR URL, then inspect the remaining task graph from `/to-tickets`:

1. List which downstream tickets are now unblocked on the **Ready Frontier** so the user knows what to pass to `/implement` in a fresh context window.
2. If all tickets belonging to the spec are now complete, announce that the entire spec is finished.
3. Remind the user: if any friction, convention issues, or navigation hurdles occurred in this session, run `/retro` before clearing context.
