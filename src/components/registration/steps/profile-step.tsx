'use client'
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { useRouter } from 'next/navigation';
import {  Controller, type FieldPath, UseFormReturn } from 'react-hook-form';
import React, { useEffect, useRef, useState } from "react";
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

import { submitRegistrationAction } from "@/app/registration/actions";
import { Input } from "@/components/ui/input";
import {  createUserProfileValues } from "@/lib/validators/user-profile";

type ProfileStepProps = {
  form: UseFormReturn<createUserProfileValues>;
  onNext: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
};

export default function ProfileStep({
    form,
    onNext,
}: ProfileStepProps) {
    const { data: session } = authClient.useSession();
    const email = session?.user?.email;

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your profile information below.</CardDescription>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="-rhf-input-email">
                            Email
                        </FieldLabel>
                        <Input id="user_profile-email" type="email" value={email ?? ""} readOnly/>
                    </Field>
                    <Controller
                        name="firstName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-input-first-name">
                        First Name
                    </FieldLabel>
                    <Input
                        {...field}
                        id="form-rhf-input-first-name"
                        aria-invalid={fieldState.invalid}
                        aria-describedby={fieldState.error ? "user_profile-first-name-error" : undefined}
                        placeholder="Please enter your first name" value={form.getValues().firstName || field.value}
                        readOnly
                    />
                        {fieldState.invalid && (
                            <FieldError id="user_profile-first-name-error" errors={[fieldState.error]} />
                        )}
                    </Field>
                    )}
                    />
                    <Controller
                        name="lastName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-input-last-name">
                                Last Name
                            </FieldLabel>
                            <Input {...field}
                                id="form-rhf-input-last-name"
                                aria-invalid={fieldState.invalid}
                                aria-describedby={fieldState.error ? "user_profile-last-name-error" : undefined}
                                placeholder="Please enter your last name"
                                readOnly
                            />
                            {fieldState.invalid && (
                            <FieldError id="user_profile-last-name-error" errors={[fieldState.error]} />
                            )}
                        </Field>
                        )}
                        />
                        </FieldGroup>
                        </CardContent>
                            <CardFooter>
                                <Field orientation="horizontal">
                                <Button type="submit" variant="default">
                                    Next
                                </Button>
                                </Field>
                            </CardFooter>
        </Card>
        )
    }