"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { FormProvider, useForm, useWatch, type DefaultValues } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { updateSettingsAction } from "../actions";
import {
  summarizeDemographics,
  summarizeNotifications,
  summarizePersonal,
  summarizeSchool,
} from "../lib/summarize-settings";
import type { SettingsProfile } from "../queries";
import { updateSettingsSchema, type UpdateSettingsInput } from "../validators";
import { DemographicsFields, NotificationFields, PersonalFields, SchoolFields } from "./settings-fields";

const sections: {
  id: string;
  title: string;
  Fields: ComponentType;
  summarize: (values: Partial<UpdateSettingsInput>) => string;
}[] = [
  { id: "personal", title: "Personal", Fields: PersonalFields, summarize: summarizePersonal },
  { id: "school", title: "School", Fields: SchoolFields, summarize: summarizeSchool },
  { id: "demographics", title: "Demographics", Fields: DemographicsFields, summarize: summarizeDemographics },
  { id: "notifications", title: "Notifications", Fields: NotificationFields, summarize: summarizeNotifications },
];

const emptySettings = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  pronouns: "",
  school: "",
  major: "",
  country: "",
  race: [],
  gender: "",
  ethnicity: "",
  shirtSize: "",
  eventAnnouncementEmail: false,
  eventAnnouncementPhone: false,
};

function SectionSummary({ summarize }: { summarize: (values: Partial<UpdateSettingsInput>) => string }) {
  const values = useWatch<UpdateSettingsInput>();
  return <p className="text-muted-foreground text-sm">{summarize(values) || "Not set"}</p>;
}

export function SettingsForm({ profile, children }: { profile: SettingsProfile | null; children?: ReactNode }) {
  const isMobile = useIsMobile();
  const hasProfile = profile !== null;
  const [openSection, setOpenSection] = useState<string | null>(null);

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    mode: "onTouched",
    defaultValues: { ...emptySettings, ...profile } as DefaultValues<UpdateSettingsInput>,
  });
  const { isDirty, isSubmitting } = form.formState;
  useUnsavedChangesGuard(isDirty);

  async function onSubmit(input: UpdateSettingsInput) {
    const result = await updateSettingsAction(input);

    if (result.ok) {
      toast.success("Settings saved");
      form.reset(input);
      return;
    }

    for (const [name, messages] of Object.entries(result.error.fieldErrors ?? {})) {
      form.setError(name as keyof UpdateSettingsInput, { message: messages?.[0] });
    }
    toast.error(result.error.message);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-w-0 flex-1 flex-col gap-4">
        {!hasProfile && (
          <div role="alert" className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
            {/*TODO: link the registration once merged */}
            Finish registration before editing your settings.
          </div>
        )}

        {sections.map(({ id, title, Fields, summarize }) => (
          <Card key={id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{title}</CardTitle>
              {isMobile && (
                <Button type="button" variant="outline" size="sm" className="h-11" onClick={() => setOpenSection(id)}>
                  <Pencil />
                  <span className="sr-only">Edit </span>
                  {title}
                </Button>
              )}
            </CardHeader>
            <CardContent>{isMobile ? <SectionSummary summarize={summarize} /> : <Fields />}</CardContent>
          </Card>
        ))}

        {children}

        <div className="bg-background sticky bottom-0 flex items-center justify-end gap-2 border-t py-3">
          <Button type="button" variant="outline" disabled={!isDirty || isSubmitting} onClick={() => form.reset()}>
            Discard
          </Button>
          <Button type="submit" disabled={!hasProfile || !isDirty || isSubmitting}>
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      {isMobile &&
        sections.map(({ id, title, Fields }) => (
          <Drawer key={id} open={openSection === id} onOpenChange={(open) => setOpenSection(open ? id : null)}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription className="sr-only">Edit your {title.toLowerCase()} settings.</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-4">
                <Fields />
              </div>
              <DrawerFooter>
                <Button type="button" className="h-11" onClick={() => setOpenSection(null)}>
                  Done
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
    </FormProvider>
  );
}
