"use client";

import { AdminSelectEvent } from "@/lib/types/event";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Eye, EyeOff, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const columns: ColumnDef<AdminSelectEvent>[] = [
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => {
      const thumbnail = row.original.thumbnail;
      return (
        <div className="relative h-12 w-20 overflow-hidden rounded-md bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail.url}
              alt={row.original.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link href={`/events/${row.original.id}`}>
        <div className="font-medium">{row.getValue("title")}</div>
      </Link>
    ),
  },
  {
    accessorKey: "eventTypes",
    header: "Type",
    cell: ({ row }) => {
      const eventType = row.original.eventTypes;
      return (
        <Badge
          variant="outline"
          style={{
            borderColor: eventType.color,
            backgroundColor: `${eventType.color}20`,
            color: eventType.color,
          }}
        >
          {eventType.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: "start",
    header: "Date & Time",
    cell: ({ row }) => {
      const startDate = row.original.start;
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(startDate, "MMM d, yyyy • h:mm a")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      if (!location) {
        return <span className="text-muted-foreground">No location</span>;
      }
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "points",
    header: "Points",
    cell: ({ row }) => {
      const points = row.getValue("points") as number;
      return (
        <Badge variant="secondary" className="font-mono">
          {points} pts
        </Badge>
      );
    },
  },
  {
    accessorKey: "hidden",
    header: "Status",
    cell: ({ row }) => {
      const isHidden = row.getValue("hidden") as boolean;
      return isHidden ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <EyeOff className="h-4 w-4" />
          <span>Hidden</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-600">
          <Eye className="h-4 w-4" />
          <span>Visible</span>
        </div>
      );
    },
  },
];
