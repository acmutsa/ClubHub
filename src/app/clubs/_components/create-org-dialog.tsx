"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { createClub } from "@/actions/membership";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateOrgDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { execute, isPending } = useAction(
    createClub.bind(null, name, description),
    {
      onSuccess: () => {
        toast.success(`Created ${name}`);
        setOpen(false);
        setName("");
        setDescription("");
        router.refresh();
      },
      onError: ({ error }) => {
        const message =
          error.validationErrors?.formErrors?.[0] ??
          error.serverError ??
          error.thrownError?.message ??
          "Couldn't create the org.";
        console.error("createClub failed:", error);
        toast.error(message);
      },
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors">
          Create Org
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new org</DialogTitle>
          <DialogDescription>
            Give your organization a name and a short description.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            execute();
          }}
        >
          <div className="grid gap-4 py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              required
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : "Create Org"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}