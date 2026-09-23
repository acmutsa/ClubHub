import {
  sqliteTable,
  text,
  primaryKey,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "@/lib/auth/schema";
import { membershipRoles } from "@/lib/types/membership";
import { sql, relations } from "drizzle-orm";

const commonTimestamps = {
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
};

export const clubs = sqliteTable(
  "clubs",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    description: text().notNull(),
    ownerId: text("owner").notNull(),
    slug: text().notNull(),
  },
  (table) => [uniqueIndex("clubs_slug_unique").on(table.slug)],
);

export const memberships = sqliteTable(
  "memberships",
  {
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clubId: text()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    role: text({ enum: membershipRoles }).notNull().default("MEMBER"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.clubId] })]
);

export const events = sqliteTable("events", {
  id: integer().primaryKey({ autoIncrement: true }),
  clubId: text()
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  title: text().notNull(),
  description: text().notNull(),
  startAt: integer({ mode: "timestamp" }).notNull(),
  endAt: integer({ mode: "timestamp" }).notNull(),
  checkInStartAt: integer({ mode: "timestamp" }).notNull(),
  checkInEndAt: integer({ mode: "timestamp" }).notNull(),
  createdBy: text().references(() => user.id, { onDelete: "set null" }),
  updatedBy: text().references(() => user.id, { onDelete: "set null" }),
  thumbnailId: integer()
    .references(() => thumbnails.id, { onDelete: "set null" })
    .default(sql`NULL`),
  locationId: integer()
    .references(() => locations.id, {
      onDelete: "set default",
    })
    .default(sql`NULL`),
  eventTypeId: integer()
    .notNull()
    .references(() => eventTypes.id, { onDelete: "set default" }),
  points: integer().notNull().default(0),
  hidden: integer({ mode: "boolean" }).notNull().default(false),
  ...commonTimestamps,
});

export const eventTypes = sqliteTable("event_types", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
  color: text().notNull(),
  requiredPoints: integer().notNull().default(0),
  clubId: text()
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  ...commonTimestamps,
});

export const locations = sqliteTable("locations", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  roomNumber: text().notNull(),
  buildingId: integer()
    .references(() => buildings.id, { onDelete: "cascade" })
    .notNull(),
  ...commonTimestamps,
});

export const buildings = sqliteTable("buildings", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  code: text().notNull(),
  ...commonTimestamps,
});

export const thumbnails = sqliteTable("thumbnails", {
  id: integer().primaryKey({ autoIncrement: true }),
  url: text().notNull(),
  ...commonTimestamps,
});

export const clubsRelationships = relations(clubs, ({ one, many }) => ({
  events: many(events),
  memberships: many(memberships),
  eventTypes: many(eventTypes),
}));

export const eventsRelationships = relations(events, ({ one, many }) => ({
  club: one(clubs, {
    fields: [events.clubId],
    references: [clubs.id],
  }),
  eventTypes: one(eventTypes, {
    fields: [events.eventTypeId],
    references: [eventTypes.id],
  }),
  location: one(locations, {
    fields: [events.locationId],
    references: [locations.id],
  }),
  thumbnail: one(thumbnails, {
    fields: [events.thumbnailId],
    references: [thumbnails.id],
  }),
  creator: one(user, {
    fields: [events.createdBy],
    references: [user.id],
  }),
  updater: one(user, {
    fields: [events.updatedBy],
    references: [user.id],
  }),
}));

export const eventTypesRelationships = relations(
  eventTypes,
  ({ one, many }) => ({
    club: one(clubs, {
      fields: [eventTypes.clubId],
      references: [clubs.id],
    }),
    events: many(events),
  })
);

export const locationsRelationships = relations(locations, ({ one, many }) => ({
  building: one(buildings, {
    fields: [locations.buildingId],
    references: [buildings.id],
  }),
  events: many(events),
}));

export const buildingsRelationships = relations(buildings, ({ one, many }) => ({
  locations: many(locations),
}));

export const thumbnailsRelationships = relations(
  thumbnails,
  ({ one, many }) => ({
    events: many(events),
  })
);

export * from "@/lib/auth/schema";
