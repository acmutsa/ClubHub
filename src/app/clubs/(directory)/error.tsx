"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AllOrgsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("All Orgs failed to load", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto w-full max-w-6xl space-y-4 px-4 py-10"
    >
      <h2 className="text-lg font-semibold">Orgs could not be loaded</h2>
      <p className="text-sm text-muted-foreground">
        Something went wrong on our side. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
