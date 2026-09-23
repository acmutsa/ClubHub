# The `src/lib` map

`src/lib` holds code that several routes can share. Most files fit into one of six jobs: action boundaries, authentication, request context, validation, shared types, and small utilities.

## Actions

| File | What it does | Use it when |
| --- | --- | --- |
| `actions/action-error-code.ts` | Defines the error codes returned by actions | Branching on expected failures in client code |
| `actions/create-safe-action.ts` | Validates a club-scoped mutation and supplies club context | Changing data that belongs to the active club |
| `actions/create-authenticated-safe-action.ts` | Validates a mutation and supplies the signed-in user plus IP address | The operation is tied to a user but no active club |
| `actions/create-platform-safe-action.ts` | Validates a platform mutation and enforces a platform permission | Platform-wide administration |

These are custom ClubHub wrappers. The `next-safe-action` package appears in `package.json`, but these files do not use its client or middleware APIs.

## Authentication

| File | What it does | Where it belongs |
| --- | --- | --- |
| `auth/client.ts` | Creates the Better Auth browser client and exports sign-in, sign-out, sign-up, and session helpers | Client components |
| `auth/server.ts` | Configures Better Auth and its Drizzle adapter | Server code and the auth route |
| `auth/schema.ts` | Defines Better Auth tables for users, sessions, accounts, and verification | Database schema setup |
| `auth/current-user.ts` | Reads the current session and exposes optional or required user helpers | Server components, queries, and context builders |
| `auth/get-auth-context.ts` | Aliases optional and required club context | Club-scoped server routes |
| `auth/permissions.ts` | Names club and platform permission string types | Action and context signatures |
| `auth/sign-in-redirect.ts` | Builds a safe sign-in callback and redirects unauthenticated requests | Required server context |

`requireAuthContext()` sounds general, but its implementation returns club context. Do not use it on a landing or platform page just because the viewer must be signed in. Use `requireCurrentUser()` there, or `requirePlatformContext()` for platform administration.

## Request context

| File | What it does | Use it when |
| --- | --- | --- |
| `club-context/get-club-context.ts` | Resolves the request surface, club, membership, user, permissions array, and IP address | Reading club data or authorizing a club route |
| `platform-context/get-platform-context.ts` | Resolves a platform role and exposes permission helpers | Reading or changing platform-wide data |

Context is built from headers set by `src/proxy.ts`. Read [context and auth](/server/context-and-auth) before using these helpers outside a page.

## Validators and types

`validators/club.ts`, `validators/event.ts`, and `validators/location.ts` build Zod schemas from Drizzle tables. Event validation also defines create-form rules and cross-field date checks.

The files under `types` infer TypeScript types from those schemas. `types/membership.ts` is slightly different because it defines the role values and their schema in the same file.

Use inferred types when a type truly mirrors a schema. Write a separate type when the shape has a different owner, such as a view model returned by a query.

## Utility

`utils.ts` exports `cn()`, which combines `clsx` conditional classes and resolves Tailwind conflicts with `tailwind-merge`.

```tsx
<Input
  className={cn(
    "w-full",
    hasError && "border-destructive",
    className,
  )}
/>
```

Keep utilities here only when they are small, stable, and shared. Event pricing logic or attendance rules belong in a named domain module, not a general `utils.ts` drawer.
