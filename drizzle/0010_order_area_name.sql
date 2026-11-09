ALTER TABLE `orders` ADD `area_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE `orders` SET `area_name` = COALESCE((SELECT `areas`.`name` FROM `tables` JOIN `areas` ON `areas`.`id` = `tables`.`area_id` WHERE `tables`.`id` = `orders`.`table_id`), '');
