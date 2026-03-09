import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Plus } from "lucide-react";
import { getClubEvents, getClubEventTypes } from "@/lib/queries/events";
import Link from "next/link";
import { headers } from "next/headers";
import { modifyBasePath } from "@/lib/routing/subdomain";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const [clubEvents, eventTypes] = await Promise.all([
    getClubEvents(slug),
    getClubEventTypes(slug),
  ]);

  const h = (await headers()).get("host") ?? "";

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
                Manage and monitor your organizations events
              </p>
            </div>
            <Link href={modifyBasePath(slug, h, "/admin/events/new")}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-4">
        <DataTable
          columns={columns}
          data={clubEvents}
          eventTypes={eventTypes}
        />
      </div>
    </>
  );
}
