"use client";

import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

export function SwitchField({ name, label }: { name: string; label: string }) {
  const id = useId();
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Switch id={id} checked={field.value} onCheckedChange={field.onChange} />
        </Field>
      )}
    />
  );
}
