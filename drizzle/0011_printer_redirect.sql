ALTER TABLE `printers` ADD `redirect_to_printer_id` integer REFERENCES printers(id);--> statement-breakpoint
ALTER TABLE `printers` ADD `redirected_at` integer;