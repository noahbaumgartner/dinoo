CREATE TABLE `areas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`numbering` text DEFAULT 'letter' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `areas` (`id`, `name`, `numbering`, `sort_order`)
SELECT 1, 'Saal', CASE WHEN (SELECT `value` FROM `settings` WHERE `key` = 'tableNumbering') = 'number' THEN 'number' ELSE 'letter' END, 1;--> statement-breakpoint
DELETE FROM `settings` WHERE `key` = 'tableNumbering';--> statement-breakpoint
PRAGMA defer_foreign_keys = ON;--> statement-breakpoint
CREATE TABLE `__old_tables` AS SELECT * FROM `tables`;--> statement-breakpoint
DROP TABLE `tables`;--> statement-breakpoint
CREATE TABLE `tables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`area_id` integer NOT NULL,
	`label` text NOT NULL,
	`grid_row` integer,
	`grid_column` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `tables` (`id`, `area_id`, `label`, `grid_row`, `grid_column`, `sort_order`, `active`, `created_at`, `updated_at`)
SELECT `id`, 1, `label`, `grid_row`, `grid_column`, `sort_order`, `active`, `created_at`, `updated_at` FROM `__old_tables`;--> statement-breakpoint
DROP TABLE `__old_tables`;--> statement-breakpoint
CREATE UNIQUE INDEX `tables_grid_cell_idx` ON `tables` (`area_id`,`grid_row`,`grid_column`);
