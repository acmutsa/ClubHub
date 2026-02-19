import { notFound } from "next/navigation";

interface CheckinsPageProps {
  params: Promise<{ clubId: string; eventId: string }>;
}

export default async function CheckinsPage({ params }: CheckinsPageProps) {
  const { clubId, eventId } = await params;
  const eventIdNumber = parseInt(eventId, 10);

  if (isNaN(eventIdNumber)) {
    notFound();
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Event Check-ins</h1>
      <p className="text-sm text-muted-foreground">
        Club: {clubId} • Event ID: {eventIdNumber}
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm">
          Check-in scanner + attendee list goes here.
        </p>
      </div>
    </main>
  );
}
