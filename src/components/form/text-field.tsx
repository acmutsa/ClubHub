"use client";

import { useId, type ComponentProps } from "react";
import { useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function TextField({
  name,
  label,
  type = "text",
  inputProps,
}: {
  name: string;
  label: string;
  type?: string;
  inputProps?: ComponentProps<"input">;
}) {
  const id = useId();
  const { register, formState } = useFormContext();
  const error = formState.errors[name];

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} type={type} aria-invalid={!!error} {...register(name)} {...inputProps} />
      <FieldError errors={[error]} />
    </Field>
  );
}
