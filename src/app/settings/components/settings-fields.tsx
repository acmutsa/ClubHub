"use client";

import { useId, type ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { countries } from "@/constants/countries";
import { ethnicityOptions, genderOptions, raceOptions } from "@/constants/demographics";
import { majorOptions } from "@/constants/majors";
import { schoolOptions } from "@/constants/schools";
import { shirtSizeOptions } from "@/constants/shirt-sizes";
import type { UpdateSettingsInput } from "../validators";

type FieldName = keyof UpdateSettingsInput;

function TextField({ name, label, type = "text", children }: { name: FieldName; label: string; type?: string; children?: ReactNode }) {
  const id = useId();
  const { register, formState } = useFormContext<UpdateSettingsInput>();
  const error = formState.errors[name];

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} type={type} aria-invalid={!!error} {...register(name as "firstName")} />
      {children}
      <FieldError errors={[error]} />
    </Field>
  );
}

function DateField({ name, label }: { name: "birthDate" | "expectedGraduationDate"; label: string }) {
  const id = useId();
  const { control } = useFormContext<UpdateSettingsInput>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Input
            id={id}
            type="date"
            aria-invalid={fieldState.invalid}
            value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ""}
            onChange={(event) => field.onChange(event.target.valueAsDate)}
            onBlur={field.onBlur}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

function SelectField({ name, label, options }: { name: FieldName; label: string; options: readonly { value: string; label: string }[] }) {
  const id = useId();
  const { control } = useFormContext<UpdateSettingsInput>();

  return (
    <Controller
      control={control}
      name={name as "school"}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={id} aria-invalid={fieldState.invalid} className="w-full">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

function SwitchField({ name, label }: { name: "eventAnnouncementEmail" | "eventAnnouncementPhone"; label: string }) {
  const id = useId();
  const { control } = useFormContext<UpdateSettingsInput>();

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

const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

export function PersonalFields() {
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="firstName" label="First name" />
        <TextField name="lastName" label="Last name" />
        <TextField name="pronouns" label="Pronouns" />
        <DateField name="birthDate" label="Birth date" />
        <TextField name="phoneNumber" label="Phone number" type="tel" />
        <SelectField name="country" label="Country" options={countries.map((country) => ({ value: country.code, label: country.name }))} />
      </div>
      <SelectField name="shirtSize" label="Shirt size" options={toOptions(shirtSizeOptions)} />
    </FieldGroup>
  );
}

export function SchoolFields() {
  return (
    <FieldGroup>
      <SelectField name="school" label="School" options={toOptions(schoolOptions)} />
      <SelectField name="major" label="Major" options={toOptions(majorOptions)} />
      <DateField name="expectedGraduationDate" label="Expected graduation" />
    </FieldGroup>
  );
}

export function DemographicsFields() {
  const { control } = useFormContext<UpdateSettingsInput>();

  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="gender" label="Gender" options={toOptions(genderOptions)} />
        <SelectField name="ethnicity" label="Ethnicity" options={toOptions(ethnicityOptions)} />
      </div>
      <Controller
        control={control}
        name="race"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Race (select all that apply)</FieldLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              {raceOptions.map((option) => (
                <label key={option} className="flex min-h-9 items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value.includes(option)}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? [...field.value, option] : field.value.filter((race) => race !== option))
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </FieldGroup>
  );
}

export function NotificationFields() {
  return (
    <FieldGroup>
      <SwitchField name="eventAnnouncementEmail" label="Email event announcements" />
      <SwitchField name="eventAnnouncementPhone" label="Text event announcements" />
    </FieldGroup>
  );
}
