# Google reCAPTCHA v2 Integration

## 🔐 Setup reCAPTCHA v2

### 1. Daftar di Google reCAPTCHA

1. Buka https://www.google.com/recaptcha/admin
2. Login dengan Google account
3. Klik **+** untuk registrasi site baru
4. Isi form:
   - **Label**: Aspirasi HIMARPL
   - **reCAPTCHA type**: ✅ **reCAPTCHA v2** → **"I'm not a robot" Checkbox**
   - **Domains**:
     - `localhost` (untuk development)
     - `your-domain.com` (untuk production)
   - Accept terms & Submit

5. Anda akan mendapatkan:
   - **Site Key** (untuk frontend)
   - **Secret Key** (untuk backend)---

## 📝 Configuration

### Backend (.env)

Tambahkan ke file `.env`:

```env
# Google reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_secret_key_from_google
RECAPTCHA_SCORE_THRESHOLD=0.5
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_from_google
```

**Penjelasan:**

- `RECAPTCHA_SECRET_KEY` - Secret key dari Google (RAHASIA, server-only)
- `RECAPTCHA_SCORE_THRESHOLD` - Minimum score (0.0 - 1.0). Default: 0.5
  - 0.0 = Bot
  - 1.0 = Human
  - 0.5 = Threshold yang balance
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - Site key untuk frontend (public)

---

## 🎨 Frontend Implementation

### 1. Install reCAPTCHA Package

```bash
npm install react-google-recaptcha-v3
```

### 2. Setup Provider di Layout

```tsx
// app/layout.tsx
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          language="id"
          scriptProps={{
            async: true,
            defer: true,
            appendTo: "head",
          }}
        >
          {children}
        </GoogleReCaptchaProvider>
      </body>
    </html>
  );
}
```

### 3. Form Aspirasi dengan reCAPTCHA

```tsx
// components/AspirasiForm.tsx
"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function AspirasiForm() {
  const [aspirasi, setAspirasi] = useState("");
  const [penulis, setPenulis] = useState("");
  const [kategori, setKategori] = useState<"prodi" | "hima">("hima");
  const [loading, setLoading] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      alert("reCAPTCHA belum siap. Coba lagi.");
      return;
    }

    setLoading(true);

    try {
      // Generate reCAPTCHA token
      const recaptchaToken = await executeRecaptcha("submit_aspirasi");

      // Kirim ke backend
      const response = await fetch("/api/aspirasi/aspirasimhs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aspirasi,
          penulis: penulis || null,
          kategori,
          recaptchaToken, // Kirim token reCAPTCHA
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Aspirasi berhasil ditambahkan!");
        // Reset form
        setAspirasi("");
        setPenulis("");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting aspirasi:", error);
      alert("Gagal mengirim aspirasi. Coba lagi.");
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
          placeholder="Tulis aspirasi Anda di sini..."
          required
        />
      </div>

      {/* Penulis (Opsional) */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nama Penulis (Opsional)</label>
        <input
          type="text"
          value={penulis}
          onChange={(e) => setPenulis(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="Nama Anda (opsional)"
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

      {/* reCAPTCHA Badge Info */}
      <div className="mb-4 text-xs text-gray-600">
        This site is protected by reCAPTCHA and the Google{" "}
        <a href="https://policies.google.com/privacy" className="underline" target="_blank">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/terms" className="underline" target="_blank">
          Terms of Service
        </a>{" "}
        apply.
      </div>

      {/* Submit Button */}
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

---

## 🔧 Backend Implementation

Sudah terintegrasi di `/api/aspirasi/aspirasimhs`:

```typescript
// src/app/api/aspirasi/aspirasimhs/route.ts

// POST request akan:
1. Cek rate limit
2. Validasi reCAPTCHA token
3. Cek reCAPTCHA score (minimum 0.5)
4. Validasi input data
5. Insert ke database jika semua valid
```

**Flow:**

```
Frontend Form
    ↓ [Generate reCAPTCHA token]
    ↓ [POST /api/aspirasi/aspirasimhs]
Backend API
    ↓ [Rate limit check]
    ↓ [Verify reCAPTCHA with Google API]
    ↓ [Check score >= threshold]
    ↓ [Validate data]
    ↓ [Insert to database]
Return success/error
```

---

## 📊 reCAPTCHA Score Interpretation

| Score     | Interpretation      | Action                  |
| --------- | ------------------- | ----------------------- |
| 0.0 - 0.1 | Definitif bot       | ❌ Reject               |
| 0.1 - 0.3 | Sangat mencurigakan | ❌ Reject               |
| 0.3 - 0.5 | Mencurigakan        | ⚠️ Depends on threshold |
| 0.5 - 0.7 | Kemungkinan human   | ✅ Accept (default)     |
| 0.7 - 1.0 | Definitif human     | ✅ Accept               |

Default threshold: **0.5**

Adjust di `.env`:

```env
RECAPTCHA_SCORE_THRESHOLD=0.5  # Bisa diubah 0.3 - 0.7
```

---

## 🧪 Testing

### Test dengan Postman/Thunder Client:

1. **Get reCAPTCHA token dari browser console:**

```javascript
// Jalankan di browser console
grecaptcha.ready(function () {
  grecaptcha.execute("YOUR_SITE_KEY", { action: "submit_aspirasi" }).then(function (token) {
    console.log("Token:", token);
  });
});
```

2. **POST request:**

```bash
curl -X POST http://localhost:3000/api/aspirasi/aspirasimhs \
  -H "Content-Type: application/json" \
  -d '{
    "aspirasi": "Test aspirasi dengan reCAPTCHA",
    "penulis": "Test User",
    "kategori": "hima",
    "recaptchaToken": "TOKEN_FROM_STEP_1"
  }'
```

### Expected Responses:

**Success (200):**

```json
{
  "success": true,
  "data": {
    "id_aspirasi": 1,
    "aspirasi": "Test aspirasi dengan reCAPTCHA",
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

**Invalid/Low Score (403):**

```json
{
  "success": false,
  "error": "Verifikasi reCAPTCHA gagal. Pastikan Anda bukan robot.",
  "details": "reCAPTCHA score too low"
}
```

---

## 🔒 Security Benefits

✅ **Bot Protection** - Mencegah spam dari bot  
✅ **Rate Limiting** - Tetap ada rate limit sebagai layer tambahan  
✅ **Score-based** - Flexible threshold untuk balance security vs UX  
✅ **Invisible** - reCAPTCHA v3 tidak mengganggu UX (no checkbox)  
✅ **Google-powered** - Machine learning dari Google untuk deteksi bot

---

## 📝 Environment Variables Summary

```env
# Backend only (SECRET!)
RECAPTCHA_SECRET_KEY=6Lf...your_secret_key

# Threshold for score validation
RECAPTCHA_SCORE_THRESHOLD=0.5

# Frontend (PUBLIC)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lf...your_site_key
```

---

## 🚨 Important Notes

1. **Token sekali pakai**: reCAPTCHA token hanya bisa diverifikasi 1x
2. **Token expiry**: Token valid selama 2 menit
3. **Action name**: Gunakan action name yang deskriptif (`submit_aspirasi`)
4. **Domain whitelist**: Pastikan domain terdaftar di Google reCAPTCHA console
5. **HTTPS production**: reCAPTCHA butuh HTTPS di production

---

## 📚 Resources

- [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [reCAPTCHA v3 Docs](https://developers.google.com/recaptcha/docs/v3)
- [react-google-recaptcha-v3](https://www.npmjs.com/package/react-google-recaptcha-v3)

---

**Status**: ✅ Implemented  
**Updated**: 2025-11-08
