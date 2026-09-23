import { Button } from "@/components/ui/button";
import { EventDataTable } from "./event-data-table";
import { eventColumns } from "./event-columns";
import { Plus } from "lucide-react";
import { listClubEvents, listClubEventTypes } from "../../queries";
import Link from "next/link";

export default async function Page({ params }: { params: { clubId: string } }) {
  const { clubId } = await params;
  const [clubEvents, eventTypes] = await Promise.all([
    listClubEvents(clubId),
    listClubEventTypes(clubId),
  ]);

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                Events
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage and monitor your club&apos;s events
              </p>
            </div>
            <Link href={`/admin/events/new`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-4">
        <EventDataTable
          columns={eventColumns}
          data={clubEvents}
          eventTypes={eventTypes}
        />
      </div>
    </>
  );
}
