import { int, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./auth.schema";
import { membershipRoles } from "@/lib/types/membership";

export const clubs = sqliteTable("clubs", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
});

export const membership = sqliteTable(
  "membership",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clubId: int()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    role: text({ enum: membershipRoles }).notNull().default("member"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.clubId] })]
);
export * from "./auth.schema";
