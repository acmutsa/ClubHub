"use client";

import { useEffect, useRef } from "react";

import { Spinner } from "@/components/ui/spinner";
import { signOutDeletedAccountAction } from "./actions";

// Shown instead of the profile when the signed-in account has been deleted.
// Signs the user out as soon as it mounts.
export function DeletedAccountSignOut() {
  const hasStarted = useRef(false);

  useEffect(() => {
    // Effects run twice in dev (Strict Mode); only sign out once
    if (hasStarted.current) return;
    hasStarted.current = true;

    void signOutDeletedAccountAction();
  }, []);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <Spinner />
      <p className="font-medium">This account is no longer active.</p>
      <p className="text-muted-foreground text-sm">Signing you out…</p>
    </div>
  );
}
