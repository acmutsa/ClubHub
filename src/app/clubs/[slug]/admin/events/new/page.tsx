import { NewEventForm } from "@/components/clubs/new-event-form";
import { getClubEventTypes, getAllLocations } from "@/lib/queries/events";
import { thumbnailStorage } from "@/lib/storage/thumbnails";

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [eventTypes, locations, thumbnailResult] = await Promise.all([
    getClubEventTypes(slug),
    getAllLocations(),
    thumbnailStorage.listClubThumbnails(slug),
  ]);

  const thumbnails = await Promise.all(
    thumbnailResult.keys.map(async (key) => ({
      key,
      url: await thumbnailStorage.getThumbnailUrl(key),
    })),
  );

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
            slug={slug}
            eventTypes={eventTypes}
            locations={locations}
            initialThumbnails={thumbnails}
          />
        </div>
      </div>
    </div>
  );
}
