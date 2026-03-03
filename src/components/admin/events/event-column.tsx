import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import type { AdminEventRow } from "@/lib/types/event"

export const EventColumns = (isSuperAdmin: boolean ): ColumnDef<AdminEventRow>[] => [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Title<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Description<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground text-wrap w-[50ch]">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "start",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Start<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => {
        const date = row.original.start;
        return (
            <div className="text-left text-muted-foreground">{date.toLocaleString()}</div>
        );
      },
    },
    {
      accessorKey: "end",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >End<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => {
        const date = row.original.end;
        return (
            <div className="text-left text-muted-foreground">{date.toLocaleString()}</div>
        );
      },
    },
    {
      accessorKey: "checkInStart",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >CheckInStart<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => {
        const date = row.original.checkInStart;
        return (
            <div className="text-left text-muted-foreground">{date.toLocaleString()}</div>
        );
      },
    },
    {
      accessorKey: "checkInEnd",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >CheckInEnd<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => {
        const date = row.original.checkInEnd;
        return (
            <div className="text-left text-muted-foreground">{date.toLocaleString()}</div>
        );
      },
    },
    {
      accessorKey: "createdByName",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >CreatedByName<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground">{row.getValue("createdByName")}</div>
      ),
    },
    {
      accessorKey: "updatedByName",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >UpdatedByName<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground">{row.getValue("updatedByName")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const event = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={`/admin/events/${event.id}`}>
                  View Event
                </Link>
              </DropdownMenuItem>
              {isSuperAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => console.log("click")}
                    className="cursor-pointer"
                  >
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => console.log("Click")}
                    className="cursor-pointer bg-red-300 dark:bg-red-800 data-[highlighted]:bg-red-600 dark:data-[highlighted]:bg-red-600"
                  >
                    Delete Event
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
];