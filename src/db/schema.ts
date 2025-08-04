import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  nama: text("nama").notNull(),
  role: text("role").$type<"admin" | "superadmin">().notNull(),
  password: text("password").notNull(),
});

export const aspirasi = sqliteTable("aspirasi", {
  id_aspirasi: integer("id_aspirasi").primaryKey({ autoIncrement: true }),
  aspirasi: text("aspirasi").notNull(),
  penulis: text("penulis", { length: 100 }),
  kategori: text("kategori", { enum: ["prodi", "hima"] }),
  c_date: text("c_date").notNull(), // SQLite doesn't have datetime, using text with ISO format
});

export const displayAspirasi = sqliteTable("display_aspirasi", {
  id_dispirasi: integer("id_dispirasi").primaryKey({ autoIncrement: true }),
  aspirasi: text("aspirasi").notNull(),
  penulis: text("penulis", { length: 100 }),
  ilustrasi: text("ilustrasi", { length: 100 }),
  kategori: text("kategori", { enum: ["prodi", "hima"] }).notNull(),
  added_by: text("added_by", { length: 100 })
    .notNull()
    .references(() => users.email, {
      onDelete: "set null", // atau "no action" sesuai kebutuhan
    }),
  last_updated: text("last_updated").notNull(), // ISO datetime (karena SQLite tidak punya tipe datetime asli)
  status: text("status", { enum: ["displayed", "hidden"] }).notNull(),
});

// Tipe TypeScript-nya (opsional)
export type DisplayAspirasi = typeof displayAspirasi.$inferSelect;
export type NewDisplayAspirasi = typeof displayAspirasi.$inferInsert;

// Tipe untuk data user
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Tipe untuk data aspirasi
export type Aspirasi = typeof aspirasi.$inferSelect;
export type NewAspirasi = typeof aspirasi.$inferInsert;
