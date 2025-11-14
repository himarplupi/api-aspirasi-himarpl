# Migrasi File Ilustrasi ke Supabase Storage

## 📋 Ringkasan Perubahan

Sistem penyimpanan file ilustrasi aspirasi telah dimigrasi dari **local filesystem** ke **Supabase Storage** untuk meningkatkan skalabilitas dan keandalan.

---

## 🔧 Perubahan yang Dilakukan

### 1. **Environment Variables (.env)**

Ditambahkan konfigurasi Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://iieyqnbtsfzpvetpcyjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2. **Dependencies**

Installed package:

```bash
npm install @supabase/supabase-js
```

### 3. **File Baru: `src/utils/supabase.ts`**

Utility functions untuk Supabase Storage:

- ✅ `uploadIllustration(file)` - Upload file ke Supabase
- ✅ `deleteIllustration(filename)` - Hapus file dari Supabase
- ✅ `updateIllustration(oldFilename, newFile)` - Update file (hapus lama, upload baru)
- ✅ `getIllustrationPublicUrl(filename)` - Dapatkan public URL

### 4. **File Dimodifikasi: `src/app/api/aspirasi/displayaspirasi/route.ts`**

- ❌ Removed: `fs/promises` dan `path` (local filesystem)
- ✅ Added: Import dari `@/utils/supabase`
- ✅ Updated: Semua operasi file menggunakan Supabase Storage

---

## 🗄️ Setup Supabase Storage

### Langkah 1: Buat Bucket di Supabase Dashboard

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **Storage** → **Buckets**
4. Klik **New Bucket**
5. Konfigurasi:
   - **Name**: `ilustrasi-aspirasi`
   - **Public**: ✅ **Centang ini** (agar file bisa diakses public)
   - **File size limit**: 5 MB (atau sesuai kebutuhan)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`

### Langkah 2: Setup Storage Policies (Opsional untuk Security)

Jika ingin kontrol akses lebih ketat:

```sql
-- Policy untuk public read (agar ilustrasi bisa ditampilkan)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ilustrasi-aspirasi' );

-- Policy untuk authenticated upload (hanya user login yang bisa upload)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ilustrasi-aspirasi'
  AND auth.role() = 'authenticated'
);

-- Policy untuk authenticated delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ilustrasi-aspirasi'
  AND auth.role() = 'authenticated'
);
```

---

## 🧪 Testing API

### 1. **POST - Upload Ilustrasi Baru**

```bash
curl -X POST http://localhost:3000/api/aspirasi/displayaspirasi \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "id_aspirasi=1" \
  -F "kategori=hima" \
  -F "status=displayed" \
  -F "ilustrasi=@/path/to/image.jpg"
```

### 2. **PUT - Update Ilustrasi**

```bash
curl -X PUT http://localhost:3000/api/aspirasi/displayaspirasi \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "id_dispirasi=1" \
  -F "action=update_image" \
  -F "ilustrasi=@/path/to/new-image.jpg"
```

### 3. **DELETE - Hapus Display Aspirasi**

```bash
curl -X DELETE "http://localhost:3000/api/aspirasi/displayaspirasi?id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Format File yang Disimpan

**Naming Convention:**

```
aspirasi-{timestamp}.{extension}
```

**Contoh:**

```
aspirasi-1702345678901.jpg
aspirasi-1702345679902.png
```

---

## 🔗 Cara Mendapatkan Public URL

### Di Backend (sudah terintegrasi):

```typescript
import { getIllustrationPublicUrl } from "@/utils/supabase";

const publicUrl = getIllustrationPublicUrl("aspirasi-1702345678901.jpg");
// Output: https://iieyqnbtsfzpvetpcyjp.supabase.co/storage/v1/object/public/ilustrasi-aspirasi/aspirasi-1702345678901.jpg
```

### Di Frontend:

```typescript
// Data dari API sudah berisi nama file
const illustration = displayAspirasi.ilustrasi; // "aspirasi-1702345678901.jpg"

// Build public URL
const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ilustrasi-aspirasi/${illustration}`;

// Tampilkan di Image component
<img src={publicUrl} alt="Ilustrasi Aspirasi" />
```

---

## ⚠️ Perbedaan dengan Local Filesystem

| Aspek                | Local Filesystem (❌ Old)                    | Supabase Storage (✅ New)                     |
| -------------------- | -------------------------------------------- | --------------------------------------------- |
| **Storage Location** | `public/assets/images/ilustrasi_aspirasi/`   | Supabase Cloud Storage                        |
| **Access URL**       | `/assets/images/ilustrasi_aspirasi/file.jpg` | `https://...supabase.co/storage/.../file.jpg` |
| **Scalability**      | Limited (server disk space)                  | Unlimited (cloud-based)                       |
| **CDN**              | No                                           | Yes (built-in)                                |
| **Backup**           | Manual                                       | Automatic                                     |
| **Cost**             | Free (uses server space)                     | Free tier: 1GB, then paid                     |

---

## 🔒 Security Notes

1. **Public Bucket**: File ilustrasi bisa diakses siapa saja (by design untuk ditampilkan di landing page)
2. **Upload/Delete**: Tetap memerlukan JWT token authentication
3. **File Validation**: Pastikan validasi tipe file di client-side juga
4. **Rate Limiting**: Pertimbangkan tambahkan rate limiting untuk endpoint upload

---

## 📦 Rollback Plan (jika diperlukan)

Jika ingin kembali ke local filesystem:

1. Restore file `route.ts` dari git history
2. Uncomment import `fs` dan `path`
3. Remove import dari `@/utils/supabase`
4. Restore fungsi `saveIllustrationFile` dan `deleteIllustrationFile`

---

## ✅ Checklist Deployment

Sebelum deploy ke production:

- [x] Environment variables sudah diset di production server
- [ ] Bucket `ilustrasi-aspirasi` sudah dibuat di Supabase
- [ ] Bucket diset sebagai **public**
- [ ] Storage policies sudah dikonfigurasi (opsional)
- [ ] Test upload, update, dan delete file
- [ ] Test public URL accessibility
- [ ] Migrasi file existing dari local ke Supabase (jika ada)

---

## 🚀 Next Steps

1. **Migrasi Data Existing** (jika ada file di local):
   - Buat script untuk upload file dari `public/assets/images/ilustrasi_aspirasi/` ke Supabase
   - Update database dengan URL baru

2. **Optimize Image Handling**:
   - Tambah image compression sebelum upload
   - Tambah thumbnail generation
   - Tambah file size validation

3. **Monitoring**:
   - Monitor Supabase storage usage
   - Setup alerts untuk storage quota

---

## 📞 Support

Jika ada masalah:

1. Cek Supabase Dashboard → Storage → Buckets
2. Cek logs di Supabase Dashboard → Logs
3. Cek environment variables sudah benar
4. Pastikan bucket `ilustrasi-aspirasi` sudah dibuat dan public

---

**Status**: ✅ Migration Complete
**Date**: 2025-10-14
