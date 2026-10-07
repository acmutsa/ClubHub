# Request context and authentication

Context answers three questions: who is signed in, which club or platform surface the request targets, and what that person may do there. Picking the right helper keeps those questions separate.

## How a request gets its scope

`src/proxy.ts` runs before matched application routes. It writes these request headers:

| Header | Meaning |
| --- | --- |
| `x-current-path` | Original path and query string, used for the sign-in callback |
| `x-app-scope` | `landing`, `platform`, or `club` |
| `x-club-id` | Club segment from `/clubs/[clubId]` |
| `x-club-slug` | Club subdomain when one is present |

A request for `/clubs/acm/events` gets club scope with `x-club-id: acm`. A request for `/clubs` gets platform scope. Other routes get landing scope. On a club subdomain, the proxy rewrites the path into `/clubs/[slug]/...` and keeps the original browser URL.

Do not read these headers throughout feature code. The context helpers interpret them in one place and apply membership checks.

## Pick a context helper

| Need | Helper | Signed-out behavior |
| --- | --- | --- |
| Optional account UI | `getCurrentUser()` | Returns `null` |
| Any signed-in user | `requireCurrentUser()` | Redirects to sign-in |
| Optional signed-in club member | `getOptionalClubContext()` | Returns `null` |
| Required club member | `getClubContext()` or `requireClubContext()` | Redirects to sign-in |
| Club auth alias | `getAuthContext()` or `requireAuthContext()` | Optional or required club context |
| Platform user | `getPlatformContext()` or `requirePlatformContext()` | Redirects to sign-in |

## Current user helpers

`getCurrentUser()` reads the Better Auth session and returns the user or `null`. React's `cache()` prevents repeated session work during the same server render.

Use it when both signed-in and signed-out output are valid:

```tsx
import { getCurrentUser } from "@/lib/auth/current-user"

export default async function LandingPage() {
  const user = await getCurrentUser()

  return (
    <main>
      <Hero />
      {user ? <Link href="/clubs">Open ClubHub</Link> : <SignInLink />}
    </main>
  )
}
```

`requireCurrentUser()` fits a page that needs an account but does not need club membership:

```tsx
import { requireCurrentUser } from "@/lib/auth/current-user"

export default async function AccountPage() {
  const user = await requireCurrentUser()

  return <AccountDetails user={user} />
}
```

Neither helper proves club membership. A user ID alone is not enough to query tenant-owned records.

## Club context

`getCurrentClub()` uses the proxy headers to find a club by slug or ID. It returns `null` outside club scope or when the club does not exist.

`getOptionalClubContext()` returns `null` when nobody is signed in or when the user lacks an active approved membership. Once a user exists, it requires a valid club. A missing club calls `notFound()`. A missing membership returns `null`.

`getAuthContext()` exposes the optional club context. `requireAuthContext()` delegates to `requireClubContext()` for required club access.

`getClubContext()` and `requireClubContext()` redirect signed-out users and forbid signed-in users without an active approved membership. The result contains:

```ts
{
  user,
  club,
  clubId: club.id,
  membership,
  permissions,
  ipAddress,
}
```

The `permissions` array comes from the member's assigned club role. Use `context.hasPermission(Permission.EVENTS_CREATE)` or `context.requirePermission(...)` for club authorization. A platform `ADMIN` role does not grant club permissions.

### A club page

```tsx
import { notFound } from "next/navigation"

import { requireClubContext } from "@/lib/club-context/get-club-context"
import { getEventById } from "./queries"

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const context = await requireClubContext()
  const event = await getEventById(context.clubId, eventId)

  if (!event) notFound()

  return <EventDetailView event={event} />
}
```

The query receives both IDs. Filtering by `eventId` alone creates an unsafe direct-object reference because the same event ID could be requested from another club route.

### A tenant-safe query

```ts
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { events } from "@/db/schema"

export async function getEventById(clubId: string, eventId: string) {
  return (
    (await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.clubId, clubId)),
    })) ?? null
  )
}
```

### Checking a route parameter

`matchesClubRoute()` accepts either the stored ID or slug. Use it in a layout that receives `[clubId]`:

```tsx
const { clubId } = await params
const context = await requireClubContext()

if (!matchesClubRoute(context.club, clubId)) {
  notFound()
}
```

This stops a route parameter and the proxy-resolved club from drifting apart.

## Platform context

`getPlatformContext()` and `requirePlatformContext()` require a signed-in user. They return `user` and `isAdmin`, where `isAdmin` reflects the user's global `ADMIN` role. Platform safe actions require a typed global role name through their `role` option. Platform roles do not alter club membership or permissions.

```tsx
const context = await requirePlatformContext()
if (!context.isAdmin) forbidden()
```

## Safe sign-in callbacks

`getSafeCallbackUrl()` only accepts local application paths. It rejects absolute URLs, protocol-relative URLs, API paths, and sign-in loops. Platform callbacks must also stay under `/clubs`.

```ts
getSafeCallbackUrl("/clubs/acm/events")
// "/clubs/acm/events"

getSafeCallbackUrl("https://attacker.example")
// "/"

getSafeCallbackUrl("//attacker.example")
// "/"

getSafeCallbackUrl("/settings", "platform")
// "/clubs"
```

Use `getSignInUrl()` when rendering a sign-in link with a return path:

```tsx
const href = getSignInUrl("/clubs/acm/events")

return <Link href={href}>Sign in to view events</Link>
```

Use `redirectToSignIn()` from server code when the current request must stop. Do not build callback URLs by concatenating untrusted query values.

## Client auth

`auth/client.ts` exports `signIn`, `signOut`, `signUp`, and `useSession` from Better Auth for client components.

```tsx
"use client"

import { signOut } from "@/lib/auth/client"

export function SignOutButton() {
  return <Button onClick={() => signOut()}>Sign out</Button>
}
```

Client auth helpers improve interaction but do not authorize server data. Every query and mutation still checks its server context.

`auth/server.ts` configures email and password login with the SQLite Drizzle adapter. The reset-password callback is a placeholder right now, so password reset is unfinished until delivery is implemented and tested.
