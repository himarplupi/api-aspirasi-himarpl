# Contoh Penggunaan Supabase Storage di Frontend

## 📝 Contoh Komponen React/Next.js

### 1. Display Aspirasi Card dengan Ilustrasi

```typescript
// components/AspirasiCard.tsx
import Image from "next/image";
import { getIllustrationUrl } from "@/lib/supabase-helper";

interface AspirasiCardProps {
  aspirasi: {
    id_dispirasi: number;
    aspirasi: string;
    penulis: string;
    ilustrasi: string | null;
    kategori: "prodi" | "hima";
  };
}

export default function AspirasiCard({ aspirasi }: AspirasiCardProps) {
  const imageUrl = getIllustrationUrl(aspirasi.ilustrasi);

  return (
    <div className="card">
      {/* Next.js Image Component */}
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={`Ilustrasi ${aspirasi.aspirasi}`}
          fill
          className="object-cover rounded-t-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg">{aspirasi.aspirasi}</h3>
        <p className="text-sm text-gray-600">Oleh: {aspirasi.penulis}</p>
        <span className="badge">{aspirasi.kategori}</span>
      </div>
    </div>
  );
}
```

### 2. Fetch dan Display List Aspirasi

```typescript
// app/aspirasi/page.tsx
"use client";

import { useEffect, useState } from "react";
import AspirasiCard from "@/components/AspirasiCard";

interface DisplayAspirasi {
  id_dispirasi: number;
  aspirasi: string;
  penulis: string;
  ilustrasi: string | null;
  kategori: "prodi" | "hima";
  status: "displayed" | "hidden";
}

export default function AspirasiPage() {
  const [aspirasis, setAspirasis] = useState<DisplayAspirasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAspirasi() {
      try {
        const res = await fetch("/api/aspirasi/displayaspirasi");
        const data = await res.json();
        setAspirasis(data.data);
      } catch (error) {
        console.error("Error fetching aspirasi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAspirasi();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Aspirasi Mahasiswa</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aspirasis.map((aspirasi) => (
          <AspirasiCard key={aspirasi.id_dispirasi} aspirasi={aspirasi} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Upload Form dengan Preview

```typescript
// components/UploadAspirasiForm.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function UploadAspirasiForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aspirasi, setAspirasi] = useState("");
  const [kategori, setKategori] = useState<"prodi" | "hima">("hima");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("id_aspirasi", "1"); // Sesuaikan dengan ID aspirasi
      formData.append("kategori", kategori);
      formData.append("status", "displayed");
      if (file) {
        formData.append("ilustrasi", file);
      }

      const token = localStorage.getItem("token"); // Atau dari context
      const res = await fetch("/api/aspirasi/displayaspirasi", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert("Aspirasi berhasil ditambahkan!");
        // Reset form
        setFile(null);
        setPreview(null);
        setAspirasi("");
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal upload aspirasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Aspirasi</h2>

      {/* Preview Image */}
      {preview && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Preview:</label>
          <div className="relative w-full h-64">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Upload Ilustrasi:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Aspirasi Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Isi Aspirasi:
        </label>
        <textarea
          value={aspirasi}
          onChange={(e) => setAspirasi(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={4}
          required
        />
      </div>

      {/* Kategori */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Kategori:</label>
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value as "prodi" | "hima")}
          className="w-full border rounded px-3 py-2"
        >
          <option value="hima">HIMA</option>
          <option value="prodi">Prodi</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Uploading..." : "Upload Aspirasi"}
      </button>
    </form>
  );
}
```

### 4. Image Gallery dengan Lightbox

```typescript
// components/AspirasiGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { getIllustrationUrl } from "@/lib/supabase-helper";

interface AspirasiGalleryProps {
  images: Array<{
    id: number;
    ilustrasi: string | null;
    caption: string;
  }>;
}

export default function AspirasiGallery({ images }: AspirasiGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative h-48 cursor-pointer hover:opacity-80 transition"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={getIllustrationUrl(image.ilustrasi)}
              alt={image.caption}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            <Image
              src={getIllustrationUrl(images[selectedImage].ilustrasi)}
              alt={images[selectedImage].caption}
              width={1200}
              height={800}
              className="object-contain"
            />
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## 🎨 Styling dengan Tailwind CSS

### Responsive Card Layout

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>
```

### Image dengan Aspect Ratio

```tsx
<div className="aspect-video relative w-full overflow-hidden rounded-lg">
  <Image src={imageUrl} alt="Ilustrasi" fill className="object-cover" />
</div>
```

### Loading Skeleton

```tsx
function ImageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 h-48 w-full rounded-lg"></div>
    </div>
  );
}
```

---

## 📱 Performance Tips

### 1. Lazy Loading dengan Next.js Image

```tsx
<Image
  src={imageUrl}
  alt="Ilustrasi"
  fill
  loading="lazy" // Lazy load untuk performa
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### 2. Optimize dengan Supabase Image Transformation

```typescript
import { getIllustrationThumbnailUrl } from "@/lib/supabase-helper";

// Untuk thumbnail (300x300)
const thumbnailUrl = getIllustrationThumbnailUrl(aspirasi.ilustrasi, 300, 300);

// Untuk card image (600x400)
const cardImageUrl = getIllustrationThumbnailUrl(aspirasi.ilustrasi, 600, 400);
```

### 3. Preload Critical Images

```tsx
// app/layout.tsx
import { getIllustrationUrl } from "@/lib/supabase-helper";

export default function RootLayout() {
  return (
    <html>
      <head>
        <link rel="preload" as="image" href={getIllustrationUrl("featured-image.jpg")} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔒 Error Handling

```typescript
// components/SafeImage.tsx
import { useState } from "react";
import Image from "next/image";
import { getIllustrationUrl } from "@/lib/supabase-helper";

interface SafeImageProps {
  filename: string | null;
  alt: string;
  width?: number;
  height?: number;
}

export default function SafeImage({ filename, alt, width, height }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="bg-gray-200 flex items-center justify-center h-full">
        <span className="text-gray-500">Image not available</span>
      </div>
    );
  }

  return (
    <Image
      src={getIllustrationUrl(filename)}
      alt={alt}
      width={width}
      height={height}
      onError={() => setError(true)}
    />
  );
}
```

---

## 📦 Export untuk Digunakan

```typescript
// lib/index.ts
export {
  getIllustrationUrl,
  getIllustrationThumbnailUrl,
  isSupabaseStorageUrl,
  extractFilenameFromUrl,
} from "./supabase-helper";
```

Lalu import di komponen:

```typescript
import { getIllustrationUrl } from "@/lib";
```

---

**Updated**: 2025-10-14
