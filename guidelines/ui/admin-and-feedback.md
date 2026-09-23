# Admin UI and feedback

Admin screens are work surfaces. Keep the hierarchy quiet so records and actions carry the page.

## Headers and cards

Page headers contain a title and actions. Card headers contain a title, actions, and compact record metadata when it helps someone identify the record. Leave out eyebrows and generic descriptions unless the requested design includes them.

```tsx
<CardHeader className="flex-row items-center justify-between">
  <div>
    <CardTitle>ACM Fall Kickoff</CardTitle>
    <p className="text-sm text-muted-foreground">Sep 18 at 6:00 PM</p>
  </div>
  <EventActions eventId={event.id} />
</CardHeader>
```

Metadata is concrete. An event time helps scanning. "Everything you need to know about this event" does not.

## Pick feedback by consequence

| Situation | Feedback |
| --- | --- |
| Invalid field | `FieldError` under that control |
| Save succeeded or a quick request failed | Toast |
| Page-level warning or recoverable failure | Alert or callout |
| Copy button | Small nearby confirmation or popover |
| Delete or another serious action | Confirmation dialog |
| Leaving a dirty form | Unsaved-changes guard |
| The whole screen must wait | Blocking overlay |

A blocking overlay is rare. If someone can still read, cancel, or work elsewhere, keep the feedback local.

## Pending actions

The button that started an operation should show the wait. Disable it to prevent duplicate requests, keep its width steady, and include a spinner when available.

```tsx
<Button type="submit" disabled={isPending}>
  {isPending && <Spinner data-icon="inline-start" />}
  {isPending ? t("saving") : t("save")}
</Button>
```

Disable other controls only when changing them during the request would corrupt the operation. Freezing an entire page for one row action makes the interface feel brittle.

## Destructive actions

Ask for confirmation when the result is difficult to reverse, affects other people, or deletes business data. Name the record in the dialog and make the destructive button explicit.

```tsx
<DialogTitle>Delete ACM Fall Kickoff?</DialogTitle>
<DialogDescription>
  Attendance records for this event will also be removed.
</DialogDescription>
```

"Are you sure?" forces the person to remember what they clicked. The record name and consequence make the choice legible.

## Accessibility details

Connect labels with control IDs. Put validation text in `FieldError`, which already renders `role="alert"`. Keep keyboard focus inside dialogs and return it to the trigger after closing. Icon-only buttons need an accessible name and a tooltip for sighted users who do not recognize the icon.
