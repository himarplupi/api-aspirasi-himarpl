# API Pagination - Quick Reference

## Endpoint dengan Pagination Support

### 1. `/api/aspirasi/aspirasimhs` (GET)

### 2. `/api/aspirasi/displayaspirasi` (GET)

---

## Cara Penggunaan

| Mode           | Parameter         | Contoh URL                                   | Keterangan                     |
| -------------- | ----------------- | -------------------------------------------- | ------------------------------ |
| **Semua Data** | -                 | `/api/aspirasi/aspirasimhs`                  | Ambil semua data tanpa batasan |
| **Pagination** | `param=start,end` | `/api/aspirasi/aspirasimhs?param=1,10`       | Ambil data posisi 1-10         |
| **Search**     | `param=keyword`   | `/api/aspirasi/aspirasimhs?param=pendidikan` | Cari berdasarkan keyword       |
| **By ID**      | `id=number`       | `/api/aspirasi/aspirasimhs?id=123`           | Ambil data spesifik by ID      |

---

## Format Response

```json
{
  "success": true,
  "count": 150,        // Total keseluruhan data
  "data": [...],       // Array data sesuai request
  "message": "..."
}
```

---

## Contoh Implementasi

### Fetch Halaman 1 (Data 1-10)

```javascript
fetch("/api/aspirasi/aspirasimhs?param=1,10", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Fetch Halaman 2 (Data 11-20)

```javascript
fetch("/api/aspirasi/aspirasimhs?param=11,20", {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Hitung Total Halaman

```javascript
const totalPages = Math.ceil(count / pageSize);
```

### Hitung Start-End untuk Halaman N

```javascript
const start = (page - 1) * pageSize + 1;
const end = page * pageSize;
```

---

## Dokumentasi Lengkap

📖 Lihat [ASPIRASI_PAGINATION_GUIDE.md](./ASPIRASI_PAGINATION_GUIDE.md) untuk dokumentasi lengkap dengan contoh kode frontend React.

---

## Catatan Penting

✅ **Wajib menggunakan JWT Token** di header Authorization  
✅ Data **diurutkan dari terbaru** (DESC by c_date)  
✅ Pagination dimulai dari **posisi 1**, bukan 0  
✅ Field `count` menunjukkan **total data**, bukan data per halaman  
✅ Token refresh tersedia di header `x-refreshed-token` jika ada

---

## Quick Example: Pagination Component

```javascript
async function getPage(token, page = 1, size = 10) {
  const start = (page - 1) * size + 1;
  const end = page * size;

  const res = await fetch(`/api/aspirasi/aspirasimhs?param=${start},${end}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  return {
    items: json.data,
    total: json.count,
    pages: Math.ceil(json.count / size),
    current: page,
  };
}

// Usage
const result = await getPage(myToken, 1, 10);
console.log(`Showing ${result.items.length} of ${result.total} items`);
console.log(`Page ${result.current} of ${result.pages}`);
```
