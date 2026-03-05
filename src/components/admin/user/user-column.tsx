import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import type { AdminUserRow } from "@/lib/types/user"

export const UserColumns = (isSuperAdmin: boolean, setEditingUser: (user: AdminUserRow) => void): ColumnDef<AdminUserRow>[] => [
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
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Email<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-left text-muted-foreground">{row.getValue("email")}</div>
      ),
    },

    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Role<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("role")}</span>
      ),
    },

    {
      accessorKey: "clubCount",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer !m-0 !p-1"
          >Clubs<ArrowUpDown/></Button>
        );
      },
      cell: ({ row }) => row.getValue<number>("clubCount"),
    },

    {
      id: "clubs",
      header: "Club Memberships",
      cell: ({ row }) => {
        const clubs = row.original.clubs;

        if (!clubs.length) {
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <div className="flex gap-2 overflow-x-auto scroll-m-0 w-[50ch] px-1">
            {clubs.map((club, index) => {
              const isNull = !club?.id;

              return (
                <span
                  key={club?.id ?? `null-${index}`}
                  className="
                    underline
                    after:content-[',']
                    last:after:content-['']
                  "
                >
                  {isNull ? (
                    <span className="text-red-500 font-semibold">
                      null
                    </span>
                  ) : (
                    <Link
                      href={`/admin/clubs/${club.id}`}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      {club.name}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>
        );
      },
    },

    {
      id: "actions",
      enableHiding: false,
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href={`/admin/users/${user.id}`}>
                  View Profile
                </Link>
              </DropdownMenuItem>
              {isSuperAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setEditingUser(user)
                    }}
                    className="cursor-pointer"
                  >
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => console.log("Click")}
                    className="cursor-pointer bg-red-300 dark:bg-red-800 data-[highlighted]:bg-red-600 dark:data-[highlighted]:bg-red-600"
                  >
                    Delete User
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
];