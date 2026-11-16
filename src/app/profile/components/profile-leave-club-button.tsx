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
import { ActionErrorCode } from "@/constants/action-error-code";
import { leaveClubFromProfileAction } from "../actions";

// The membership changed since the page loaded, so the card is out of date
const STALE_MEMBERSHIP_ERRORS = new Set([ActionErrorCode.NOT_FOUND, ActionErrorCode.FORBIDDEN]);

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
      setOpen(false);

      if (!result.ok) {
        toast.error(result.error.message);
        if (STALE_MEMBERSHIP_ERRORS.has(result.error.code)) router.refresh();
        return;
      }

      toast.success(`You left ${clubName}.`);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
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
