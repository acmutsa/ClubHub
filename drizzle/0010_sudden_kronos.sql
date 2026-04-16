ALTER TABLE `event_types` RENAME COLUMN "slug" TO "clubId";--> statement-breakpoint
ALTER TABLE `events` RENAME COLUMN "slug" TO "clubId";--> statement-breakpoint
ALTER TABLE `membership` RENAME COLUMN "slug" TO "clubId";--> statement-breakpoint
ALTER TABLE `event_types` ALTER COLUMN "clubId" TO "clubId" text NOT NULL REFERENCES clubs(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ALTER COLUMN "clubId" TO "clubId" text NOT NULL REFERENCES clubs(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP INDEX `membership_user_club_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `membership_user_club_unique` ON `membership` (`userId`,`clubId`);--> statement-breakpoint
ALTER TABLE `membership` ALTER COLUMN "clubId" TO "clubId" text NOT NULL REFERENCES clubs(id) ON DELETE cascade ON UPDATE no action;