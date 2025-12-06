"use client";

import { joinClub, leaveClub } from "@/actions/membership";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";

export function JoinClubButton({
  userId,
  clubId,
}: {
  userId: string;
  clubId: number;
}) {
  const { execute } = useAction(joinClub.bind(null, userId, clubId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await execute({ userId, clubId });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="default">Join Club</Button>
    </form>
  );
}

export function LeaveClubButton({
  userId,
  clubId,
}: {
  userId: string;
  clubId: number;
}) {
  const { execute } = useAction(leaveClub.bind(null, userId, clubId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await execute({ userId, clubId });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="destructive">Leave Club</Button>
    </form>
  );
}
