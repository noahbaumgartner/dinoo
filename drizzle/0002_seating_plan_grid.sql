ALTER TABLE `tables` ADD `grid_row` integer;--> statement-breakpoint
ALTER TABLE `tables` ADD `grid_column` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `tables_grid_cell_idx` ON `tables` (`grid_row`,`grid_column`);