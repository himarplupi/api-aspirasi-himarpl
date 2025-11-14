# Panduan Penggunaan Pagination API Aspirasi

Dokumentasi ini menjelaskan cara menggunakan fitur pagination pada endpoint API Aspirasi.

## Endpoint

### GET `/api/aspirasi/aspirasimhs`

Endpoint ini mendukung beberapa mode pengambilan data:

1. **Ambil semua data** (tanpa pagination)
2. **Ambil data dengan pagination** (range tertentu)
3. **Cari data berdasarkan keyword**
4. **Ambil data berdasarkan ID**

---

## 1. Ambil Semua Data

Mengambil seluruh data aspirasi tanpa batasan.

### Request

```http
GET /api/aspirasi/aspirasimhs
Authorization: Bearer <your_jwt_token>
```

### Response

```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id_aspirasi": 1,
      "aspirasi": "Contoh aspirasi",
      "penulis": "Anonymous",
      "kategori": "hima",
      "c_date": "2025-01-01T00:00:00.000Z"
    }
    // ... data lainnya
  ],
  "message": "Data aspirasi berhasil diambil"
}
```

---

## 2. Pagination (Range Data)

Mengambil data dalam rentang tertentu menggunakan parameter `param` dengan format `start,end`.

### Cara Kerja

- `start`: Posisi data awal (dimulai dari 1)
- `end`: Posisi data akhir
- Data diurutkan berdasarkan tanggal terbaru (`c_date DESC`)

### Request

**Contoh: Ambil data ke-1 sampai ke-10**

```http
GET /api/aspirasi/aspirasimhs?param=1,10
Authorization: Bearer <your_jwt_token>
```

**Contoh: Ambil data ke-11 sampai ke-20**

```http
GET /api/aspirasi/aspirasimhs?param=11,20
Authorization: Bearer <your_jwt_token>
```

### Response

```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id_aspirasi": 150,
      "aspirasi": "Aspirasi terbaru",
      "penulis": "John Doe",
      "kategori": "prodi",
      "c_date": "2025-11-08T10:30:00.000Z"
    }
    // ... 9 data lainnya (total 10 data)
  ],
  "message": "Data aspirasi berhasil diambil"
}
```

**Catatan:**

- `count` menampilkan total keseluruhan data (150), bukan jumlah data di halaman saat ini
- `data` berisi array sesuai rentang yang diminta (10 data)

---

## 3. Pencarian dengan Keyword

Mencari aspirasi berdasarkan kata kunci yang terdapat dalam isi aspirasi.

### Request

```http
GET /api/aspirasi/aspirasimhs?param=pendidikan
Authorization: Bearer <your_jwt_token>
```

### Response

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id_aspirasi": 45,
      "aspirasi": "Meningkatkan kualitas pendidikan...",
      "penulis": "Anonymous",
      "kategori": "prodi",
      "c_date": "2025-10-15T08:00:00.000Z"
    }
    // ... hasil pencarian lainnya
  ],
  "message": "Data aspirasi berhasil diambil"
}
```

**Catatan:**

- Pencarian case-insensitive
- Mencari substring di kolom `aspirasi`
- `count` menampilkan jumlah hasil pencarian

---

## 4. Ambil Data Berdasarkan ID

Mengambil satu data aspirasi spesifik berdasarkan ID.

### Request

```http
GET /api/aspirasi/aspirasimhs?id=123
Authorization: Bearer <your_jwt_token>
```

### Response Success

```json
{
  "success": true,
  "data": {
    "id_aspirasi": 123,
    "aspirasi": "Contoh aspirasi spesifik",
    "penulis": "Jane Doe",
    "kategori": "hima",
    "c_date": "2025-11-01T12:00:00.000Z"
  },
  "message": "Data aspirasi berhasil diambil"
}
```

### Response Not Found

```json
{
  "success": false,
  "error": "Aspirasi tidak ditemukan"
}
```

---

## Contoh Implementasi Frontend

### JavaScript/TypeScript

```javascript
// 1. Ambil semua data
async function getAllAspirasi(token) {
  const response = await fetch("/api/aspirasi/aspirasimhs", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

// 2. Pagination - Ambil halaman tertentu
async function getAspirasiPage(token, page, pageSize = 10) {
  const start = (page - 1) * pageSize + 1;
  const end = page * pageSize;

  const response = await fetch(`/api/aspirasi/aspirasimhs?param=${start},${end}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  return {
    data: result.data,
    totalCount: result.count,
    totalPages: Math.ceil(result.count / pageSize),
    currentPage: page,
  };
}

// 3. Pencarian
async function searchAspirasi(token, keyword) {
  const response = await fetch(`/api/aspirasi/aspirasimhs?param=${encodeURIComponent(keyword)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

// 4. Get by ID
async function getAspirasiById(token, id) {
  const response = await fetch(`/api/aspirasi/aspirasimhs?id=${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}
```

### React Example dengan Pagination

```jsx
import { useState, useEffect } from "react";

function AspirasiList() {
  const [aspirasi, setAspirasi] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const fetchPage = async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const start = (page - 1) * pageSize + 1;
      const end = page * pageSize;

      const response = await fetch(`/api/aspirasi/aspirasimhs?param=${start},${end}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        setAspirasi(result.data);
        setTotalPages(Math.ceil(result.count / pageSize));
      }
    } catch (error) {
      console.error("Error fetching aspirasi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage]);

  return (
    <div>
      <h1>Daftar Aspirasi</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul>
            {aspirasi.map((item) => (
              <li key={item.id_aspirasi}>
                <strong>{item.penulis || "Anonymous"}</strong>: {item.aspirasi}
                <br />
                <small>
                  Kategori: {item.kategori} | {item.c_date}
                </small>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span>
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AspirasiList;
```

---

## Format Response

Semua response mengikuti struktur berikut:

### Success Response

```json
{
  "success": true,
  "count": <number>,
  "data": <array | object>,
  "message": "Data aspirasi berhasil diambil"
}
```

### Error Response

```json
{
  "success": false,
  "error": "<error message>",
  "details": "<optional error details>"
}
```

---

## Status Codes

- `200` - Success
- `400` - Bad Request (ID tidak valid, dll)
- `401` - Unauthorized (Token tidak valid/tidak ada)
- `404` - Not Found (Data tidak ditemukan)
- `500` - Internal Server Error

---

## Tips Penggunaan

### 1. Menghitung Total Halaman

```javascript
const totalPages = Math.ceil(totalCount / pageSize);
```

### 2. Menghitung Start dan End untuk Halaman

```javascript
const page = 3;
const pageSize = 10;
const start = (page - 1) * pageSize + 1; // 21
const end = page * pageSize; // 30
```

### 3. Token Refresh

Jika server mengembalikan token baru, akan ada di header response:

```javascript
const newToken = response.headers.get("x-refreshed-token");
if (newToken) {
  // Simpan token baru
  localStorage.setItem("token", newToken);
}
```

### 4. Kombinasi Pagination dengan Filter

Untuk implementasi yang lebih kompleks, pertimbangkan untuk:

1. Gunakan pagination untuk menampilkan data per halaman
2. Gunakan search untuk filter berdasarkan keyword
3. Gunakan get by ID untuk detail data spesifik

---

## Pertanyaan Umum (FAQ)

**Q: Apakah parameter `param` case-sensitive untuk pencarian?**  
A: Tidak, pencarian menggunakan LIKE yang case-insensitive.

**Q: Berapa maksimal data yang bisa diambil dengan pagination?**  
A: Tidak ada batasan hard limit, tapi disarankan menggunakan pageSize 10-50 untuk performa optimal.

**Q: Apakah bisa menggunakan pagination dan search bersamaan?**  
A: Tidak secara langsung. Parameter `param` hanya bisa digunakan untuk salah satu: pagination (format `start,end`) atau search (keyword).

**Q: Bagaimana jika `start` lebih besar dari total data?**  
A: API akan mengembalikan array kosong dengan count total yang ada.

**Q: Apakah data diurutkan?**  
A: Ya, data selalu diurutkan berdasarkan `c_date` (tanggal dibuat) secara descending (terbaru ke lama).

---

## Changelog

### v1.0.0 (November 2025)

- ✅ Tambah dukungan pagination dengan format `start,end`
- ✅ Tambah dukungan pencarian dengan keyword
- ✅ Tambah field `count` untuk total data
- ✅ Konsistensi response format dengan endpoint displayaspirasi

---

## Support

Jika ada pertanyaan atau masalah, silakan hubungi tim development atau buat issue di repository.
