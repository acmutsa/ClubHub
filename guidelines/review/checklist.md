# Security and release checklist

Run this before calling a feature finished. A small route may clear some items in seconds. A mutation that handles membership, money, or uploads deserves a slower pass.

## Route behavior

- The route has a useful `loading.tsx` or local loading state.
- A failed request shows a safe message and a retry action.
- A successful request with zero records has an intentional empty state.
- Missing records use `notFound()` instead of crashing or rendering blanks.
- Shared navigation, providers, and broad permission checks live in the closest layout.

## Authorization and tenant safety

- The server checks authorization. Hiding a button is only a UI choice.
- Club queries filter with the trusted `context.clubId`.
- A form's `clubId`, `userId`, role, price, or owner field is never trusted as authority.
- A route parameter matches the resolved club by ID or slug.
- Platform actions use platform context and a platform permission.
- Direct object references cannot read or change another club's record.
- The club safe action handler performs an explicit role check while permission enforcement is pending.

## Validation and actions

- Every action parses unknown input with the right Zod schema.
- Cross-field rules attach to the field a person should fix.
- Expected failures use `actionError()` or `platformActionError()` where supported.
- Unexpected errors stay on the server and return a generic message.
- The client checks `result.ok` before reading action data.
- Changed server-rendered paths are revalidated after a successful mutation.
- Repeated or retried submissions cannot create damaging duplicates.

## Forms and feedback

- Every control has a label and room for `FieldError`.
- Server field errors map back to their controls.
- The submit button is disabled and shows a spinner while pending.
- Success and failure feedback match the size of the event.
- Destructive actions use a confirmation dialog that names the record and consequence.
- Dirty forms warn before meaningful edits are lost.

## Admin interface

- The page header contains its title and relevant actions.
- Admin cards avoid eyebrows and generic explanatory descriptions.
- Record metadata appears only when it helps identification or scanning.
- Existing components in `src/components/ui` were checked before a new primitive was added.

## Mobile and accessibility

- Desktop tables become useful record cards or lists on a phone.
- Long dialog forms use a bottom drawer on small screens.
- Tap targets, action menus, overflow, and the open phone keyboard were tested.
- Keyboard focus is visible and follows dialogs and drawers correctly.
- Icon-only actions have accessible names.
- Errors use an alert role and do not rely on color alone.
- Long names do not break the layout.

## Security baseline

- User-visible rich text cannot inject scripts.
- Database queries use the ORM safely and do not splice untrusted strings into SQL.
- File uploads, when present, check type, size, ownership, storage name, and download authorization.
- Secrets stay out of client bundles, returned errors, and logs.
- Money uses integer cents and server-owned totals. Tax and payment state changes get focused review.

## Logging and privacy

Log enough context to debug the operation: action name, safe entity IDs, club ID, user ID, permission, and timing when useful. Use structured fields rather than building one long string.

Never log passwords, API keys, session tokens, authorization headers, raw credentials, private provider responses, or unchecked full form payloads. The current action wrappers use `console.error`. Move them to the shared logger when that adapter is added.

## Repository hygiene

- No package was added or restored without approval.
- Superseded routes, fields, components, and actions were removed.
- Schema changes include their migrations, queries, tests, fixtures, and seeds.
- No compatibility shim or dual-write path was added for pre-production data.
- Names follow the project conventions and can be found with a plain text search.

Finish by using the feature as a regular member, a club admin, a signed-out visitor, and a narrow-screen user. Those four passes catch different bugs.
