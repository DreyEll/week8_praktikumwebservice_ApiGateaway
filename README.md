# API Gateway Individu: Platform Tiket Event/Konser

Proyek praktikum individu yang mengambil konteks dari rancangan Platform Tiket Event/Konser: Event Service, Order Service, dan API Gateway.

## Struktur

```text
api-gateway-tiket-event/
├── gateway/gateway.js
├── service-event/server.js
├── service-event/package.json
├── service-order/server.js
├── service-order/package.json
├── test-rate-limit.js
├── package.json
└── README.md
```

## 1. Instalasi

Pastikan Node.js versi 18 atau lebih baru telah terpasang. Buka folder proyek di VS Code, kemudian jalankan di terminal:

```bash
npm install
npm install --prefix service-event
npm install --prefix service-order
```

## 2. Jalankan tiga proses

Buka tiga terminal di VS Code, semuanya dari folder utama proyek.

Terminal 1:
```bash
npm run service:event
```

Terminal 2:
```bash
npm run service:order
```

Terminal 3, atur API key dahulu.

Windows PowerShell:
```powershell
$env:API_KEY="TiketRahasia123"
```

macOS/Linux:
```bash
export API_KEY="TiketRahasia123"
```

Kemudian jalankan gateway:
```bash
npm run gateway
```

Gateway aktif pada `http://localhost:8080`. Jangan tutup ketiga terminal saat pengujian.

## 3. Pengujian Postman

| Tujuan | Method | URL | Header |
|---|---|---|---|
| Status Event Service | GET | `http://localhost:8080/events/` | Tidak perlu |
| Daftar event | GET | `http://localhost:8080/events/events` | Tidak perlu |
| Detail event | GET | `http://localhost:8080/events/events/1` | Tidak perlu |
| Daftar pesanan | GET | `http://localhost:8080/orders/orders` | `X-API-Key: TiketRahasia123` |
| Detail pesanan | GET | `http://localhost:8080/orders/orders/1001` | `X-API-Key: TiketRahasia123` |

### Uji API key

1. Kirim `GET http://localhost:8080/orders/orders` tanpa header `X-API-Key`. Hasil yang diharapkan: `401 Unauthorized`.
2. Tambahkan header `X-API-Key` dengan nilai `TiketRahasia123`. Hasil yang diharapkan: `200 OK`.
3. API key di Postman harus sama dengan nilai `API_KEY` pada terminal gateway.

Untuk membuat pesanan simulasi, kirim `POST http://localhost:8080/orders/orders` dengan header `X-API-Key` dan `Content-Type: application/json`. Body JSON:

```json
{
  "eventId": 1,
  "quantity": 2
}
```

Hasil yang diharapkan: `201 Created`. Data pesanan disimpan sementara di memori, sehingga akan kembali ke data awal saat service dimulai ulang.

## 4. Uji rate limiting

Jalankan setelah semua service aktif:

```bash
npm run test:rate
```

Script mengirim 30 request dengan cepat. Gateway membatasi hingga 20 request per 10 detik per IP. Biasanya request awal mendapat status `200`, lalu request yang melewati batas mendapat `429 Too Many Requests`. Jika tidak terlihat, tunggu lebih dari 10 detik lalu ulangi pengujian. Ambil screenshot terminal yang menunjukkan status normal dan 429.

## 5. Diagram arsitektur

```text
Browser / Postman
       |
       v
API Gateway :8080
  |-- Rate limit: 20 request / 10 detik / IP
  |-- /events/* --> Event Service :3000
  |-- /orders/* --> API key --> Order Service :3001
```

Prefix `/events` dan `/orders` dihapus sebelum request diteruskan. Contoh: `/events/events` dari gateway diteruskan ke Event Service sebagai `/events`.

## 6. Refleksi

API Gateway menyediakan satu alamat masuk bagi klien untuk mengakses Event Service dan Order Service. Gateway juga dapat menerapkan rate limiting dan pemeriksaan API key sebelum request diteruskan. Namun, jika gateway mati, klien tidak dapat mengakses kedua service melalui pintu masuk tersebut sampai gateway kembali aktif.

## 7. Checklist pengumpulan

- [ ] Repository berisi `gateway/gateway.js` dan `package.json`.
- [ ] Screenshot Postman menunjukkan Event Service dapat diakses lewat port 8080.
- [ ] Screenshot Postman menunjukkan Order Service memberikan 401 tanpa API key dan 200 dengan API key yang benar.
- [ ] Screenshot script rate limiting menunjukkan status 429.
- [ ] Diagram arsitektur dan refleksi singkat disertakan.

## Catatan penting

Service dalam folder ini adalah implementasi contoh untuk demonstrasi tugas individu, disesuaikan dengan rancangan Platform Tiket Event/Konser. Ini belum terhubung ke kode layanan atau database proyek kelompok yang sebenarnya. Dokumen rancangan menyebut GraphQL untuk katalog event dan OAuth2 untuk token pengguna; implementasi praktikum ini menggunakan endpoint Express sederhana dan API key untuk menunjukkan routing, rate limiting, serta pemeriksaan akses dasar sesuai latihan API Gateway. Jangan menyatakan OAuth2 atau GraphQL sudah diimplementasikan dalam kode ini.
