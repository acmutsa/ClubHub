import { NewEventForm } from "./components/new-event-form";
import { listClubEventTypes, listLocations } from "../../../queries";

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;

  const [eventTypes, locations] = await Promise.all([
    listClubEventTypes(clubId),
    listLocations(),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">
                Create New Event
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in the details below to create a new event for your club.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">
          <NewEventForm
            clubId={clubId}
            eventTypes={eventTypes}
            locations={locations}
          />
        </div>
      </div>
    </div>
  );
}
