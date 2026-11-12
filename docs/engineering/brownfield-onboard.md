## What it does

`brownfield-onboard` surveys an existing, undocumented codebase to extract implicit domain concepts, resolve naming clashes, and bootstrap foundational documentation. It creates `GLOSSARY.md` and initial architectural decision records without making any code edits.

The defining constraint is that it excavates existing realities rather than designing new abstractions: it catalogues the terms the code already uses and asks you which ones to standardise. Running new feature skills like [grill-with-docs](https://aihero.dev/skills-grill-with-docs) on an unfamiliar codebase without onboarding risks inventing novel terms that clash with legacy models.

## When to reach for it

You invoke this by typing `/brownfield-onboard`. The [agent](https://www.aihero.dev/ai-coding-dictionary/agent) won't reach for it on its own.

| Situation | What to run |
| --- | --- |
| Inheriting a legacy codebase with no `GLOSSARY.md` or ADRs | `/brownfield-onboard` |
| Planning a new feature on an already-onboarded repo | [grill-with-docs](https://aihero.dev/skills-grill-with-docs) |
| Architecture review on a project with existing docs | [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) |
| Diagnosing a bug on a legacy codebase | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |

## Terminology collisions and legacy synonyms

The primary failure mode in brownfield codebases is semantic drift: different modules use different words for the exact same entity. One module calls an object `Customer`, another calls it `Buyer`, and the database schema names the table `accounts`.

`brownfield-onboard` isolates these clusters and interviews you using the [grilling](https://aihero.dev/skills-grilling) primitive. You confirm the canonical name for future work, and designate conflicting terms as legacy synonyms. The result is recorded in a dedicated table inside `GLOSSARY.md` so that future agent sessions recognize historical terms without reproducing them in new code.

## Recovering invisible ADRs

Every surviving codebase contains implicit architectural commitments: how multi-tenancy is isolated, how asynchronous jobs execute, or how external APIs are wrapped. Because they were never written down, new features often violate them unintentionally.

`brownfield-onboard` identifies these implicit conventions from the directory layout, schemas, and git history, converting them into historical ADRs under `docs/adr/`.

## Common questions

**Should I let the skill rename legacy files or refactor old terms?**
No. Renaming legacy symbols across an entire project produces an enormous blast radius with high regression risk. Keep legacy code intact; the glossary bridges the vocabulary gap so new work uses canonical terms while understanding legacy references.

**What if our codebase has multiple competing architecture styles?**
Point out the divergence during the interview. The skill documents the dominant pattern as the accepted standard and records the older approach as deprecated context.

## It's working if

- `GLOSSARY.md` exists with clear definitions and a populated Synonyms & Legacy Terms table.
- At least one recovered ADR documents the existing persistence or concurrency model in `docs/adr/`.
- Subsequent [grill-with-docs](https://aihero.dev/skills-grill-with-docs) sessions use the canonical vocabulary without inventing redundant nouns.

## Where it fits

A run-once onboarding step at the very beginning of working with a legacy project. It feeds directly into the main development flow: once complete, proceed to [grill-with-docs](https://aihero.dev/skills-grill-with-docs) to plan new features. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
