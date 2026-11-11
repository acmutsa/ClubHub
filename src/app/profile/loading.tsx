import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the /profile layout so nothing jumps when the data arrives.
export default function ProfileLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your profile"
      className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8"
    >
      <Skeleton className="mb-6 h-5 w-32" />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <Card className="w-full lg:w-80 lg:shrink-0">
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="size-28 rounded-full" />
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="size-[18px] shrink-0" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <Skeleton className="h-8 w-40" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-[140px] w-full rounded-xl" />
          ))}
        </section>
      </div>
    </main>
  );
}
