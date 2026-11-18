'use client'
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import { Checkbox } from "@/components/ui/checkbox";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    useComboboxAnchor
} from "@/components/ui/combobox";
import {
    ethnicityOptions,
    genderOptions,
    raceOptions,
} from "@/constants/demographics";
import { countries } from "@/constants/countries";
import { shirtSizeOptions } from "@/constants/shirt-sizes";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import type { createUserProfileValues } from "@/lib/validators/user-profile";

type PersonalInfoStepProps = {
    form: UseFormReturn<createUserProfileValues>;
    onBack: () => void;
    headingRef: React.RefObject<HTMLHeadingElement | null>;
};

export default function PersonalInfoStep({
    form,
    onBack,
    
}: PersonalInfoStepProps) {
    const [countryQuery, setCountryQuery] = useState(() => {
    const savedCode = form.getValues("country");
    return countries.find((country) => country.code === savedCode)?.name ?? "";
    });

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Tell us a little about yourself.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                <Field data-invalid={!!form.formState.errors.gender}>
                    <Label htmlFor="gender">Gender</Label>
                    <select id="gender" aria-invalid={!!form.formState.errors.gender} aria-describedby={form.formState.errors.gender ? "gender-error" : undefined} {...form.register("gender")} className={cn("primary w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", form.formState.errors.gender && "border-red-500 focus-visible:ring-red-500")}>
                        {genderOptions.map((gender) => (<option key={gender} value={gender}>{gender}</option>))}
                    </select>
                        {form.formState.errors.gender && <FieldError id="gender-error" errors={[form.formState.errors.gender]} />}
                </Field>
                <Controller
                    name="race"
                    control={form.control}
                    render={({ field, fieldState }) => {
                        const selectedRaces = field.value ?? [];

                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Race</FieldLabel>
                                <div className="grid gap-2">
                                    {raceOptions.map((race, index) => {
                                        const id = `race-${index}`;

                                        return (
                                            <div key={race} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={id}
                                                    checked={selectedRaces.includes(race)}
                                                    aria-invalid={fieldState.invalid}
                                                    aria-describedby={fieldState.error ? "race-error" : undefined}
                                                    onCheckedChange={(checked) => {
                                                        field.onChange(
                                                            checked
                                                                ? [...selectedRaces, race]
                                                                : selectedRaces.filter((selectedRace) => selectedRace !== race),
                                                        );
                                                    }}
                                                />
                                                <Label htmlFor={id}>{race}</Label>
                                            </div>
                                        );
                                    })}
                                </div>
                                {fieldState.error && <FieldError id="race-error" errors={[fieldState.error]} />}
                            </Field>
                        );
                    }}
                />
                <Field data-invalid={!!form.formState.errors.ethnicity}>
                    <Label htmlFor="ethnicity">Ethnicity</Label>
                    <select id="ethnicity" aria-invalid={!!form.formState.errors.ethnicity} aria-describedby={form.formState.errors.ethnicity ? "ethnicity-error" : undefined} {...form.register("ethnicity")} className={cn("primary w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", form.formState.errors.ethnicity && "border-red-500 focus-visible:ring-red-500")}>
                        {ethnicityOptions.map((ethnicity) => (
                            <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
                        ))}
                    </select>
                    {form.formState.errors.ethnicity && <FieldError id="ethnicity-error" errors={[form.formState.errors.ethnicity]} />}
                </Field>
                <Field data-invalid={!!form.formState.errors.phoneNumber}>
                    <Label htmlFor="phoneNumber">Phone number</Label>
                    <Input id="phoneNumber" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit phone number" aria-invalid={!!form.formState.errors.phoneNumber} aria-describedby={form.formState.errors.phoneNumber ? "phone-number-error" : undefined} {...form.register("phoneNumber")} />
                    {form.formState.errors.phoneNumber && <FieldError id="phone-number-error" errors={[form.formState.errors.phoneNumber]} />}
                </Field>
                <Field data-invalid={!!form.formState.errors.pronouns}>
                    <Label htmlFor="pronouns">Pronouns</Label>
                    <Input id="pronouns" aria-invalid={!!form.formState.errors.pronouns} aria-describedby={form.formState.errors.pronouns ? "pronouns-error" : undefined} {...form.register("pronouns")} />
                    {form.formState.errors.pronouns && <FieldError id="pronouns-error" errors={[form.formState.errors.pronouns]} />}
                </Field>
                <Field data-invalid={!!form.formState.errors.birthDate}>
                    <Label id="birthDate-label">Date of birth</Label>
                    <Controller
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <Calendar
                                id="birthDate"
                                aria-labelledby="birthDate-label"
                                aria-describedby={form.formState.errors.birthDate ? "birth-date-error" : undefined}
                                aria-invalid={!!form.formState.errors.birthDate}
                                mode="single"
                                selected={field.value ?? undefined}
                                onSelect={(date) => field.onChange(date ?? undefined)}
                                captionLayout="dropdown"
                                numberOfMonths={1}
                                disabled={{ after: new Date() }}
                                className="rounded-lg border"
                            />
                        )}
                    />
                    {form.formState.errors.birthDate && <FieldError id="birth-date-error" errors={[form.formState.errors.birthDate]} />}
                </Field>
                <Controller
                    name="country"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="country">Country</FieldLabel>
                            <Combobox
                                items={countries.map((country) => country.code)}
                                value={field.value || null}
                                inputValue={countryQuery}
                                onValueChange={(value) => {
                                    const code = value ?? "";
                                    field.onChange(code);
                                    setCountryQuery(
                                        countries.find((country) => country.code === code)?.name ?? "");
                                }}
                                autoHighlight
                            >
                                <ComboboxInput
                                    id="country"
                                    className="w-full"
                                    placeholder={"Type to search countries..." }
                                    showTrigger
                                    showClear
                                    aria-invalid={fieldState.invalid}
                                    aria-describedby={fieldState.error ? "country-error" : "country-hint"}
                                >
                                    <ComboboxContent>
                                        <ComboboxEmpty>No matching countries.</ComboboxEmpty>
                                        <ComboboxList>
                                            {countries
                                                .filter((country) =>
                                                    country.name.toLowerCase().includes(countryQuery.toLowerCase()),
                                                )
                                                .map((country) => (
                                                    <ComboboxItem key={country.code} value={country.code}>
                                                        {country.name}
                                                    </ComboboxItem>
                                                ))
                                            }
                                        </ComboboxList>
                                    </ComboboxContent>
                                </ComboboxInput>
                            </Combobox>
                            <p id="country-hint" className="text-muted-foreground text-sm">
                                Type to search, then select a country from the suggestions.
                            </p>
                            {fieldState.error && <FieldError id="country-error" errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Field data-invalid={!!form.formState.errors.shirtSize}>
                    <Label htmlFor="shirtSize">Shirt size</Label>
                    <select id="shirtSize" aria-invalid={!!form.formState.errors.shirtSize} aria-describedby={form.formState.errors.shirtSize ? "shirt-size-error" : undefined} {...form.register("shirtSize")} className={cn("primary w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", form.formState.errors.shirtSize && "border-red-500 focus-visible:ring-red-500")}>
                        {shirtSizeOptions.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    {form.formState.errors.shirtSize && <FieldError id="shirt-size-error" errors={[form.formState.errors.shirtSize]} />}
                </Field>
                </div>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button className='max-sm:flex-1' variant='outline' type='button' onClick={onBack}>
                        Back
                    </Button>
                    <Button type="submit">
                        Next
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}