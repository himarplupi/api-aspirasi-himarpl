import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase client dengan SERVICE ROLE KEY untuk bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Nama bucket untuk ilustrasi aspirasi
const BUCKET_NAME = "ilust_aspirasi";

/**
 * Upload file ilustrasi ke Supabase Storage
 * @param file - File yang akan diupload
 * @returns Nama file yang tersimpan atau null jika gagal
 */
export async function uploadIllustration(file: File): Promise<string | null> {
  try {
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `aspirasi-${timestamp}.${fileExtension}`;

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("Error uploading to Supabase:", error);
      return null;
    }

    return data.path;
  } catch (error) {
    console.error("Error in uploadIllustration:", error);
    return null;
  }
}

/**
 * Hapus file ilustrasi dari Supabase Storage
 * @param filename - Nama file yang akan dihapus
 * @returns true jika berhasil, false jika gagal
 */
export async function deleteIllustration(filename: string | null): Promise<boolean> {
  if (!filename) return true;

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filename]);

    if (error) {
      console.error("Error deleting from Supabase:", error);
      return false;
    }

    console.log(`Successfully deleted illustration: ${filename}`);
    return true;
  } catch (error) {
    console.error("Error in deleteIllustration:", error);
    return false;
  }
}

/**
 * Dapatkan public URL untuk file ilustrasi
 * @param filename - Nama file
 * @returns Public URL atau null jika gagal
 */
export function getIllustrationPublicUrl(filename: string | null): string | null {
  if (!filename) return null;

  try {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);

    return data.publicUrl;
  } catch (error) {
    console.error("Error getting public URL:", error);
    return null;
  }
}

/**
 * Update file ilustrasi (hapus yang lama, upload yang baru)
 * @param oldFilename - Nama file lama yang akan dihapus
 * @param newFile - File baru yang akan diupload
 * @returns Nama file baru atau null jika gagal
 */
export async function updateIllustration(
  oldFilename: string | null,
  newFile: File
): Promise<string | null> {
  try {
    // Upload file baru dulu
    const newFilename = await uploadIllustration(newFile);

    if (!newFilename) {
      return null;
    }

    // Hapus file lama setelah berhasil upload
    if (oldFilename) {
      await deleteIllustration(oldFilename);
    }

    return newFilename;
  } catch (error) {
    console.error("Error in updateIllustration:", error);
    return null;
  }
}
