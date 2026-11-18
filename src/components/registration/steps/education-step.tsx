'use client'
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


import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { majorOptions } from "@/constants/majors";

import { Input } from "@/components/ui/input";
import type { createUserProfileValues } from "@/lib/validators/user-profile";
import { schoolOptions } from "@/constants/schools";


type EducationStepProps = {
    form: UseFormReturn<createUserProfileValues>;
    onBack: () => void;
    headingRef: React.RefObject<HTMLHeadingElement | null>;
};

export default function EducationStep({
    form,
    onBack,
}: EducationStepProps) {
    const [majorQuery, setMajorQuery] = useState<string>(() => form.getValues("major") ?? "");
    const [schoolQuery, setSchoolQuery] = useState<string>(() => form.getValues("school") ?? "");
    const nextMonth = new Date();
    nextMonth.setDate(1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const minimumGraduationMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>Tell us about your studies.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3">
                <Controller
                    name="major"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="major">Major</FieldLabel>
                            <Combobox
                                items={majorOptions}
                                value={field.value || null}
                                inputValue={majorQuery}
                                onValueChange={(value) => {
                                    const selectedMajor = value ?? "";
                                    field.onChange(selectedMajor);
                                    setMajorQuery(selectedMajor);
                                }}
                                onInputValueChange={(value, details) => {
                                    setMajorQuery(value);
                                    if (details.reason === "input-change" || details.reason === "input-clear") {
                                        field.onChange("");
                                    }
                                }}
                                autoHighlight
                            >
                                <ComboboxInput
                                    id="major"
                                    className="w-full"
                                    placeholder={"Type to search majors..." }
                                    showTrigger
                                    showClear
                                    aria-invalid={fieldState.invalid}
                                    aria-describedby={fieldState.error ? "major-error" : "major-hint"}
                                >
                                    <ComboboxContent>
                                        <ComboboxEmpty>No matching majors.</ComboboxEmpty>
                                        <ComboboxList>
                                            {majorOptions
                                                .filter((major) =>
                                                    major.toLowerCase().includes(majorQuery.toLowerCase()),
                                                )
                                                .map((major) => (
                                                    <ComboboxItem key={major} value={major}>
                                                        {major}
                                                    </ComboboxItem>
                                                ))
                                            }
                                        </ComboboxList>
                                    </ComboboxContent>
                                </ComboboxInput>
                            </Combobox>
                            <p id="major-hint" className="text-muted-foreground text-sm">
                                Type to search, then select a major from the suggestions.
                            </p>
                            {fieldState.error && <FieldError id="major-error" errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    control={form.control}
                    name="expectedGraduationDate"
                    render={({ field }) => (
                        <Field data-invalid={!!form.formState.errors.expectedGraduationDate}>
                            <Label htmlFor="expectedGraduationDate">Expected Graduation Month</Label>
                            <Input
                                id="expectedGraduationDate"
                                type="month"
                                min={minimumGraduationMonth}
                                value={
                                    field.value
                                        ? `${field.value.getFullYear()}-${String
                                            (field.value.getMonth() + 1
                                        ).padStart(2, "0")}`
                                        : ""
                                }
                                onChange={(event) => {
                                    const [year, month] = event.target.value.split("-").map(Number);
                                    field.onChange(
                                        event.target.value ? new Date(year, month - 1, 1): undefined
                                    );
                                }}
                                />
                        </Field>
                    )}
                />
                <Controller
                    name="school"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="school">School</FieldLabel>
                            <Combobox
                                items={schoolOptions}
                                value={field.value || null}
                                inputValue={schoolQuery}
                                onValueChange={(value) => {
                                    const selectedSchool = value ?? "";
                                    field.onChange(selectedSchool);
                                    setSchoolQuery(selectedSchool);
                                }}
                                onInputValueChange={(value, details) => {
                                    setSchoolQuery(value);
                                    if (details.reason === "input-change" || details.reason === "input-clear") {
                                        field.onChange("");
                                    }
                                }}
                                autoHighlight
                            >
                                <ComboboxInput
                                    id="school"
                                    className="w-full"
                                    placeholder={"Type to search schools..." }
                                    showTrigger
                                    showClear
                                    aria-invalid={fieldState.invalid}
                                    aria-describedby={fieldState.error ? "school-error" : "school-hint"}
                                >
                                    <ComboboxContent>
                                        <ComboboxEmpty>No matching schools.</ComboboxEmpty>
                                        <ComboboxList>
                                            <ComboboxItem>Select a school</ComboboxItem>
                                            {schoolOptions
                                                .filter((school) =>
                                                    school.toLowerCase().includes(schoolQuery.toLowerCase()),
                                                )
                                                .map((school) => (
                                                    <ComboboxItem key={school} value={school}>
                                                        {school}
                                                    </ComboboxItem>
                                                ))
                                            }
                                        </ComboboxList>
                                    </ComboboxContent>
                                </ComboboxInput>
                            </Combobox>
                            <p id="school-hint" className="text-muted-foreground text-sm">
                                Type to search, then select a school from the suggestions.
                            </p>
                            {fieldState.error && <FieldError id="school-error" errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
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