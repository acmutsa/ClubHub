ALTER TABLE `clubs` ADD `owner` text NOT NULL;--> statement-breakpoint
ALTER TABLE `clubs` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `clubs_slug_unique` ON `clubs` (`slug`);