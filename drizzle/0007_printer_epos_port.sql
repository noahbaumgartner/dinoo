PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_printers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`host` text NOT NULL,
	`port` integer DEFAULT 443 NOT NULL,
	`model` text DEFAULT 'TM-T20IV' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`last_success_at` integer,
	`last_error_at` integer,
	`last_error` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_printers`("id", "name", "host", "port", "model", "active", "last_success_at", "last_error_at", "last_error", "created_at", "updated_at") SELECT "id", "name", "host", "port", "model", "active", "last_success_at", "last_error_at", "last_error", "created_at", "updated_at" FROM `printers`;--> statement-breakpoint
DROP TABLE `printers`;--> statement-breakpoint
ALTER TABLE `__new_printers` RENAME TO `printers`;--> statement-breakpoint
UPDATE `printers` SET `port` = 443 WHERE `port` = 9100;--> statement-breakpoint
PRAGMA foreign_keys=ON;