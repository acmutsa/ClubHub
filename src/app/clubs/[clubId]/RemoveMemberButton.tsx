"use client";

import { leaveClub } from "@/db/actions/clubs";

export function RemoveMemberButton({ userId, clubId }: { userId: string; clubId: number }) {
  async function handleRemove() {
    await leaveClub(userId, clubId);
    window.location.reload(); 
  }

  return (
    <button 
      className="rounded-lg bg-blue-400 px-2 py-1"
      onClick={handleRemove}
    >
      Remove Member
    </button>
  );
}
