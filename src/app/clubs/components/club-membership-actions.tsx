"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createClubAction,
  joinClubAction,
  leaveClubAction,
} from "../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

function showActionError(message: string) {
  toast.error(message);
}

export function JoinClubButton({ clubId }: { clubId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function joinClub() {
    startTransition(async () => {
      const result = await joinClubAction({ clubId });

      if (!result.ok) {
        showActionError(result.error.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button
      variant="default"
      disabled={isPending}
      className="w-full"
      onClick={joinClub}
    >
      {isPending ? <Spinner /> : "Join Club"}
    </Button>
  );
}

export function LeaveClubButton({ clubId }: { clubId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function leaveClub() {
    startTransition(async () => {
      const result = await leaveClubAction({ clubId });

      if (!result.ok) {
        showActionError(result.error.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button
      variant="destructive"
      disabled={isPending}
      className="w-full"
      onClick={leaveClub}
    >
      {isPending ? <Spinner /> : "Leave Club"}
    </Button>
  );
}

export function CreateClubButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function createClub(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await createClubAction({ name, description });

      if (!result.ok) {
        showActionError(result.error.message);
        return;
      }

      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Club</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Club</DialogTitle>
          <DialogDescription>
            Enter the name and description for your new club.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={createClub}>
          <div className="grid gap-4 py-4">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              required
            />
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="default" disabled={isPending}>
              {isPending ? <Spinner /> : "Create Club"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
