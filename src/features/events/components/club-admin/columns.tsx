"use client";

import { AdminSelectEvent } from "@/features/events/lib/types/event";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  ImageIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Sortable column header component
function SortableHeader({
  column,
  children,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
}

export const columns: ColumnDef<AdminSelectEvent>[] = [
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    enableSorting: false,
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
    header: ({ column }) => (
      <SortableHeader column={column}>Title</SortableHeader>
    ),
    cell: ({ row }) => (
      <Link href={`/events/${row.original.id}`}>
        <div className="font-medium hover:underline">
          {row.getValue("title")}
        </div>
      </Link>
    ),
  },
  {
    accessorKey: "eventTypes",
    header: "Type",
    filterFn: (row, id, value) => {
      const eventType = row.original.eventTypes;
      return String(eventType.id) === value;
    },
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
    header: ({ column }) => (
      <SortableHeader column={column}>Date & Time</SortableHeader>
    ),
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
    enableSorting: false,
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
    header: ({ column }) => (
      <SortableHeader column={column}>Points</SortableHeader>
    ),
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
    header: ({ column }) => (
      <SortableHeader column={column}>Status</SortableHeader>
    ),
    filterFn: (row, id, value) => {
      const isHidden = row.getValue(id) as boolean;
      if (value === "visible") return !isHidden;
      if (value === "hidden") return isHidden;
      return true;
    },
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
