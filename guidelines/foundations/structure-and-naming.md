# Structure and naming

Predictable names save time. A new contributor should be able to find a query by searching for `get`, a server mutation by searching for `Action`, and a validator by searching for `Schema`.

## Put code near its owner

Shared application code belongs in `src/components` and `src/lib`. Route-specific code belongs beside the route.

```txt
src/app/clubs/[clubId]/admin/events/
  page.tsx
  loading.tsx
  error.tsx
  actions.ts
  queries.ts
  validators.ts
  components/
    event-data-table.tsx
```

Keep business logic out of React components. Keep actions thin too. A server action should validate, authorize, call the domain or database layer, revalidate affected paths, and return a small result.

## Naming table

| Thing | Pattern | Example |
| --- | --- | --- |
| Files and folders | kebab-case | `create-event-form.tsx` |
| React components | PascalCase | `CreateEventForm` |
| Server actions | verb first, end in `Action` | `createEventAction` |
| Queries | start with `get`, `find`, or `list` | `listClubEvents` |
| Business functions | use a domain verb | `scheduleEvent` |
| Zod schemas | camelCase, end in `Schema` | `createEventSchema` |
| Input and output types | PascalCase and specific | `CreateEventInput` |
| Database models | singular PascalCase | `Membership` |
| Database table maps | plural snake case | `club_memberships` |
| Permissions | dot-separated | `events.create` |
| Feature flags | kebab-case | `event-check-in` |

Use `At` for timestamps such as `createdAt`, `Date` for calendar dates such as `dueDate`, and `Cents` for stored money such as `totalCents`.

Avoid names such as `processData`, `handleThing`, `Item`, or bare `Result`. They hide intent. `CreateEventResult` gives the next programmer a real search term.

## Route names

Routes should use the words people use in the product: `clubs`, `events`, `members`, `schedule`, and `settings`. Folders named `management`, `data`, or `modules` say how the code is organized but say little about the work inside.
