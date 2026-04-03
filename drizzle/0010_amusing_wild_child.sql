ALTER TABLE `event_types` RENAME COLUMN "clubId" TO "slug";--> statement-breakpoint
ALTER TABLE `events` RENAME COLUMN "clubId" TO "slug";--> statement-breakpoint
CREATE TABLE `checkins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`eventId` integer NOT NULL,
	`membershipId` integer NOT NULL,
	`createdAt` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`rating` integer DEFAULT NULL,
	`feedback` text DEFAULT NULL,
	`method` text DEFAULT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`membershipId`) REFERENCES `membership`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkins_event_membership_unique` ON `checkins` (`eventId`,`membershipId`);--> statement-breakpoint
CREATE INDEX `checkins_event_idx` ON `checkins` (`eventId`);--> statement-breakpoint
CREATE INDEX `checkins_membership_idx` ON `checkins` (`membershipId`);--> statement-breakpoint
ALTER TABLE `event_types` ALTER COLUMN "slug" TO "slug" text NOT NULL REFERENCES clubs(slug) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ALTER COLUMN "slug" TO "slug" text NOT NULL REFERENCES clubs(id) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_membership` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`slug` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`slug`) REFERENCES `clubs`(`slug`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_membership`("id", "userId", "slug", "role") SELECT "id", "userId", "slug", "role" FROM `membership`;--> statement-breakpoint
DROP TABLE `membership`;--> statement-breakpoint
ALTER TABLE `__new_membership` RENAME TO `membership`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `membership_user_club_unique` ON `membership` (`userId`,`slug`);--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'user' NOT NULL;