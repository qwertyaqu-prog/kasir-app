# 🏪 KASIR PRO - Professional POS System

**Aplikasi Kasir Profesional** berbasis web dengan fitur lengkap untuk manajemen toko, transaksi, dan laporan keuangan.

---

## ✨ Fitur Utama

| Fitur | Status | Keterangan |
|-------|--------|------------|
| 🖥️ **POS (Point of Sale)** | ✅ | Transaksi kasir, keranjang belanja, cetak struk |
| 📊 **Dashboard** | ✅ | Ringkasan penjualan, grafik bulanan, stok menipis |
| 📦 **Manajemen Produk** | ✅ | CRUD produk, harga jual, harga modal (cost), stok, barcode |
| 📜 **History Transaksi** | ✅ | Lihat semua transaksi, filter tanggal, cetak ulang struk |
| 📈 **Laporan Penjualan** | ✅ | Laporan harian, top produk, rata-rata transaksi (Admin only) |
| 💰 **Profit & Loss** | ✅ | Laba/rugi per periode, margin keuntungan, inventory value (Admin only) |
| 👥 **Manajemen User** | ✅ | Tambah/edit/hapus kasir, reset password, aktif/nonaktif (Admin only) |
| 🌐 **Akses LAN** | ✅ | Bisa diakses dari komputer/HP dalam 1 jaringan |
| 📱 **Mobile Responsive** | ✅ | Tampilan menyesuaikan layar HP |

---

## 🚀 Teknologi yang Digunakan

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **SQLite3** - Database ringan (file-based)
- **JWT** - Autentikasi token
- **bcryptjs** - Enkripsi password

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **React Hot Toast** - Notifikasi
- **React Icons** - Icon library
- **Recharts** - Grafik dashboard

---

### 📁 Struktur Folder
- kasir-app/
- ├── backend/
- │ ├── database/
- │ │ └── kasir.sqlite # Database file
- │ ├── src/
- │ │ ├── database/
- │ │ │ └── init.js # Inisialisasi DB
- │ │ ├── middleware/
- │ │ │ └── auth.js # Autentikasi
- │ │ ├── routes/
- │ │ │ ├── auth.js # Login
- │ │ │ ├── users.js # Manajemen user
- │ │ │ ├── categories.js # Kategori produk
- │ │ │ ├── products.js # CRUD produk
- │ │ │ ├── transactions.js # Transaksi
- │ │ │ └── reports.js # Laporan & laba/rugi
- │ │ └── server.js # Entry point backend
- │ └── package.json
- ├── frontend/
- │ ├── public/
- │ ├── src/
- │ │ ├── components/
- │ │ │ ├── Layout.jsx # Layout utama
- │ │ │ └── PrivateRoute.jsx
- │ │ ├── pages/
- │ │ │ ├── Login.jsx
- │ │ │ ├── Dashboard.jsx
- │ │ │ ├── POS.jsx
- │ │ │ ├── Products.jsx
- │ │ │ ├── Transactions.jsx
- │ │ │ ├── Reports.jsx
- │ │ │ ├── ProfitLoss.jsx
- │ │ │ └── Users.jsx
- │ │ ├── stores/
- │ │ │ └── authStore.js
- │ │ ├── App.jsx
- │ │ ├── main.jsx
- │ │ └── index.css
- │ ├── index.html
- │ ├── package.json
- │ ├── vite.config.js
- │ └── tailwind.config.js
- ├── start.bat # Jalankan aplikasi (Windows)
- ├── stop.bat # Stop semua server
- └── README.md # Dokumentasi ini

---

## 🔧 Instalasi

### Prasyarat
- **Node.js** (v16 atau lebih baru)
- **npm** (biasanya sudah termasuk Node.js)

### Langkah Instalasi

## 1. Clone atau download project
```bash
cd C:\Users\Admin\Documents\kasir-app
```

## 2. Install dependencies backend
```bash
cd backend
npm install
```

## 3. Install dependencies frontend
```bash
cd ../frontend
npm install
```

## 4. Jalankan aplikasi
Kembali ke terminal 1 (backend)
```bash
cd ../backend
node src/server.js
```

## Terminal 2 (frontend)
```bash
cd ../frontend
npm run dev
```

Atau Gunakan Batch File (Windows)
Double click start.bat - Jalankan semua server otomatis
Double click stop.bat - Stop semua server

## 🎮 Cara Menggunakan
Login
- Role	Username	Password
- Admin	admin	admin123
- Kasir	kasir1	kasir123

## Menu Aplikasi
Menu	Akses	Fungsi
POS	Admin & Kasir	Transaksi penjualan, tambah ke keranjang, cetak struk
Dashboard	Admin & Kasir	Lihat ringkasan penjualan hari ini
Products	Admin & Kasir	Kelola produk (tambah, edit, hapus)
Transactions	Admin & Kasir	Lihat history transaksi, cetak ulang struk
Reports	Admin saja	Laporan harian, stok menipis
Profit & Loss	Admin saja	Laporan laba/rugi, hitung keuntungan
Users	Admin saja	Kelola user kasir

## 💰 Rumus Keuangan yang Digunakan
### Laba/Rugi
- Total Sales (Omzet)     = Σ(Harga Jual × Quantity)
- Total Cost (HPP)        = Σ(Harga Modal × Quantity)
- Gross Profit (Laba)     = Total Sales - Total Cost
- Profit Margin           = (Laba ÷ Total Sales) × 100%

### Nilai Stok
- Inventory Selling Value = Σ(Harga Jual × Stok)
- Inventory Cost Value    = Σ(Harga Modal × Stok)
- Potential Profit        = Selling Value - Cost Value

## 🌐 Akses dari Jaringan Lokal (LAN)
Cari IP komputer server:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
Contoh IP: 192.168.1.100
```

Akses dari komputer/HP lain dalam 1 WiFi:
http://192.168.1.100:5173
Pastikan firewall mengizinkan port 3000 dan 5173

## 📱 Akses dari HP
Pastikan HP dan komputer dalam 1 WiFi

Buka browser HP

Ketik: http://[IP-KOMPUTER]:5173

Login dengan akun yang sudah dibuat

Tips: Aplikasi sudah responsive untuk layar HP

## 🖨️ Cetak Struk
Default: Menggunakan window.print() browser

Untuk thermal printer: Dapat diintegrasikan dengan library ESC/POS

Reprint: Buka menu Transactions → klik ikon printer

## 📊 Contoh Laporan
Profit & Loss Report
- ╔══════════════════════════════════════════════╗
- ║  PERIODE: 1 Jan 2024 - 31 Jan 2024           ║
- ╠══════════════════════════════════════════════╣
- ║  Total Sales (Omzet)     Rp 15.000.000       ║
- ║  Total Cost (HPP)        Rp 11.500.000       ║
- ║  Gross Profit (Laba)     Rp  3.500.000       ║
- ║  Profit Margin                 23.3%         ║
- ╚══════════════════════════════════════════════╝
- Stock Alert Report
- ╔══════════════════════════════════════════════╗
- ║  Low Stock Products: 3                       ║
- ╠══════════════════════════════════════════════╣
- ║  Indomie Goreng   Stok: 2  (Min: 5)          ║
- ║  Aqua 600ml       Stok: 3  (Min: 5)          ║
- ║  Gula Pasir       Stok: 4  (Min: 5)          ║
- ╚══════════════════════════════════════════════╝
## 🛠️ Troubleshooting
Error: SQLITE_ERROR: table products has no column named cost_price
Solusi: Hapus file backend/database/kasir.sqlite lalu restart backend

Error: 401 Unauthorized
Solusi: Login ulang atau cek token di localStorage

Tidak bisa akses dari HP
Solusi:

Cek IP komputer dengan ipconfig

Matikan firewall sementara untuk test

Pastikan HP dan komputer 1 WiFi

Tampilan berantakan di HP
Solusi: Refresh halaman atau clear cache browser

## 📦 Backup Database
Database berada di:

backend/database/kasir.sqlite
Cara backup: Copy file tersebut ke folder aman

Restore: Copy file backup ke lokasi semula

## 🔐 Keamanan
Password dienkripsi dengan bcrypt

Autentikasi menggunakan JWT token

Role-based access control (Admin vs Kasir)

Token expires dalam 24 jam

## 📝 Todo / Pengembangan Selanjutnya
Cetak ke thermal printer (ESC/POS)

Laporan laba/rugi dengan grafik

Export laporan ke Excel/PDF

Diskon per produk & per transaksi

Manajemen member/poin

Backup otomatis database

Mode offline dengan IndexedDB

Aplikasi desktop dengan Electron

## 👨‍💻 Developer
Dibuat untuk Aplikasi Kasir Profesional - Full Stack POS System

## 📄 Lisensi
MIT License - Bebas digunakan, dimodifikasi, dan didistribusikan.

## 🙏 Terima Kasih
Terima kasih telah menggunakan KASIR PRO!

Jika ada pertanyaan atau saran, silakan hubungi developer.

© 2024 KASIR PRO - Professional POS System
