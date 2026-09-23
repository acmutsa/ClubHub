# Mobile design

Phone layouts need their own information order. Shrinking a six-column table until every cell wraps produces a screen that is technically responsive and miserable to use.

## Tables become record cards

Keep the full table for wider screens. On a phone, render one card per record with the name and status first. Move secondary facts lower and put row actions in a menu or detail drawer.

```tsx
<>
  <div className="hidden md:block">
    <EventsTable events={events} />
  </div>

  <div className="space-y-3 md:hidden">
    {events.map((event) => (
      <EventMobileCard key={event.id} event={event} />
    ))}
  </div>
</>
```

The mobile card is a view of the same data, so extract shared formatting functions instead of duplicating date and status rules.

## Dialogs become drawers

A short confirmation dialog can still work on a phone. A form with a keyboard, several fields, or long option lists belongs in a bottom drawer. The form body stays shared while the container changes at the phone breakpoint.

```tsx
function EventFormFields() {
  return <FieldGroup>{/* shared controls */}</FieldGroup>
}

function EventFormSurface() {
  const isPhone = useMediaQuery("(max-width: 767px)")

  return isPhone ? (
    <Drawer>{/* trigger, content, and EventFormFields */}</Drawer>
  ) : (
    <Dialog>{/* trigger, content, and EventFormFields */}</Dialog>
  )
}
```

A drawer rises from the bottom and works with touch dragging. Use the shared primitive in `src/components/ui/drawer.tsx` for the phone form pattern.

## A useful mobile record card

```tsx
function EventMobileCard({ event }: { event: AdminEvent }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="min-w-0">
          <CardTitle className="truncate">{event.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(event.startAt, "MMM d, h:mm a")}
          </p>
        </div>
        <EventActions eventId={event.id} />
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Badge>{event.eventTypes.name}</Badge>
        <span className="text-sm">{event.points} points</span>
      </CardContent>
    </Card>
  )
}
```

The title and time answer the first two questions someone asks. Less useful fields can wait for the detail view.

## Phone checks

- Keep tap targets large enough to hit without precision.
- Let forms use one column unless two tiny controls clearly belong together.
- Keep primary actions visible without covering the final field.
- Test the open keyboard, validation messages, long record names, and scroll locking.
- Put the most useful record fact first. Desktop column order is a poor default for a card.
- Make sure the drawer can scroll while its header and submit action remain understandable.

Test at a narrow width during development. Waiting until the desktop screen is finished usually exposes structural problems when the form or table is already expensive to change.
