# JAREE IT ECOSYSTEM — MASTER SYSTEM BLUEPRINT & CONTEXT
> **PERINGATAN UNTUK SEMUA AI AGENT**:
> File ini adalah **Single Source of Truth (SSOT)** untuk proyek JAREE. Setiap sesi AI baru, subagent, atau developer WAJIB membaca dan mematuhi seluruh arsitektur, prinsip bisnis, skema data, dan standar desain yang tercantum di sini sebelum melakukan perubahan apapun.

---

## 1. VISI & BRAND EVOLUTION (JAREE)

### 1.1 Identitas Brand
- **Brand Name**: JAREE
- **Owner / Founder**: Fajar Romadhan
- **Official Contact**: `fajaromadhan@gmail.com`
- **Official WhatsApp**: `0857-8365-6335` (`6285783656335`)
- **Official Bank**: SeaBank — `9014-4868-3446` a.n. Fajar Romadhan
- **Brand Colors**: 
  - Primary Accent: Slate Blue `#4F7BAE` (Signature Slate Blue, Warna Banner Total Tagihan Invoice)
  - Theme Style: Simple, Minimalist & Elegant Light Slate
  - Background Base: `#f8fafc` / Surface: `#ffffff`
  - Border: `#e2e8f0` / Text Primary: `#0f172a` / Text Secondary: `#475569` / Text Muted: `#94a3b8`
- **EmailJS Gateway (100% Free Zero-Backend)**:
  - Service ID: `service_qz3z9jq`
  - Template ID: `template_277378i`
  - Public Key: `33YWwbogyPk8u4NFH`
  - Fallback: Direct 1-Click Gmail Web Compose deep link (`mail.google.com`)
- **Cloud Database Realtime Sync Gateway (Google Firebase Firestore — 100% Free)**:
  - Project ID: `jaree-946de`
  - Auth Domain: `jaree-946de.firebaseapp.com`
  - Storage Bucket: `jaree-946de.firebasestorage.app`
  - API Key: `AIzaSyBQOb4otLRsETQgTCCppcQGauYtuVTBACc`
  - App ID: `1:347412861890:web:083acb53483e0bbc177c5b`
  - Measurement ID: `G-4D8203SF90`
  - Collection: `jaree_db` / Doc: `current` (Sinkronisasi live 24/7 di seluruh akun Chrome & perangkat Founder)

### 1.2 Tahapan Evolusi Bisnis (Roadmap)
1. **Fase 1 (Current / Immediate Need)**: 
   - Solusi spesifik: Reseller & Manajemen Langganan Penyimpanan Drive 5 TB (Rp 150.000 / bulan).
   - Problem solved: Menghilangkan pembuatan invoice manual, mencegah kelupaan tagih ke klien, sistem peringatan otomatis H-1 sebelum langganan habis.
2. **Fase 2 (Multi-Service Digital Agency)**:
   - Integrasi produk digital lain: Undangan Digital (sejalan dengan ekosistem `E:/PROJECT/UNDANGAN DIGITAL`), domain & hosting, cloud backup, lisensi software (Office 365, Canva, Workspace).
3. **Fase 3 (Full IT Solution & SaaS)**:
   - Sistem tagihan multi-tenant, dashboard client portal (klien bisa login cek invoice dan bayar mandiri), integrasi payment gateway (QRIS / Midtrans / Xendit), integrasi WhatsApp Gateway resmi (Fonnte / Waha).

### 1.3 Akses Khusus & Privasi (Founder-Only Security)
- **Akses Eksklusif**: Sistem ini secara ketat HANYA digunakan oleh Founder JAREE (**Fajar Romadhan**). Tidak dibuka untuk publik atau multi-user sembarangan.
- **Proteksi PIN Master (Opsional)**: Sistem mendukung Master Passcode Lock (Default: `260803`), namun dinonaktifkan secara default agar Founder dapat langsung mengakses konsol tanpa hambatan (dapat diaktifkan kapan saja melalui menu Pengaturan).
- **Kerahasiaan Data**: Seluruh data tersimpan secara lokal dan privat pada mesin/browser pemilik tanpa pengiriman data ke server pihak ketiga.

### 1.4 Baseline Klien & Invoice Aktif
- **Klien Baseline**: Dimas Imansyah (`frekuensipicture@gmail.com`)
- **Layanan**: Penyimpanan Drive 5 TB (Rp 150.000 / bulan)
- **Nomor Invoice Rujukan**: `INV-2026-0803-01`
- **Status Transaksi**: **Selesai (Lunas)** — Periode 3 Agustus 2026 – 3 September 2026 telah terbayar lunas. Penambahan periode berikutnya menggunakan tombol shortcut "Order Lagi".

---

## 2. ARSITEKTUR FUNDAMENTAL SISTEM

### 2.1 Arsitektur Aplikasi (Client-Centric Zero-Cost Architecture)
Sistem dirancang mandiri, ringan, tanpa biaya sewa server bulanan yang membebani di tahap awal, namun siap di-upgrade:
- **Frontend Core**: SPA (Single Page Application) Vanilla JS + HTML5 + CSS3 Modern (Glassmorphism, Dark Mode, Micro-interactions).
- **Iconography & Fonts**: Feather Icons + Inter (Google Fonts).
- **Data Persistence**:
  - Primary: Browser LocalStorage & IndexedDB.
  - Redundancy / Anti-Data-Loss: One-Click JSON Backup & Auto-Snapshot export berkala.
- **PDF Engine**: Client-side Canvas/DOM to PDF (`html2pdf.js` / native print stylesheet pixel-perfect) mereplikasi format `INV-2026-0803-01`.
- **Notification Engine**:
  - Email: EmailJS SDK (Free tier 200 email/bulan, zero backend).
  - WhatsApp: Direct WhatsApp Click-to-Chat deep link generator dengan teks template otomatis siap kirim (kritis untuk kultur Indonesia).

---

## 3. MASTER DATA SCHEMAS

### 3.1 Entity: Client (`clients`)
```typescript
interface Client {
  id: string;              // Format: CLT-YYYYMMDD-XXX
  name: string;            // Nama lengkap klien
  email: string;           // Email klien (untuk invoice & reminder)
  phone: string;           // No. WhatsApp (contoh: 628123456789)
  type: 'personal' | 'business';
  company?: string;
  notes?: string;
  createdAt: string;       // ISO Date
  updatedAt: string;
}
```

### 3.2 Entity: Service (`services`)
```typescript
interface Service {
  id: string;              // Format: SVC-XXX
  code: string;            // e.g. "GDRIVE-5TB"
  name: string;            // "Penyimpanan Drive 5 TB"
  description: string;     // "Penyimpanan Drive 5 TB · 1 akun · berbayar per bulan"
  category: 'storage' | 'invitation' | 'software' | 'service';
  defaultPrice: number;    // e.g. 150000
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  isActive: boolean;
}
```

### 3.3 Entity: Subscription (`subscriptions`)
```typescript
interface Subscription {
  id: string;              // Format: SUB-YYYYMMDD-XXX
  clientId: string;        // Relasi ke Client
  serviceId: string;       // Relasi ke Service
  serviceSnapshot: {       // Snapshot jika harga/nama master service berubah
    name: string;
    description: string;
    price: number;
  };
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD (Tanggal jatuh tempo periode ini)
  billingCycle: 'monthly' | 'yearly';
  price: number;
  status: 'active' | 'expiring_soon' | 'critical_h1' | 'expired' | 'grace_period' | 'cancelled';
  remindersSent: {
    h7?: string | null;    // Timestamp pengiriman jika sudah kirim
    h3?: string | null;
    h1?: string | null;    // Paling krusial
    h0?: string | null;
    overdue?: string | null;
  };
  lastInvoiceId?: string;  // ID invoice periode terakhir
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3.4 Entity: Invoice (`invoices`)
Replikasi dari spesifikasi standar JAREE (`INV-2026-0803-01`):
```typescript
interface Invoice {
  id: string;              // Unique ID internal
  invoiceNumber: string;   // Format resmi: INV-YYYY-MMDD-NN (e.g. INV-2026-0803-01)
  subscriptionId: string;
  clientId: string;
  clientSnapshot: {
    name: string;
    email: string;
    phone: string;
  };
  issueDate: string;       // YYYY-MM-DD
  dueDate: string;         // YYYY-MM-DD
  servicePeriod: {
    from: string;          // YYYY-MM-DD
    to: string;            // YYYY-MM-DD
  };
  items: Array<{
    description: string;   // "Penyimpanan Drive 5 TB · 1 akun · berbayar per bulan"
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentDetails: {
    bankName: string;      // "SeaBank"
    accountNumber: string; // "901448683446"
    accountName: string;   // "Fajar Romadhan"
  };
  notes: string[];         // Catatan standar:
                           // 1. "Pembayaran telah diterima — terima kasih."
                           // 2. "Akun Penyimpanan Drive 5 TB aktif untuk periode layanan di atas."
                           // 3. "Perpanjangan ditagihkan pada awal periode berikutnya."
  status: 'draft' | 'unpaid' | 'paid' | 'cancelled';
  paidAt?: string | null;
  paymentProofUrl?: string | null; // DataURL bukti transfer jika di-upload
  sentAt?: string | null;
  createdAt: string;
}
```

### 3.5 Entity: ReminderLog (`reminder_logs`)
```typescript
interface ReminderLog {
  id: string;
  subscriptionId: string;
  clientId: string;
  channel: 'email' | 'whatsapp';
  triggerType: 'h7' | 'h3' | 'h1' | 'h0' | 'overdue' | 'invoice_issued';
  recipient: string;
  subjectOrPreview: string;
  status: 'success' | 'failed' | 'manual_sent';
  timestamp: string;
  error?: string;
}
```

---

## 4. SISTEM ATURAN & STATE MACHINE REAL-TIME

### 4.1 Kalkulasi Status Langganan Dinamis
Dihitung secara real-time berdasarkan selisih hari (`daysLeft = endDate - today`):
- `daysLeft > 7`: Status = `active` (Badge Hijau)
- `3 < daysLeft <= 7`: Status = `expiring_soon` (Badge Kuning, Trigger H-7)
- `1 < daysLeft <= 3`: Status = `expiring_soon` (Badge Oranye, Trigger H-3)
- `0 < daysLeft <= 1`: Status = `critical_h1` (Badge Merah Berkedip, Trigger H-1)
- `daysLeft === 0`: Status = `expired` (Jatuh tempo hari ini, Trigger H-0)
- `daysLeft < 0`: Status = `overdue` (Menunggak / Grace Period)

### 4.2 Siklus Automasi H-1 & Penagihan
1. **Pemeriksaan Idempoten**:
   Pengiriman email reminder tidak boleh ganda dalam satu periode penagihan. Sistem memeriksa `subscription.remindersSent.h1`. Jika sudah ada timestamp tanggal periode berjalan, sistem tidak mengulang kirim.
2. **Action Cascade**:
   - Jika `daysLeft <= 1` dan `remindersSent.h1 == null`:
     - Munculkan High-Priority Alert Banner di Dashboard JAREE.
     - Eksekusi kirim Email Reminder H-1 via EmailJS.
     - Buat shortcut 1-klik "Kirim Tagihan via WhatsApp" jika klien lebih aktif di WA.
     - Catat log ke `ReminderLog` dan update `remindersSent.h1 = now()`.

### 4.3 Siklus Pesanan Mandiri (Standalone Order & Repeat Order)
1. **Konsep Mandiri**:
   - Menghilangkan konsep perpanjangan berantai dan status `renewed`.
   - Setiap baris pesanan diproses 1 kali dan berdiri sendiri dengan tanggal periode, harga, dan nomor invoice tersendiri.
2. **Shortcut "Order Lagi" (Repeat Order)**:
   - Tombol **"Order Lagi"** tersedia langsung di setiap baris tabel.
   - Mengklik tombol ini otomatis membuka modal dengan data klien terpilih, tanggal mulai melanjutkan dari tanggal selesai sebelumnya, dan tanggal akhir otomatis +1 bulan.
   - 1 kali klik simpan langsung membuat entri pesanan baru dan menerbitkan invoice baru.
3. **Tombol "+ Tambah Pesanan Baru"**:
   - Tersedia di atas tabel untuk input pesanan klien lama maupun pendaftaran klien baru secara cepat.

### 4.4 Fleksibilitas Pengaturan Periode Layanan & Sinkronisasi Dokumen
1. **Perpanjangan Fleksibel (Renewal Modal)**:
   - User dapat memilih durasi preset (`+1 Bulan`, `+3 Bulan`, `+6 Bulan`, `+1 Tahun`) atau mengatur `Tanggal Mulai` dan `Tanggal Berakhir` secara bebas.
   - Nominal tagihan dapat disesuaikan manual atau otomatis terhitung berdasarkan durasi.
   - Perhitungan tanggal menggunakan penanggalan lokal bebas deviasi UTC/timezone.
2. **Koreksi Periode Manual (Edit Subscription Modal)**:
   - User dapat mengoreksi `Tanggal Mulai`, `Tanggal Jatuh Tempo`, dan `Nominal` dari baris langganan tanpa perlu menerbitkan invoice baru.
   - Dilengkapi opsi checklist sinkronisasi ke invoice periode berjalan/terakhir.
   - Status langganan (`active`, `expiring_soon`, `critical_h1`, `overdue`) dikalkulasi ulang seketika.
3. **Koreksi Periode Dokumen Invoice (Edit Invoice Modal)**:
   - User dapat mengoreksi `Periode Layanan Mulai`, `Periode Layanan Berakhir`, dan `Tanggal Jatuh Tempo` langsung pada setiap invoice yang sudah terbit.
   - Dokumen PDF pratinjau langsung memperbarui tampilan data secara real-time.

---

## 5. REPLIKASI DESAIN INVOICE RESMI JAREE
Format PDF invoice harus mematuhi layout dokumen `INV-2026-0803-01`:
1. **Header**:
   - Judul Dokumen: `INVOICE`
   - Identitas Kiri: Nama Klien & Informasi Kontak.
   - Identitas Kanan: No Invoice, Tanggal Terbit, Jatuh Tempo, Periode Layanan.
2. **Tabel Item**:
   - Kolom: Deskripsi Layanan | Qty | Harga Satuan | Jumlah
   - Typography tegas, clean sans-serif.
3. **Total Tagihan Banner (Khas JAREE)**:
   - Kotak berwarna Slate Blue `#4F7BAE` di sisi kanan bawah.
   - Teks putih: `TOTAL TAGIHAN` & Nominal `Rp 150.000` dengan font bold kondens/kapital modern.
4. **Metode Pembayaran (Kiri Bawah)**:
   - Border box dengan corner crosshair marks (`+`).
   - `METODE PEMBAYARAN`: Transfer Bank — SeaBank
   - No Rekening besar: `901448683446`
   - a.n. Fajar Romadhan
5. **Catatan**:
   - Bullet points instruksi layanan dan penagihan periode berikutnya.
6. **Footer**:
   - Garis tanda tangan: `Jaree — Penerbit invoice`
   - Legal text: "Invoice ini diterbitkan secara digital oleh Jaree dan sah tanpa tanda tangan basah."
   - Footer bar kecil: `JAREE · FAJAROMADHAN@GMAIL.COM | INV-XXXX-XXXX-XX`

---

## 6. PROTOKOL BACKUP & INTEGRITAS DATA
1. Setiap mutasi data (tambah/edit klien, subscription, invoice) langsung di-commit ke `localStorage` dengan key namespace `JAREE_DB_V1`.
2. Tombol **"Download Database Backup (.json)"** tersedia di pojok navigasi dan Settings.
3. Tombol **"Restore Database (.json)"** memvalidasi schema sebelum menimpa data untuk mencegah korupsi data.
4. Export CSV / Excel untuk rekap pembukuan keuangan bulanan.
