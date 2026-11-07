CREATE TABLE `payment_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payment_id` integer NOT NULL,
	`order_item_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `payment_items_payment_idx` ON `payment_items` (`payment_id`);--> statement-breakpoint
CREATE INDEX `payment_items_order_item_idx` ON `payment_items` (`order_item_id`);