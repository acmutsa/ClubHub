'use client'
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { useRouter } from 'next/navigation';
import { useForm, Controller, type FieldPath } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Progress } from "@/components/ui/progress"
import { Checkbox } from "../ui/checkbox";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { registrationFormSchema, type RegistrationFormValues } from "./registration-schema";
import { submitRegistrationAction } from "@/app/registration/actions";
import { majorOptions } from "@/constants/majors";
import { collegeDepartments, getDepartmentMajorOptions } from "@/constants/department-majors";
import { raceOptions } from "@/constants/demographics";

export default function RegistrationForm({
    callbackUrl,
    className,
    ...props
}: React.ComponentProps<"form"> & { callbackUrl: string }) {
    const [step, setStep] = useState(1);
    const [reviewValues, setReviewValues] = useState<RegistrationFormValues | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [majorQuery, setMajorQuery] = useState("");
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const email = session?.user?.email;
    const completeForm = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationFormSchema),
        mode: "onTouched",
        defaultValues: {
            classification: "Freshman",
            gender: "Prefer Not to Say",
            race: "Other",
            ethnicity: "Non-Hispanic",
            major: "",
            college: "",
            department: "",
            expectedGraduationDate: "",
            account: {
                firstName: "",
                lastName: "",
                email: email || ""
            },
            emailReminder: false,
            phoneReminder: false,
            smsReminder: false,
        }
    });
    const selectedCollege = completeForm.watch("college");
    const selectedDepartment = completeForm.watch("department");
    const departmentOptions = collegeDepartments[selectedCollege] ?? [];
    const departmentMajorOptions = selectedDepartment
        ? getDepartmentMajorOptions(selectedDepartment)
        : majorOptions;
    const normalizedMajorQuery = majorQuery.trim().toLocaleLowerCase();
    const filteredMajorOptions = departmentMajorOptions.filter((major) =>
        major.toLocaleLowerCase().includes(normalizedMajorQuery),
    );
    const stepHeadingRef = useRef<HTMLHeadingElement>(null);
    const previousStep = useRef(step);

    const totalSteps = 6;
    const progress = (step / totalSteps) * 100;

    useEffect(() => {
        if (previousStep.current !== step) {
            stepHeadingRef.current?.focus();
            previousStep.current = step;
        }
    }, [step]);

    useEffect(() => {
        if (email && !completeForm.getValues("account.email")) {
            completeForm.setValue("account.email", email);
        }
    }, [completeForm, email]);

    async function onSubmit(values: RegistrationFormValues) {
        setIsSubmitting(true);
        completeForm.clearErrors("root");
        try {
            const result = await submitRegistrationAction(values);
            if (result?.data?.accepted) {
                router.push(callbackUrl || "/clubs");
                router.refresh();
                return;
            }

            completeForm.setError("root", {
                message:
                    result?.serverError ??
                    "Please review the form and try submitting again.",
            });
        } catch {
            completeForm.setError("root", {
                message: "Could not complete registration. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function validateCurrentStep() {
        let fields: FieldPath<RegistrationFormValues>[] = [];

        switch (step) {
            case 1:
                fields = ["account.email", "account.firstName", "account.lastName"];
                break;
            case 2:
                fields = ["gender", "race", "ethnicity"];
                break;
            case 3:
                fields = [
                    "classification",
                    "college",
                    "major",
                    "department",
                    "expectedGraduationDate",
                ];
                break;
            case 4:
            case 5:
                fields = step === 5
                    ? ["emailReminder", "phoneReminder", "smsReminder"]
                    : [];
                break;
            default:
                return;
        }

        const valid =
            fields.length === 0 ||
            await completeForm.trigger(fields, { shouldFocus: true });
        if (valid) {
            if (step === 5) {
                setReviewValues(completeForm.getValues());
            }
            setStep((current) => Math.min(current + 1, totalSteps));
        }
    }

    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (step === totalSteps) {
            await completeForm.handleSubmit(onSubmit)(event);
            return;
        }
        await validateCurrentStep();
    }

        return (
            <form onSubmit={handleFormSubmit} className={cn("flex flex-col gap-3 items-center", className)} {...props}>
                <div className="w-full max-w-md space-y-2" aria-label="Registration progress">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Registration progress</span>
                        <span aria-live="polite">Step {step} of {totalSteps}</span>
                    </div>
                    <Progress
                        value={progress}
                        aria-label="Registration progress"
                        aria-valuetext={`Step ${step} of ${totalSteps}`}
                    />
                </div>
                
                {step === 1 && (
                    <Card className="w-full sm:max-w-md">
                        <CardHeader>
                            <CardTitle ref={stepHeadingRef} tabIndex={-1}>Profile Settings</CardTitle>
                            <CardDescription>
                            Update your profile information below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FieldGroup>
                                <Controller
                                name="account.email"
                                control={completeForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-input-email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-input-email"
                                        aria-invalid={fieldState.invalid}
                                        aria-describedby={fieldState.error ? "account-email-error" : undefined}
                                        placeholder="Please enter your email"
                                        autoComplete="email"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError id="account-email-error" errors={[fieldState.error]} />
                                    )}
                                    </Field>
                                )}
                                />
                                <Controller
                                name="account.firstName"
                                control={completeForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-input-first-name">
                                        First Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-input-first-name"
                                        aria-invalid={fieldState.invalid}
                                        aria-describedby={fieldState.error ? "account-first-name-error" : undefined}
                                        placeholder="Please enter your first name"
                                        autoComplete="first-name"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError id="account-first-name-error" errors={[fieldState.error]} />
                                    )}
                                    </Field>
                                )}
                                />

                                <Controller
                                name="account.lastName"
                                control={completeForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-rhf-input-last-name">
                                        Last Name
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="form-rhf-input-last-name"
                                        aria-invalid={fieldState.invalid}
                                        aria-describedby={fieldState.error ? "account-last-name-error" : undefined}
                                        placeholder="Please enter your last name"
                                        autoComplete="last-name"
                                    />
                                    {fieldState.invalid && (
                                        <FieldError id="account-last-name-error" errors={[fieldState.error]} />
                                    )}
                                    </Field>
                                )}
                                />
                            </FieldGroup>
                        </CardContent>
                        <CardFooter>
                            <Field orientation="horizontal">
                            <Button type="button" variant="outline" onClick={() => completeForm.reset()}>
                                Reset
                            </Button>
                            <Button type="submit" variant="default">
                                Next
                            </Button>
                            </Field>
                        </CardFooter>
                        </Card>
                )
                }
                {step === 2 && (
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle ref={stepHeadingRef} tabIndex={-1}>Personal information</CardTitle>
                            <CardDescription>Tell us a little about yourself.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            <Field data-invalid={!!completeForm.formState.errors.gender}>
                            <Label htmlFor="gender">Gender</Label>
                            <select id="gender" aria-invalid={!!completeForm.formState.errors.gender} aria-describedby={completeForm.formState.errors.gender ? "gender-error" : undefined} {...completeForm.register("gender")} className={cn("registration-select w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", completeForm.formState.errors.gender && "border-red-500 focus-visible:ring-red-500")}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-Binary">Non-binary</option>
                                <option value="Prefer Not To Say">Prefer not to say</option>
                            </select>
                            {completeForm.formState.errors.gender && <FieldError id="gender-error" errors={[completeForm.formState.errors.gender]} />}
                            </Field>
                            <Controller
                                name="race"
                                control={completeForm.control}
                                render={({ field,fieldState }) => (
                               <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="race">Race</FieldLabel>
                                <Combobox
                                    items={raceOptions}
                                    value={field.value || null}
                                    onValueChange={(value) => {
                                        const selectedRace = value ?? "";
                                        field.onChange(selectedRace);
                                        setMajorQuery(selectedRace);
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
                                        id="race"
                                        className="w-full"
                                        placeholder="Type to search races..."
                                        showTrigger
                                        showClear
                                        aria-invalid={fieldState.invalid}
                                        aria-describedby={fieldState.error ? "race-error" : "race-hint"}
                                    >
                                        <ComboboxContent>
                                            <ComboboxEmpty>No matches found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {raceOptions.map((race) => (
                                                    <ComboboxItem key={race} value={race}>
                                                        {race}
                                                    </ComboboxItem>
                                                ))}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </ComboboxInput>
                                </Combobox>
                                <p id="race-hint" className="text-muted-foreground text-sm">
                                    Type to search, then select from the suggestions.
                                </p>
                                {completeForm.formState.errors.race && <FieldError id="race-error" errors={[completeForm.formState.errors.race]} />}
                                </Field> 
                                )}
                            />
                            <Field data-invalid={!!completeForm.formState.errors.ethnicity}>
                            <Label htmlFor="ethnicity">Ethnicity</Label>
                            <select id="ethnicity" aria-invalid={!!completeForm.formState.errors.ethnicity} aria-describedby={completeForm.formState.errors.ethnicity ? "ethnicity-error" : undefined} {...completeForm.register("ethnicity")} className={cn("registration-select w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", completeForm.formState.errors.ethnicity && "border-red-500 focus-visible:ring-red-500")}>
                                <option value="Hispanic">Hispanic or Latino</option>
                                <option value="Non-Hispanic">Not Hispanic or Latino</option>
                            </select>
                            {completeForm.formState.errors.ethnicity && <FieldError id="ethnicity-error" errors={[completeForm.formState.errors.ethnicity]} />}
                            </Field>
                          </div>
                        </CardContent>
                        <CardFooter>
                            <Field orientation="horizontal">
                                <Button className='max-sm:flex-1' variant='outline' type='button' onClick={() => setStep((current) => current - 1)}>
                                    Back
                                </Button>
                                <Button type="submit">
                                    Next
                                </Button>
                            </Field>
                        </CardFooter>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle ref={stepHeadingRef} tabIndex={-1}>Education</CardTitle>
                            <CardDescription>Tell us about your studies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            <Field data-invalid={!!completeForm.formState.errors.classification}>
                            <Label htmlFor="classification">Year of Study</Label>
                            <select id="classification" aria-invalid={!!completeForm.formState.errors.classification} aria-describedby={completeForm.formState.errors.classification ? "classification-error" : undefined} {...completeForm.register("classification")} className={cn("registration-select w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", completeForm.formState.errors.classification && "border-red-500 focus-visible:ring-red-500")}>
                                <option value="Freshman">Freshman</option>
                                <option value="Sophomore">Sophomore</option>
                                <option value="Junior">Junior</option>
                                <option value="Senior">Senior</option>
                                <option value="Graduate">Graduate</option>
                            </select>
                            {completeForm.formState.errors.classification && <FieldError id="classification-error" errors={[completeForm.formState.errors.classification]} />}
                            </Field>
                            <Field data-invalid={!!completeForm.formState.errors.college}>
                            <Label htmlFor="college">College</Label>
                            <select id="college" aria-invalid={!!completeForm.formState.errors.college} aria-describedby={completeForm.formState.errors.college ? "college-error" : undefined} {...completeForm.register("college", {
                                onChange: () => {
                                    completeForm.setValue("department", "");
                                    completeForm.setValue("major", "");
                                    completeForm.clearErrors(["department", "major"]);
                                    setMajorQuery("");
                                },
                            })} className={cn("registration-select w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", completeForm.formState.errors.college && "border-red-500 focus-visible:ring-red-500")}>
                                <option value="">Select your college</option>
                                <option value="Carlos Alvarez College of Business">Carlos Alvarez College of Business</option>
                                <option value="Education and Human Development">Education and Human Development</option>
                                <option value="Klesse College of Engineering and Integrated Design">Klesse College of Engineering and Integrated Design</option>
                                <option value="Liberal and Fine Arts">Liberal and Fine Arts</option>
                                <option value="Health, Community and Policy">Health, Community and Policy</option>
                                <option value="Sciences">Sciences</option>
                                <option value="College of Cyber, AI, and Computing">College of Cyber, AI, and Computing</option>
                                <option value="Honors College">Honors College</option>
                            </select>
                            {completeForm.formState.errors.college && <FieldError id="college-error" errors={[completeForm.formState.errors.college]} />}
                            </Field>
                            <Field data-invalid={!!completeForm.formState.errors.department}>
                                <Label htmlFor="department">Department</Label>
                                <select
                                    id="department"
                                    aria-invalid={!!completeForm.formState.errors.department}
                                    aria-describedby={completeForm.formState.errors.department ? "department-error" : undefined}
                                    disabled={!selectedCollege}
                                    {...completeForm.register("department", {
                                        onChange: () => {
                                            completeForm.setValue("major", "");
                                            completeForm.clearErrors("major");
                                            setMajorQuery("");
                                        },
                                    })}
                                    className={cn("registration-select w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", completeForm.formState.errors.department && "border-red-500 focus-visible:ring-red-500")}
                                >
                                    <option value="">Select your department</option>
                                    {departmentOptions.map((department) => (
                                        <option key={department} value={department}>{department}</option>
                                    ))}
                                </select>
                                {completeForm.formState.errors.department && (
                                    <FieldError id="department-error" errors={[completeForm.formState.errors.department]} />
                                )}
                            </Field>
                            <Controller
                                name="major"
                                control={completeForm.control}
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
                                            disabled={!selectedDepartment}
                                            autoHighlight
                                        >
                                            <ComboboxInput
                                                id="major"
                                                className="w-full"
                                                placeholder={selectedDepartment ? "Type to search majors..." : "Select a department first"}
                                                showTrigger
                                                showClear
                                                aria-invalid={fieldState.invalid}
                                                aria-describedby={fieldState.error ? "major-error" : "major-hint"}
                                            >
                                                <ComboboxContent>
                                                    <ComboboxEmpty>No matching majors.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {filteredMajorOptions.map((major) => (
                                                            <ComboboxItem key={major} value={major}>
                                                                {major}
                                                            </ComboboxItem>
                                                        ))}
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
                            <Field data-invalid={!!completeForm.formState.errors.expectedGraduationDate}>
                                <Label htmlFor="expectedGraduationDate">Expected Graduation Date</Label>
                                <Input id="expectedGraduationDate" type="date" aria-invalid={!!completeForm.formState.errors.expectedGraduationDate} aria-describedby={completeForm.formState.errors.expectedGraduationDate ? "expected-graduation-error" : undefined} {...completeForm.register("expectedGraduationDate")} className={cn(completeForm.formState.errors.expectedGraduationDate && "border-red-500 focus-visible:ring-red-500")} />
                                {completeForm.formState.errors.expectedGraduationDate && <FieldError id="expected-graduation-error" errors={[completeForm.formState.errors.expectedGraduationDate]} />}
                            </Field>
                          </div>
                        </CardContent>
                        <CardFooter>
                            <Field orientation="horizontal">
                                <Button className='max-sm:flex-1' variant='outline' type='button' onClick={() => setStep((current) => current - 1)}>
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

                {step === 4 && (
                  <Card className='w-full max-w-md'>
                    <CardHeader>
                        <CardTitle ref={stepHeadingRef} tabIndex={-1} className='font-semibold'>Resume upload</CardTitle>
                        <CardDescription>This optional upload is not available yet. You can continue without a file.</CardDescription>
                    </CardHeader>
                    <CardFooter className='flex justify-end gap-2 max-sm:justify-center'>
                        <Button className='max-sm:flex-1' variant='outline' type='button' onClick={() => setStep((current) => current - 1)}>
                            Back
                        </Button>
                        <Button className='max-sm:flex-1' type='submit'>
                            Next
                        </Button>
                        </CardFooter>
                    </Card>
                    )
            }

            {step === 5 && (
                <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle ref={stepHeadingRef} tabIndex={-1}>Notifications</CardTitle>
                    <CardDescription>Choose whether you would like email updates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FieldGroup>
                        <Controller
                            name="emailReminder"
                            control={completeForm.control}
                            render={({ field, fieldState }) => (
                                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                    <Checkbox
                                        id="emailReminder"
                                        checked={field.value ?? false}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldLabel htmlFor="emailReminder" className="font-normal">
                                        Send me email updates and announcements
                                    </FieldLabel>
                                </Field>
                            )}
                        />
                        <Controller
                            name="phoneReminder"
                            control={completeForm.control}
                            render={({ field, fieldState }) => (
                                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                    <Checkbox
                                        id="phoneReminder"
                                        checked={field.value ?? false}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldLabel htmlFor="phoneReminder" className="font-normal">
                                        Send me phone updates and announcements
                                    </FieldLabel>
                                </Field>
                            )}
                        />
                        <Controller
                            name="smsReminder"
                            control={completeForm.control}
                            render={({ field, fieldState }) => (
                                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                    <Checkbox
                                        id="smsReminder"
                                        checked={field.value ?? false}
                                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                        aria-invalid={fieldState.invalid}
                                    />
                                    <FieldLabel htmlFor="smsReminder" className="font-normal">
                                        Send me SMS updates and announcements
                                    </FieldLabel>
                                </Field>
                            )}
                        />
                        {completeForm.formState.errors.emailReminder && (
                            <FieldError errors={[completeForm.formState.errors.emailReminder]} />
                        )}
                    </FieldGroup>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal">
                    <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}>
                        Back
                    </Button>
                    <Button type="submit">
                        Next
                    </Button>
                    </Field>
                </CardFooter>
                </Card>
                )}
                {step === 6 && reviewValues && (
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle ref={stepHeadingRef} tabIndex={-1}>Review your registration</CardTitle>
                            <CardDescription>
                                Check your information before submitting.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-4 text-sm">
                                <div>
                                    <dt className="font-medium">Name</dt>
                                    <dd className="text-muted-foreground">
                                        {reviewValues.account.firstName} {reviewValues.account.lastName}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium">Email</dt>
                                    <dd className="text-muted-foreground">{reviewValues.account.email}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium">Personal information</dt>
                                    <dd className="text-muted-foreground">
                                        Gender: {reviewValues.gender}; Race/ethnicity: {reviewValues.race}, {reviewValues.ethnicity}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium">Education</dt>
                                    <dd className="text-muted-foreground">
                                        {reviewValues.classification} · {reviewValues.major} · {reviewValues.department} · {reviewValues.college}
                                    </dd>
                                    <dd className="text-muted-foreground">
                                        Expected graduation: {reviewValues.expectedGraduationDate}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium">Notification preferences</dt>
                                    <dd className="text-muted-foreground">
                                        Email: {reviewValues.emailReminder ? "Opted in" : "Opted out"}; Phone: {reviewValues.phoneReminder ? "Opted in" : "Opted out"}; SMS: {reviewValues.smsReminder ? "Opted in" : "Opted out"}
                                    </dd>
                                </div>
                            </dl>
                            {completeForm.formState.errors.root && (
                                <FieldError
                                    className="mt-4"
                                    errors={[completeForm.formState.errors.root]}
                                />
                            )}
                        </CardContent>
                        <CardFooter>
                            <Field orientation="horizontal">
                                <Button type="button" variant="outline" onClick={() => setStep(5)}>
                                    Back to notifications
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                                </Button>
                            </Field>
                        </CardFooter>
                    </Card>
                )}
            </form>
            )
        }