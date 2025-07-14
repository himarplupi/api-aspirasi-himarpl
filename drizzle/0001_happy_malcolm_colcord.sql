CREATE TABLE `aspirasi` (
	`id_aspirasi` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`aspirasi` text NOT NULL,
	`penulis` text(100),
	`c_date` text NOT NULL
);
--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `users` ALTER COLUMN "role" TO "role" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);