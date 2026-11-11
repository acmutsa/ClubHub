'use client'
import { Button } from "@/components/ui/button";
import { Controller, UseFormReturn } from 'react-hook-form';

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
import { Checkbox } from "@/components/ui/checkbox";
import { createUserProfileValues } from "@/lib/validators/user-profile";

type NotificationStepProps = React.ComponentProps<"form"> & {
  form: UseFormReturn<createUserProfileValues>;
  onNext: () => void;
  onBack: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
};

export default function NotificationStep({
    form,
    onNext,
    onBack,
}: NotificationStepProps) {
   
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choose whether you would like email updates.</CardDescription>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Controller
                        name="eventAnnouncementEmail"
                        control={form.control}
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
                        name="eventAnnouncementPhone"
                        control={form.control}
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
                    {form.formState.errors.eventAnnouncementEmail && (
                        <FieldError errors={[form.formState.errors.eventAnnouncementEmail]} />
                    )}
                </FieldGroup>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                <Button type="button" variant="outline" onClick={onBack}>
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