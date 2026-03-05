"use client";
import {
  joinClub,
  leaveClub,
  createClub,
  transferOwnership,
} from "@/actions/membership";
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
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Shield } from "lucide-react";

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
    [name, description],
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

export function TransferOwnershipButton({ clubId }: { clubId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "confirm">("input");

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsPending(true);
    setError(null);
    try {
      await transferOwnership(clubId, email);
      setOpen(false);
      setEmail("");
      setStep("input");
    } catch (err: any) {
      setError(err.message || "Error: Failed to transfer");
    } finally {
      setIsPending(false);
    }
  };

  const handleBack = () => {
    setStep("input");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SidebarMenuButton asChild>
        <DialogTrigger asChild>
          <button>
            <Shield />
            <span>Transfer Ownership</span>
          </button>
        </DialogTrigger>
      </SidebarMenuButton>
      <DialogContent>
        {step === "input" ? (
          <>
            <DialogHeader>
              <DialogTitle>Transfer Ownership</DialogTitle>
              <DialogDescription>
                Enter the email of a member to transfer ownership of this club
                to.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmailSubmit}>
              <div className="grid gap-4 py-4">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Member's email"
                  required
                  type="email"
                />
              </div>
              <DialogFooter>
                <Button type="submit" variant="default">
                  Continue
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Transfer</DialogTitle>
              <DialogDescription>
                Transfer ownership to <strong>{email}</strong>? This is a
                destructive action that cannot be undone!
              </DialogDescription>
            </DialogHeader>
            {error && <div className="text-red-500">{error}</div>}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? <Spinner /> : "Transfer"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
