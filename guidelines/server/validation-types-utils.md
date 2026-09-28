# Validation, types, and utilities

Zod schemas protect runtime boundaries. TypeScript types help while writing code, but they disappear after compilation. Data from a form, URL, database adapter, or external service still needs runtime validation when its shape is not already guaranteed.

## Select schemas from Drizzle

The club, event, location, thumbnail, and event-type validators use `createSelectSchema()` from `drizzle-zod`.

```ts
import { createSelectSchema } from "drizzle-zod"

import { events } from "@/db/schema"

export const eventSchema = createSelectSchema(events)
```

This keeps the base runtime shape tied to the table. `adminEventSchema` extends it with the relations expected by the admin view.

```ts
export const adminEventSchema = eventSchema.extend({
  club: clubSchema,
  eventTypes: eventTypeSchema,
  location: locationSchema.nullable(),
  thumbnail: thumbnailSchema.nullable(),
})
```

Use a relation schema when a query promises those relations. Do not claim a related value is present if the query can omit it.

## Parse a query result at a boundary

Drizzle already types local queries. Runtime parsing still helps when a query result crosses a less certain boundary, such as a cached payload or external adapter.

```ts
const row = await loadCachedEvent(eventId)
const parsed = eventSchema.safeParse(row)

if (!parsed.success) {
  console.error("Cached event had an invalid shape.", {
    eventId,
    issues: parsed.error.issues,
  })

  return null
}

return parsed.data
```

Use `safeParse()` when failure is an expected branch. Use `parse()` when an invalid shape is a programming error that should reach the server error boundary.

## Input schemas are separate

A database row schema is a poor create-form schema. Rows contain IDs, ownership fields, and timestamps that the server should set.

```ts
export const createEventFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required"),
  startAt: z.date(),
  endAt: z.date(),
  eventTypeId: z.number().int().positive(),
  locationId: z.number().int().positive().nullable(),
  points: z.number().int().min(0),
  hidden: z.boolean(),
})

export const createEventSchema = createEventFormSchema.refine(
  (event) => event.endAt > event.startAt,
  {
    path: ["endAt"],
    message: "End date must be after the start date",
  },
)
```

The `path` sends the cross-field failure to the value that should change. The server adds `clubId`, `createdBy`, and `updatedBy` from trusted context after parsing.

## Validate URL search parameters

Search parameters are strings and should be parsed before they shape a query.

```ts
const eventFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  query: z.string().trim().max(100).default(""),
  hidden: z.enum(["all", "shown", "hidden"]).default("all"),
})

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await searchParams
  const filters = eventFiltersSchema.parse({
    page: raw.page,
    query: raw.query,
    hidden: raw.hidden,
  })

  const events = await listEvents(filters)
  return <EventsView events={events} filters={filters} />
}
```

Zod coercion turns the page string into a number and rejects values such as `-4` or `abc`.

## Validate route parameters

Dynamic segments are also untrusted strings:

```ts
const eventParamsSchema = z.object({
  eventId: z.string().uuid(),
})

const parsed = eventParamsSchema.safeParse(await params)

if (!parsed.success) {
  notFound()
}

const event = await getEventById(context.clubId, parsed.data.eventId)
```

Use the real ID format. If event IDs are not UUIDs, replace `uuid()` with the matching rule.

## Infer types from schemas

The files in `src/lib/types` use `z.infer`:

```ts
export type AdminEvent = z.infer<typeof adminEventSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
```

This prevents the schema and type from drifting. Import the schema where runtime parsing is needed and the inferred type where TypeScript alone is enough.

Do not create a second hand-written interface with the same fields. Two owners eventually disagree about nullability or a renamed column.

## Membership roles

`types/membership.ts` defines the accepted values once:

```ts
export const membershipRoles = [
  "MEMBER",
  "ADMIN",
  "SUPER_ADMIN",
] as const

export const membershipRoleSchema = z.enum(membershipRoles)
export type MembershipRole = z.infer<typeof membershipRoleSchema>
```

The constant works for select options and database checks. The schema validates runtime input. The type gives autocomplete and compile-time checks.

```ts
export function canManageClub(role: MembershipRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}
```

When the same role rule appears in several server files, move it to a clearly named auth helper and test it there.

## Permission types

`ClubPermissionType` and `PlatformPermissionType` are string aliases right now. They document intent but do not catch a misspelling such as `event.create` versus `events.create`.

A future permission catalog can use constants:

```ts
export const platformPermissions = [
  "clubs.review",
  "clubs.approve",
  "clubs.reject",
] as const

export type PlatformPermissionType =
  (typeof platformPermissions)[number]
```

Do this when the permission names settle. A partial catalog that omits active permissions causes more confusion than the current string type.

## The `cn` helper

`cn()` combines `clsx` conditions with `tailwind-merge` conflict resolution.

```tsx
function Panel({
  selected,
  className,
}: {
  selected: boolean
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-lg border p-4",
        selected && "border-primary bg-primary/5",
        className,
      )}
    />
  )
}
```

A caller can replace spacing without leaving conflicting Tailwind classes:

```tsx
<Panel selected className="p-6" />
```

The final class set contains `p-6`, not both `p-4` and `p-6`.

### Conditional error styling

```tsx
<Input
  aria-invalid={hasError}
  className={cn(
    hasError && "border-destructive focus-visible:ring-destructive",
  )}
/>
```

Keep normal, unconditional class strings plain. Calling `cn()` around every class name adds noise without changing behavior.

## Small utility or domain function?

Put a helper in `src/lib/utils.ts` when it is tiny, stable, and unrelated to one business area. Class merging fits. Event eligibility, membership promotion, and attendance points do not.

```txt
src/lib/utils.ts                         # cn
src/app/clubs/[clubId]/events/lib/
  calculate-attendance-points.ts        # event rule
```

Domain functions deserve names and nearby tests. A general utility drawer makes security and business rules hard to find.
