# Build a feature from the outside in

Start with the screen a person will use. Write down what they see while data loads, when no records exist, when the request fails, and after an action succeeds. This catches missing states before the database code hardens around a half-finished interface.

## A workable order

1. Find the closest business route and place the feature there.
2. Decide which shared layout owns navigation, providers, and broad permission checks.
3. Sketch the page header, primary content, empty state, and phone layout.
4. Define a Zod schema at the server boundary.
5. Pick the narrowest context or safe-action helper that matches the operation.
6. Build the form with field errors and a disabled loading button.
7. Add `loading.tsx`, `error.tsx`, and retry behavior where the route needs them.
8. Check authorization, tenant scoping, mobile behavior, and user feedback.

Keep each step small. A route with six states is much easier to reason about when those states are named before the JSX grows.

## Example feature folder

An event editing route could look like this:

```txt
src/app/clubs/[clubId]/admin/events/[eventId]/edit/
  page.tsx
  loading.tsx
  error.tsx
  actions.ts
  queries.ts
  validators.ts
  components/
    edit-event-form.tsx
```

The page reads data and composes the screen. `queries.ts` owns database reads. `actions.ts` owns thin server mutations. The client form handles interaction, then hands validated input to the action. Code used by only this route stays beside the route.

## Before writing a new component

Check `src/components/ui` first. ClubHub already has buttons, inputs, dialogs, cards, tables, skeletons, tooltips, popovers, selects, switches, a spinner, and the field family. Reusing them keeps focus behavior, colors, spacing, and disabled states consistent.

Drawer forms are the phone counterpart to dialog forms. Use the shared drawer primitive from `src/components/ui/drawer.tsx` instead of building a one-off version inside a feature folder.

Create a shared component in `src/components` when several routes need the same behavior. Keep a one-route component in that route's `components` folder. Moving every small component to the top level makes ownership harder to see.

## Package rule

Do not add a package as a side effect of feature work. Explain the missing capability and ask first. The same rule applies to reinstalling a package that used to be present.

## Pre-production changes

ClubHub has no supported legacy contract yet. When a model or route changes, update its schema, callers, tests, fixtures, and seed data in one pass, then remove the old path. Compatibility shims and dual writes leave two versions of the product alive and make beginner mistakes much harder to spot.
