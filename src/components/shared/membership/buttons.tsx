"use client";

import { joinClub, leaveClub, createClub } from "@/actions/membership";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getClub } from "@/lib/queries/club";

export function JoinClubButton({ clubId }: { clubId: string }) {
  const { execute, isPending } = useAction(joinClub.bind(null, clubId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await execute();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="default" disabled={isPending} className="w-full">
        {isPending ? <Spinner /> : "Join Club"}
      </Button>
    </form>
  );
}

export function LeaveClubButton({ clubId }: { clubId: string }) {
  const { execute, isPending } = useAction(leaveClub.bind(null, clubId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await execute();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="destructive" disabled={isPending} className="w-full">
        {isPending ? <Spinner /> : "Leave Club"}
      </Button>
    </form>
  );
}

export function CreateClubButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const boundAction = useMemo(
    () => createClub.bind(null, name, description),
    [name, description]
  );

  const { execute, isPending } = useAction(boundAction);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    execute();
    setOpen(false);
    setName("");
    setDescription("");
  };

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
        <form onSubmit={handleSubmit}>
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
