ALTER TABLE `order_items` ADD `note` text;--> statement-breakpoint
-- Keep existing order notes: they move to the first item of their order.
UPDATE `order_items` SET `note` = (SELECT `note` FROM `orders` WHERE `orders`.`id` = `order_items`.`order_id`)
WHERE `id` IN (SELECT min(`id`) FROM `order_items` GROUP BY `order_id`);--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `note`;
