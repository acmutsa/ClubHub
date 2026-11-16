"use client";

import { useId } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toLocalDate, toUtcDate } from "@/lib/calendar-date";
import { cn } from "@/lib/utils";

export function DateField({
  name,
  label,
  fromYear,
  toYear,
  disableFuture = false,
}: {
  name: string;
  label: string;
  fromYear: number;
  toYear: number;
  disableFuture?: boolean;
}) {
  const id = useId();
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = field.value instanceof Date ? toLocalDate(field.value) : undefined;

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  type="button"
                  variant="outline"
                  aria-invalid={fieldState.invalid}
                  className={cn("w-full justify-start font-normal", !selected && "text-muted-foreground")}
                >
                  <CalendarIcon />
                  {selected ? format(selected, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={selected}
                  defaultMonth={selected}
                  onSelect={(date) => field.onChange(date ? toUtcDate(date) : undefined)}
                  startMonth={new Date(fromYear, 0)}
                  endMonth={new Date(toYear, 11)}
                  disabled={disableFuture ? { after: new Date() } : undefined}
                />
              </PopoverContent>
            </Popover>
            <FieldError errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
