"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  eventInsertBaseSchema,
  type EventInsertInput,
} from "@/lib/validators/event";
import { createEventAction } from "@/actions/events";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  id: number;
  name: string;
  color: string;
}

interface Location {
  id: number;
  name: string;
  roomNumber: string;
  building: {
    name: string;
    code: string;
  };
}

interface NewEventFormProps {
  clubId: string;
  eventTypes: EventType[];
  locations: Location[];
  className?: string;
}

export function NewEventForm({
  clubId,
  eventTypes,
  locations,
  className,
}: NewEventFormProps) {
  const router = useRouter();

  const form = useForm<EventInsertInput>({
    resolver: zodResolver(eventInsertBaseSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      description: "",
      points: 0,
      hidden: false,
      locationId: null,
    },
  });

  const { execute, isPending, result } = useAction(createEventAction, {
    onSuccess: () => {
      router.push(`/admin/events`);
    },
    onError: () => {
      console.log(result);
      // toast({
      //   title: "Error",
      //   description: "An error occurred while creating the event.",
      //   variant: "destructive",
      // });
    },
  });

  function onSubmit(values: EventInsertInput) {
    execute({
      ...values,
      clubId,
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-8", className)}
    >
      {/* Root Error */}
      {result?.validationErrors?._errors && (
        <div className="rounded-md bg-destructive/10 border border-destructive p-4">
          <p className="text-destructive text-sm font-medium">
            {result.validationErrors._errors.join(", ")}
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
                    "border-destructive focus-visible:ring-destructive",
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
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              <FieldError>
                {form.formState.errors.description?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="eventTypeId">Event Type</FieldLabel>
              <Select
                onValueChange={(value) =>
                  form.setValue("eventTypeId", parseInt(value), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="eventTypeId"
                  className={cn(
                    form.formState.errors.eventTypeId &&
                      "border-destructive focus-visible:ring-destructive",
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
                {form.formState.errors.eventTypeId?.message}
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
                  value={form.watch("start")}
                  onChange={(date) =>
                    form.setValue("start", date, { shouldValidate: true })
                  }
                  error={!!form.formState.errors.start}
                />
                <FieldError>{form.formState.errors.start?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel>End Date & Time</FieldLabel>
                <DateTimePicker
                  value={form.watch("end")}
                  onChange={(date) =>
                    form.setValue("end", date, { shouldValidate: true })
                  }
                  error={!!form.formState.errors.end}
                />
                <FieldError>{form.formState.errors.end?.message}</FieldError>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Check-in Start</FieldLabel>
                <DateTimePicker
                  value={form.watch("checkinStart")}
                  onChange={(date) =>
                    form.setValue("checkinStart", date, {
                      shouldValidate: true,
                    })
                  }
                  error={!!form.formState.errors.checkinStart}
                />
                <FieldDescription>
                  When attendees can start checking in
                </FieldDescription>
                <FieldError>
                  {form.formState.errors.checkinStart?.message}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel>Check-in End</FieldLabel>
                <DateTimePicker
                  value={form.watch("checkinEnd")}
                  onChange={(date) =>
                    form.setValue("checkinEnd", date, { shouldValidate: true })
                  }
                  error={!!form.formState.errors.checkinEnd}
                />
                <FieldDescription>When check-in closes</FieldDescription>
                <FieldError>
                  {form.formState.errors.checkinEnd?.message}
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
                    value === "none" ? null : parseInt(value),
                    { shouldValidate: true },
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
                      {location.building.code} {location.roomNumber} -{" "}
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Select where the event will be held
              </FieldDescription>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="points">Points</FieldLabel>
                <Input
                  id="points"
                  type="number"
                  min={0}
                  {...form.register("points", { valueAsNumber: true })}
                  className={cn(
                    form.formState.errors.points &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                <FieldDescription>
                  Points awarded for attending this event
                </FieldDescription>
                <FieldError>{form.formState.errors.points?.message}</FieldError>
              </Field>

              <Field
                orientation="horizontal"
                className="items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="hidden">Hidden Event</FieldLabel>
                  <FieldDescription>
                    Hidden events won&apos;t appear to members
                  </FieldDescription>
                </div>
                <Switch
                  id="hidden"
                  checked={form.watch("hidden")}
                  onCheckedChange={(checked) =>
                    form.setValue("hidden", checked)
                  }
                />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/events`)}
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
              error && "border-destructive focus-visible:ring-destructive",
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
        defaultValue="10:30:00"
        className={cn(
          "w-[120px] bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
    </div>
  );
}
