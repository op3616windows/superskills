---
name: ui-craft
description: Enforce frontend visual craft, five-state completeness, design system tokens, and WCAG AA accessibility. Use when implementing UI components, writing React or Next.js pages, modifying .tsx or .jsx files, editing styles with Tailwind or CSS, adding loading skeletons or empty states, or auditing frontend interfaces.
---

# UI Craft

Discipline for frontend engineering: five-state completeness, design system fidelity, and accessibility compliance.

When automated coding agents implement frontend components, they often suffer from "AI Slop": writing only the happy path with static mock data, neglecting loading skeletons, crashing on network errors, inventing arbitrary colors that deviate from the design system, and failing basic accessibility standards.

`ui-craft` governs any work touching `.tsx`, `.jsx`, CSS, or frontend components during `/implement`.

## The Five-State Completeness Matrix

A user interface component or vertical slice ticket containing UI is incomplete unless all five states are explicitly implemented and verified:

| State | Requirement | Guardrail |
| --- | --- | --- |
| **1. Loading** | Skeleton loader matching the exact dimensions of final content. | Avoid single generic spinners that cause Cumulative Layout Shift (CLS) when content appears. |
| **2. Empty** | Clear visual message explaining why there is no content. | Always include a prominent Call to Action (CTA) guiding the user on how to populate data. |
| **3. Error** | Human-readable explanation of what went wrong. | Must include an actionable "Retry" button or recovery link; never leave the user at a blank screen. |
| **4. Partial / Optimistic** | Immediate visual feedback when the user mutates state. | Show pending indicators or optimistic updates, and guarantee graceful rollback if the server rejects the action. |
| **5. Populated** | The standard view with real data. | Enforce text truncation, container wrapping, and responsive sizing across all screen widths. |

## Design System Guardrails

### 1. Semantic tokens over arbitrary values
- **Never use arbitrary CSS values or ad-hoc Tailwind classes**: Disallow classes like `bg-[#1a2b3c]` or `p-[13px]`.
- **Use established design system tokens**: Always use semantic variables (for example: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`).
- **Reuse component primitives**: Always leverage established repository component libraries (such as `shadcn/ui`, Radix UI, or Tailwind UI) instead of re-inventing basic buttons, dialogs, dropdowns, or inputs from raw unstyled HTML elements.

### 2. Fluid typography and responsive layout
- **Mobile-first responsive structure**: Design flexbox and grid layouts that adapt cleanly from small mobile viewports (375px) to desktop monitors (1280px+).
- **No fixed pixel widths on layout containers**: Use max-widths, percentages, and auto-margins. Avoid rigid pixel dimensions that trigger horizontal scrolling on mobile.
- **Defensive layout**: Add `truncate`, `line-clamp`, or `break-words` on user-generated text containers to prevent overflow.

### 3. Accessibility Standards (WCAG AA)
- **Contrast**: Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text against background colors.
- **Focus visibility**: Interactive elements must provide visible focus indicators (such as `focus-visible:ring-2 focus-visible:ring-offset-2`).
- **Semantic HTML**: Use native semantic tags (`<button>`, `<nav>`, `<main>`, `<article>`, `<header>`) rather than `div` tags with `onClick` handlers.
- **Screen reader labels**: When using icon-only buttons, always provide `aria-label` or visually hidden screen reader text (`sr-only`).

## Visual Verification

Before marking any UI ticket or component complete:

1. **Check both Desktop (1280px) and Mobile (375px) layouts**:
   - Inspect the rendered component or run browser verification.
   - Confirm that elements stack properly on mobile without horizontal scrollbars.
2. **Verify state transitions**:
   - Manually trigger or test the loading skeleton and error boundary.
3. **Check console output**:
   - Confirm zero React hydration errors, invalid HTML nesting warnings, or unhandled promise rejections.
