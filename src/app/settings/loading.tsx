import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your settings"
      className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:px-8"
    >
      <Skeleton className="mb-6 h-5 w-32" />
      <Skeleton className="mb-6 h-9 w-40" />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <Card className="w-full lg:w-80 lg:shrink-0">
          <CardContent className="flex flex-col items-center gap-3">
            <Skeleton className="size-28 rounded-full" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[160px] w-full rounded-xl" />
          ))}
        </section>
      </div>
    </main>
  );
}
