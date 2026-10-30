"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { leaveClubFromProfileAction } from "../actions";

// Profile-only Leave button: a quiet trigger in the club card footer that opens a
// confirm dialog naming the club. The shared LeaveClubButton on /clubs is untouched.
export function ProfileLeaveClubButton({
  clubId,
  clubName,
}: {
  clubId: string;
  clubName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function leaveClub() {
    startTransition(async () => {
      const result = await leaveClubFromProfileAction({ clubId });

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      setOpen(false);

      if (result.data.status === "sole_owner") {
        // Nothing changed, so there's nothing to refresh
        toast.error(`You're the only owner of ${clubName}. Transfer ownership before leaving.`);
        return;
      }

      if (result.data.status === "suspended") {
        // Nothing changed, but refresh so the page reflects the suspension
        toast.error(`Your membership in ${clubName} is suspended. Contact a club officer.`);
        router.refresh();
        return;
      }

      if (result.data.status === "not_member") {
        // Already left (e.g. in another tab): refresh so the card disappears
        toast.info(`You're no longer a member of ${clubName}.`);
        router.refresh();
        return;
      }

      toast.success(`You left ${clubName}.`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Keep the dialog open while the request is in flight
        if (!isPending) setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Leave ${clubName}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 sm:h-8"
        >
          Leave
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle className="break-words">Leave {clubName}?</DialogTitle>
          <DialogDescription>
            You&apos;ll lose access to its member pages, and it will be removed from My Clubs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={leaveClub} disabled={isPending}>
            {isPending ? (
              <>
                <Spinner />
                Leaving…
              </>
            ) : (
              "Leave club"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
