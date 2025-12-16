import { int, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./auth.schema";

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
    clubId: text()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.clubId] })]
);
export * from "./auth.schema";
