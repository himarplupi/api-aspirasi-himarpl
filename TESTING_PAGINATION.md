# Testing Pagination dengan cURL/PowerShell

## PowerShell Commands

### 1. Ambil Semua Data

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/aspirasi/aspirasimhs" -Headers $headers -Method Get
```

### 2. Pagination - Halaman 1 (Data 1-10)

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/aspirasi/aspirasimhs?param=1,10" -Headers $headers -Method Get
```

### 3. Pagination - Halaman 2 (Data 11-20)

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/aspirasi/aspirasimhs?param=11,20" -Headers $headers -Method Get
```

### 4. Search dengan Keyword

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/aspirasi/aspirasimhs?param=pendidikan" -Headers $headers -Method Get
```

### 5. Get by ID

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/aspirasi/aspirasimhs?id=1" -Headers $headers -Method Get
```

---

## cURL Commands (untuk Git Bash atau WSL)

### 1. Ambil Semua Data

```bash
curl -X GET "http://localhost:3000/api/aspirasi/aspirasimhs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 2. Pagination - Halaman 1 (Data 1-10)

```bash
curl -X GET "http://localhost:3000/api/aspirasi/aspirasimhs?param=1,10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 3. Pagination - Halaman 2 (Data 11-20)

```bash
curl -X GET "http://localhost:3000/api/aspirasi/aspirasimhs?param=11,20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 4. Search dengan Keyword

```bash
curl -X GET "http://localhost:3000/api/aspirasi/aspirasimhs?param=pendidikan" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 5. Get by ID

```bash
curl -X GET "http://localhost:3000/api/aspirasi/aspirasimhs?id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Testing dengan Postman

### Setup

1. Buka Postman
2. Buat New Request (GET)
3. Set URL ke endpoint yang ingin ditest

### Headers

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### Test Cases

#### Test 1: All Data

- **URL**: `http://localhost:3000/api/aspirasi/aspirasimhs`
- **Expected**: Semua data aspirasi

#### Test 2: Pagination Page 1

- **URL**: `http://localhost:3000/api/aspirasi/aspirasimhs?param=1,10`
- **Expected**: 10 data pertama + total count

#### Test 3: Pagination Page 2

- **URL**: `http://localhost:3000/api/aspirasi/aspirasimhs?param=11,20`
- **Expected**: 10 data selanjutnya + total count

#### Test 4: Search

- **URL**: `http://localhost:3000/api/aspirasi/aspirasimhs?param=mahasiswa`
- **Expected**: Data yang mengandung kata "mahasiswa"

#### Test 5: Get by ID

- **URL**: `http://localhost:3000/api/aspirasi/aspirasimhs?id=1`
- **Expected**: Satu data dengan id_aspirasi = 1

#### Test 6: Invalid ID

- **URL**: `http://localhost:3000/api/aspirasi/aspirasimhs?id=abc`
- **Expected**: Error 400 - ID tidak valid

#### Test 7: Without Token

- **URL**: `http://localhost:3000/api/aspirasi/aspirasimhs`
- **Headers**: (kosong atau tanpa Authorization)
- **Expected**: Error 401 - Token tidak ditemukan

---

## Expected Response Format

### Success Response

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
  ],
  "message": "Data aspirasi berhasil diambil"
}
```

### Error Response (401 Unauthorized)

```json
{
  "success": false,
  "error": "Token tidak ditemukan di header"
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "ID aspirasi tidak valid"
}
```

### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Aspirasi tidak ditemukan"
}
```

---

## Testing Script (PowerShell)

Simpan script berikut sebagai `test-pagination.ps1`:

```powershell
# Configuration
$baseUrl = "http://localhost:3000/api/aspirasi/aspirasimhs"
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host "=== Testing Pagination API ===" -ForegroundColor Cyan

# Test 1: All Data
Write-Host "`n1. Testing: Get All Data" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri $baseUrl -Headers $headers -Method Get
    Write-Host "✓ Success: Got $($result.count) total records" -ForegroundColor Green
    Write-Host "  Data count: $($result.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Pagination Page 1
Write-Host "`n2. Testing: Pagination Page 1 (1-10)" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl?param=1,10" -Headers $headers -Method Get
    Write-Host "✓ Success: Total=$($result.count), Retrieved=$($result.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Pagination Page 2
Write-Host "`n3. Testing: Pagination Page 2 (11-20)" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl?param=11,20" -Headers $headers -Method Get
    Write-Host "✓ Success: Total=$($result.count), Retrieved=$($result.data.Count)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Search
Write-Host "`n4. Testing: Search with keyword" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl?param=mahasiswa" -Headers $headers -Method Get
    Write-Host "✓ Success: Found $($result.count) matching records" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get by ID
Write-Host "`n5. Testing: Get by ID" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl?id=1" -Headers $headers -Method Get
    Write-Host "✓ Success: Got record ID $($result.data.id_aspirasi)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Cyan
```

### Cara Menjalankan:

```powershell
# Ganti token terlebih dahulu
.\test-pagination.ps1
```

---

## Notes

- Ganti `YOUR_JWT_TOKEN_HERE` dengan token JWT yang valid
- Ganti `http://localhost:3000` dengan URL server yang sesuai
- Token bisa didapatkan dari login endpoint `/api/auth/login`
- Token akan expire sesuai konfigurasi, refresh jika diperlukan
