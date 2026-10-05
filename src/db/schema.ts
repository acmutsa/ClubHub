import {
  sqliteTable,
  text,
  primaryKey,
  integer,
  index,
  foreignKey,
  check,
  unique,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "@/db/auth-schema";
import { sql, relations } from "drizzle-orm";


const uuid = (name: string) => text(name).$defaultFn(() => crypto.randomUUID());

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => new Date()),
};

const softDelete = {
  deletedAt: integer("deleted_at", { mode: "timestamp" }).default(sql`NULL`),
};

// Tables

// files 
export const files = sqliteTable("files", {
  id: uuid("id").primaryKey(),
  uploadedById: text("uploaded_by_id").references(() => user.id, { onDelete: "set null" }),
  storageKey: text("storage_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// user (globalRoles lives in auth-schema.ts next to user, which references it)
export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number", { length: 10 }).notNull(),
  pronouns: text("pronouns").notNull(),
  birthDate: integer("birth_date", { mode: "timestamp" }).notNull(),
  school: text("school").notNull(),
  expectedGraduationDate: integer("expected_graduation_date", { mode: "timestamp" }).notNull(),
  major: text("major").notNull(),
  resumeFileId: text("resume_file_id").references(() => files.id, { onDelete: "set null" }),
  // 2-letter code from countries in constants.ts, e.g. "US"
  country: text("country", { length: 2 }).notNull(),
  race: text("race", { mode: "json" }).$type<string[]>().notNull(),
  gender: text("gender").notNull(),
  ethnicity: text("ethnicity").notNull(),
  shirtSize: text("shirt_size",  { length: 3 }).notNull(),
  eventAnnouncementEmail: integer("event_announcement_email", { mode: "boolean" }).notNull().default(false),
  eventAnnouncementPhone: integer("event_announcement_phone", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
  ...softDelete,
});

// club
export const clubs = sqliteTable("clubs", {
  id: uuid("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  mission: text("mission"),
  category: text("category").notNull().default("Other"),
  color: text("color").default("#646466"),
  logoFileId: text("logo_file_id").references(() => files.id, { onDelete: "set null" }),
  bannerFileId: text("banner_file_id").references(() => files.id, { onDelete: "set null" }),
  createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
  ...timestamps,
  ...softDelete,
  },

  (table) => [
    index("clubs_category_idx").on(table.category),
  ],
);

export const clubSocialLinks = sqliteTable( "club_social_links", {
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    platform: text("platform",  { length: 20 }).notNull(),
    url: text("url").notNull(),
  },

  (table) => [
    index("club_social_links_idx").on(table.clubId),
    unique("check_club_social_links_url_unique").on(table.clubId, table.url)
  ],
);

export const clubSponsors = sqliteTable("club_sponsors", {
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    logoFileId: text("logo_file_id").references(() => files.id, { onDelete: "set null" }),
    websiteUrl: text("website_url"),
    ...timestamps,
    ...softDelete,
  },

  (table) => [index("club_sponsors_idx").on(table.clubId)],
);

export const clubRoles = sqliteTable( "club_roles", {
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    permissions: text("permissions", { mode: "json" }).$type<string[]>().notNull(),
    color: text("color").notNull().default("#71717a"),
    // MEMBER and ADMIN: cannot be deleted or renamed
    isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
    ...timestamps,
  },

  (table) => [
    unique("check_club_roles_unique").on(table.clubId, table.name),
    // role can only be used in its own club
    unique("check_club_roles_club_id_unique").on(table.clubId, table.id),
  ],
);

export const clubMemberships = sqliteTable( "club_memberships", {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    roleId: text("role_id").notNull(),
    title: text("title").notNull().default("Member"),
    applicationStatus: text("application_status", { length: 10, enum: ["pending", "approved", "suspended"] }).notNull().default("approved"),
    status: text("status", { length: 10, enum: ["active", "inactive"] }).notNull().default("active"),
    inactiveAt: integer("inactive_at", { mode: "timestamp" }),
    ...timestamps,
    ...softDelete,
  },

  (table) => [
    primaryKey({ columns: [table.userId, table.clubId] }),
    index("club_member_idx").on(table.clubId, table.userId),
    // the role must belong to the same club.
    foreignKey({
      columns: [table.clubId, table.roleId],
      foreignColumns: [clubRoles.clubId, clubRoles.id],
    }).onDelete("no action"),
    // inactive_at is set only while the membership is inactive
    check("club_memberships_inactive_at", sql`(${table.status} = 'active' AND ${table.inactiveAt} IS NULL) OR (${table.status} = 'inactive' AND ${table.inactiveAt} IS NOT NULL)`),
  ],
);

export const subOrgs = sqliteTable( "sub_orgs", {
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    logoFileId: text("logo_file_id").references(() => files.id, { onDelete: "set null" }),
    ...timestamps,
    ...softDelete,
  },

  (table) => [
    index("sub_orgs_club_idx").on(table.clubId),
    uniqueIndex("check_sub_orgs_unique").on(table.clubId, table.name).where(sql`${table.deletedAt} IS NULL`),
    // sub-org can only be used in its own club
    unique("check_sub_orgs_club_id_unique").on(table.clubId, table.id),
  ],
);

export const eventCategories = sqliteTable( "event_categories", {
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    color: text("color").notNull().default("#71717a"),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex("check_event_categories_unique").on(table.clubId, table.name).where(sql`${table.deletedAt} IS NULL`),
    unique("check_event_categories_club_id_unique").on(table.clubId, table.id),
  ],
);

export const locations = sqliteTable("locations", {
  id: uuid("id").primaryKey(),
  building: text("building",  { length: 100 }).notNull(),
  code: text("code",  { length: 5 }).notNull(),
  roomNumber: text("room_number").notNull(),
  roomName: text("room_name"),
});

export const addresses = sqliteTable("addresses", {
  id: uuid("id").primaryKey(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state", { length: 2 }),
  postalCode: text("postal_code"),
  country: text("country", { length: 2 }),
});

export const events = sqliteTable( "events", {
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    categoryId: text("category_id").notNull().references(() => eventCategories.id, { onDelete: "cascade" }),
    subOrgId: text("sub_org_id").default(sql`NULL`),
    locationId: text("location_id").references(() => locations.id, { onDelete: "set null" }),
    addressId: text("address_id").references(() => addresses.id, { onDelete: "set null" }),
    thumbnailFileId: text("thumbnail_file_id").references(() => files.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp" }).notNull(),
    checkinStartsAt: integer("checkin_starts_at", { mode: "timestamp" }).notNull(),
    checkinEndsAt: integer("checkin_ends_at", { mode: "timestamp" }).notNull(),
    points: integer("points").notNull().default(0),
    createdById: text("created_by_id").references(() => user.id, { onDelete: "set null" }),
    updatedById: text("updated_by_id").references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
    ...softDelete,
  },
  
  (table) => [
    index("events_club_starts_at_idx").on(table.clubId, table.startsAt),
    index("events_club_category_idx").on(table.clubId, table.categoryId),
    check("events_points_non_negative", sql`${table.points} >= 0`),
    check("events_ends_after_starts", sql`${table.endsAt} > ${table.startsAt}`),
    check("events_checkin_ends_after_starts", sql`${table.checkinEndsAt} > ${table.checkinStartsAt}`),
    unique("check_events_club_id_unique").on(table.clubId, table.id),
    // the category must belong to the same club
    foreignKey({
      columns: [table.clubId, table.categoryId],
      foreignColumns: [eventCategories.clubId, eventCategories.id],
    }).onDelete("cascade"),
    // the sub-org must belong to the same club
    foreignKey({
      columns: [table.clubId, table.subOrgId],
      foreignColumns: [subOrgs.clubId, subOrgs.id],
    }).onDelete("cascade"),


  ],
);

export const checkIns = sqliteTable( "check_ins",{
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    checkedInById: text("checked_in_by_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    unique("check_in_event_user_unique").on(table.eventId, table.userId),
    // the event must belong to the check-in's club
    foreignKey({
      columns: [table.clubId, table.eventId],
      foreignColumns: [events.clubId, events.id],
    }).onDelete("cascade"),
  ],
);

export const semesters = sqliteTable(
  "semesters",
  {
    id: uuid("id").primaryKey(),
    clubId: text("club_id").notNull().references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startDate: integer("start_date", { mode: "timestamp" }).notNull(),
    endDate: integer("end_date", { mode: "timestamp" }).notNull(),
    ...timestamps,
  },
  
  (table) => [
    index("semesters_club_idx").on(table.clubId),
    check("semesters_ends_after_starts", sql`${table.endDate} > ${table.startDate}`),
    unique("check_semesters_unique").on(table.clubId, table.name),
  ],
);

// other 

export const notificationLogs = sqliteTable( "notification_logs", {
    id: uuid("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["queued", "sent", "failed", "skipped"] }).notNull().default("queued"),
    error: text("error"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
    sentAt: integer("sent_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("notification_logs_event_idx").on(table.eventId),
    // Only one waiting attempt per user and event; finished attempts (sent/failed/skipped) stay as history
    uniqueIndex("notification_logs_one_queued_unique")
      .on(table.eventId, table.userId)
      .where(sql`${table.status} = 'queued'`),
  ],
);



// Relationships for tables

export const userRelationships = relations(user, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [user.id], references: [userProfiles.userId]}),

  memberships: many(clubMemberships),
  uploadedFiles: many(files),
  createdClubs: many(clubs),
  checkIns: many(checkIns, { relationName: "checkInUser" }),
  recordedCheckIns: many(checkIns, { relationName: "checkInStaff" }),
  createdEvents: many(events, { relationName: "eventCreator" }),
  updatedEvents: many(events, { relationName: "eventUpdater" }),
  notificationLogs: many(notificationLogs),
}));

export const filesRelationships = relations(files, ({ one }) => ({
  uploadedBy: one(user, { fields: [files.uploadedById], references: [user.id] }),
}));

export const userProfilesRelationships = relations(userProfiles, ({ one }) => ({
  user: one(user, { fields: [userProfiles.userId], references: [user.id] }),
  resume: one(files, { fields: [userProfiles.resumeFileId], references: [files.id] }),
}));

export const clubsRelationships = relations(clubs, ({ one, many }) => ({
  createdBy: one(user, { fields: [clubs.createdById],  references: [user.id] }),
  logo: one(files, { fields: [clubs.logoFileId], references: [files.id], relationName: "clubLogo" }),
  banner: one(files, { fields: [clubs.bannerFileId], references: [files.id], relationName: "clubBanner" }),

  socialLinks: many(clubSocialLinks),
  sponsors: many(clubSponsors),
  roles: many(clubRoles),
  memberships: many(clubMemberships),
  subOrgs: many(subOrgs),
  eventCategories: many(eventCategories),
  events: many(events),
  semesters: many(semesters),
  checkIns: many(checkIns),
}));

export const clubSocialLinksRelationships = relations(clubSocialLinks, ({ one }) => ({
  club: one(clubs, {fields: [clubSocialLinks.clubId], references: [clubs.id] }),
}));

export const clubSponsorsRelationships = relations(clubSponsors, ({ one }) => ({
  club: one(clubs, { fields: [clubSponsors.clubId], references: [clubs.id] }),
  logo: one(files, { fields: [clubSponsors.logoFileId], references: [files.id] }),
}));

export const clubRolesRelationships = relations(clubRoles, ({ one, many }) => ({
  club: one(clubs, { fields: [clubRoles.clubId], references: [clubs.id] }),

  memberships: many(clubMemberships),
}));

export const clubMembershipsRelationships = relations(clubMemberships, ({ one }) => ({
  user: one(user, { fields: [clubMemberships.userId], references: [user.id] }),
  club: one(clubs, { fields: [clubMemberships.clubId], references: [clubs.id] }),
  role: one(clubRoles, { fields: [clubMemberships.roleId], references: [clubRoles.id] }),
}));

export const subOrgsRelationships = relations(subOrgs, ({ one, many }) => ({
  club: one(clubs, { fields: [subOrgs.clubId], references: [clubs.id] }),
  logo: one(files, { fields: [subOrgs.logoFileId], references: [files.id] }),
  events: many(events),
}));

export const eventCategoriesRelationships = relations(eventCategories, ({ one, many }) => ({
  club: one(clubs, { fields: [eventCategories.clubId], references: [clubs.id] }),
  events: many(events),
}));

export const locationsRelationships = relations(locations, ({ many }) => ({
  events: many(events),
}));

export const addressesRelationships = relations(addresses, ({ many }) => ({
  events: many(events),
}));

export const eventsRelationships = relations(events, ({ one, many }) => ({
  club: one(clubs, { fields: [events.clubId], references: [clubs.id] }),
  category: one(eventCategories, { fields: [events.categoryId], references: [eventCategories.id] }),
  subOrg: one(subOrgs, { fields: [events.subOrgId], references: [subOrgs.id] }),
  location: one(locations, { fields: [events.locationId], references: [locations.id] }),
  address: one(addresses, { fields: [events.addressId], references: [addresses.id] }),
  thumbnail: one(files, { fields: [events.thumbnailFileId], references: [files.id] }),
  creator: one(user, { fields: [events.createdById], references: [user.id], relationName: "eventCreator" }),
  updater: one(user, { fields: [events.updatedById], references: [user.id], relationName: "eventUpdater" }),

  checkIns: many(checkIns),
  notificationLogs: many(notificationLogs),
}));

export const checkInsRelationships = relations(checkIns, ({ one }) => ({
  club: one(clubs, { fields: [checkIns.clubId], references: [clubs.id] }),
  event: one(events, { fields: [checkIns.eventId], references: [events.id] }),
  user: one(user, { fields: [checkIns.userId], references: [user.id], relationName: "checkInUser" }),
  checkedInBy: one(user, { fields: [checkIns.checkedInById], references: [user.id], relationName: "checkInStaff" }),
}));

export const semestersRelationships = relations(semesters, ({ one }) => ({
  club: one(clubs, { fields: [semesters.clubId], references: [clubs.id] }),
}));

export const notificationLogsRelationships = relations(notificationLogs, ({ one }) => ({
  user: one(user, { fields: [notificationLogs.userId], references: [user.id] }),
  event: one(events, { fields: [notificationLogs.eventId], references: [events.id] }),
}));

export * from "@/db/auth-schema";
