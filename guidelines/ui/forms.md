# Forms and validation

ClubHub uses two form shapes. A page form gets room for longer work. A button-triggered form opens in a dialog on larger screens and a drawer on phones. Both follow the same validation, error, and submission rules.

::: warning Current package gap
The intended standard is TanStack Form. This repository currently uses `react-hook-form` and does not have `@tanstack/react-form` installed. Existing forms explain the current flow, but new forms should follow the target pattern after the package is approved and added.
:::

## The shared form contract

Every interactive form needs these pieces:

- A Zod schema that also runs on the server
- A `Field`, `FieldLabel`, control, and `FieldError` for each value
- A visible form-level error for failures that do not belong to one field
- A submit button that shows a spinner and stays disabled while the request runs
- An unsaved-changes guard when losing edits would hurt

Client validation gives quick feedback. Server validation protects the database. Keep both because a caller can skip browser code and invoke the server boundary directly.

## Write the schema first

Keep user-editable fields in a dedicated input schema. Ownership fields and IDs derived from context stay out of the form.

```ts
import { z } from "zod"

export const createEventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required"),
    startAt: z.date(),
    endAt: z.date(),
    points: z.number().int().min(0),
  })
  .refine((event) => event.endAt > event.startAt, {
    path: ["endAt"],
    message: "End time must be after the start time",
  })

export type CreateEventInput = z.infer<typeof createEventSchema>
```

The `path` on the date rule matters. It puts the message beside the end-time control instead of leaving it as a vague form error.

## A page form with TanStack Form

The exact manual-error API may vary with the installed TanStack Form version. The stable shape is what matters: the field renders its own errors, the submit handler calls a safe action, and server `fieldErrors` return to matching controls.

```tsx
"use client"

import { useState, useTransition } from "react"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { createEventAction } from "../actions"
import { createEventSchema } from "../validators"

export function CreateEventForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      startAt: new Date(),
      endAt: new Date(),
      points: 0,
    },
    validators: { onSubmit: createEventSchema },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null)
      const result = await createEventAction(value)

      if (result.ok) return

      setFormError(result.error.message)

      for (const [name, messages] of Object.entries(
        result.error.fieldErrors ?? {},
      )) {
        formApi.setFieldMeta(name, (meta) => ({
          ...meta,
          errorMap: { ...meta.errorMap, onSubmit: messages },
        }))
      }
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        startTransition(() => form.handleSubmit())
      }}
      className="space-y-6"
    >
      {formError && <p role="alert">{formError}</p>}

      <form.Field name="title">
        {(field) => (
          <Field data-invalid={!field.state.meta.isValid}>
            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              aria-invalid={!field.state.meta.isValid}
            />
            <FieldError errors={field.state.meta.errors} />
          </Field>
        )}
      </form.Field>

      <Button type="submit" disabled={isPending}>
        {isPending && <Spinner />}
        {isPending ? "Creating event" : "Create event"}
      </Button>
    </form>
  )
}
```

Check the installed TanStack Form API before copying `setFieldMeta`. Versions can differ around manual server errors.

## A reusable field example

Complex controls can still follow the field contract. Keep the label, error state, and message outside the control implementation.

```tsx
<form.Field name="points">
  {(field) => (
    <Field data-invalid={!field.state.meta.isValid}>
      <FieldLabel htmlFor={field.name}>Attendance points</FieldLabel>
      <Input
        id={field.name}
        type="number"
        min={0}
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.valueAsNumber)}
        aria-invalid={!field.state.meta.isValid}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )}
</form.Field>
```

## Dialog forms and phone drawers

Keep one form body and change only its container. Closing after success belongs in the wrapper. Values and validation stay in the form.

```tsx
function CreateEventFields() {
  return <FieldGroup>{/* shared fields */}</FieldGroup>
}

return isPhone ? (
  <Drawer open={open} onOpenChange={setOpen}>
    <DrawerTrigger asChild>{trigger}</DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Create event</DrawerTitle>
      </DrawerHeader>
      <CreateEventForm onSuccess={() => setOpen(false)} />
    </DrawerContent>
  </Drawer>
) : (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create event</DialogTitle>
      </DialogHeader>
      <CreateEventForm onSuccess={() => setOpen(false)} />
    </DialogContent>
  </Dialog>
)
```

Use the shared drawer exports from `src/components/ui/drawer.tsx` when implementing this pattern.

## Mapping safe-action errors

Safe actions return field errors as a record of string arrays:

```ts
type ActionFieldErrors = Partial<Record<string, string[]>>
```

Use the first message when the form library accepts one error. Pass the full list to `FieldError` when several messages help fix the field. Keep the general action message at the top because `FORBIDDEN`, `NOT_FOUND`, and server failures may have no field at all.

## Submission behavior

During submission, clear the previous root error, disable the submit button, and show a spinner beside a specific pending label such as "Creating event". On success, show a toast when the form stays open. If success navigates to the new record, the destination screen can carry the confirmation.

Guard against double submission on the client, but make the server mutation safe too. A disabled button cannot stop two browser tabs or a retried network request.

## Existing code to treat with care

`new-event-form.tsx` demonstrates `FieldError` and server field-error mapping, but it uses `react-hook-form` and includes descriptive admin card headers that conflict with the current rules. Use it to understand the old flow. Do not clone it for a new feature unchanged.
