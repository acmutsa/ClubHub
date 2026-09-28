# Pages and layouts

Next.js layouts stay mounted while their child routes change. Put shared shells and shared checks there once, then let each page focus on its own data and content.

## What belongs in each layout

`src/app/layout.tsx` owns app-wide work. It currently loads the fonts and theme cookie, wraps the app in `TooltipProvider`, and renders the global `Toaster`.

`src/app/clubs/[clubId]/layout.tsx` owns the club shell. It resolves the club context, checks that the URL matches the active club, and renders the club navbar and footer.

`src/app/clubs/[clubId]/admin/layout.tsx` owns the admin shell. It rejects members without an admin role and renders the admin sidebar. Child admin pages should not repeat that sidebar or the same role check.

Use the closest common layout. Putting a club-only provider in the root layout makes public pages pay for it. Repeating admin authorization in ten pages makes one of those pages easy to miss.

## A section layout example

Suppose every event settings page needs the same permission and tabs:

```tsx
import { forbidden } from "next/navigation"

import { requireAuthContext } from "@/lib/auth/get-auth-context"

export default async function EventSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await requireAuthContext()

  const canManageEvents =
    context.membership.role === "ADMIN" ||
    context.membership.role === "SUPER_ADMIN"

  if (!canManageEvents) forbidden()

  return (
    <section>
      <EventSettingsTabs />
      {children}
    </section>
  )
}
```

When the permission model is wired into club context, replace the role check with the shared permission helper. Do not trust a hidden tab or button as authorization. The server layout or action still has to reject the request.

## What stays in a page

A page loads route-specific data, handles `notFound()` for its record, and composes the route's main view.

```tsx
import { notFound } from "next/navigation"

import { getEvent } from "./queries"

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const event = await getEvent(eventId)

  if (!event) notFound()

  return <EventDetailView event={event} />
}
```

Keep broad navigation and section chrome out of this file. Those pieces survive navigation better in a layout.

## Admin page headers

An admin page header contains the page title and relevant actions. Skip eyebrows and generic descriptions unless the product request calls for one.

```tsx
<header className="flex items-center justify-between gap-4">
  <h1 className="text-2xl font-semibold">Events</h1>
  <Button asChild>
    <Link href={`/clubs/${clubId}/admin/events/new`}>New event</Link>
  </Button>
</header>
```

The same restraint applies to card headers. Use the card title, actions, and short record metadata that helps someone scan, such as an event date or a member's role. Filler like "Manage your events here" adds height without helping a decision.
