ALTER TABLE `categories` ADD `color` text DEFAULT 'blue' NOT NULL;--> statement-breakpoint
-- Spread existing categories over the palette instead of making them all blue.
UPDATE `categories` SET `color` = CASE `id` % 10
	WHEN 1 THEN 'blue' WHEN 2 THEN 'orange' WHEN 3 THEN 'green' WHEN 4 THEN 'red' WHEN 5 THEN 'violet'
	WHEN 6 THEN 'sky' WHEN 7 THEN 'yellow' WHEN 8 THEN 'pink' WHEN 9 THEN 'teal' ELSE 'gray' END;
