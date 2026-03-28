import { relations } from "drizzle-orm/relations";
import { user, account, session, clubs, eventTypes, buildings, locations, membership, events, thumbnails } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	memberships: many(membership),
	events_updatedBy: many(events, {
		relationName: "events_updatedBy_user_id"
	}),
	events_createdBy: many(events, {
		relationName: "events_createdBy_user_id"
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const eventTypesRelations = relations(eventTypes, ({one, many}) => ({
	club: one(clubs, {
		fields: [eventTypes.clubId],
		references: [clubs.id]
	}),
	events: many(events),
}));

export const clubsRelations = relations(clubs, ({many}) => ({
	eventTypes: many(eventTypes),
	memberships: many(membership),
	events: many(events),
}));

export const locationsRelations = relations(locations, ({one, many}) => ({
	building: one(buildings, {
		fields: [locations.buildingId],
		references: [buildings.id]
	}),
	events: many(events),
}));

export const buildingsRelations = relations(buildings, ({many}) => ({
	locations: many(locations),
}));

export const membershipRelations = relations(membership, ({one}) => ({
	club: one(clubs, {
		fields: [membership.clubId],
		references: [clubs.id]
	}),
	user: one(user, {
		fields: [membership.userId],
		references: [user.id]
	}),
}));

export const eventsRelations = relations(events, ({one}) => ({
	eventType: one(eventTypes, {
		fields: [events.eventTypeId],
		references: [eventTypes.id]
	}),
	location: one(locations, {
		fields: [events.locationId],
		references: [locations.id]
	}),
	thumbnail: one(thumbnails, {
		fields: [events.thumbnailId],
		references: [thumbnails.id]
	}),
	user_updatedBy: one(user, {
		fields: [events.updatedBy],
		references: [user.id],
		relationName: "events_updatedBy_user_id"
	}),
	user_createdBy: one(user, {
		fields: [events.createdBy],
		references: [user.id],
		relationName: "events_createdBy_user_id"
	}),
	club: one(clubs, {
		fields: [events.clubId],
		references: [clubs.id]
	}),
}));

export const thumbnailsRelations = relations(thumbnails, ({many}) => ({
	events: many(events),
}));