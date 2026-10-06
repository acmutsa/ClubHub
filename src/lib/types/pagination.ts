import { z } from "zod";
import { paginationSchema } from "@/lib/validators/common";

export type PaginationInput = z.infer<typeof paginationSchema>;

export type PaginationMeta = {
  page: number;
  pageSize: number;
  offset: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};
