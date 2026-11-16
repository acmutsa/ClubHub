"use client";

import { DateField } from "@/components/form/date-field";
import { MultiSelectField } from "@/components/form/multi-select-field";
import { FieldGroup } from "@/components/ui/field";
import { SearchableSelectField } from "@/components/form/searchable-select-field";
import { SelectField } from "@/components/form/select-field";
import { SwitchField } from "@/components/form/switch-field";
import { TextField } from "@/components/form/text-field";
import { toFieldOptions } from "@/components/form/field-option";
import { countries } from "@/constants/countries";
import { ethnicityOptions, genderOptions, raceOptions } from "@/constants/demographics";
import { majorOptions } from "@/constants/majors";
import { schoolOptions } from "@/constants/schools";
import { shirtSizeOptions } from "@/constants/shirt-sizes";

const thisYear = new Date().getFullYear();
const countryOptions = countries.map((country) => ({ value: country.code, label: country.name }));

export function PersonalFields() {
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="firstName" label="First name" />
        <TextField name="lastName" label="Last name" />
        <TextField name="pronouns" label="Pronouns" />
        <DateField name="birthDate" label="Birth date" fromYear={thisYear - 100} toYear={thisYear} disableFuture />
        <TextField
          name="phoneNumber"
          label="Phone number"
          type="tel"
          inputProps={{ inputMode: "numeric", autoComplete: "tel-national", maxLength: 10, placeholder: "10 digits, no dashes" }}
        />
        <SearchableSelectField name="country" label="Country" options={countryOptions} />
      </div>
      <SelectField name="shirtSize" label="Shirt size" options={toFieldOptions(shirtSizeOptions)} />
    </FieldGroup>
  );
}

export function SchoolFields() {
  return (
    <FieldGroup>
      <SearchableSelectField name="school" label="School" options={toFieldOptions(schoolOptions)} />
      <SearchableSelectField name="major" label="Major" options={toFieldOptions(majorOptions)} />
      <DateField name="expectedGraduationDate" label="Expected graduation" fromYear={thisYear - 10} toYear={thisYear + 10} />
    </FieldGroup>
  );
}

export function DemographicsFields() {
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="gender" label="Gender" options={toFieldOptions(genderOptions)} />
        <SelectField name="ethnicity" label="Ethnicity" options={toFieldOptions(ethnicityOptions)} />
      </div>
      <MultiSelectField name="race" label="Race (select all that apply)" options={raceOptions} />
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
