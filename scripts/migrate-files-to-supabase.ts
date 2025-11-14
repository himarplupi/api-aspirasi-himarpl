/**
 * Script untuk migrasi file ilustrasi dari local filesystem ke Supabase Storage
 *
 * Cara menjalankan:
 * npx tsx scripts/migrate-files-to-supabase.ts
 */

import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = "ilustrasi-aspirasi";
const LOCAL_DIR = path.join(process.cwd(), "public/assets/images/ilustrasi_aspirasi");

async function uploadFileToSupabase(filePath: string, filename: string): Promise<boolean> {
  try {
    const fileBuffer = await fs.readFile(filePath);

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(filename, fileBuffer, {
      cacheControl: "3600",
      upsert: true, // Overwrite jika sudah ada
    });

    if (error) {
      console.error(`❌ Error uploading ${filename}:`, error.message);
      return false;
    }

    console.log(`✅ Successfully uploaded: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
    return false;
  }
}

async function migrateFiles() {
  console.log("🚀 Starting migration from local to Supabase Storage...\n");

  try {
    // Cek apakah directory local ada
    try {
      await fs.access(LOCAL_DIR);
    } catch {
      console.log("⚠️  Local directory tidak ditemukan:", LOCAL_DIR);
      console.log("Tidak ada file untuk dimigrasi.\n");
      return;
    }

    // Baca semua file di directory
    const files = await fs.readdir(LOCAL_DIR);
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

    if (imageFiles.length === 0) {
      console.log("⚠️  Tidak ada file gambar ditemukan di directory local.\n");
      return;
    }

    console.log(`📁 Ditemukan ${imageFiles.length} file untuk dimigrasi:\n`);

    let successCount = 0;
    let failCount = 0;

    // Upload setiap file
    for (const filename of imageFiles) {
      const filePath = path.join(LOCAL_DIR, filename);
      const success = await uploadFileToSupabase(filePath, filename);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(50));
    console.log(`Total files: ${imageFiles.length}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log("=".repeat(50) + "\n");

    if (successCount > 0) {
      console.log("🎉 Migration completed!");
      console.log(
        "\n💡 Tips: Anda bisa menghapus file local setelah memastikan semua berfungsi dengan baik."
      );
      console.log(`    Directory: ${LOCAL_DIR}\n`);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Jalankan migrasi
migrateFiles()
  .then(() => {
    console.log("✅ Script selesai dijalankan.\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
