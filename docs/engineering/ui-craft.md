## What it does

`ui-craft` enforces frontend engineering discipline, ensuring user interfaces handle all runtime states, maintain design system consistency, and meet accessibility standards.

The defining constraint is that it requires every frontend component to explicitly handle five distinct states and adhere to semantic design tokens rather than shipping only happy-path mock data. When coding agents write UI without this discipline, they routinely produce brittle interfaces that lack loading skeletons, crash on network errors, and introduce arbitrary CSS values that break design coherence.

## When to reach for it

Type `/ui-craft`, or the [agent](https://www.aihero.dev/ai-coding-dictionary/agent) reaches for it automatically when a task fits.

| Situation | What to run |
| --- | --- |
| Writing or modifying React, Vue, Next.js, or HTML components | `/ui-craft` |
| Designing a rapid throwaway prototype to test user reactions | [prototype](https://aihero.dev/skills-prototype) |
| Implementing backend business logic and domain entities | [tdd](https://aihero.dev/skills-tdd) |
| Reviewing code standards and interface diffs | [code-review](https://aihero.dev/skills-code-review) |

## The five UI states

Every UI slice must account for five states before it is considered done:

1. **Loading**: A dimension-accurate skeleton loader preventing layout shift.
2. **Empty**: Informative messaging accompanied by a prominent action button to create or fetch data.
3. **Error**: A clear error description paired with a functional retry mechanism.
4. **Partial or Optimistic**: Instant visual feedback for pending user interactions with clean rollback on failure.
5. **Populated**: Full content display with robust text truncation, responsive wrapping, and hierarchy.

## Guardrails against AI slop

To maintain design integrity across sessions, `ui-craft` enforces strict boundaries:

- **Semantic tokens only**: Prohibits arbitrary hex codes and magic pixel values (such as `bg-[#1a2b3c]` or `h-[47px]`). All colors and spacing must use project theme tokens.
- **Component reuse**: Obligates the use of existing primitives (such as `shadcn/ui` or Radix) rather than raw unstyled HTML elements.
- **Responsive verification**: Mandates checking both desktop (1280px) and mobile (375px) viewports to guarantee no horizontal overflow occurs.
- **Accessibility (WCAG AA)**: Requires visible focus indicators, semantic elements, and screen reader labels on icon buttons.

## Common questions

**Does a small internal admin panel really need all five states?**
Yes. An unhandled error state or missing loading skeleton in an admin dashboard causes confusion and support tickets when network blips occur. Handling these states systematically takes minutes when done upfront during ticket implementation.

**How should visual verification be conducted?**
By checking the interface in headless browser tools, inspecting screenshots across responsive breakpoints, or running automated component tests that verify the presence of error boundaries and loading states.

## It's working if

- UI components render an accurate skeleton loader while waiting for queries.
- Failed network requests display an inline error message with a working retry button.
- All styles utilize semantic design system tokens with zero arbitrary hardcoded colors.
- Layouts render cleanly on both mobile (375px) and desktop (1280px) without horizontal clipping.

## Where it fits

A model-invoked skill triggered automatically during [implement](https://aihero.dev/skills-implement) whenever an issue or ticket touches user interface code. It works with [prototype](https://aihero.dev/skills-prototype) for throwaway experiments and [code-review](https://aihero.dev/skills-code-review) for final inspection. See [ask-matt](https://aihero.dev/skills-ask-matt) for the complete map of skills.
