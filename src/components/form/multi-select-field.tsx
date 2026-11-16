"use client";

import { ChevronsUpDown, X } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { matchesQuery, toFieldOptions } from "./field-option";

type MultiSelectProps = {
  id: string;
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  invalid: boolean;
};

function MultiSelectBox({
  value,
  onChange,
  invalid,
  children,
  ...props
}: Pick<MultiSelectProps, "value" | "onChange" | "invalid"> & Omit<ComponentProps<"div">, "onChange">) {
  return (
    <div
      {...props}
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 shadow-xs focus-within:ring-[3px] md:min-h-9",
        invalid && "border-destructive",
      )}
    >
      {value.map((item) => (
        <Badge key={item} variant="secondary" className="gap-1 pr-1">
          {item}
          <button
            type="button"
            aria-label={`Remove ${item}`}
            className="hover:bg-foreground/10 rounded-full p-1.5 md:p-0.5"
            onClick={() => onChange(value.filter((other) => other !== item))}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {children}
    </div>
  );
}

function MultiSelectList({
  id,
  label,
  options,
  value,
  onChange,
}: Pick<MultiSelectProps, "id" | "label" | "options" | "value" | "onChange">) {
  const [query, setQuery] = useState("");
  const matches = toFieldOptions(options).filter((option) => matchesQuery(option, query));

  function toggle(item: string) {
    onChange(value.includes(item) ? value.filter((other) => other !== item) : [...value, item]);
  }

  return (
    <div id={id} className="flex min-h-0 flex-col">
      <div className="border-b p-2">
        <Input type="search" placeholder="Search…" aria-label={`Search ${label}`} value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <ul className="max-h-[50dvh] overflow-y-auto p-1 md:max-h-64">
        {matches.length === 0 && (
          <li className="text-muted-foreground px-2 py-6 text-center text-sm">No matches</li>
        )}
        {matches.map((option) => (
          <li key={option.value}>
            <label className="hover:bg-accent flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm px-2 text-sm md:min-h-9">
              <Checkbox checked={value.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
              {option.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MultiSelectInput({ id, label, options, value, onChange, invalid }: MultiSelectProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const box = { value, onChange, invalid };
  const listId = `${id}-list`;
  const list = <MultiSelectList id={listId} label={label} options={options} value={value} onChange={onChange} />;
  const trigger = (
    <button
      id={id}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-controls={listId}
      aria-haspopup="listbox"
      aria-invalid={invalid}
      className="text-muted-foreground flex min-h-7 flex-1 basis-24 items-center justify-between gap-2 text-left text-sm focus-visible:outline-none"
    >
      {value.length === 0 ? "Select…" : ""}
      <ChevronsUpDown className="ml-auto size-4 opacity-50" />
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <MultiSelectBox {...box}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
        </MultiSelectBox>
        <SheetContent side="bottom" className="max-h-[85dvh] gap-0">
          <SheetHeader>
            <SheetTitle>{label}</SheetTitle>
            <SheetDescription className="sr-only">Select all that apply.</SheetDescription>
          </SheetHeader>
          {list}
          <SheetFooter>
            <Button type="button" className="h-11" onClick={() => setOpen(false)}>
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <MultiSelectBox {...box}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        </MultiSelectBox>
      </PopoverAnchor>
      <PopoverContent align="start" side="bottom" avoidCollisions={false} className="w-(--radix-popover-trigger-width) p-0">
        {list}
      </PopoverContent>
    </Popover>
  );
}

export function MultiSelectField({ name, label, options }: { name: string; label: string; options: readonly string[] }) {
  const id = useId();
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <MultiSelectInput id={id} label={label} options={options} value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
