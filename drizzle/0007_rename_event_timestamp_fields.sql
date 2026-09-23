ALTER TABLE `events` RENAME COLUMN `start` TO `startAt`;--> statement-breakpoint
ALTER TABLE `events` RENAME COLUMN `end` TO `endAt`;--> statement-breakpoint
ALTER TABLE `events` RENAME COLUMN `checkinStart` TO `checkInStartAt`;--> statement-breakpoint
ALTER TABLE `events` RENAME COLUMN `checkinEnd` TO `checkInEndAt`;--> statement-breakpoint
ALTER TABLE `membership` RENAME TO `memberships`;--> statement-breakpoint
UPDATE `memberships`
SET `role` = CASE `role`
  WHEN 'member' THEN 'MEMBER'
  WHEN 'admin' THEN 'ADMIN'
  WHEN 'super_admin' THEN 'SUPER_ADMIN'
  ELSE `role`
END;
