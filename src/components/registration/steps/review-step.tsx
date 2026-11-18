'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import type { createUserProfileValues } from "@/lib/validators/user-profile";
import type { UseFormReturn } from "react-hook-form";

type ReviewStepProps = {
  email?: string;
  form: UseFormReturn<createUserProfileValues>;
  isSubmitting: boolean;
  onBack: () => void;
  reviewValues: createUserProfileValues;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
};

export default function ReviewStep({
  email,
  form,
  isSubmitting,
  onBack,
  reviewValues,
}: ReviewStepProps) {
  const race = Array.isArray(reviewValues.race) && reviewValues.race.length > 0
    ? reviewValues.race.join(", ")
    : "Not provided";
  const graduationDate =
    reviewValues.expectedGraduationDate instanceof Date &&
    !Number.isNaN(reviewValues.expectedGraduationDate.getTime())
      ? reviewValues.expectedGraduationDate.toLocaleString(undefined, {
          month: "long",
          year: "numeric",
        })
      : "Not provided";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Review your registration</CardTitle>
        <CardDescription>
          Check your information before submitting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="font-medium">Name</dt>
            <dd className="text-muted-foreground">
              {reviewValues.firstName} {reviewValues.lastName}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Email</dt>
            <dd className="text-muted-foreground">{email}</dd>
          </div>
          <div>
            <dt className="font-medium">Personal information</dt>
            <dd className="text-muted-foreground">
              Gender: {reviewValues.gender || "Not provided"}; Race: {race}; Ethnicity: {reviewValues.ethnicity || "Not provided"}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Education</dt>
            <dd className="text-muted-foreground">
              {reviewValues.school} · {reviewValues.country} · {reviewValues.major}
            </dd>
            <dd className="text-muted-foreground">
              Expected graduation: {graduationDate}
            </dd>
          </div>
          <div>
            <dt className="font-medium">Notification preferences</dt>
            <dd className="text-muted-foreground">
              Email: {reviewValues.eventAnnouncementEmail ? "Opted in" : "Opted out"};
              {" "}Phone: {reviewValues.eventAnnouncementPhone ? "Opted in" : "Opted out"}
            </dd>
          </div>
        </dl>
        {form.formState.errors.root && (
          <FieldError
            className="mt-4"
            errors={[form.formState.errors.root]}
          />
        )}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
