"use client";

import { joinClub, leaveClub } from "@/actions/membership";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAction } from "next-safe-action/hooks";

export function JoinClubButton({ clubId }: { clubId: number }) {
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

export function LeaveClubButton({ clubId }: { clubId: number }) {
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
