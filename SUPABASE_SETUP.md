# Setup Supabase Storage - Panduan Lengkap

## 🎯 Langkah-langkah Setup

### Step 1: Buat Bucket di Supabase Dashboard

1. **Login ke Supabase**
   - Buka https://app.supabase.com
   - Login dengan akun Anda

2. **Pilih Project**
   - Pilih project: `aspirasihimarpl-89e70`

3. **Buka Storage**
   - Di sidebar kiri, klik **Storage**
   - Klik tab **Buckets**

4. **Create New Bucket**
   - Klik tombol **New Bucket**
   - Isi form:
     ```
     Name: ilustrasi-aspirasi
     Public bucket: ✅ CENTANG (PENTING!)
     ```
   - Klik **Create bucket**

### Step 2: Konfigurasi Storage Policies

Setelah bucket dibuat, konfigurasi policies untuk keamanan:

1. **Klik bucket `ilustrasi-aspirasi`**
2. **Klik tab "Policies"**
3. **Klik "New Policy"**

#### Policy 1: Public Read Access (Wajib)

```sql
-- Nama Policy: Public Access for Images
-- Allowed operation: SELECT
-- Policy definition:

CREATE POLICY "Public Access for Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ilustrasi-aspirasi' );
```

#### Policy 2: Authenticated Upload (Opsional, jika pakai Auth)

```sql
-- Nama Policy: Authenticated Upload
-- Allowed operation: INSERT
-- Policy definition:

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'ilustrasi-aspirasi' );
```

#### Policy 3: Authenticated Delete (Opsional, jika pakai Auth)

```sql
-- Nama Policy: Authenticated Delete
-- Allowed operation: DELETE
-- Policy definition:

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'ilustrasi-aspirasi' );
```

### Step 3: Test Upload Manual

Test apakah bucket berfungsi:

1. Di Supabase Dashboard → Storage → `ilustrasi-aspirasi`
2. Klik **Upload file**
3. Pilih gambar test
4. Setelah upload, klik file tersebut
5. Klik **Get URL** → Copy URL
6. Buka URL di browser, pastikan gambar muncul

### Step 4: Verifikasi Environment Variables

Pastikan `.env` sudah benar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://iieyqnbtsfzpvetpcyjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 5: Test dari Aplikasi

Jalankan aplikasi dan test:

```bash
npm run dev
```

Test API upload:

```bash
curl -X POST http://localhost:3000/api/aspirasi/displayaspirasi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "id_aspirasi=1" \
  -F "kategori=hima" \
  -F "status=displayed" \
  -F "ilustrasi=@test-image.jpg"
```

---

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"

**Solusi:**

- Pastikan bucket diset sebagai **Public**
- Atau tambahkan RLS policies seperti di atas

### Error: "Bucket not found"

**Solusi:**

- Cek nama bucket di `src/utils/supabase.ts` (harus `ilustrasi-aspirasi`)
- Pastikan bucket sudah dibuat di dashboard

### Error: "Invalid API key"

**Solusi:**

- Cek `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env`
- Pastikan tidak ada spasi atau newline
- Restart development server

### Gambar tidak muncul di browser

**Solusi:**

- Cek bucket diset sebagai **Public**
- Cek RLS policy untuk SELECT sudah ada
- Test URL manual di browser

---

## 📊 Monitoring & Limits

### Free Tier Limits (Supabase)

- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited

### Cek Usage

1. Supabase Dashboard → Settings → Usage
2. Monitor:
   - Storage used
   - Bandwidth used
   - Number of files

---

## 🚀 Migrasi File Existing (jika ada)

Jika sudah ada file di `public/assets/images/ilustrasi_aspirasi/`:

```bash
npx tsx scripts/migrate-files-to-supabase.ts
```

Script akan:

1. Scan folder local
2. Upload semua file ke Supabase
3. Show summary (success/failed)

---

## ✅ Checklist Final

- [ ] Bucket `ilustrasi-aspirasi` sudah dibuat
- [ ] Bucket diset sebagai **Public**
- [ ] RLS Policy untuk SELECT (public read) sudah ada
- [ ] Environment variables sudah benar
- [ ] Test upload manual berhasil
- [ ] Test dari aplikasi berhasil
- [ ] URL gambar bisa diakses dari browser

---

## 📞 Support

Dokumentasi Supabase Storage:

- https://supabase.com/docs/guides/storage

Jika masih ada masalah, cek:

1. Supabase Dashboard → Logs → Storage logs
2. Browser console untuk error
3. Server logs untuk error backend

---

**Setup Status**: ⏳ Pending (Selesaikan checklist di atas)
**Updated**: 2025-10-14
