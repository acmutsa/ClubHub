'use client'
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { useRouter } from 'next/navigation';
import { useForm, Controller, type FieldPath } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FieldError,
} from "@/components/ui/field"

import { Progress } from "@/components/ui/progress"
import { submitRegistrationAction } from "@/app/registration/actions";
import { majorOptions } from "@/constants/majors";
import { createUserProfileSchema, createUserProfileValues } from "@/lib/validators/user-profile";
import { schoolOptions } from "@/constants/schools";
import { createResumeUploadSchema } from "@/lib/validators/file";
import ProfileStep from "./steps/profile-step";
import NotificationStep from "./steps/notification-step";
import EducationStep from "./steps/education-step";
import ReviewStep from "./steps/review-step";
import PersonalInfoStep from "./steps/personal-info-step";
import ResumeStep from "./steps/resume-step";

type RegistrationFormProps = React.ComponentProps<"form"> & {
  profile: { firstName: string; lastName: string } | undefined;
};

export default function RegistrationForm({
    className,
    profile,
    ...props
}: RegistrationFormProps) {
    const [step, setStep] = useState(1);
    const [reviewValues, setReviewValues] = useState<createUserProfileValues | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draftLoadedForUser, setDraftLoadedForUser] = useState<string | null>(null);
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const email = session?.user?.email;
    const userId = session?.user?.id;

    const completeForm = useForm<createUserProfileValues>({
        resolver: zodResolver(createUserProfileSchema),
        mode: "onTouched",
        defaultValues: {
            firstName: profile?.firstName ?? "",
            lastName: profile?.lastName ?? "",    
            eventAnnouncementEmail: false,  
            eventAnnouncementPhone: false,      
        }
    });
    
    const stepHeadingRef = useRef<HTMLHeadingElement>(null);
    const previousStep = useRef(step);

    const totalSteps = 6;
    const progress = (step / totalSteps) * 100;
    const saveDraft = useCallback(() => {
        if (!userId) return true;

        try {
            window.localStorage.setItem(
                `registration-draft:${userId}`,
                JSON.stringify({ step, values: completeForm.getValues() }),
            );
            return true;
        } catch {
            completeForm.setError("root", {
                message: "Could not save your progress in this browser.",
            });
            return false;
        }
    }, [completeForm, step, userId]);

    const nextMonth = new Date();
    nextMonth.setDate(1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    useEffect(() => {
        if (previousStep.current !== step) {
            stepHeadingRef.current?.focus();
            previousStep.current = step;
        }
    }, [step]);


    useEffect(() => {
        if (!userId) return;

        try {
            const savedDraft = window.localStorage.getItem(`registration-draft:${userId}`);
            if (savedDraft) {
                const draft: unknown = JSON.parse(savedDraft);
                if (
                    typeof draft !== "object" ||
                    draft === null ||
                    Array.isArray(draft) ||
                    !("step" in draft) ||
                    typeof draft.step !== "number" ||
                    !Number.isInteger(draft.step) ||
                    draft.step < 1 ||
                    draft.step > totalSteps ||
                    !("values" in draft) ||
                    typeof draft.values !== "object" ||
                    draft.values === null ||
                    Array.isArray(draft.values)
                ) {
                    throw new Error("Saved registration progress has an invalid format.");
                }

                const values = Object.fromEntries(
                    Object.entries(draft.values).map(([key, value]) => [
                        key,
                        value === "" || (Array.isArray(value) && value.length === 0)
                            ? undefined
                            : value,
                    ]),
                );
                for (const field of ["birthDate", "expectedGraduationDate"] as const) {
                    const value = values[field];
                    if (typeof value === "string") {
                        values[field] = new Date(value);
                    }
                }

                const parsedValues = createUserProfileSchema.partial().safeParse(values);
                if (!parsedValues.success) {
                    throw new Error("Saved registration fields are invalid.");
                }

                const restoredValues = {
                    ...completeForm.getValues(),
                    ...parsedValues.data,
                };
                completeForm.reset(restoredValues);
                let restoredStep = draft.step;

                if (draft.step === totalSteps) {
                    const completeValues = createUserProfileSchema.safeParse(restoredValues);
                    if (completeValues.success) {
                        setReviewValues(completeValues.data);
                    } else {
                        restoredStep = totalSteps - 1;
                    }
                }

                setStep(restoredStep);
            }
        } catch {
            completeForm.setError("root", {
                message: "Could not restore your saved registration progress.",
            });
        }

        setDraftLoadedForUser(userId);
    }, [completeForm, totalSteps, userId]);

    useEffect(() => {
        if (!userId || draftLoadedForUser !== userId) return;

        const subscription = completeForm.watch(() => {
            saveDraft();
        });

        saveDraft();
        return () => subscription.unsubscribe();
    }, [completeForm, draftLoadedForUser, saveDraft, userId]);

    function saveAndFinishLater() {
        if (!saveDraft()) return;

        router.push("/");
    }

    const [resumeError, setResumeError] = useState<string | null>(null);

    async function onSubmit(values: createUserProfileValues) {
        setIsSubmitting(true);
        completeForm.clearErrors("root");
        try {
            const result = await submitRegistrationAction(values);
            if (result.ok && result?.data?.accepted) {
                if (userId) {
                    try {
                        window.localStorage.removeItem(`registration-draft:${userId}`);
                    } catch (error) {
                        console.error("Could not remove the completed registration draft.", error);
                    }
                }
                router.push("/");
                router.refresh();
                return;
            }

            if (!result.ok) {
                completeForm.setError("root", {
                    message:
                        result?.error.message ??
                        "Please review the form and try submitting again.",
                });
            }
        } catch {
            completeForm.setError("root", {
                message: "Could not complete registration. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function validateCurrentStep() {
        let fields: FieldPath<createUserProfileValues>[] = [];

        switch (step) {
            case 1:
                fields = [ "firstName", "lastName"];
                break;
            case 2:
                fields = [
                    "gender",
                    "race",
                    "ethnicity",
                    "phoneNumber",
                    "pronouns",
                    "birthDate",
                    "country",
                    "shirtSize",
                ];
                break;
            case 3:
                fields = [
                    "school",
                    "major",
                    "expectedGraduationDate",
                ];
                break;
            case 4:
                if (resumeError) return;
                break;
            case 5:
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
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                        <p className="text-muted-foreground">
                            Your progress is saved in this browser. Finish later before joining clubs.
                        </p>
                        <Button type="button" variant="outline" size="sm" onClick={saveAndFinishLater}>
                            Save and finish later
                        </Button>
                    </div>
                    {completeForm.formState.errors.root && (
                        <FieldError errors={[completeForm.formState.errors.root]} />
                    )}
                </div>

                {step === 1 && (
                    <ProfileStep 
                    form={completeForm} 
                    onNext={() => setStep(2)}
                    headingRef={stepHeadingRef} 
                    />
                )}

                {step === 2 && (
                    <PersonalInfoStep 
                        form={completeForm} 
                        onBack={() => setStep(1)} 
                        headingRef={stepHeadingRef}
                    />
                )}

                {step === 3 && (
                    <EducationStep 
                        form={completeForm} 
                        onBack={() => setStep(2)}
                        headingRef={stepHeadingRef}
                    />
                )}

                {step === 4 && (
                    <ResumeStep 
                        form={completeForm} 
                        resumeError={resumeError} 
                        setResumeError={setResumeError} 
                        onNext={() => setStep(5)} 
                        onBack={() => setStep(3)} 
                        headingRef={stepHeadingRef}
                    />
                )}

                {step === 5 && (
                    <NotificationStep 
                        form={completeForm} 
                        onNext={() => setStep(6)} 
                        onBack= {() => setStep(4)}
                        headingRef={stepHeadingRef}
                    />
                )}

                {step === 6 && reviewValues && (
                    <ReviewStep 
                        form={completeForm} 
                        reviewValues={reviewValues} 
                        email={email}
                        isSubmitting={isSubmitting}
                        onBack={() => setStep(5)}
                        headingRef={stepHeadingRef}
                    />
                )}
            </form>
            )
        }