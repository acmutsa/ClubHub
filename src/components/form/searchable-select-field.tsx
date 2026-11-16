"use client";

import { ChevronsUpDown } from "lucide-react";
import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { matchesQuery, type FieldOption } from "./field-option";

const keepFocusInInput = (event: { preventDefault(): void }) => event.preventDefault();

function Combobox({
  id,
  options,
  value,
  onChange,
  onBlur,
  invalid,
}: {
  id: string;
  options: readonly FieldOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid: boolean;
}) {
  const listId = useId();
  const chosenLabel = options.find((option) => option.value === value)?.label ?? "";
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(chosenLabel);
  const [typed, setTyped] = useState(false);
  const [active, setActive] = useState(0);

  const matches = typed ? options.filter((option) => matchesQuery(option, text)) : options;

  useEffect(() => {
    if (!open) setText(chosenLabel);
  }, [open, chosenLabel]);

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  function choose(option: FieldOption) {
    onChange(option.value);
    setText(option.label);
    setTyped(false);
    setOpen(false);
  }

  function selectActiveOption(event: KeyboardEvent<HTMLInputElement>) {
    event.preventDefault();
    if (matches[active]) choose(matches[active]);
  }

  function closeListOnly(event: KeyboardEvent<HTMLInputElement>) {
    event.stopPropagation();
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.max(0, Math.min(matches.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
    } else if (event.key === "Enter" && open) {
      selectActiveOption(event);
    } else if (event.key === "Escape" && open) {
      closeListOnly(event);
    }
  }

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
            aria-invalid={invalid}
            autoComplete="off"
            placeholder="Search…"
            className="pr-8"
            value={text}
            onFocus={(event) => {
              setOpen(true);
              event.target.select();
            }}
            onChange={(event) => {
              setText(event.target.value);
              setTyped(true);
              setActive(0);
              setOpen(true);
            }}
            onBlur={() => {
              setOpen(false);
              setTyped(false);
              onBlur();
            }}
            onKeyDown={handleKeyDown}
          />
          <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 opacity-50" />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        side="bottom"
        avoidCollisions={false}
        className="w-(--radix-popover-trigger-width) p-0"
        onOpenAutoFocus={keepFocusInInput}
      >
        <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1">
          {matches.length === 0 && (
            <li className="text-muted-foreground px-2 py-6 text-center text-sm">No matches</li>
          )}
          {matches.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              onMouseDown={keepFocusInInput}
              onClick={() => choose(option)}
              className={cn(
                "flex min-h-11 cursor-pointer items-center rounded-sm px-2 text-sm md:min-h-9",
                index === active && "bg-accent",
                option.value === value && "font-medium",
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function SearchableSelectField({ name, label, options }: { name: string; label: string; options: readonly FieldOption[] }) {
  const id = useId();
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Combobox id={id} options={options} value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={fieldState.invalid} />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
