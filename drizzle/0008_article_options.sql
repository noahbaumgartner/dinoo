ALTER TABLE `articles` ADD `description` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `min_age` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `articles` ADD `options` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `options` text DEFAULT '[]' NOT NULL;