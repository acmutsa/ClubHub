PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_membership` (
	`userId` text NOT NULL,
	`clubId` integer NOT NULL,
	PRIMARY KEY(`userId`, `clubId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`clubId`) REFERENCES `clubs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_membership`("userId", "clubId") SELECT "userId", "clubId" FROM `membership`;--> statement-breakpoint
DROP TABLE `membership`;--> statement-breakpoint
ALTER TABLE `__new_membership` RENAME TO `membership`;--> statement-breakpoint
PRAGMA foreign_keys=ON;