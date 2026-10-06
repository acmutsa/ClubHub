DROP TABLE IF EXISTS `memberships`;--> statement-breakpoint
DROP TABLE IF EXISTS `events`;--> statement-breakpoint
DROP TABLE IF EXISTS `event_types`;--> statement-breakpoint
DROP TABLE IF EXISTS `locations`;--> statement-breakpoint
DROP TABLE IF EXISTS `buildings`;--> statement-breakpoint
DROP TABLE IF EXISTS `thumbnails`;--> statement-breakpoint
DROP TABLE IF EXISTS `clubs`;--> statement-breakpoint
DROP TABLE IF EXISTS `session`;--> statement-breakpoint
DROP TABLE IF EXISTS `account`;--> statement-breakpoint
DROP TABLE IF EXISTS `verification`;--> statement-breakpoint
DROP TABLE IF EXISTS `user`;--> statement-breakpoint
DROP TABLE IF EXISTS `checkins`;--> statement-breakpoint

CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`street` text NOT NULL,
	`city` text NOT NULL,
	`state` text(2),
	`postal_code` text,
	`country` text(2)
);
--> statement-breakpoint
CREATE TABLE `check_ins` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`checked_in_by_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`checked_in_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`club_id`,`event_id`) REFERENCES `events`(`club_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `check_in_event_user_unique` ON `check_ins` (`event_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `club_memberships` (
	`user_id` text NOT NULL,
	`club_id` text NOT NULL,
	`role_id` text NOT NULL,
	`title_id` text NOT NULL,
	`application_status` text(10) DEFAULT 'approved' NOT NULL,
	`status` text(10) DEFAULT 'active' NOT NULL,
	`inactive_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	PRIMARY KEY(`user_id`, `club_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`club_id`,`role_id`) REFERENCES `club_roles`(`club_id`,`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`club_id`,`title_id`) REFERENCES `club_titles`(`club_id`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "club_memberships_inactive_at" CHECK(("club_memberships"."status" = 'active' AND "club_memberships"."inactive_at" IS NULL) OR ("club_memberships"."status" = 'inactive' AND "club_memberships"."inactive_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `club_member_idx` ON `club_memberships` (`club_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `club_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`permissions` text NOT NULL,
	`color` text DEFAULT '#71717a' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "club_roles_position" CHECK("club_roles"."position" >= 0)
);
--> statement-breakpoint
CREATE INDEX `club_roles_position_idx` ON `club_roles` (`club_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `check_club_roles_unique` ON `club_roles` (`club_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `check_club_roles_club_id_unique` ON `club_roles` (`club_id`,`id`);--> statement-breakpoint
CREATE TABLE `club_social_links` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`platform` text(20) NOT NULL,
	`url` text NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `club_social_links_idx` ON `club_social_links` (`club_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `check_club_social_links_url_unique` ON `club_social_links` (`club_id`,`url`);--> statement-breakpoint
CREATE TABLE `club_sponsors` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`name` text NOT NULL,
	`logo_file_id` text,
	`website_url` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`logo_file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `club_sponsors_idx` ON `club_sponsors` (`club_id`);--> statement-breakpoint
CREATE TABLE `club_titles` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `check_club_titles_unique` ON `club_titles` (`club_id`,`name`);--> statement-breakpoint
CREATE TABLE `clubs` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`mission` text,
	`category` text DEFAULT 'Other' NOT NULL,
	`color` text DEFAULT '#646466',
	`logo_file_id` text,
	`banner_file_id` text,
	`created_by_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	FOREIGN KEY (`logo_file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`banner_file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clubs_slug_unique` ON `clubs` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `clubs_name_unique` ON `clubs` (`name`);--> statement-breakpoint
CREATE INDEX `clubs_category_idx` ON `clubs` (`category`);--> statement-breakpoint
CREATE TABLE `event_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`color` text DEFAULT '#71717a' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `check_event_categories_unique` ON `event_categories` (`club_id`,`name`) WHERE "event_categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `check_event_categories_club_id_unique` ON `event_categories` (`club_id`,`id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`category_id` text NOT NULL,
	`sub_org_id` text DEFAULT NULL,
	`location_id` text,
	`address_id` text,
	`thumbnail_file_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`checkin_starts_at` integer NOT NULL,
	`checkin_ends_at` integer NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	`created_by_id` text,
	`updated_by_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `event_categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`thumbnail_file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`updated_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`club_id`,`category_id`) REFERENCES `event_categories`(`club_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`club_id`,`sub_org_id`) REFERENCES `sub_orgs`(`club_id`,`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "events_points_non_negative" CHECK("events"."points" >= 0),
	CONSTRAINT "events_ends_after_starts" CHECK("events"."ends_at" > "events"."starts_at"),
	CONSTRAINT "events_checkin_ends_after_starts" CHECK("events"."checkin_ends_at" > "events"."checkin_starts_at")
);
--> statement-breakpoint
CREATE INDEX `events_club_starts_at_idx` ON `events` (`club_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `events_club_category_idx` ON `events` (`club_id`,`category_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `check_events_club_id_unique` ON `events` (`club_id`,`id`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`uploaded_by_id` text,
	`storage_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`uploaded_by_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `files_storage_key_unique` ON `files` (`storage_key`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`building` text(100) NOT NULL,
	`code` text(5) NOT NULL,
	`room_number` text NOT NULL,
	`room_name` text
);
--> statement-breakpoint
CREATE TABLE `notification_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event_id` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`error` text,
	`scheduled_at` integer NOT NULL,
	`sent_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notification_logs_event_idx` ON `notification_logs` (`event_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_logs_one_queued_unique` ON `notification_logs` (`event_id`,`user_id`) WHERE "notification_logs"."status" = 'queued';--> statement-breakpoint
CREATE TABLE `semesters` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`name` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "semesters_ends_after_starts" CHECK("semesters"."end_date" > "semesters"."start_date")
);
--> statement-breakpoint
CREATE INDEX `semesters_club_idx` ON `semesters` (`club_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `check_semesters_unique` ON `semesters` (`club_id`,`name`);--> statement-breakpoint
CREATE TABLE `sub_orgs` (
	`id` text PRIMARY KEY NOT NULL,
	`club_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`logo_file_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`logo_file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `sub_orgs_club_idx` ON `sub_orgs` (`club_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `check_sub_orgs_unique` ON `sub_orgs` (`club_id`,`name`) WHERE "sub_orgs"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `check_sub_orgs_club_id_unique` ON `sub_orgs` (`club_id`,`id`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone_number` text(10) NOT NULL,
	`pronouns` text NOT NULL,
	`birth_date` integer NOT NULL,
	`school` text NOT NULL,
	`expected_graduation_date` integer NOT NULL,
	`major` text NOT NULL,
	`resume_file_id` text,
	`country` text(2) NOT NULL,
	`race` text NOT NULL,
	`gender` text NOT NULL,
	`ethnicity` text NOT NULL,
	`shirt_size` text(3) NOT NULL,
	`event_announcement_email` integer DEFAULT false NOT NULL,
	`event_announcement_phone` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer DEFAULT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`resume_file_id`) REFERENCES `files`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `global_roles` (
	`role` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'USER' NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`role`) REFERENCES `global_roles`(`role`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
INSERT INTO `global_roles` (`role`) VALUES ('USER'), ('ADMIN');