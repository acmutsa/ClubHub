import { z } from "zod";

import { clubCategories } from "@/constants/club-categories";

export const orgSortSchema = z.enum(["name-asc", "name-desc", "type"]);
export type OrgSort = z.infer<typeof orgSortSchema>;

// Search params come straight from the URL, so anything malformed falls back
// to a default instead of throwing. A bad link should still show the page.
export const allOrgsFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(""),
  // ?type=Arts&type=Music arrives as an array, ?type=Arts as a string
  type: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => (value === undefined ? [] : [value].flat()))
    .transform((types) =>
      // keep only known categories, de-duplicated, in the constant's order
      clubCategories.filter((category) => types.includes(category)),
    )
    .catch([]),
  sort: orgSortSchema.catch("name-asc"),
});

export type AllOrgsFilters = z.infer<typeof allOrgsFiltersSchema>;
