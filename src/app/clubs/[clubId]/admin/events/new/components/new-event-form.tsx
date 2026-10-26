"use client";

import { type FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InsertEventInput } from "@/lib/types/event";
import type { z } from "zod";
import {
  insertEventFormSchema,
} from "@/lib/validators/event";
import { createEventAction } from "@/app/clubs/[clubId]/admin/events/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
// import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EventType {
  id: string;
  name: string;
  color: string;
}

interface Location {
  id: string;
  roomNumber: string;
  roomName: string | null;
  building: string;
  code: string;
}

interface NewEventFormProps {
  eventTypes: EventType[];
  locations: Location[];
  className?: string;
}

export function NewEventForm({
  eventTypes,
  locations,
  className,
}: NewEventFormProps) {
  const router = useRouter();

  const form = useForm<z.input<typeof insertEventFormSchema>, unknown, InsertEventInput>({
    resolver: zodResolver(insertEventFormSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      description: "",
      points: 0,
      subOrgId: null,
      addressId: null,
      thumbnailFileId: null,
      locationId: null,
    },
  });

  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<
    Awaited<ReturnType<typeof createEventAction>> | null
  >(null);

  function onSubmit(values: InsertEventInput) {
    setActionResult(null);

    startTransition(async () => {
      const result = await createEventAction(values);
      setActionResult(result);

      if (result.ok) {
        router.push("/admin/events");
        return;
      }

      for (const [field, messages] of Object.entries(
        result.error.fieldErrors ?? {},
      )) {
        const message = messages?.[0];

        if (message) {
          form.setError(field as FieldPath<z.input<typeof insertEventFormSchema>>, { message });
        }
      }
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-8", className)}
    >
      {/* Root Error */}
      {actionResult && !actionResult.ok && (
        <div className="rounded-md bg-destructive/10 border border-destructive p-4">
          <p className="text-destructive text-sm font-medium">
            {actionResult.error.message}
          </p>
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Basic information about your event</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                placeholder="Enter event title"
                {...form.register("title")}
                className={cn(
                  form.formState.errors.title &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              <FieldError>{form.formState.errors.title?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                rows={4}
                {...form.register("description")}
                className={cn(
                  form.formState.errors.description &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              <FieldError>
                {form.formState.errors.description?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="categoryId">Event Type</FieldLabel>
              <Select
                onValueChange={(value) =>
                  form.setValue("categoryId", value, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="categoryId"
                  className={cn(
                    form.formState.errors.categoryId &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                >
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>
                {form.formState.errors.categoryId?.message}
              </FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
          <CardDescription>When will your event take place?</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Start Date & Time</FieldLabel>
                <DateTimePicker
                  value={form.watch("startsAt")}
                  onChange={(date) =>
                    form.setValue("startsAt", date, { shouldValidate: true })
                  }
                  error={!!form.formState.errors.startsAt}
                />
                <FieldError>{form.formState.errors.startsAt?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>End Date & Time</FieldLabel>
                <DateTimePicker
                  value={form.watch("endsAt")}
                  onChange={(date) =>
                    form.setValue("endsAt", date, { shouldValidate: true })
                  }
                  error={!!form.formState.errors.endsAt}
                />
                <FieldError>{form.formState.errors.endsAt?.message}</FieldError>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Check-in Start</FieldLabel>
                <DateTimePicker
                  value={form.watch("checkinStartsAt")}
                  onChange={(date) =>
                    form.setValue("checkinStartsAt", date, {
                      shouldValidate: true,
                    })
                  }
                  error={!!form.formState.errors.checkinStartsAt}
                />
                <FieldDescription>
                  When attendees can start checking in
                </FieldDescription>
                <FieldError>
                  {form.formState.errors.checkinStartsAt?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel>Check-in End</FieldLabel>
                <DateTimePicker
                  value={form.watch("checkinEndsAt")}
                  onChange={(date) =>
                    form.setValue("checkinEndsAt", date, { shouldValidate: true })
                  }
                  error={!!form.formState.errors.checkinEndsAt}
                />
                <FieldDescription>When check-in closes</FieldDescription>
                <FieldError>
                  {form.formState.errors.checkinEndsAt?.message}
                </FieldError>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Location & Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Settings</CardTitle>
          <CardDescription>
            Where will your event be held and additional options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="locationId">Location (Optional)</FieldLabel>
              <Select
                onValueChange={(value) =>
                  form.setValue(
                    "locationId",
                    value === "none" ? null : value,
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger id="locationId">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No location</SelectItem>
                  {locations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {location.code} {location.roomNumber} -{" "}
                      {location.roomName ?? location.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Select where the event will be held
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Thumbnail</FieldLabel>
              <div className="flex items-center gap-4 rounded-md border border-dashed p-3">
                <Image
                  src="/event-thumbnail-placeholder.svg"
                  alt="Event thumbnail placeholder"
                  width={160}
                  height={90}
                  className="rounded object-cover"
                />
                <FieldDescription>Thumbnail upload is coming soon.</FieldDescription>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="points">Points</FieldLabel>
              <Input id="points" type="number" min={0} {...form.register("points", { valueAsNumber: true })} />
              <FieldError>{form.formState.errors.points?.message}</FieldError>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/events")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
}

// DateTime Picker Component
interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  error?: boolean;
}

function DateTimePicker({ value, onChange, error }: DateTimePickerProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // Preserve existing time or use current time
    const newDate = new Date(date);
    if (value) {
      newDate.setHours(value.getHours());
      newDate.setMinutes(value.getMinutes());
    } else {
      const now = new Date();
      newDate.setHours(now.getHours());
      newDate.setMinutes(now.getMinutes());
    }
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    onChange(newDate);
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        id="time-picker"
        step="1"
        value={value ? format(value, "HH:mm:ss") : ""}
        onChange={handleTimeChange}
        className={cn(
          "w-[120px] bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
    </div>
  );
}
