"use client"
 
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
 import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,} from "@/components/ui/select";
interface DataTableProps<TData, TValue> {
    
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}
 
export default function MemberDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
 const [sorting, setSorting] = useState<SortingState>([]);
 const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
 const [globalFilter, setGlobalFilter] = useState("")
 const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
  })
 
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex flex-row items-center ">
              <Input
              placeholder="Search members..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-lg ml-2"
              />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                  Show Only
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  {table
                  .getAllColumns()
                  .filter(
                      (column) => column.getCanHide()
                  )
                  .map((column) => {
                      return (
                      <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                          }
                      >
                          {column.id}
                      </DropdownMenuCheckboxItem>
                      )
                  })}
              </DropdownMenuContent>
              </DropdownMenu>
              <Select
                defaultValue="all"
                onValueChange={(value) => {
                  const roleColumn = table.getColumn("role")

                  if (!roleColumn) return

                  if (value === "all") {
                    roleColumn.setFilterValue(undefined)
                  }

                  if (value === "admins") {
                    roleColumn.setFilterValue(["admin", "super_admin"])
                  }

                  if (value === "members") {
                    roleColumn.setFilterValue("member")
                  }
                }}
              >
                    <SelectTrigger className="w-[180px] m-3">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Members</SelectItem>
                        <SelectItem value="admins">Admins Only</SelectItem>
                        <SelectItem value="members">Members Only</SelectItem>
                      </SelectGroup>
                    </SelectContent>
              </Select>
          </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}