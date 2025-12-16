import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  return (
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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
}
