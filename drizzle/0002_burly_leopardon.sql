CREATE TABLE `display_aspirasi` (
	`id_dispirasi` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`aspirasi` text NOT NULL,
	`penulis` text(100),
	`kategori` text NOT NULL,
	`added_by` text(100) NOT NULL,
	`last_updated` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`email`) ON UPDATE no action ON DELETE set null
);
