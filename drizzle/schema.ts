import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`).notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: integer("expires_at").notNull(),
	token: text().notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`).notNull(),
	updatedAt: integer("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	uniqueIndex("session_token_unique").on(table.token),
]);

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").default(false).notNull(),
	image: text(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`).notNull(),
},
(table) => [
	uniqueIndex("user_email_unique").on(table.email),
]);

export const clubs = sqliteTable("clubs", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text().notNull(),
	owner: text().notNull(),
	slug: text().default("id").notNull(),
});

export const buildings = sqliteTable("buildings", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	code: text().notNull(),
	createdAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const eventTypes = sqliteTable("event_types", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	description: text().notNull(),
	color: text().notNull(),
	requiredPoints: integer().default(0).notNull(),
	clubId: text().notNull().references(() => clubs.id, { onDelete: "cascade" } ),
	createdAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const locations = sqliteTable("locations", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	roomNumber: text().notNull(),
	buildingId: integer().notNull().references(() => buildings.id, { onDelete: "cascade" } ),
	createdAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const thumbnails = sqliteTable("thumbnails", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	url: text().notNull(),
	createdAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer("expires_at").notNull(),
	createdAt: integer("created_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(cast((julianday('now') - 2440587.5)*86400000 as integer))`).notNull(),
});

export const membership = sqliteTable("membership", {
	userId: text().notNull().references(() => user.id, { onDelete: "cascade" } ),
	clubId: text().notNull().references(() => clubs.id, { onDelete: "cascade" } ),
	role: text().default("member").notNull(),
},
(table) => [
	primaryKey({ columns: [table.userId, table.clubId], name: "membership_userId_clubId_pk"})
]);

export const events = sqliteTable("events", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	clubId: text().notNull().references(() => clubs.id, { onDelete: "cascade" } ),
	title: text().notNull(),
	description: text().notNull(),
	start: integer().notNull(),
	end: integer().notNull(),
	checkinStart: integer().notNull(),
	checkinEnd: integer().notNull(),
	createdBy: text().references(() => user.id, { onDelete: "set null" } ),
	updatedBy: text().references(() => user.id, { onDelete: "set null" } ),
	thumbnailId: integer().default(sql`(NULL)`).references(() => thumbnails.id, { onDelete: "set null" } ),
	locationId: integer().default(sql`(NULL)`).references(() => locations.id, { onDelete: "set default" } ),
	eventTypeId: integer().notNull().references(() => eventTypes.id, { onDelete: "set default" } ),
	points: integer().default(0).notNull(),
	hidden: integer().default(false).notNull(),
	createdAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: integer().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

