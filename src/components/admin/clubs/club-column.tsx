import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import type { AdminClubRow } from "@/lib/types/club"

export const ClubColumns = (isSuperAdmin: boolean ): ColumnDef<AdminClubRow>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Name<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "ownerName",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Owner<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground">{row.getValue("ownerName")}</div>
      ),
    },
    {
      accessorKey: "slug",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Slug<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground">{row.getValue("slug")}</div>
      ),
    },
    {
      accessorKey: "memberCount",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Members<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground">{row.getValue("memberCount")}</div>
      ),
    },
    {
      accessorKey: "eventCount",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Events<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground">{row.getValue("eventCount")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const club = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={`/admin/clubs/${club.id}`}>
                  View Club
                </Link>
              </DropdownMenuItem>
              {isSuperAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => console.log("click")}
                    className="cursor-pointer"
                  >
                    Edit Club
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => console.log("Click")}
                    className="cursor-pointer bg-red-300 dark:bg-red-800 data-[highlighted]:bg-red-600 dark:data-[highlighted]:bg-red-600"
                  >
                    Delete Club
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
];