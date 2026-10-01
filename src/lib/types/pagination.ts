import { z } from "zod";
import {paginationSchema } from "@/lib/validators/common";

export type PaginationInput = z.infer<typeof paginationSchema>;
export type PaginatedResult<T> = {items: T[]};
