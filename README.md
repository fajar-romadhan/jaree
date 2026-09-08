# JAREE — Billing & Subscription Management System

<div align="center">

![JAREE Brand](https://img.shields.io/badge/Brand-JAREE-4F7BAE?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20Live-black?style=for-the-badge&logo=vercel)
![Cloud Database](https://img.shields.io/badge/Database-Firebase%20Firestore-FFA611?style=for-the-badge&logo=firebase)
![Email Gateway](https://img.shields.io/badge/Email-EmailJS%20Zero--Backend-EA4335?style=for-the-badge&logo=gmail)
![Architecture](https://img.shields.io/badge/Architecture-Client--Centric%20SPA-0ea5e9?style=for-the-badge)

<br>

**A modern, minimalist, and ultra-reliable client billing and subscription management platform built for digital IT agencies, cloud storage resellers, and software solutions.**

[🌐 Buka Aplikasi Live (Production)](https://jaree-beta.vercel.app) · [📑 Master Blueprint](GEMINI.md) · [📝 Rekam Jejak Pengerjaan](PROGRESS.md)

</div>

---

## 📌 Ringkasan Eksekutif (Executive Summary)

**JAREE** adalah sistem manajemen tagihan dan pemantauan langganan klien (*client subscription & billing management*) yang dirancang dengan arsitektur mandiri (*Zero Server Cost, Client-Centric*). 

Sistem ini menghilangkan seluruh kerepotan pembuatan invoice manual, mencegah kelupaan menagih klien sebelum masa aktif habis, mengotomatiskan penerbitan kuitansi resmi, serta menyinkronkan seluruh data transaksi secara *real-time* ke semua perangkat (Laptop, Komputer, HP Android, iPhone) melalui **Google Firebase Cloud Firestore**.

---

## ✨ Fitur Unggulan Sistem

### 1. 📑 Mesin Invoice Resmi Standar JAREE (`INV-2026-0803-01`)
* **Desain Presisi Slate Blue `#4F7BAE`**: Format dokumen invoice digital minimalis dan elegan, mereplikasi standar resmi JAREE.
* **Cap Stempel Korporat Autentik (Double-Ring Corporate Stamp)**:
  * Dilengkapi cap stempel ganda melingkar (*★ JAREE IT ECOSYSTEM ★* & *★ FAJAR ROMADHAN · SAH ★*) berotasi `-12°`.
  * Menggunakan teknologi **High-Resolution Canvas 2D Rasterization** (`generateStampDataUrl`) yang menghasilkan gambar PNG murni beresolusi tinggi, menjamin stempel muncul **100% tajam dan tidak hilang** pada file PDF hasil unduhan maupun cetak fisik.
* **1-Klik Unduh & Cetak**: Tombol langsung `[Unduh PDF]` via `html2pdf.js` dan `[Cetak / Simpan PDF]` via dialog cetak browser dengan penamaan file standar otomatis (*contoh: `INV-2026-0909-01 - Dimas Imansyah.pdf`*).

### 2. ☁️ Sinkronisasi Cloud Real-Time 24/7 (Google Firebase Firestore)
* **Arsitektur Dual-Layer**:
  * **Layer 1 (LocalStorage)**: Cache lokal berkecepatan tinggi, memuat aplikasi instan dalam 0.1 detik dan tetap berfungsi saat offline.
  * **Layer 2 (Cloud Firestore)**: Sinkronisasi *real-time* via `onSnapshot` listener.
* **Multi-Perangkat & Multi-Akun**: Setiap transaksi baru, pembaruan periode, atau konfirmasi lunas otomatis tersinkronisasi dalam waktu < 500 ms ke seluruh akun Chrome, laptop, dan HP tanpa perlu ekspor-impor file manual.
* **100% Gratis Selamanya**: Berjalan di atas paket Google Cloud Firebase Spark Tier (kuota gratis 50.000 pembacaan dan 20.000 penulisan per hari).

### 3. ⚡ Model Pesanan Mandiri & Shortcut "Order Lagi"
* **Konsep Mandiri (*Standalone Order Model*)**: Setiap pesanan diproses 1 kali dan berdiri sendiri dengan nomor invoice, nominal, dan periode tanggalnya masing-masing.
* **Shortcut "Order Lagi"**: Tombol instan di setiap baris tabel untuk membuat pesanan periode berikutnya dari klien yang sama. Tanggal mulai otomatis melanjutkan dari tanggal berakhir sebelumnya (+1 bulan).

### 4. ✉️ Pengiriman Email Cerdas (Zero-Backend)
* **Smart Content Adaptation**:
  * **Status Lunas (`paid`)**: Menghasilkan **Bukti Pembayaran / Kwitansi Resmi**. Instruksi transfer dan kalimat penagihan otomatis dihilangkan 100%.
  * **Status Belum Lunas (`unpaid`)**: Menghasilkan **Tagihan Invoice / Pengingat Jatuh Tempo (H-1)** lengkap dengan rincian rekening SeaBank dan batas waktu pembayaran.
* **Dual Dispatch**: Pengiriman otomatis di latar belakang via **EmailJS** atau 1-klik buka draf di **Gmail Web Compose** (`mail.google.com`).

### 5. 💬 Integrasi WhatsApp Business Ready
* Generator pesan WhatsApp siap kirim dengan tata bahasa Indonesia formal, santun, dan jelas.
* Dilengkapi tautan kontak resmi WhatsApp Founder: `+62 857-8365-6335`.

### 6. 🔒 Keamanan & Privasi Tingkat Tinggi (Founder-Only)
* Sistem ditujukan khusus untuk Founder (**Fajar Romadhan**).
* Dilengkapi fitur kunci layar (*Master Passcode Protection*) opsional yang dapat diaktifkan kapan saja di menu Pengaturan.

---

## 🛠️ Arsitektur & Tumpukan Teknologi (Tech Stack)

```
┌─────────────────────────────────────────────────────────────┐
│                       JAREE ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend Core   │ HTML5 Semantik, Modern Vanilla CSS3, JS  │
│  Typography      │ Plus Jakarta Sans, Inter (Google Fonts)  │
│  Iconography     │ Feather Icons CDN                        │
│  PDF Generator   │ HTML5 Canvas 2D + html2pdf.js + jsPDF    │
│  Cloud Database  │ Google Firebase Firestore (Compat SDK)   │
│  Email Gateway   │ EmailJS SDK + Gmail Web Deep Link        │
│  Hosting / CI-CD │ Vercel Production + GitHub Auto-Deploy   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Direktori Repositori

```text
E:\PROJECT\JAREE/
├── .agents/                    # Konfigurasi & aturan otomatis AI Agent Antigravity
│   └── rules/
│       └── progress.md         # Aturan auto-context & referensi SSOT
├── css/
│   ├── invoice.css             # Styling lembar dokumen invoice resmi & print stylesheet
│   └── style.css               # Styling dashboard admin modern (Light Slate Theme)
├── docs/                       # Dokumentasi spesifikasi arsitektur & arsip referensi
│   ├── superpowers/specs/      # Dokumen spesifikasi model pesanan mandiri
│   └── INV-2026-0803-01.pdf    # Dokumen fisik referensi resmi standar JAREE
├── js/
│   ├── app.js                  # Controller utama dashboard, view switching & state machine
│   ├── automation.js           # Mesin penyusun template email & link pesan WhatsApp
│   ├── cloud-sync.js           # Mesin sinkronisasi real-time Google Firebase Firestore
│   ├── db.js                   # Lapisan persistensi data (LocalStorage & auto-migrasi)
│   ├── email.min.js            # Library lokal EmailJS browser SDK
│   ├── html2pdf.bundle.min.js  # Library lokal konversi DOM ke file PDF
│   └── invoice.js              # Mesin pembuat invoice resmi & Canvas stamp generator
├── .gitignore                  # Filter pengecualian file sistem, log, dan artefak build
├── AGENTS.md                   # Instruksi pengembang & AI pair programming
├── GEMINI.md                   # Master Blueprint & Single Source of Truth (SSOT)
├── index.html                  # Shell aplikasi Single Page Application (SPA)
├── PROGRESS.md                 # Jurnal kerja lengkap, riwayat audit bug & post-mortem
└── README.md                   # Dokumentasi resmi repositori proyek
```

---

## 🚀 Panduan Menjalankan Secara Lokal (Quickstart)

Aplikasi ini tidak memerlukan instalasi `npm`, `node_modules`, ataupun konfigurasi kompilasi yang rumit:

### Opsi A: Jalankan Menggunakan Python (Disarankan)
```bash
# Buka terminal pada folder proyek
cd E:/PROJECT/JAREE

# Jalankan server lokal
python -m http.server 5500
```
Buka browser pada alamat: **`http://localhost:5500`**.

### Opsi B: Buka File Langsung
Klik dua kali file `index.html` pada File Explorer untuk membukanya langsung di Google Chrome, Microsoft Edge, atau browser modern lainnya.

---

## 🌐 Alur Deployment Otomatis (CI/CD)

Repositori ini terhubung langsung ke **Vercel** dengan continuous deployment:
* **Branch Utama**: `main`
* **Trigger**: Setiap `git push origin main` akan otomatis memicu proses *build* dan *deployment* ke server produksi Vercel dalam waktu < 15 detik.
* **URL Produksi**: `https://jaree-beta.vercel.app`

---

## 📋 Informasi Kontak & Legalitas Brand

* **Nama Brand**: JAREE (Digital IT Solutions & Cloud Service)
* **Founder / Owner**: Fajar Romadhan
* **Email Resmi**: [fajaromadhan@gmail.com](mailto:fajaromadhan@gmail.com)
* **WhatsApp Resmi**: [+62 857-8365-6335](https://wa.me/6285783656335)
* **Rekening Resmi**: SeaBank — `9014-4868-3446` a.n. Fajar Romadhan
* **Nomor Invoice Rujukan**: `INV-2026-0803-01`

---

<div align="center">

*Dokumentasi ini dikelola dan diperbarui secara berkala oleh tim pengembang JAREE IT Ecosystem.*  
**© 2026 JAREE · Fajar Romadhan. Seluruh hak cipta dilindungi undang-undang.**

</div>
