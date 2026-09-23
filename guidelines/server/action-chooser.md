# Choose an action helper

Start with the resource being changed. Its scope tells you which action wrapper to use.

| Resource or operation | Helper | Context supplied |
| --- | --- | --- |
| Event, member, or settings for the active club | `createSafeAction` | User, club, membership, club ID, permission array, IP address |
| Joining a club or creating a new club | `createAuthenticatedSafeAction` | User and IP address |
| Reviewing clubs across the whole platform | `createPlatformSafeAction` | User, platform role, platform permissions, permission helpers |
| Public operation with no user | No matching shared wrapper yet | Ask before inventing a new action pattern |

## Club-owned mutations

Use `createSafeAction` when the record belongs to the active club. The wrapper resolves the club and membership before it validates input or runs the handler.

```ts
export const updateEventTitleAction = createSafeAction(
  {
    schema: z.object({
      eventId: z.string().min(1),
      title: z.string().trim().min(1).max(200),
    }),
    permission: "events.update",
  },
  async ({ eventId, title }, context) => {
    const isAdmin =
      context.membership.role === "ADMIN" ||
      context.membership.role === "SUPER_ADMIN"

    if (!isAdmin) {
      throw actionError(ActionErrorCode.FORBIDDEN, "Permission denied.")
    }

    const [event] = await db
      .update(events)
      .set({ title, updatedBy: context.user.id })
      .where(
        and(
          eq(events.id, eventId),
          eq(events.clubId, context.clubId),
        ),
      )
      .returning()

    if (!event) {
      throw actionError(ActionErrorCode.NOT_FOUND, "Event not found.")
    }

    return { eventId: event.id }
  },
)
```

Both IDs appear in the update condition. That tenant filter matters even though the page already loaded club context.

::: danger Permission is not enforced yet
The `permission` option is accepted but intentionally ignored in the current implementation. Passing `permission: "events.update"` documents intent only. Keep an explicit role or permission check inside the handler until club permission enforcement is implemented.
:::

## Signed-in work without club scope

Use `createAuthenticatedSafeAction` for operations tied to a user but outside one active club. Joining and creating clubs are current examples.

```ts
const joinClubSchema = z.object({
  clubId: z.string().min(1),
})

export const joinClubAction = createAuthenticatedSafeAction(
  { schema: joinClubSchema },
  async ({ clubId }, context) => {
    await db
      .insert(memberships)
      .values({ clubId, userId: context.user.id })
      .onConflictDoNothing()

    revalidatePath("/clubs")
    return { clubId }
  },
)
```

The user ID comes from the session context. Never accept it from a hidden input.

This wrapper returns `UNAUTHORIZED`, `VALIDATION_ERROR`, or `SERVER_ERROR`. It does not expose a custom expected-error class. If a new flow needs a structured `CONFLICT` or `NOT_FOUND`, extend the shared wrapper deliberately.

## Platform administration

Use `createPlatformSafeAction` for operations across clubs. It resolves platform context and enforces the permission in its options.

```ts
export const approveClubAction = createPlatformSafeAction(
  {
    schema: z.object({ clubId: z.string().min(1) }),
    permission: "clubs.approve",
  },
  async ({ clubId }, context) => {
    const club = await findClub(clubId)

    if (!club) {
      throw platformActionError(
        ActionErrorCode.NOT_FOUND,
        "The club was not found.",
      )
    }

    await approveClub(club.id, context.user.id)
    revalidatePath("/clubs/review")

    return { clubId: club.id }
  },
)
```

## Reads belong in queries

Use server actions for create, update, delete, membership changes, and commands such as publishing an event. Put ordinary reads in server queries called by server components.

```ts
export async function listClubEvents(clubId: string) {
  return db.query.events.findMany({
    where: (event, { eq }) => eq(event.clubId, clubId),
    orderBy: (event, { desc }) => desc(event.startAt),
  })
}
```

A read does not gain anything from submit state or an `ActionResult` union.

## Quick decision examples

- Creating an event from `/clubs/[clubId]/admin/events`: `createSafeAction`
- Leaving a club from `/clubs`: `createAuthenticatedSafeAction`
- Suspending a club as a site administrator: `createPlatformSafeAction`
- Loading an event detail page: a server query with club context
- Showing the signed-in user's avatar on the landing page: `getCurrentUser()`

## Keep the handler narrow

A good action validates and authorizes, calls focused database or domain code, revalidates affected paths, and returns the ID or record needed by the client. Avoid sending a full private record back when the client only needs `{ eventId }`.
