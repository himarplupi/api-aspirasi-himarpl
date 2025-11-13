# reCAPTCHA v2 Integration Guide

## 🔐 Tentang reCAPTCHA v2

reCAPTCHA v2 menampilkan **checkbox "I'm not a robot"** yang harus dicentang user sebelum submit form.

**Perbedaan dengan v3:**

- ✅ v2: Checkbox visible, user interaction required
- ❌ v3: Invisible, automatic scoring (tidak digunakan di project ini)

---

## 📝 Backend Configuration

### File: `.env`

```env
# Google reCAPTCHA v2
RECAPTCHA_SECRET_KEY=6LetLwYsAAAAAO0wo2gCHfSJikrZLP6M3Gv7
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LetLwYsAAAAAHcSrn7hKVD0adD3UlA3WPOaqFt-
```

---

## 🎨 Frontend Implementation

### 1. Install react-google-recaptcha

```bash
npm install react-google-recaptcha
npm install --save-dev @types/react-google-recaptcha
```

### 2. Form dengan reCAPTCHA v2 Checkbox

```tsx
"use client";

import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function AspirasiForm() {
  const [aspirasi, setAspirasi] = useState("");
  const [penulis, setPenulis] = useState("");
  const [kategori, setKategori] = useState<"prodi" | "hima">("hima");
  const [loading, setLoading] = useState(false);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();

    if (!recaptchaToken) {
      alert("Please complete the reCAPTCHA verification");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/aspirasi/aspirasimhs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aspirasi,
          penulis: penulis || null,
          kategori,
          recaptchaToken, // Kirim token dari checkbox
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Aspirasi berhasil ditambahkan!");
        // Reset form
        setAspirasi("");
        setPenulis("");
        recaptchaRef.current?.reset(); // Reset reCAPTCHA
      } else {
        alert(`Error: ${result.error}`);
        recaptchaRef.current?.reset();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim aspirasi");
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Kirim Aspirasi</h2>

      {/* Aspirasi */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Aspirasi <span className="text-red-500">*</span>
        </label>
        <textarea
          value={aspirasi}
          onChange={(e) => setAspirasi(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={5}
          required
        />
      </div>

      {/* Penulis */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nama (Opsional)</label>
        <input
          type="text"
          value={penulis}
          onChange={(e) => setPenulis(e.target.value)}
          className="w-full border rounded px-3 py-2"
          maxLength={100}
        />
      </div>

      {/* Kategori */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Kategori</label>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value as "prodi" | "hima")}
          className="w-full border rounded px-3 py-2"
        >
          <option value="hima">HIMA</option>
          <option value="prodi">Prodi</option>
        </select>
      </div>

      {/* reCAPTCHA v2 Checkbox */}
      <div className="mb-4">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          theme="light"
          size="normal"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Mengirim..." : "Kirim Aspirasi"}
      </button>
    </form>
  );
}
```

### 3. Tema & Ukuran reCAPTCHA

```tsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
  theme="light" // atau "dark"
  size="normal" // atau "compact"
/>
```

**Options:**

- `theme`: `"light"` | `"dark"`
- `size`: `"normal"` | `"compact"`
- `badge`: `"bottomright"` | `"bottomleft"` | `"inline"` (untuk invisible)

---

## 🔧 Backend Implementation

Sudah terintegrasi di `/api/aspirasi/aspirasimhs`:

```typescript
// src/app/api/aspirasi/aspirasimhs/route.ts

export async function POST(request: NextRequest) {
  // 1. Rate limit check
  // 2. Extract recaptchaToken from body
  // 3. Verify dengan Google API (verifyRecaptcha())
  // 4. Jika valid -> insert to database
  // 5. Jika invalid -> return 403 error
}
```

**File yang terlibat:**

- `src/utils/recaptcha.ts` - Verifikasi logic
- `src/app/api/aspirasi/aspirasimhs/route.ts` - API endpoint

---

## 📊 Backend Verification Flow

```
Frontend
    ↓ [User centang checkbox]
    ↓ [Get token dari reCAPTCHA widget]
    ↓ [POST dengan recaptchaToken]
Backend API
    ↓ [Extract token]
    ↓ [POST ke Google API]
    ↓ [Google verify token]
    ↓ [Return success: true/false]
    ↓ [Jika success -> insert DB]
    ↓ [Jika fail -> return error 403]
```

---

## 🧪 Testing

### Test Request (Postman/Thunder Client):

**Cara mendapatkan token:**

1. Buka form di browser
2. Centang checkbox reCAPTCHA
3. Buka browser DevTools → Network tab
4. Submit form
5. Lihat payload request → copy `recaptchaToken`

**Request:**

```bash
POST http://localhost:3000/api/aspirasi/aspirasimhs
Content-Type: application/json

{
  "aspirasi": "Test aspirasi dengan reCAPTCHA v2",
  "penulis": "Test User",
  "kategori": "hima",
  "recaptchaToken": "03AGdBq25..."  // Token dari checkbox
}
```

### Responses:

**Success (201):**

```json
{
  "success": true,
  "data": {
    "id_aspirasi": 1,
    "aspirasi": "Test aspirasi dengan reCAPTCHA v2",
    "penulis": "Test User",
    "kategori": "hima",
    "c_date": "2025-11-08T..."
  },
  "message": "Aspirasi berhasil ditambahkan"
}
```

**Missing Token (400):**

```json
{
  "success": false,
  "error": "reCAPTCHA token tidak ditemukan"
}
```

**Verification Failed (403):**

```json
{
  "success": false,
  "error": "Verifikasi reCAPTCHA gagal. Pastikan Anda bukan robot.",
  "details": "reCAPTCHA verification failed"
}
```

---

## 🔒 Security Benefits

✅ **Bot Protection** - Mencegah automated bot spam  
✅ **Rate Limiting** - Tetap ada rate limit sebagai layer tambahan  
✅ **User-friendly** - Hanya perlu centang checkbox  
✅ **Google-powered** - Deteksi bot dari Google  
✅ **Proven** - Digunakan oleh jutaan website

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Please complete the reCAPTCHA"

**Cause:** User belum centang checkbox  
**Solution:** Validasi di frontend sebelum submit

### Issue 2: Token expired

**Cause:** Token reCAPTCHA valid 2 menit  
**Solution:** Reset reCAPTCHA setelah error:

```tsx
recaptchaRef.current?.reset();
```

### Issue 3: Domain mismatch

**Cause:** Domain tidak terdaftar di Google Console  
**Solution:** Tambahkan domain di https://www.google.com/recaptcha/admin

### Issue 4: Localhost not working

**Cause:** Localhost belum ditambahkan  
**Solution:** Add `localhost` ke domain list di reCAPTCHA admin

---

## 📝 Environment Variables

```env
# Backend (SECRET!)
RECAPTCHA_SECRET_KEY=6LetLwYsAAAAAO0wo2gCHfSJikrZLP6M3Gv7

# Frontend (PUBLIC)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LetLwYsAAAAAHcSrn7hKVD0adD3UlA3WPOaqFt-
```

---

## 🎨 Styling Examples

### Custom styling dengan className:

```tsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
  className="flex justify-center my-4"
/>
```

### Compact size untuk mobile:

```tsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
  size="compact"
  className="md:hidden" // Show compact on mobile
/>
```

---

## 📚 Resources

- [Google reCAPTCHA v2 Docs](https://developers.google.com/recaptcha/docs/display)
- [react-google-recaptcha](https://www.npmjs.com/package/react-google-recaptcha)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)

---

## ✅ Checklist

- [x] Install `react-google-recaptcha`
- [x] Setup environment variables
- [x] Add reCAPTCHA widget ke form
- [x] Kirim token ke backend
- [x] Backend verify token dengan Google API
- [x] Handle success/error responses
- [x] Reset reCAPTCHA after submit
- [ ] Add domain ke Google reCAPTCHA admin console
- [ ] Test di production

---

**Status**: ✅ Implemented (reCAPTCHA v2)  
**Updated**: 2025-11-08
