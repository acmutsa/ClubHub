import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth.schema";
import { membershipRoles } from "@/lib/types/membership";
import { sql, relations } from "drizzle-orm";
import { id } from "date-fns/locale";


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
    owner: text().notNull(),
    slug: text().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("clubs_slug_unique").on(table.slug),
  }),
);

export const membership = sqliteTable(
  "membership",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clubId: text()
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    role: text({ enum: membershipRoles }).notNull().default("member"),
  },
  (table) => ({
    userClubUnique: uniqueIndex("membership_user_club_unique").on(
      table.userId,
      table.clubId
    ),
  })
);

export const events = sqliteTable("events", {
  id: integer().primaryKey({ autoIncrement: true }),
  clubId: text()
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  title: text().notNull(),
  description: text().notNull(),
  start: integer({ mode: "timestamp" }).notNull(),
  end: integer({ mode: "timestamp" }).notNull(),
  checkinStart: integer({ mode: "timestamp" }).notNull(),
  checkinEnd: integer({ mode: "timestamp" }).notNull(),
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

export const checkins = sqliteTable(
  "checkins",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    eventId: integer()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    membershipId: integer()
      .notNull()
      .references(() => membership.id, { onDelete: "cascade" }),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    rating: integer().default(sql`NULL`),
    feedback: text().default(sql`NULL`),
    method: text().default(sql`NULL`),
  },
  (table) => [
    uniqueIndex("checkins_event_membership_unique").on(
      table.eventId,
      table.membershipId
    ),
    index("checkins_event_idx").on(table.eventId),
    index("checkins_membership_idx").on(table.membershipId),
  ]
);

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
  membership: many(membership),
  eventTypes: many(eventTypes),
}));

export const membershipRelationships = relations(
  membership,
  ({ one, many }) => ({
    club: one(clubs, {
      fields: [membership.clubId],
      references: [clubs.id],
    }),
    user: one(user, {
      fields: [membership.userId],
      references: [user.id],
    }),
    checkins: many(checkins),
  })
);

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
  checkins: many(checkins),
}));

export const checkinsRelationships = relations(checkins, ({ one }) => ({
  event: one(events, {
    fields: [checkins.eventId],
    references: [events.id],
  }),
  membership: one(membership, {
    fields: [checkins.membershipId],
    references: [membership.id],
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
  }),
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
  }),
);

export * from "./auth.schema";