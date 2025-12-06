"use client";

import { joinClub, leaveClub } from "@/actions/membership";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";

export function JoinClubButton({ clubId }: { clubId: number }) {
  const { execute } = useAction(joinClub.bind(null, clubId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await execute();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="default">Join Club</Button>
    </form>
  );
}

export function LeaveClubButton({ clubId }: { clubId: number }) {
  const { execute } = useAction(leaveClub.bind(null, clubId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await execute();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="destructive">Leave Club</Button>
    </form>
  );
}
