import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from ".";

// Jalankan migrasi
async function main() {
  // console.log("DATABASE_URL yang digunakans:", process.env.DATABASE_URL);
  // console.log("TURSO_AUTH_TOKEN yang digunakan:", process.env.TURSO_AUTH_TOKEN);

  console.log("Menjalankan migrasi...");
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migrasi selesai!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migrasi gagal:", err);
  process.exit(1);
});
