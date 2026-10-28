"use client";

import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { clubCategories } from "@/constants/club-categories";
import type { AllOrgsFilters, OrgSort } from "../validators";

type ClubCategory = (typeof clubCategories)[number];

const SEARCH_DEBOUNCE_MS = 300;

const sortLabels: Record<OrgSort, string> = {
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
  type: "Type",
};

function buildQueryString(filters: AllOrgsFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const type of filters.type) params.append("type", type);
  if (filters.sort !== "name-asc") params.set("sort", filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

// The server page owns the data: this toolbar only rewrites the URL, and the
// page re-renders with the new search params.
export function OrgFilters({ filters }: { filters: AllOrgsFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keep the box in sync with Back/Forward, but never overwrite what the
  // person is typing right now.
  useEffect(() => {
    if (document.activeElement !== searchInputRef.current) {
      setSearch(filters.q);
    }
  }, [filters.q]);

  function applyFilters(next: Partial<AllOrgsFilters>) {
    const url = `${pathname}${buildQueryString({ ...filters, ...next })}`;
    startTransition(() => {
      // replace, not push: typing shouldn't fill the history with entries
      router.replace(url, { scroll: false });
    });
  }

  // Debounced search: only hit the server once typing pauses.
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === filters.q) return;
    const timeout = setTimeout(
      () => applyFilters({ q: trimmed }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyFilters is recreated every render
  }, [search, filters.q]);

  function toggleType(type: ClubCategory, checked: boolean) {
    const nextTypes = checked
      ? [...filters.type, type]
      : filters.type.filter((t) => t !== type);
    applyFilters({ type: nextTypes });
  }

  function clearAll() {
    setSearch("");
    applyFilters({ q: "", type: [], sort: "name-asc" });
  }

  const hasActiveFilters =
    filters.q !== "" || filters.type.length > 0 || filters.sort !== "name-asc";

  return (
    <div className="space-y-3" aria-busy={isPending}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search orgs by name"
            aria-label="Search orgs by name"
            maxLength={100}
            className="h-10 pl-9 pr-9"
          />
          {isPending && (
            <Spinner className="absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>

        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 flex-1 sm:flex-none">
                Type
                {filters.type.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.type.length}
                  </Badge>
                )}
                <ChevronDownIcon className="ml-1 size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
              <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {clubCategories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={filters.type.includes(category)}
                  onCheckedChange={(checked) => toggleType(category, checked)}
                  // keep the menu open so several types can be picked in a row
                  onSelect={(event) => event.preventDefault()}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={filters.sort}
            onValueChange={(value) => applyFilters({ sort: value as OrgSort })}
          >
            <SelectTrigger
              className="flex-1 data-[size=default]:h-10 sm:w-40 sm:flex-none"
              aria-label="Sort orgs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.entries(sortLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.type.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1 pr-1">
              {type}
              <button
                type="button"
                onClick={() => toggleType(type, false)}
                className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${type} filter`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={isPending}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
