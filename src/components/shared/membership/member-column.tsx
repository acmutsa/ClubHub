import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import type { MemberRow } from "@/lib/types/user"
import { removeMember } from "@/actions/membership";
// TODO allow remove actions for a user and possibly a link to change their role?
export const MemberColumns = (isAdmin: boolean, setEditingUser: (user: MemberRow) => void, clubId: string): ColumnDef<MemberRow>[] => [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="cursor-pointer !m-0 !p-1"
                >Name<ArrowUpDown /></Button>
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
                >Email<ArrowUpDown /></Button>
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
                >Role<ArrowUpDown /></Button>
            );
        },
        cell: ({ row }) => (
            //this must be changed to display an officer role once those schema changes are implemented

            !isAdmin ? <span className="capitalize">{row.getValue("role") === "admin" ? "Officer" : row.getValue("role") === "super_admin" ? "Officer" : "Member"}</span> : < span className="capitalize" > {row.getValue("role")}</span >

        ),
    },

    {
        id: "actions",
        enableHiding: false,
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original;

            return (
                <Dialog>
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
                            {isAdmin && (
                                <DialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="cursor-pointer bg-red-300 dark:bg-red-800 data-[highlighted]:bg-red-600 dark:data-[highlighted]:bg-red-600"
                                    >
                                        Kick Member
                                    </DropdownMenuItem>
                                </DialogTrigger>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to kick {user.name}? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={async () => await removeMember(clubId, user.id)}>
                                    Kick Member
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        },
    },
];