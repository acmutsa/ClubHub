# Pages and layouts

Next.js layouts stay mounted while their child routes change. Put shared shells and shared checks there once, then let each page focus on its own data and content.

## What belongs in each layout

`src/app/layout.tsx` owns app-wide work. It currently loads the fonts and theme cookie, wraps the app in `TooltipProvider`, and renders the global `Toaster`.

`src/app/clubs/[clubId]/layout.tsx` owns the club shell. It resolves the club context, checks that the URL matches the active club, and renders the club navbar and footer.

`src/app/clubs/[clubId]/admin/layout.tsx` owns the admin shell. It rejects members without club permissions and renders the admin sidebar. Child pages still check the specific permission they need.

Use the closest common layout. Putting a club-only provider in the root layout makes public pages pay for it. Repeating admin authorization in ten pages makes one of those pages easy to miss.

## A section layout example

Suppose every event settings page needs the same permission and tabs:

```tsx
import { forbidden } from "next/navigation"
import { Permission } from "@/constants/permissions"
import { requireAuthContext } from "@/lib/auth/get-auth-context"

export default async function EventSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await requireAuthContext()

  const canManageEvents = context.hasPermission(Permission.EVENTS_EDIT)

  if (!canManageEvents) forbidden()

  return (
    <section>
      <EventSettingsTabs />
      {children}
    </section>
  )
}
```

Do not trust a hidden tab or button as authorization. The server layout or action still has to reject the request.

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
    <Link href="/admin/events/new">New event</Link>
  </Button>
</header>
```

The same restraint applies to card headers. Use the card title, actions, and short record metadata that helps someone scan, such as an event date or a member's role. Filler like "Manage your events here" adds height without helping a decision.
