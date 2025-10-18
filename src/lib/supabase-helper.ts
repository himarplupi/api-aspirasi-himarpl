// /**
//  * Helper untuk Supabase Storage di Frontend
//  *
//  * Usage:
//  * import { getIllustrationUrl } from '@/lib/supabase-helper';
//  *
//  * const imageUrl = getIllustrationUrl(aspirasi.ilustrasi);
//  * <img src={imageUrl} alt="Ilustrasi" />
//  */

// /**
//  * Generate public URL untuk file ilustrasi dari Supabase Storage
//  * @param filename - Nama file ilustrasi (misal: "aspirasi-1702345678901.jpg")
//  * @returns Public URL atau placeholder jika filename null/undefined
//  */
// export function getIllustrationUrl(filename: string | null | undefined): string {
//   // Jika tidak ada filename, return placeholder
//   if (!filename) {
//     return "/assets/images/placeholder.jpg"; // Sesuaikan dengan path placeholder Anda
//   }

//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

//   if (!supabaseUrl) {
//     console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
//     return "/assets/images/placeholder.jpg";
//   }

//   // Build public URL
//   return `${supabaseUrl}/storage/v1/object/public/ilustrasi-aspirasi/${filename}`;
// }

// /**
//  * Cek apakah URL adalah URL Supabase Storage
//  * @param url - URL untuk dicek
//  * @returns true jika URL dari Supabase Storage
//  */
// export function isSupabaseStorageUrl(url: string): boolean {
//   return url.includes("/storage/v1/object/public/");
// }

// /**
//  * Extract filename dari Supabase Storage URL
//  * @param url - Supabase Storage URL
//  * @returns Filename atau null jika bukan Supabase URL
//  */
// export function extractFilenameFromUrl(url: string): string | null {
//   if (!isSupabaseStorageUrl(url)) {
//     return null;
//   }

//   const parts = url.split("/");
//   return parts[parts.length - 1];
// }

// /**
//  * Generate thumbnail URL (jika menggunakan Supabase Image Transformation)
//  * @param filename - Nama file ilustrasi
//  * @param width - Lebar thumbnail (default: 300)
//  * @param height - Tinggi thumbnail (default: 300)
//  * @returns URL thumbnail
//  */
// export function getIllustrationThumbnailUrl(
//   filename: string | null | undefined,
//   width: number = 300,
//   height: number = 300
// ): string {
//   if (!filename) {
//     return "/assets/images/placeholder.jpg";
//   }

//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

//   if (!supabaseUrl) {
//     console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
//     return "/assets/images/placeholder.jpg";
//   }

//   // Supabase Image Transformation API
//   return `${supabaseUrl}/storage/v1/render/image/public/ilustrasi-aspirasi/${filename}?width=${width}&height=${height}&resize=cover`;
// }
