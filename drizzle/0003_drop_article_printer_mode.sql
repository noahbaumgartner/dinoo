UPDATE `articles` SET `printer_id` = NULL WHERE `printer_mode` <> 'custom';--> statement-breakpoint
ALTER TABLE `articles` DROP COLUMN `printer_mode`;