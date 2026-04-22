"use client";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { cn } from "@/lib/utils";
import { createRoleAction } from "@/actions/membership";
import { permissionList } from "@/lib/types/club-admin";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = {
    name: string,
    position: number,
    slug: string,
    selectedPermissions: number[];
};

export default function NewRoleForm({ slug }: { slug: string }) {
    const router = useRouter();

    const form = useForm<FormValues>({
        defaultValues: {
            name: "",
            position: 0,
            slug,
            selectedPermissions: [],
        },
    });

    const { execute, isPending, result } = useAction(createRoleAction, {
        onSuccess: () => {
            router.push(`/admin/members`);
        },
        onError: () => {
            console.log(result);
        }
    });

    function toBitMask(values: number[]) {
        return values.reduce((acc, curr) => acc | curr, 0);
    }

    function onSubmit(values: FormValues) {
        execute({
            name: values.name,
            position: values.position,
            slug: values.slug,
            permissions: toBitMask(values.selectedPermissions),
        });
    }

    function togglePermission(value: number) {
        const current = form.getValues("selectedPermissions");

        if (current.includes(value)) {
            form.setValue(
                "selectedPermissions",
                current.filter((v) => v !== value)
            );
        } else {
            form.setValue("selectedPermissions", [...current, value]);
        }
    }
  
    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn("space-y-6")}
        >
            {result?.validationErrors?._errors && (
                <div className="rounded-md bg-destructive/10 border border-destructive p-4">
                    <p className="text-destructive text-sm font-medium">
                        {result.validationErrors._errors.join(", ")}
                    </p>
                </div>
            )}
            <Card>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <FieldDescription>Input the name for the role</FieldDescription>
                            <Input 
                                placeholder="ex. President, Vice President, Secretary"
                                {...form.register("name")}
                            />
                            <FieldError>{form.formState.errors.name?.message}</FieldError>
                        </Field>
                    </FieldGroup>
                </CardContent>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="position">Position</FieldLabel>
                            <FieldDescription>
                                Role position controls hierarchy in the club.
                                <br />
                                <br />
                                <strong>0 = lowest rank</strong> (regular members)
                                <br />
                                Higher numbers = higher authority
                                <br />
                                <br />
                                Users with a lower position cannot manage or edit roles above them.
                                <br />
                                <br />
                                Example: Position 1 can manage position 0, but not position 2 or higher.
                            </FieldDescription>
                            <Input 
                                type="number"
                                min={0}
                                {...form.register("position", { valueAsNumber: true })}    
                            />
                            <FieldError>{form.formState.errors.position?.message}</FieldError>
                        </Field>
                    </FieldGroup>
                </CardContent>
                <CardContent>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="selectedPermissions">Permissions</FieldLabel>
                            <FieldDescription>Choose the permissions for the role</FieldDescription>
                            <Controller
                                control={form.control}
                                name="selectedPermissions"
                                render={({ field }) => {
                                    const selected = field.value ?? [];

                                    const toggle = (value: number) => {
                                        if (selected.includes(value)) {
                                            field.onChange(selected.filter((v) => v !== value));
                                        } else {
                                            field.onChange([...selected, value]);
                                        }
                                    };

                                    return (
                                        <>
                                            {permissionList.map((perm) => (
                                                <div key={perm.value} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        checked={selected.includes(perm.value)}
                                                        onCheckedChange={() => toggle(perm.value)}
                                                    />
                                                    <label className="text-sm">{perm.label}</label>
                                                </div>
                                            ))}
                                        </>
                                    );
                                }}
                            />
                            <FieldError>{form.formState.errors.selectedPermissions?.message}</FieldError>
                        </Field>
                    </FieldGroup>
                </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
                <Button 
                    type="button"
                    variant={"outline"}
                    onClick={() => router.push(`/admin/members`)}
                >Cancel</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Role"}
                </Button>
            </div>
        </form>
    );
}
