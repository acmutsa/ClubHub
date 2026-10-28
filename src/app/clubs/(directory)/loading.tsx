import { Skeleton } from "@/components/ui/skeleton";

export default function AllOrgsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-64" />
      <div className="mt-6 mb-6 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 sm:w-24" />
          <Skeleton className="h-10 flex-1 sm:w-40" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
