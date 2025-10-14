# 🖼️ Supabase Storage Integration - Quick Reference

Sistem penyimpanan file ilustrasi aspirasi menggunakan **Supabase Storage** (cloud-based).

---

## 🚀 Quick Start

### 1. Setup Supabase Bucket (WAJIB!)

Buat bucket di [Supabase Dashboard](https://app.supabase.com):

```
Nama: ilustrasi-aspirasi
Public: ✅ YES (centang ini!)
```

Detail lengkap: Lihat `SUPABASE_SETUP.md`

### 2. Environment Variables

File `.env` sudah berisi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://iieyqnbtsfzpvetpcyjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # RAHASIA! Untuk backend only
```

⚠️ **PENTING**: Backend menggunakan `SUPABASE_SERVICE_ROLE_KEY` untuk bypass RLS policies.  
Lihat: `SERVICE_ROLE_KEY_EXPLAINED.md` untuk detail.

### 3. Test Upload

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Test upload
curl -X POST http://localhost:3000/api/aspirasi/displayaspirasi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "id_aspirasi=1" \
  -F "kategori=hima" \
  -F "status=displayed" \
  -F "ilustrasi=@image.jpg"
```

---

## 📁 File Structure

```
src/
├── utils/
│   └── supabase.ts           # Backend: Upload/delete functions
├── lib/
│   └── supabase-helper.ts    # Frontend: Get public URL
└── app/api/aspirasi/displayaspirasi/
    └── route.ts              # API routes (POST, PUT, DELETE)

scripts/
└── migrate-files-to-supabase.ts  # Migration script (opsional)

# Dokumentasi
SUPABASE_SETUP.md          # Setup bucket & policies
SUPABASE_MIGRATION.md      # Detail technical migration
FRONTEND_EXAMPLES.md       # React/Next.js examples
```

---

## 🔧 Backend Functions

### Upload File

```typescript
import { uploadIllustration } from "@/utils/supabase";

const filename = await uploadIllustration(file);
// Returns: "aspirasi-1702345678901.jpg"
```

### Delete File

```typescript
import { deleteIllustration } from "@/utils/supabase";

await deleteIllustration("aspirasi-1702345678901.jpg");
```

### Update File (replace)

```typescript
import { updateIllustration } from "@/utils/supabase";

const newFilename = await updateIllustration(oldFilename, newFile);
```

**Note**: Backend menggunakan **Service Role Key** yang bypass RLS policies.  
Detail: `SERVICE_ROLE_KEY_EXPLAINED.md`

---

## 🎨 Frontend Usage

### Get Public URL

```typescript
import { getIllustrationUrl } from "@/lib/supabase-helper";

const imageUrl = getIllustrationUrl(aspirasi.ilustrasi);
// Returns: https://...supabase.co/storage/v1/object/public/ilustrasi-aspirasi/aspirasi-XXX.jpg
```

### Display Image (Next.js)

```tsx
import Image from "next/image";
import { getIllustrationUrl } from "@/lib/supabase-helper";

<Image src={getIllustrationUrl(aspirasi.ilustrasi)} alt="Ilustrasi" width={600} height={400} />;
```

### Get Thumbnail URL

```typescript
import { getIllustrationThumbnailUrl } from "@/lib/supabase-helper";

const thumbnailUrl = getIllustrationThumbnailUrl(aspirasi.ilustrasi, 300, 300);
```

Contoh lengkap: Lihat `FRONTEND_EXAMPLES.md`

---

## 📡 API Endpoints

### POST - Upload New Aspirasi

```bash
POST /api/aspirasi/displayaspirasi
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

Body:
- id_aspirasi: number
- kategori: "prodi" | "hima"
- status: "displayed" | "hidden"
- ilustrasi: File
```

### PUT - Update Image Only

```bash
PUT /api/aspirasi/displayaspirasi
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

Body:
- id_dispirasi: number
- action: "update_image"
- ilustrasi: File
```

### DELETE - Delete Display Aspirasi

```bash
DELETE /api/aspirasi/displayaspirasi?id=1
Authorization: Bearer TOKEN
```

---

## 🔍 Troubleshooting

| Problem                | Solution                                      |
| ---------------------- | --------------------------------------------- |
| Image not showing      | Cek bucket adalah **Public**                  |
| Upload failed          | Cek Supabase credentials di `.env`            |
| "Bucket not found"     | Buat bucket `ilust_aspirasi`                  |
| 403 Forbidden (upload) | ✅ FIXED: Gunakan `SUPABASE_SERVICE_ROLE_KEY` |
| RLS Policy Error       | ✅ FIXED: Service Role Key bypass RLS         |

Detail: Lihat `SUPABASE_SETUP.md` → Troubleshooting

---

## 📊 Storage Info

- **Bucket**: `ilust_aspirasi`
- **Location**: Supabase Cloud (AWS)
- **Access**: Public read, Service Role Key for write/delete
- **Naming**: `aspirasi-{timestamp}.{ext}`
- **Free Tier**: 1GB storage, 2GB bandwidth/month
- **Backend**: Uses Service Role Key (bypass RLS)

---

## 🔐 Security

✅ **Public read** - Siapa saja bisa lihat ilustrasi (by design)  
✅ **Service Role Key** - Backend bypass RLS untuk upload/delete  
✅ **JWT protection** - API endpoints butuh Bearer token  
✅ **Application-level auth** - User permissions validated di API

Detail: `SERVICE_ROLE_KEY_EXPLAINED.md`

---

## 📚 Documentation Links

- [Setup Guide](./SUPABASE_SETUP.md) - Cara setup bucket
- [Service Role Key](./SERVICE_ROLE_KEY_EXPLAINED.md) - **NEW!** Penjelasan RLS fix
- [Migration Details](./SUPABASE_MIGRATION.md) - Technical info
- [Frontend Examples](./FRONTEND_EXAMPLES.md) - React/Next.js code
- [Supabase Docs](https://supabase.com/docs/guides/storage)

---

## 🎯 Next Steps

1. ✅ Setup Supabase bucket (WAJIB!)
2. ✅ Test upload dari Postman/Thunder Client
3. ✅ Integrate di frontend
4. ⏸️ (Opsional) Migrasi file existing: `npx tsx scripts/migrate-files-to-supabase.ts`

---

**Status**: ✅ Code ready, ⏳ Bucket setup needed  
**Updated**: 2025-10-14
