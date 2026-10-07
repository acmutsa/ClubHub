CREATE TABLE `event_passes` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`user_id` text NOT NULL,
	`club_id` text NOT NULL,
	`event_id` text NOT NULL,
	`check_in_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`used_at` integer,
	`expiry_date` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`check_in_id`) REFERENCES `check_ins`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`club_id`,`event_id`) REFERENCES `events`(`club_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_passes_token_unique` ON `event_passes` (`token`);--> statement-breakpoint
CREATE INDEX `event_passes_club_idx` ON `event_passes` (`club_id`);--> statement-breakpoint
CREATE INDEX `event_passes_event_idx` ON `event_passes` (`event_id`);--> statement-breakpoint
CREATE INDEX `event_passes_user_idx` ON `event_passes` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `check_event_passes_user_event_unique` ON `event_passes` (`user_id`,`event_id`);