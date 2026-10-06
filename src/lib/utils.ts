import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPaginationOffset({ page, pageSize }: { page: number; pageSize: number }) {
  return (page - 1) * pageSize
}

export function getPaginationMeta(
  { page, pageSize, total }: { page: number; pageSize: number; total: number },
) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return {
    page,
    pageSize,
    offset: getPaginationOffset({ page, pageSize }),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}
