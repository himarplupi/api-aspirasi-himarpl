# Service Role Key vs Anon Key - Explained

## 🔑 Perbedaan Keys

### ANON KEY (Public)

- ✅ Digunakan di **frontend/client-side**
- ✅ Terbatas oleh **Row Level Security (RLS)**
- ❌ Tidak bisa bypass RLS policies
- 📍 Safe untuk diexpose ke browser

### SERVICE ROLE KEY (Private)

- ✅ Digunakan di **backend/server-side**
- ✅ **Bypass semua RLS policies**
- ✅ Full admin access
- ⚠️ **JANGAN** expose ke frontend/browser
- 📍 Hanya untuk server-side operations

---

## 🔧 Implementasi di Proyek

### Backend (`src/utils/supabase.ts`)

Menggunakan **SERVICE_ROLE_KEY** untuk bypass RLS:

```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

**Kenapa?**

- Backend API routes butuh akses penuh ke storage
- Upload/delete file harus bypass RLS
- Tidak ada security risk karena hanya di server

### Frontend (`src/lib/supabase-helper.ts`)

Hanya generate public URL, tidak perlu client:

```typescript
export function getIllustrationUrl(filename: string | null): string {
  return `${supabaseUrl}/storage/v1/object/public/ilust_aspirasi/${filename}`;
}
```

**Kenapa tidak pakai Supabase client di frontend?**

- Hanya perlu URL public untuk display image
- Lebih simple dan aman
- Upload/delete tetap lewat API (protected dengan JWT)

---

## 🔐 Environment Variables

### `.env` File

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://iieyqnbtsfzpvetpcyjp.supabase.co

# Anon Key (untuk frontend, jika diperlukan nanti)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Service Role Key (untuk backend - RAHASIA!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

⚠️ **PENTING:**

- `NEXT_PUBLIC_*` = Exposed ke browser
- `SUPABASE_SERVICE_ROLE_KEY` = Server-only (TIDAK ada prefix `NEXT_PUBLIC_`)

---

## 🛡️ Security Best Practices

### ✅ DO:

- Gunakan SERVICE_ROLE_KEY hanya di backend
- Protect API routes dengan JWT authentication
- Validate user permissions di backend
- Keep SERVICE_ROLE_KEY secret (tidak commit ke git)

### ❌ DON'T:

- Jangan expose SERVICE_ROLE_KEY ke frontend
- Jangan hardcode keys di code
- Jangan commit `.env` ke git
- Jangan share SERVICE_ROLE_KEY dengan orang lain

---

## 🚀 Kenapa Error RLS Sebelumnya?

### Error yang terjadi:

```
Error uploading to Supabase: [Error [StorageApiError]:
new row violates row-level security policy]
status: 403
```

### Penyebab:

- Menggunakan **ANON_KEY** di backend
- ANON_KEY terbatas oleh RLS policies
- Bucket mungkin belum ada RLS policy yang tepat

### Solusi:

- Ganti dengan **SERVICE_ROLE_KEY** di backend
- Service Role Key bypass semua RLS
- Upload/delete sekarang berhasil tanpa error

---

## 📊 Flow Upload dengan Service Role Key

```
Frontend (React/Next.js)
    ↓ [POST request with JWT]
Backend API Route (/api/aspirasi/displayaspirasi)
    ↓ [Validate JWT]
    ↓ [Check user permissions]
Backend Supabase Client (SERVICE_ROLE_KEY)
    ↓ [Upload file - BYPASS RLS]
Supabase Storage (ilust_aspirasi bucket)
    ↓ [File stored]
Return public URL to frontend
    ↓
Frontend displays image
```

**Security Layers:**

1. JWT authentication (API level)
2. User role validation (Application level)
3. Service Role Key (Storage level - bypass RLS for admin operations)

---

## 🔄 Migration dari Anon Key ke Service Role Key

### Changes Made:

**1. `.env`**

```diff
+ SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**2. `src/utils/supabase.ts`**

```diff
- const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
- export const supabase = createClient(supabaseUrl, supabaseAnonKey);
+ const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
+ export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
+   auth: { autoRefreshToken: false, persistSession: false }
+ });
```

---

## ✅ Testing

### Test Upload:

```bash
curl -X POST http://localhost:3000/api/aspirasi/displayaspirasi \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "id_aspirasi=1" \
  -F "kategori=hima" \
  -F "status=displayed" \
  -F "ilustrasi=@test-image.jpg"
```

### Expected Result:

```json
{
  "message": "Berhasil ditambahkan",
  "data": {
    "id_dispirasi": 1,
    "ilustrasi": "aspirasi-1702345678901.jpg",
    ...
  }
}
```

### Verify in Supabase:

1. Supabase Dashboard → Storage → `ilust_aspirasi`
2. File should appear in the bucket
3. Click file → Get URL → Open in browser
4. Image should display

---

## 📝 Notes

- Service Role Key memiliki **FULL ACCESS** ke semua Supabase services
- Selalu validate user permissions di application layer
- RLS policies tetap berguna untuk frontend clients (jika ada)
- Untuk production, pertimbangkan tambahan validation/rate limiting

---

**Updated**: 2025-10-14  
**Status**: ✅ Fixed RLS Error dengan Service Role Key
