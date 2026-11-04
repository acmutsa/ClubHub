"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState, type ComponentType } from "react";
import { FormProvider, useForm, type DefaultValues } from "react-hook-form";
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
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { updateSettingsAction } from "../actions";
import { updateSettingsSchema, type UpdateSettingsInput } from "../validators";
import { DemographicsFields, NotificationFields, PersonalFields, SchoolFields } from "./settings-fields";

type Profile = Partial<UpdateSettingsInput> | null;

const sections: {
  id: string;
  title: string;
  Fields: ComponentType;
  summary: (values: UpdateSettingsInput) => string;
}[] = [
  {
    id: "personal",
    title: "Personal",
    Fields: PersonalFields,
    summary: (v) => [`${v.firstName} ${v.lastName}`.trim(), v.pronouns, v.phoneNumber].filter(Boolean).join(" · "),
  },
  {
    id: "school",
    title: "School",
    Fields: SchoolFields,
    summary: (v) => [v.major, v.school].filter(Boolean).join(" · "),
  },
  {
    id: "demographics",
    title: "Demographics",
    Fields: DemographicsFields,
    summary: (v) => [v.gender, v.ethnicity].filter(Boolean).join(" · "),
  },
  {
    id: "notifications",
    title: "Notifications",
    Fields: NotificationFields,
    summary: (v) =>
      `Email ${v.eventAnnouncementEmail ? "on" : "off"} · Text ${v.eventAnnouncementPhone ? "on" : "off"}`,
  },
];

export function SettingsForm({ profile }: { profile: Profile }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const form = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    mode: "onTouched",
    defaultValues: {
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
      ...profile,
    } as DefaultValues<UpdateSettingsInput>,
  });
  const { isDirty, isSubmitting } = form.formState;
  const values = form.watch();
  useUnsavedChangesGuard(isDirty);

  async function onSubmit(input: UpdateSettingsInput) {
    const result = await updateSettingsAction(input);

    if (result.ok) {
      if (result.data.status === "no_profile") {
        toast.error("Finish registration before editing your settings.");
        return;
      }
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
        {sections.map(({ id, title, Fields, summary }) => (
          <Card key={id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{title}</CardTitle>
              <Button type="button" variant="outline" size="sm" className="h-11 lg:hidden" onClick={() => setOpenSection(id)}>
                <Pencil />
                <span className="sr-only">Edit </span>
                {title}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm lg:hidden">{summary(values) || "Not set"}</p>
              <div className="hidden lg:block">
                <Fields />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="bg-background sticky bottom-0 flex items-center justify-end gap-2 border-t py-3">
          <Button type="button" variant="outline" disabled={!isDirty || isSubmitting} onClick={() => form.reset()}>
            Discard
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      {sections.map(({ id, title, Fields }) => (
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
