# Safe actions and action errors

A safe action is a server boundary with a stable result shape. It checks identity and scope, validates unknown input with Zod, runs the mutation, and keeps unexpected server details out of the browser.

## What each wrapper does

| Step | Club action | Authenticated action | Platform action |
| --- | --- | --- | --- |
| Resolve identity | Yes | Yes | Yes |
| Resolve tenant or platform role | Club and active membership | No tenant | Global `ADMIN` role |
| Enforce option access | Club permission | No permission option | Global role |
| Validate with Zod | Yes | Yes | Yes |
| Typed expected errors | `actionError()` | `actionError()` | `platformActionError()` |
| Catch unexpected errors | Returns `SERVER_ERROR` | Returns `SERVER_ERROR` | Returns `SERVER_ERROR` |

The wrappers validate on the server even when a form already ran the same schema in the browser.

## The result type

Every shared action returns `ActionResult<T>`:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: {
        code: ActionErrorCode
        message: string
        fieldErrors?: Partial<Record<string, string[]>>
      }
    }
```

Check `result.ok` before reading either branch. TypeScript then knows which fields exist.

```ts
const result = await createEventAction(values)

if (!result.ok) {
  showFormError(result.error.message)
  applyFieldErrors(result.error.fieldErrors)
  return
}

router.push(`/events/${result.data.event.id}`)
```

Do not use `try/catch` for expected action results on the client. The wrapper has already converted those failures into data.

## Error codes

| Code | Meaning | Usual interface response |
| --- | --- | --- |
| `VALIDATION_ERROR` | Input failed the Zod schema | Show field errors and focus the first invalid field |
| `UNAUTHORIZED` | No signed-in user | Send the person to sign-in or show a session message |
| `FORBIDDEN` | Signed in, but lacks access | Show a permission message and keep data hidden |
| `NOT_FOUND` | The requested record or scope does not exist | Show a missing-record state or leave the stale screen |
| `CONFLICT` | Current record state blocks the change | Explain the conflict and refresh stale data |
| `EXPIRED` | A token or operation is too old | Offer a new link or restart action |
| `SERVER_ERROR` | The server failed unexpectedly | Show a generic retry message |

Branch on codes when recovery differs:

```ts
if (!result.ok) {
  switch (result.error.code) {
    case ActionErrorCode.UNAUTHORIZED:
      router.push("/sign-in")
      return
    case ActionErrorCode.CONFLICT:
      toast.error(result.error.message)
      router.refresh()
      return
    default:
      setFormError(result.error.message)
  }
}
```

## Validation errors

The wrappers receive `unknown`, then call `schema.safeParse(rawInput)`. A failed parse returns the general action message plus Zod's flattened field errors.

```ts
{
  ok: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Please fix the highlighted fields.",
    fieldErrors: {
      title: ["Title is required."],
      endAt: ["End time must be after the start time."],
    },
  },
}
```

Client validation improves response time. The action schema is the security boundary.

## Expected business failures

Inside a club action, create a typed error with `actionError()` and throw it:

```ts
if (!event) {
  throw actionError(
    ActionErrorCode.NOT_FOUND,
    "The event was not found.",
  )
}
```

The `throw` matters. Returning `actionError(...)` would count as successful action data.

`SafeActionError` accepts `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `EXPIRED`, and `SERVER_ERROR`. Validation and missing authentication belong to the wrapper, so TypeScript excludes those codes from `actionError()`.

Platform actions use `platformActionError()`. The authenticated wrapper also converts `SafeActionError` from `actionError()` into an action result.

## Business validation tied to a field

Some failures require a database lookup and cannot live in a static Zod rule. Attach those messages to a field:

```ts
const existingEvent = await findEventByTitle(context.clubId, input.title)

if (existingEvent) {
  throw actionError(
    ActionErrorCode.CONFLICT,
    "An event with this title already exists.",
    { title: ["Choose a different title."] },
  )
}
```

The form shows the general conflict and places the fix beside `title`.

## A complete club action

```ts
"use server"

import { revalidatePath } from "next/cache"
import { Permission } from "@/constants/permissions"
import { db } from "@/db"
import { events } from "@/db/schema"
import { createSafeAction } from "@/lib/actions/create-safe-action"
import { insertEventFormSchema } from "@/lib/validators/event"

export const createEventAction = createSafeAction(
  {
    schema: insertEventFormSchema,
    permission: Permission.EVENTS_CREATE,
  },
  async (input, context) => {
    // Check that referenced category and sub-org IDs belong to context.clubId.
    const [event] = await db.insert(events).values({
      ...input,
      clubId: context.clubId,
      createdById: context.user.id,
      updatedById: context.user.id,
    }).returning()

    revalidatePath(`/clubs/${context.clubId}/admin/events`)
    return { event }
  },
)
```

The wrapper checks the assigned club role's permissions. Platform roles do not grant club permissions. Database lookups must still verify that submitted record IDs belong to `context.clubId`.

## A delete action with tenant filtering

```ts
const deleteEventSchema = z.object({
  eventId: z.uuid(),
})

export const deleteEventAction = createSafeAction(
  {
    schema: deleteEventSchema,
    permission: Permission.EVENTS_DELETE,
  },
  async ({ eventId }, context) => {
    const [deleted] = await db
      .delete(events)
      .where(
        and(
          eq(events.id, eventId),
          eq(events.clubId, context.clubId),
        ),
      )
      .returning({ id: events.id })

    if (!deleted) {
      throw actionError(ActionErrorCode.NOT_FOUND, "Event not found.")
    }

    revalidatePath(`/clubs/${context.clubId}/admin/events`)
    return { eventId: deleted.id }
  },
)
```

The confirmation dialog belongs in the client. The authorization and tenant filter belong here because callers can bypass the dialog.

## An authenticated action

```ts
export const leaveClubAction = createAuthenticatedSafeAction(
  {
    schema: createClubMembershipSchema,
  },
  async ({ clubId }, context) => {
    await db
      .delete(clubMemberships)
      .where(
        and(
          eq(clubMemberships.clubId, clubId),
          eq(clubMemberships.userId, context.user.id),
        ),
      )

    revalidatePath("/clubs")
    return { clubId }
  },
)
```

This action can use the request IP from `context.ipAddress` for rate limiting once that system exists. Do not treat a forwarded IP as proof of identity.

## A platform action

```ts
export const rejectClubAction = createPlatformSafeAction(
  {
    schema: z.object({
      clubId: z.uuid(),
      reason: z.string().trim().min(10),
    }),
    role: "ADMIN",
  },
  async ({ clubId, reason }, context) => {
    const club = await findClub(clubId)

    if (!club) {
      throw platformActionError(
        ActionErrorCode.NOT_FOUND,
        "The club was not found.",
      )
    }

    await rejectClub({
      clubId: club.id,
      reason,
      reviewedBy: context.user.id,
    })

    revalidatePath("/clubs/review")
    return { clubId: club.id }
  },
)
```

The platform wrapper checks the requested global role. It does not use club permissions.

## Unexpected failures

Let unexpected database, network, and programming errors throw normally. The wrapper logs server context and returns a generic `SERVER_ERROR` message. Do not send raw exception text to the browser because it may contain schema, query, provider, or secret details.

Use `actionError(ActionErrorCode.SERVER_ERROR, ...)` only when the safe public message is intentional. A truly unexpected exception should keep its original stack for server diagnostics.

## Revalidation and navigation

Call `revalidatePath()` for server-rendered paths whose cached data changed. Navigate from the client after a successful result when the destination depends on returned data.

```ts
const result = await createClubAction(values)

if (result.ok) router.refresh()
```

Avoid redirecting from deep domain code because it makes the mutation harder to reuse and test.

## Logging status

The wrappers currently log unexpected failures with `console.error` and include user, club, or permission context where available. A shared logger adapter is not present in `src/lib` yet.
