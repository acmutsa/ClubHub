# Loading, errors, and empty states

A data route needs an answer for four outcomes: waiting, failure, an empty result, and useful data. Next.js gives route files for the first two. The page owns the other two.

## Loading

Add `loading.tsx` beside the route when navigation can wait on data. Match the final page's shape with skeletons so the screen does not jump when the data arrives.

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  )
}
```

Use a spinner inside a small control such as a submit button. A page-sized spinner gives no clue about the layout that is coming.

## Route errors and retry

An App Router `error.tsx` file must be a client component. Show a plain explanation and call the supplied `reset` function from the retry button.

```tsx
"use client"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">Events could not be loaded</h2>
      <p className="text-sm text-muted-foreground">
        The request failed. Your data has not been changed.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

Log the technical error on the server or through the shared logger. Do not print stack traces, database messages, or raw exceptions in the interface.

## Empty results

An empty state means the request worked and returned no useful records. Say what is empty, then give the next action when the person has permission to take it.

```tsx
if (events.length === 0) {
  return (
    <div className="rounded-lg border p-8 text-center">
      <h2 className="font-medium">No events yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Create the first event for this club.
      </p>
      <Button className="mt-4" asChild>
        <Link href={`/clubs/${clubId}/admin/events/new`}>New event</Link>
      </Button>
    </div>
  )
}
```

If the viewer cannot create a record, omit the action and explain the state without sending them toward a forbidden screen.

## Local failures

Use a local alert when one panel fails but the rest of the page still works. Reserve the route boundary for failures that make the route unusable. This keeps a failed attendance widget from replacing an otherwise healthy event page.
