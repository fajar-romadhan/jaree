# JAREE IT ECOSYSTEM — SESSION WORKLOG & PROGRESS AUDIT
> **CATATAN UNTUK SEMUA AI AGENT / DEVELOPER**:
> File ini adalah **Jurnal Progres & Rekam Jejak Teknis (Worklog)** proyek JAREE. 
> Setiap kali pengguna meminta: *"cek update pekerjaan apa saja"* atau memulai sesi kerja lanjutan, AI Agent WAJIB membaca file ini bersama dengan [GEMINI.md](file:///E:/PROJECT/JAREE/GEMINI.md).

---

## 1. PERBEDAAN FILE MASTER NOTE VS PROGRESS WORKLOG

| Komponen | [GEMINI.md](file:///E:/PROJECT/JAREE/GEMINI.md) (Master Note) | [PROGRESS.md](file:///E:/PROJECT/JAREE/PROGRESS.md) (Progress Worklog) |
| :--- | :--- | :--- |
| **Fungsi Utama** | Single Source of Truth (SSOT) Arsitektur Sistem | Rekam jejak audit pengerjaan & histori sesi aktif |
| **Isi Konten** | Visi brand, skema data entitas, standar desain invoice resmi, roadmap bisnis | Fitur yang sudah selesai, riwayat bug & solusinya, status terkini |
| **Karakteristik** | Acuan fundamental jangka panjang (relatif statis) | Buku catatan harian yang di-update setiap iterasi/sesi kerja |
| **Tujuan Penggunaan** | Menjaga kepatuhan aturan arsitektur & format desain | Mencegah bug yang sama terulang & memudahkan handover antar sesi |

---

## 2. STATUS PEKERJAAN TERKINI (CURRENT WORKSPACE STATE)

- **Aplikasi**: Single Page Application (SPA) Mandiri — Zero Server Cost.
- **Lokasi Utama**: `file:///E:/PROJECT/JAREE/index.html`
- **Owner / Founder**: Fajar Romadhan
- **Layanan Utama**: **Penyimpanan Drive 5 TB** (Rp 150.000 / bulan).
- **Fitur Terverifikasi**: CRUD Lengkap (Invoice, Pesanan, Pelanggan), Cap Stempel Resmi JAREE, Format Invoice `INV-2026-0803-01` Slate Blue `#4F7BAE`, Modal Ubah Periode Real-Time.
- **Klien Baseline**: Dimas Imansyah (`frekuensipicture@gmail.com`)
  - **Pesanan Awal**: Penyimpanan Drive 5 TB (Periode: 3 Agustus 2026 – 3 September 2026), Invoice `INV-2026-0803-01` (Rp 150.000, Lunas).
- **Proteksi Akses**: Masuk langsung tanpa PIN (Proteksi PIN dibuat opsional di Pengaturan).

---

## 3. FITUR & SISTEM YANG BERHASIL DIBANGUN

1. **Dashboard & Manajemen Langganan Modern**:
   - Tampilan dark mode bernuansa profesional (Stripe/Linear aesthetic: `#0b0d11`, matte card `#151922`, border halus `#242a38`).
   - Kartu statistik real-time (Pendapatan Bulanan, Total Klien, Invoice Terbit, Langganan Jatuh Tempo).
   - High-Priority Alert Banner yang mendeteksi status jatuh tempo klien secara otomatis.

2. **Alur Perpanjangan Multi-Entri & Pencatatan Riwayat (Renewal Workflow)**:
   - Ketika tombol **"Perpanjang"** diklik dan dikonfirmasi:
     - Data pesanan lama (**3 Agt – 3 Sep**) tidak terhapus, melainkan ditandai sebagai `Selesai (Diperpanjang)` dan tetap tersimpan sebagai **Riwayat**.
     - Data langganan periode baru (**3 Sep – 3 Okt**) dibuat secara otomatis dan langsung **muncul di baris teratas** dengan status `Aktif`.
     - Invoice baru diterbitkan (`INV-YYYY-MMDD-NN`) dan terhubung ke periode baru tersebut.
     - Pratinjau PDF invoice baru langsung otomatis terbuka di layar.
     - Setiap baris (baik yang aktif maupun riwayat lama) memiliki tombol langsung **"Cetak Invoice"**.

3. **Fleksibilitas Periode Layanan Penuh**:
   - **Mode Perpanjang**: Pilihan preset cepat (`+1 Bulan`, `+3 Bulan`, `+6 Bulan`, `+1 Tahun`) atau bebas ubah tanggal mulai & akhir secara manual.
   - **Mode Ubah Periode Langganan**: Modal koreksi tanggal masa aktif langganan langsung dari tabel tanpa harus menerbitkan invoice baru.
   - **Mode Ubah Periode Invoice**: Modal pengeditan tanggal periode layanan langsung pada dokumen invoice yang sudah terbit dengan pratinjau real-time.

4. **Mesin Invoice Resmi JAREE (`INV-2026-0803-01`)**:
   - Desain presisi pixel-perfect dokumen invoice resmi:
     - Header invoice digital JAREE.
     - Tabel item layanan.
     - Banner Total Tagihan berwarna Slate Blue `#4F7BAE`.
     - Kotak Metode Pembayaran SeaBank `9014-4868-3446` a.n. Fajar Romadhan dengan tanda crosshair corner (`+`).
     - Tanda tangan digital legal JAREE & nomor seri dokumen.
   - Dapat langsung dicetak ke kertas fisik atau disimpan ke format PDF asli browser.

5. **Automasi & Notifikasi Multi-Channel**:
   - Integrasi EmailJS SDK (zero backend) untuk pengiriman email invoice otomatis.
   - Generator deep link WhatsApp 1-klik dengan pesan penagihan/konfirmasi resmi berbahasa Indonesia.
   - Sistem backup & restore database dalam 1-klik format `.json`.

6. **Akses Langsung Tanpa Hambatan (Frictionless Access)**:
   - Konsol dapat langsung diakses tanpa hambatan layar kunci PIN.

7. **Sistem CRUD Penuh (Create, Read, Update, Delete)**:
   - **Riwayat Invoice**: Tombol buat invoice baru, edit data/periode lengkap, pratinjau PDF, dan hapus invoice.
   - **Daftar Pesanan**: Tombol buat pesanan baru, repeat order, ubah status/periode, dan hapus pesanan.
   - **Data Pelanggan**: Modal tambah pelanggan baru, edit data kontak, chat WhatsApp, dan hapus pelanggan.

8. **Cap Stempel Resmi Perusahaan (Official Corporate Stamp)**:
   - Cap stempel vektor lingkaran ganda SVG melingkar (`★ JAREE IT ECOSYSTEM ★` & `★ FAJAR ROMADHAN · SAH ★`).
   - Dinamis: Merah Crimson Stamp `#b91c1c` dengan badge `L U N A S` & `TERVERIFIKASI RESMI` saat lunas; Slate Blue `#4F7BAE` saat belum lunas.
   - Angled natural `-12deg` dengan efek tinta stempel tembus `mix-blend-mode: multiply` di atas garis tanda tangan resmi.
   - Opsi proteksi PIN tetap tersedia di tab Pengaturan sebagai fitur opsional jika sewaktu-waktu ingin diaktifkan kembali.

---

## 4. REKAM JEJAK BUG / KESALAHAN YANG TELAH DIPERBAIKI (POST-MORTEM)

Bagian ini mencatat seluruh bug yang pernah terjadi agar **TIDAK PERNAH DIULANGI LAGI** di sesi berikutnya:

### ❌ Bug 1: Deviasi Zona Waktu UTC (Off-By-One Date Shift)
- **Gejala Masalah**: Saat menambah durasi 1 bulan pada tanggal `2026-09-08`, tanggal yang dihasilkan bergeser mundur menjadi `2026-10-07` bukannya `2026-10-08`.
- **Akar Masalah (Root Cause)**: Penggunaan fungsi bawaan `.toISOString().slice(0, 10)` pada objek JavaScript `Date` di zona waktu Indonesia (WIB / UTC+7). Saat jam dini hari (01:00 WIB), waktu UTC masih berada di hari sebelumnya (18:00 UTC), sehingga `.toISOString()` mengambil tanggal kemarin.
- **Solusi yang Diterapkan**:
  - Seluruh modul penanggalan distandarisasi menggunakan fungsi lokal murni:
    - `parseLocalDate(str)`: Membaca string `YYYY-MM-DD` dan menyetel jam ke 12:00 siang lokal.
    - `formatToISO(date)`: Memformat menggunakan `.getFullYear()`, `.getMonth() + 1`, dan `.getDate()` lokal.
    - `addMonths(startDateStr, months)`: Menambahkan bulan tanpa pernah terkena deviasi UTC.
    - `getTodayISO()`: Mengambil tanggal hari ini dalam format lokal.
- **ATURAN MUTLAK**: **DILARANG** menggunakan `new Date().toISOString().slice(0, 10)` untuk tanggal bisnis di proyek JAREE. Gunakan selalu `window.automation.getTodayISO()` atau `window.automation.addMonths()`.

---

### ❌ Bug 2: Data Lama Menempel di LocalStorage Browser (Cache Inconsistency)
- **Gejala Masalah**: Di layar pengguna, Dimas Imansyah menampilkan tanggal mulai `3 Agustus 2026` dan jatuh tempo `3 Agustus 2026` sehingga statusnya `-36 hari lagi`, meskipun file seed awal sudah diubah.
- **Akar Masalah (Root Cause)**: Browser pengguna sudah menyimpan state awal dari iterasi pertama ke `localStorage`. Fungsi `init()` lama hanya mengecek `if (!raw)`, sehingga data lama di cache browser pengguna tidak pernah ter-update.
- **Solusi yang Diterapkan**:
  - Ditambahkan blok **Auto-Migration** di `JareeDB.init()` (`js/db.js`):
    Jika mendeteksi data Dimas lama (`endDate === '2026-08-03'` atau `'2026-09-09'`), sistem otomatis memperbaruinya ke tanggal yang benar: **3 Agustus 2026 – 3 September 2026** dan menyimpannya kembali ke `localStorage`.
- **ATURAN MUTLAK**: Setiap kali ada pembaruan baseline data penting, sertakan fungsi migrasi kondisional di `JareeDB.init()` agar cache browser pengguna otomatis ter-update tanpa perlu pengguna menghapus data manual.

---

### ❌ Bug 3: Perpanjangan Menimpa Baris Data (Riwayat Hilang)
- **Gejala Masalah**: Ketika menekan tombol perpanjang, baris langganan lama langsung ditimpa tanggalnya, sehingga riwayat pesanan awal (3 Agt – 3 Sep) hilang dan pengguna merasa "tidak ada data baru yang muncul".
- **Akar Masalah (Root Cause)**: Logika `executeRenewalConfirmed()` awalnya hanya meng-update objek `sub` yang ada secara in-place.
- **Solusi yang Diterapkan**:
  - Logika dirombak total:
    1. Langganan periode lama (`sub`) diubah statusnya menjadi `'renewed'` ("Selesai (Diperpanjang)") dan tetap disimpan di database.
    2. Langganan periode baru (`newSub`) dibuat sebagai entri baru dengan status `'active'` dan muncul di baris teratas.
    3. Tabel menampilkan data baru dan seluruh riwayat periode sebelumnya secara kronologis.
    4. Tombol **"Cetak Invoice"** dipasang di setiap baris.

---

### ❌ Bug 4: Potongan Kode Duplikat (Syntax Error di `js/app.js`)
- **Gejala Masalah**: Ada baris duplikat sisa penggabungan fungsi di dalam `js/app.js` yang berpotensi memicu error interpreter JavaScript.
- **Solusi yang Diterapkan**:
  - Dihapus bersih, dan seluruh file JS selalu diverifikasi menggunakan perintah compiler: `node -c E:/PROJECT/JAREE/js/app.js`.
- **ATURAN MUTLAK**: Setiap kali mengedit file `.js`, AI Agent WAJIB menjalankan `node -c` pada file yang diubah untuk memastikan tidak ada syntax error sebelum merespons pengguna.

---

### ❌ Bug 5: Tombol Cetak Invoice Tersembunyi di Tab Lain
- **Gejala Masalah**: Pengguna kesulitan mencetak invoice karena tombol cetak hanya tersedia di menu "Riwayat Invoice", sedangkan saat mengelola langganan pengguna berada di menu "Langganan Aktif".
- **Solusi yang Diterapkan**:
  - Tombol **"Cetak Invoice"** disediakan langsung di setiap baris tabel Langganan (Dashboard dan Tab Langganan).
  - Fungsi `previewInvoice(invoiceId)` diperluas agar bisa menerima argumen berupa `id` internal maupun nomor string `invoiceNumber` (misal: `INV-2026-0803-01`).

---

### ✅ Optimasi: Penonaktifan Proteksi PIN Akses (Langsung Masuk Konsol)
- **Permintaan Pengguna**: *"ga usah pakai pin"*.
- **Solusi yang Diterapkan**:
  - `pinEnabled` disetel ke `false` secara default di [db.js](file:///E:/PROJECT/JAREE/js/db.js).
  - Auto-migrasi ditambahkan pada `JareeDB.init()` agar cache `localStorage` browser pengguna otomatis menonaktifkan PIN tanpa perlu pembersihan manual.
  - Tombol "Kunci Sesi" di topbar otomatis disembunyikan saat PIN tidak aktif.
  - Form Pengaturan di [index.html](file:///E:/PROJECT/JAREE/index.html) dan [app.js](file:///E:/PROJECT/JAREE/js/app.js) ditambahkan toggle checkbox interaktif jika Founder sewaktu-waktu ingin mengaktifkannya kembali.

---

### ✅ Optimasi: Model Pesanan Mandiri (Standalone Order) & Desain Minimalist Elegant
- **Permintaan Pengguna**: *"mana ini masih ga berubah , aku mau tampilan yg simple minimalist elegant saja ubah color palette yg di piluh"*
- **Akar Masalah**: Mekanisme perpanjangan lama terlalu rumit dengan status buatan (`renewed`) dan palet warna dark mode terasa terlalu pekat/berat.
- **Solusi yang Diterapkan**:
  1. **Palet Warna Minimalist Elegant**:
     - Background: Soft Slate `#f8fafc` (bersih, lega, modern).
     - Cards & Sidebar: Pure White `#ffffff` dengan border halus `#e2e8f0` dan soft micro-shadow.
     - Aksen Utama: Signature Slate Blue `#4F7BAE` (selaras dengan banner total tagihan invoice).
     - Tipografi & Kontras: Deep charcoal `#0f172a` dengan keterbacaan sempurna.
  2. **Model Pesanan Mandiri (1 Kali Proses)**:
     - Mekanisme perpanjangan berantai dan status `renewed` dihilangkan total.
     - Tombol "Perpanjang" diganti dengan tombol shortcut **"Order Lagi"** di setiap baris dan tombol **"+ Tambah Pesanan"** di atas tabel.
     - Mengklik "Order Lagi" otomatis membuka modal pesanan dengan data klien terisi dan tanggal otomatis berlanjut ke bulan berikutnya.
     - 1 kali klik simpan = 1 pesanan baru tercatat + 1 invoice baru terbit siap cetak.

---

### ✅ Optimasi: Status Pesanan Selesai (Lunas) & Penonaktifan False Alarm
- **Permintaan Pengguna**: *"untuk pesanan ini tuh udh selesai lunas itula aku contohkan invoicenya"*.
- **Akar Masalah**: Sistem sebelumnya menghitung `days < 0` secara mentah dan langsung memberi label merah *"Lewat 5 hari"* serta memicu banner alarm peringatan jatuh tempo, padahal pesanan awal Dimas Imansyah (`INV-2026-0803-01`) sudah berstatus lunas.
- **Solusi yang Diterapkan**:
  1. Status pesanan awal Dimas di [db.js](file:///E:/PROJECT/JAREE/js/db.js) disetel dan diauto-migrasi menjadi `status: 'completed'`.
  2. Logika badge di [app.js](file:///E:/PROJECT/JAREE/js/app.js) disesuaikan: Jika tanggal periode sudah lewat namun invoice terkait berstatus `paid` (atau status pesanan `completed`), maka badge menampilkan **`Selesai (Lunas)`** berwarna hijau sage lembut `#ecfdf5` / `#15803d`, BUKAN merah *"Lewat X hari"*.
  3. Status *"Menunggak / Lewat"* hanya muncul jika invoice benar-benar belum lunas (`unpaid`).
  4. Banner peringatan jatuh tempo di dashboard otomatis dinonaktifkan untuk transaksi yang sudah lunas dan selesai, menghilangkan alarm keliru.
  5. Statistik *"Jatuh Tempo Mendekat"* hanya menghitung pesanan yang aktif berjalan atau belum lunas.

---

### ✅ Optimasi: Fitur Pengubah Status Pesanan Lunas & Perbaikan Komprehensif Bug UI
- **Permintaan Pengguna**: 
  1. *"banyak bug perbaiki skrg"*
  2. *"pastikan aku jg bs ubah status pesanan lunas"*
- **Akar Masalah**:
  1. Pengguna sebelumnya tidak memiliki tombol atau kontrol interaktif untuk mengubah status pesanan/invoice menjadi "Lunas" atau "Belum Lunas" secara mandiri dari antarmuka.
  2. Banner peringatan jatuh tempo sebelumnya sempat merembes ke tab "Data Pelanggan" dan memicu alarm keliru untuk pesanan yang sebenarnya sudah lunas.
  3. Pratinjau dokumen invoice memiliki background modal gelap gulita `#0a0c10` warisan dark mode yang tidak selaras dengan tema Simple Light Slate.
  4. Header tabel "Data Pelanggan" belum memiliki kolom aksi shortcut pesanan.
- **Solusi yang Diterapkan**:
  1. **Tombol Toggle Status 1-Klik (`Lunas` / `Set Lunas`)**:
     - Ditambahkan tombol toggle interaktif di kolom Aksi pada tabel **Dashboard** dan **Daftar Pesanan**.
     - Jika diklik, status pesanan dan invoice terkait langsung beralih secara instan antara **Lunas** (`paid` / `completed`) dan **Belum Lunas** (`unpaid` / `active`).
     - Disertai toast notifikasi dan re-render otomatis seluruh tampilan.
  2. **Pilihan Status pada Semua Modal**:
     - Modal **Buat Pesanan Baru**: Ditambahkan dropdown *Status Pembayaran Awal* (default: *Lunas*).
     - Modal **Ubah Periode Layanan**: Ditambahkan dropdown *Status Pembayaran / Pesanan* (*Lunas*, *Belum Lunas*, *Dibatalkan*).
     - Modal **Ubah Periode Invoice**: Ditambahkan dropdown *Status Pembayaran Dokumen*.
     - Modal **Pratinjau Invoice**: Ditambahkan tombol cepat *"Tandai Lunas"* / *"Ubah ke Belum Lunas"* langsung di footer modal.
  3. **Pembersihan Bug Banner Peringatan**:
     - Banner peringatan diisolasi ketat di dalam `#view-dashboard` dan secara eksplisit menyaring setiap pesanan yang invoice-nya sudah lunas (`isPaid === true`).
     - Tidak akan pernah muncul peringatan untuk pesanan yang sudah terbayar.
  4. **Peningkatan Tab Data Pelanggan**:
     - Ditambahkan kolom **AKSI** dengan tombol shortcut **"Order Lagi"** dan **"Chat WA"** untuk setiap pelanggan terdaftar.
     - Ditambahkan tombol **"+ Tambah Pesanan / Klien"** di header panel.
  5. **Penyelarasan Tema Minimalist Light Slate**:
     - Modal body pratinjau invoice diubah ke Slate Light `#f1f5f9`, membuat lembar A4 invoice dengan Slate Blue `#4F7BAE` tampil bersih, kontras, dan tampak seperti lembar kertas fisik premium.
     - Versi query string di-bump ke `?v=20260908_v5` untuk menjamin bypass disk cache browser.

---

### ✅ Optimasi: Desain Invoice Corporate Minimalist & Stempel Digital Resmi
- **Permintaan Pengguna**: *"bisa kamu improv ga design hasil cetak invoicenya ini"*
- **Pilihan Pengguna**: Konsep **Corporate Minimalist** (faktur korporat formal, garis tipis presisi, hemat tinta printer, aksen Slate Blue `#4F7BAE` eksklusif) + **Stempel Digital Resmi JAREE** (*Digital Verification Seal / Sah Tanpa Tanda Tangan Basah*).
- **Solusi yang Diterapkan**:
  1. **Tipografi & Hairline Borders**:
     - Menggunakan kombinasi Plus Jakarta Sans + Inter dengan garis pembatas tipis (`1px solid #e2e8f0`).
     - Tampilan formal, elegan, dan ink-friendly (sangat hemat tinta printer saat dicetak ke kertas fisik).
  2. **Header & Identitas Korporat**:
     - Logo badge modern `[J]` Slate Blue bersanding dengan teks tebal `JAREE`.
     - Nomor invoice berformat monospace presisi dengan aksen Slate Blue `#4F7BAE`.
     - Status pill dinamis (`● LUNAS` / `○ MENUNGGU PEMBAYARAN`).
  3. **Tabel Layanan & Rekapitulasi**:
     - Tabel berpenomoran `#`, deskripsi layanan berpenjelasan spesifikasi cloud, dan angka tabular monospace.
     - Banner Total Tagihan khas JAREE berwarna Slate Blue `#4F7BAE` dengan font tebal kontras putih.
  4. **Metode Pembayaran SeaBank Arsitektural**:
     - Menggunakan corner crosshairs (`+`) presisi sesuai blueprint SSOT [GEMINI.md](file:///E:/PROJECT/JAREE/GEMINI.md).
     - Rekening: SeaBank `9014-4868-3446` a.n. Fajar Romadhan.
  5. **Stempel Digital Resmi (Digital Verification Seal)**:
     - Dilengkapi emblem SVG verifikasi resmi: *"JAREE VERIFIED · DOKUMEN RESMI SAH"*.
     - Disclaimer legal: *"Invoice ini diterbitkan secara digital oleh sistem billing JAREE dan sah tanpa tanda tangan basah."*
  6. **Presisi Cetak A4 1 Halaman**:
     - Rule `@media print` dan print window dikonfigurasi presisi untuk ukuran `A4 portrait` (`12mm 14mm` margin).
     - Seluruh konten pas 1 lembar utuh tanpa ada overflow/tumpah ke halaman kedua.
     - Versi query string di-bump ke `?v=20260908_v6`.

---

### 🐛 Bug Audit & Perbaikan: Modal "Ubah Periode" pada Pratinjau Invoice Tertutup & Sinkronisasi Tanggal
- **Masalah yang Ditemukan**:
  1. **Z-Index Stacking Context Bug**: Tombol `[📅 Ubah Periode]` pada modal Pratinjau Dokumen Invoice (`#invoice-preview-modal`) membuka `#edit-inv-modal`. Keduanya menggunakan kelas `.modal-overlay { z-index: 1000; }`. Karena `#invoice-preview-modal` terletak setelah `#edit-inv-modal` dalam DOM `index.html`, browser merender `#edit-inv-modal` tepat di **belakang** modal pratinjau invoice. Akibatnya tombol tampak macet / tidak merespons sama sekali.
  2. **Resolusi ID Invoice Fleksibel**: Pemanggilan `openEditInvoicePeriodModal(invoiceId)` berpotensi gagal jika ID invoice berupa format nomor seri `INV-XXXX-XXXX-XX`.
  3. **Penyimpangan Tanggal Jatuh Tempo**: Pilihan preset `+1 Bulan` sebelumnya keliru mengubah `dueDate` (jatuh tempo pembayaran) menjadi sama dengan tanggal akhir layanan, bukan tanggal jatuh tempo pesanan.
  4. **Live Pratinjau Tidak Refresh**: Modal pratinjau invoice tidak memperbarui teks tanggal secara instan setelah modal ubah periode disimpan.
- **Solusi yang Diterapkan**:
  1. **Z-Index Elevation**: Menetapkan `#edit-inv-modal, #edit-sub-modal { z-index: 1200 !important; }` baik di `css/style.css` maupun inline `<style>` di `index.html`. Modal ubah periode sekarang muncul di atas modal invoice preview dengan transisi mulus.
  2. **Fallback Resolusi Invoice di db.js & app.js**: `getInvoiceById(id)` di `js/db.js` diperbarui untuk mencocokkan `i.id === id || i.invoiceNumber === id`. `openEditInvoicePeriodModal()` di `js/app.js` memiliki fallback bertingkat ke `this.currentViewingInvoice`.
  3. **Presisi Tanggal Jatuh Tempo**: Durasi preset `+1 Bulan`, `+3 Bulan`, dsb. hanya menyesuaikan `edit-inv-period-to` dan membiarkan `dueDate` sesuai tanggal penagihan resmi.
  4. **Live Re-render Pratinjau**: `saveInvoicePeriodEdit()` memanggil `this.previewInvoice(inv.id)` seketika saat disimpan, sehingga dokumen invoice langsung ter-update di layar pratinjau.
  5. **Versi Cache-Busting**: Di-bump ke `?v=20260908_v7` untuk memastikan browser langsung memuat script terbaru.

---

### ✅ Penyelarasan Nama Layanan Resmi: "Penyimpanan Drive 5 TB"
- **Permintaan Pengguna**: *"dan jasa saya tuh bukan google one , tapi penyimpanan drive 5 tb"*
- **Tindakan yang Diterapkan**:
  1. **Master Data & Setting Default**: Mengubah seluruh penamaan produk dari `Google One 5 TB` / `Google One 2 TB` menjadi `Penyimpanan Drive 5 TB` dan `Penyimpanan Drive 2 TB` pada `DEFAULT_SERVICES`, `DEFAULT_SETTINGS`, `INITIAL_SUBSCRIPTIONS`, dan `INITIAL_INVOICES` di [js/db.js](file:///E:/PROJECT/JAREE/js/db.js).
  2. **Auto-Migration Data LocalStorage**: Menambahkan pembersihan dan migrasi otomatis pada startup `js/db.js` agar data yang telah tersimpan di browser klien langsung bermutasi dari teks `Google One` menjadi `Penyimpanan Drive` tanpa perlu reset database manual.
  3. **Form Pemesanan & Modal**: Memperbarui pilihan dropdown layanan di [index.html](file:///E:/PROJECT/JAREE/index.html) dan [js/app.js](file:///E:/PROJECT/JAREE/js/app.js).
  4. **Notifikasi & Invoice Description**: Memperbarui deskripsi item invoice dan teks catatan tagihan di [js/automation.js](file:///E:/PROJECT/JAREE/js/automation.js) dan [GEMINI.md](file:///E:/PROJECT/JAREE/GEMINI.md).
  5. **Versi Cache-Busting**: Di-bump ke `?v=20260908_v8`.

---

### 🚀 Implementasi CRUD Lengkap (Create, Read, Update, Delete)
- **Permintaan Pengguna**: *"pastikan ada crud"* (disertai tangkapan layar Riwayat Seluruh Invoice).
- **Analisis Kebutuhan**:
  Sebelumnya sistem memiliki alur Read dan Update terbatas, namun belum menyediakan aksi Delete (Hapus) dan Create mandiri di halaman Riwayat Invoice dan Data Pelanggan.
- **Solusi & Fitur yang Diterapkan**:
  1. **CRUD Riwayat Invoice (`#view-invoices`)**:
     - **Create**: Tombol `[+ Terbitkan Invoice Baru]` di header tabel invoice.
     - **Read**: Tabel rekapitulasi invoice + tombol `[Cetak PDF]` (pratinjau lembar faktur).
     - **Update**: Tombol `[Ubah Periode]` untuk mengedit tanggal mulai, tanggal akhir, tanggal terbit, jatuh tempo, nominal total tagihan (Rp), dan status pembayaran.
     - **Delete**: Tombol `[Hapus]` dengan ikon tong sampah dan dialog konfirmasi keamanan (tersedia di tabel dan di dalam modal pratinjau invoice).
  2. **CRUD Daftar Pesanan (`#view-subscriptions`)**:
     - **Create**: Tombol `[+ Tambah Pesanan Baru]` dan `[Order Lagi]`.
     - **Read**: Tabel daftar pesanan aktif dan riwayat periode terdahulu.
     - **Update**: Tombol `[Ubah]` untuk mengoreksi tanggal masa aktif, nominal, dan status pesanan.
     - **Delete**: Tombol `[Hapus]` dengan ikon tong sampah dan konfirmasi keamanan.
  3. **CRUD Data Pelanggan (`#view-clients`)**:
     - **Create**: Tombol `[+ Tambah Pelanggan]` membuka modal `#client-modal` untuk input nama, email, no WA, tipe akun, dan catatan.
     - **Read**: Tabel daftar seluruh pelanggan dengan link shortcut chat WhatsApp.
     - **Update**: Tombol `[Edit]` membuka form edit profil pelanggan dengan data terisi.
     - **Delete**: Tombol `[Hapus]` untuk menghapus data kontak pelanggan dengan konfirmasi.
   4. **Versi Cache-Busting**: Di-bump ke `?v=20260908_v9`.

---

### 🔴 Penambahan Cap Stempel Resmi & Profesional pada Invoice
- **Permintaan Pengguna**: *"tambahkan cap stempel profesional"* (disertai tangkapan layar area footer invoice).
- **Desain & Implementasi**:
  1. **Struktur Cap Stempel Vektor Resmi (Double-Ring Corporate Stamp)**:
     - Menggunakan SVG melingkar ganda konsentris (*outer double ring + inner dotted ring*).
     - **Teks Melingkar Atas**: `★ JAREE IT ECOSYSTEM ★` menggunakan SVG `<textPath>`.
     - **Teks Melingkar Bawah**: `★ FAJAR ROMADHAN · SAH ★`.
     - **Pusat Stempel (Center Focal Badge)**:
       - Saat status **Lunas**: Teks tebal kapital **`L U N A S`** beraksen Crimson Red authentic stamp ink (`#b91c1c`) dengan subjudul `TERVERIFIKASI RESMI`.
       - Saat status **Belum Lunas**: Teks kapital **`TAGIHAN`** dengan aksen Signature Slate Blue `#4F7BAE` dan subjudul `ORIGINAL INVOICE`.
  2. **Penempatan & Efek Realistis (Authentic Stamp Overlay)**:
     - Ditempatkan pas di atas blok tanda tangan penerbit resmi (`JAREE · Penerbit Resmi Invoice`).
     - Diputar dengan sudut kemiringan natural `-12deg` serta efek tinta stempel tembus `mix-blend-mode: multiply` dan `opacity: 0.90`.
     - Ketika invoice dicetak ke kertas fisik atau disimpan ke PDF, stempel tetap tajam resolusi vektor tinggi (tanpa pecah/blur).
  3. **Pembersihan Teks Layanan Otomatis**:
     - Memastikan seluruh deskripsi item dan catatan invoice yang me-render kata "Google One" langsung disanitasi menjadi "Penyimpanan Drive 5 TB".
  4. **Versi Cache-Busting**: Di-bump ke `?v=20260908_v9`.

---

### ✅ Optimasi & Perbaikan: Penyesuaian Otomatis Nama File PDF Invoice
- **Permintaan Pengguna**: *"pastikan pada saat pdf nama file untuk inv sdh di sesuaikan"* (disertai tangkapan layar dialog Windows *Save Print Output As* di mana kotak *File name:* kosong).
- **Akar Masalah (Root Cause)**:
  1. Metode lama menggunakan `window.open('', '_blank')` dengan `document.write(...)`. Di browser Chromium (Chrome/Edge) pada sistem operasi Windows, window popup bertipe `about:blank` tidak mengirimkan judul dokumen ke subsistem cetak Windows (`DOCINFO.lpszDocName` pada Windows Print Spooler bernilai string kosong). Akibatnya, driver printer "Microsoft Print to PDF" memunculkan dialog penyimpanan dengan nama file kosong tanpa terisi otomatis.
  2. Belum ada tombol unduh file PDF mandiri (1-klik download) yang langsung mengunduh file `.pdf` ke folder Downloads tanpa harus membuka dialog print Windows.
- **Solusi yang Diterapkan**:
  1. **Standardisasi Nama File Otomatis (`getInvoicePdfFileName`)**:
     - Dibuat fungsi terpusat yang menghasilkan format nama file resmi:
       `${cleanInvNum} - ${cleanClient}` (contoh: `INV-2026-0803-01 - Dimas Imansyah`).
     - Karakter terlarang pada sistem berkas Windows (`/ \ ? % * : | " < >`) disanitasi secara otomatis.
  2. **Perombakan Mekanisme Cetak Browser (`printInvoice`)**:
     - Tidak lagi menggunakan popup `about:blank` yang bermasalah.
     - Mengubah `document.title` halaman aktif secara dinamis ke `${fileName}` tepat sebelum `window.print()` dipanggil, dan memulihkannya kembali secara otomatis via event `afterprint`.
     - Karena dijalankan dari konteks tab aktif dengan URL valid, Chromium secara konsisten meneruskan nama invoice ke driver "Microsoft Print to PDF" dan dialog "Save as PDF", sehingga kotak input **File name** otomatis terisi `INV-2026-0803-01 - Dimas Imansyah`.
  3. **Isolasi Penuh Lembar Cetak A4 (`css/invoice.css`)**:
     - Aturan `@media print` disempurnakan: seluruh antarmuka aplikasi (`.app-shell`, sidebar, topbar, modal-header, modal-footer, toast) disembunyikan total (`display: none !important`).
     - Hanya lembar faktur `.jaree-invoice-sheet` yang dicetak di atas kertas A4 portrait dengan margin rapi.
  4. **Tombol "Unduh PDF" 1-Klik (`html2pdf.js`)**:
     - Menambahkan pustaka lokal `js/html2pdf.bundle.min.js` (100% offline, zero external dependency).
     - Menambahkan tombol `[Unduh PDF]` berdampingan dengan `[Cetak / Simpan PDF]` pada modal pratinjau invoice.
     - Mengklik tombol ini langsung mengunduh file `INV-2026-0803-01 - Dimas Imansyah.pdf` ke folder download pengguna tanpa perlu melalui dialog printer.
  5. **Versi Cache-Busting**: Di-bump ke `?v=20260909_v10`.

---

### ✉️ Fitur Baru: Tombol Kirim Email Otomatis & Setup Center EmailJS (100% Free)
- **Permintaan Pengguna**: *"pastikan ada tombol buat kirim ke email otomatis , mari kita bangun set up email otomats yg free kita"* (disertai tangkapan layar tabel Daftar Pelanggan Dimas Imansyah).
- **Arsitektur & Solusi yang Diterapkan**:
  1. **Tombol "Email" di Seluruh Antarmuka Aplikasi**:
     - **Daftar Pelanggan**: Ditambahkan tombol `[Email]` di samping tombol `[Chat WA]`.
     - **Riwayat Invoice**: Ditambahkan tombol `[Email]` di kolom aksi setiap baris invoice.
     - **Daftar Pesanan & Dashboard**: Ditambahkan tombol `[Email]` shortcut penagihan.
     - **Pratinjau Invoice**: Ditambahkan tombol `[Kirim Email]` di modal footer lembar faktur.
  2. **Modal Kirim Email Otomatis (`#send-email-modal`)**:
     - Membuka form interaktif lengkap:
       - Penerima: Email klien (misal `frekuensipicture@gmail.com`).
       - Pilihan Jenis Notifikasi: *Tagihan Invoice*, *Pengingat Jatuh Tempo (H-1)*, atau *Konfirmasi Lunas*.
       - Subjek dan Teks Email ter-generate otomatis secara profesional dan dapat diedit manual sebelum dikirim.
     - **2 Opsi Pengiriman**:
       - **⚡ Kirim Otomatis via EmailJS**: Mengirim langsung di latar belakang browser (zero popup) dan mencatat riwayat ke database log.
       - **Buka di Gmail Web (1-Klik Gratis)**: Tautan deep link compose `mail.google.com` dengan penerima, subjek, dan draf terisi penuh untuk pengiriman instan tanpa dependensi pihak ketiga.
  3. **Setup Center EmailJS di Pengaturan (100% Free - 200 Email/Bulan)**:
     - Badge indikator status koneksi real-time (`🟢 EmailJS Siap Digunakan` / `🟡 Belum Terhubung`).
     - Panduan 4 langkah mudah registrasi dan integrasi akun Gmail Founder (`fajaromadhan@gmail.com`).
     - Tombol `[📋 Salin Format Template EmailJS]` untuk kemudahan *copy-paste* variabel template email.
     - Tombol `[⚡ Tes Kirim Email Sekarang]` untuk memvalidasi kredensial API langsung ke email Founder.
  4. **Pustaka Lokal**: Menambahkan `js/email.min.js` (EmailJS Browser SDK lokal 2 KB) tanpa ketergantungan CDN luar.
  5. **Integrasi Informasi Kontak Lanjutan Email & WhatsApp Resmi**:
     - Ditambahkan footer standar di setiap email tagihan, reminder, dan konfirmasi:
       - Email Resmi: `fajaromadhan@gmail.com`
       - Tautan & Tombol WhatsApp Resmi: `https://wa.me/6285783656335` (`0857-8365-6335`).
     - Auto-migrasi nomor kontak resmi Founder di `js/db.js` (`6285783656335`).
     - Input nomor WhatsApp resmi Founder ditambahkan di form Pengaturan & Rekening.
     - Banner kontak bantuan cepat dan tombol WhatsApp langsung disematkan pada `#send-email-modal`.
     - **Integrasi Kredensial EmailJS Resmi Founder (Fajar Romadhan) — 100% SELESAI**:
      - **Service ID**: `service_qz3z9jq` (tersimpan & termigrasi ke LocalStorage).
      - **Template ID**: `template_277378i` (tersimpan & termigrasi ke LocalStorage).
      - **Public Key**: `33YWwbogyPk8u4NFH` (tersimpan & termigrasi ke LocalStorage).
      - **Status**: Siap digunakan untuk pengiriman tagihan, pengingat H-1, dan konfirmasi lunas otomatis di latar belakang browser (kuota 200 email/bulan gratis).
     - **Automasi Peringatan Jatuh Tempo H-1 (Auto-Pilot & Manual)**:
      - **Auto-Pilot On App Open**: Setiap kali web app dibuka, sistem otomatis memindai seluruh langganan aktif. Jika ada klien yang sisa harinya H-1 atau hari-H (`0 <= daysLeft <= 1`) dan belum lunas, sistem otomatis mengirimkan email peringatan H-1 via EmailJS secara idempoten (1x per hari) dan memunculkan toast konfirmasi.
      - **Alert Banner Shortcut**: Ditambahkan tombol langsung `[Kirim Email H-1]` pada High-Priority Alert Banner merah di Dashboard.
      - **Smart Type Detection**: Jika tombol Email diklik pada pesanan yang mendekati jatuh tempo, modal otomatis memilih opsi *"Pengingat H-1"* dan menyusun teks draf peringatan resmi secara instan.
     - **Penyesuaian Otomatis Status Lunas (Kwitansi vs Tagihan)**:
      - **Bebas Instruksi Penagihan jika Lunas**: Jika transaksi / invoice berstatus `Lunas` (`paid` atau `completed`), teks email otomatis diubah menjadi **Kwitansi / Bukti Pembayaran Resmi**. Kalimat tagihan seperti *"Mohon lakukan transfer ke SeaBank..."* otomatis **dihilangkan 100%**.
      - **Draf Kwitansi Resmi**: Menampilkan ucapan terima kasih atas pembayaran yang diterima, tanggal pembayaran terverifikasi, periode masa aktif layanan yang sudah aktif tanpa jeda, serta nomor invoice sebagai tanda terima digital.
      - **Indikator Transparansi Modal**: Ditambahkan badge status transaksi hijau pada modal email (`✅ Status Transaksi: LUNAS — Pesan otomatis diatur sebagai Bukti Pembayaran / Kwitansi Resmi`) agar Founder mengetahui langsung jenis template yang aktif sebelum mengirim.
     - **Penyimpanan Kode & CI/CD Otomatis (GitHub + Vercel) — 100% LIVE PRODUCTION**:
      - **Remote Repository**: `https://github.com/fajar-romadhan/jaree.git` (Private Repository).
      - **Branch Utama**: `main`.
      - **Hosting Production**: Berhasil di-deploy ke Vercel (`fajar-romadhan's projects`).
      - **Sistem CI/CD**: Terhubung otomatis ke Vercel. Setiap perubahan/perbaikan kode yang di-push ke branch `main` akan otomatis di-build dan di-deploy ke hosting Vercel dalam hitungan detik.
      - **Versi Cache-Busting**: Di-bump ke `?v=20260909_v16`.
  6. **Perbaikan Cap Stempel Resmi pada Hasil Unduhan PDF (html2pdf / html2canvas Fix)**:
     - **Penyebab Masalah (Root Cause)**:
       - Cap stempel sebelumnya menggunakan inline SVG dengan kurva `<textPath>` melingkar serta CSS `mix-blend-mode: multiply` dan `filter: drop-shadow`.
       - Mesin konversi dokumen ke PDF (`html2pdf.js` / `html2canvas`) tidak mendukung parser SVG `<textPath>` dan secara otomatis mengabaikan (drop) elemen yang menggunakan CSS `mix-blend-mode`, sehingga di modal web cap terlihat jelas, namun saat diunduh menjadi file PDF fisiknya cap menghilang.
     - **Solusi Teknis Berstandar Tinggi**:
       - Mengimplementasikan generator stempel in-memory **High-Resolution Canvas PNG Rasterization (`generateStampDataUrl`)** di `js/invoice.js`.
       - Menggambar lingkaran luar ganda, lingkaran dalam putus-putus, dua garis pemisah horizontal, teks melingkar atas (*★ JAREE IT ECOSYSTEM ★*), teks melingkar bawah (*★ FAJAR ROMADHAN · SAH ★*), dan tulisan pusat (*L U N A S* / *TERVERIFIKASI RESMI*) menggunakan koordinat trigonometri Canvas murni.
       - Diekspor langsung ke format gambar standar Base64 PNG (`<img class="stamp-img" src="data:image/png;base64,...">`).
       - Memperbarui `css/invoice.css`: menghapus `mix-blend-mode` dan filter penyebab drop, serta menambahkan `@media print` penjamin visibilitas 100%.
     - **Hasil**: Cap stempel LUNAS berwarna merah bata (`#b91c1c`) berotasi autentik `-12deg` kini tampil 100% sempurna, tajam, dan tidak hilang baik di modal layar, cetak fisik, maupun file PDF hasil unduhan tombol `[Unduh PDF]`.
     - **Versi Cache-Busting**: Di-bump ke `?v=20260909_v18`.
  7. **Penyempurnaan Tampilan Invoice: Menghapus Nomor Telepon Klien pada Bagian 'TAGIHAN KEPADA'**:
     - **Permintaan Pengguna**: Menghilangkan baris teks nomor telepon klien (`invoice.clientSnapshot.phone`) pada kolom `TAGIHAN KEPADA` di lembar invoice.
     - **Tindakan**:
       - Mengedit `js/invoice.js` pada fungsi `renderInvoiceHTML(invoice)` untuk menghapus `<div class="inv-client-info">${invoice.clientSnapshot.phone || '-'}</div>`.
       - Kolom `TAGIHAN KEPADA` kini hanya menampilkan **Nama Klien** dan **Email Klien** secara bersih, profesional, dan rapi sesuai standar format referensi `INV-2026-0803-01`.
       - Data nomor WhatsApp klien tetap tersimpan aman di database untuk kebutuhan komunikasi dan kirim pesan via WA.
     - **Versi Cache-Busting**: Di-bump ke `?v=20260909_v19`.
  8. **Pembersihan Draf Email: Menghilangkan Tautan Panjang Unduh PDF Digital**:
     - **Permintaan Pengguna**: Menghilangkan teks blok tautan `🔗 Buka & Unduh Dokumen Invoice PDF Resmi: https://.../?d=...` dari isi pesan email.
     - **Tindakan**:
       - Mengedit `js/automation.js` pada fungsi `generateEmailDraft` untuk menghapus penyisipan blok tautan URL Base64 yang panjang ke dalam template body email (baik pada konfirmasi lunas, pengingat H-1, maupun tagihan baru).
       - Teks email kini tampil ringkas, bersih, dan elegan tanpa baris tautan yang berantakan, sehingga Founder dapat melampirkan file PDF secara langsung atau mengirim pesan tanpa tautan panjang.
     - **Versi Cache-Busting**: Di-bump ke `?v=20260909_v20`.
  9. **Penyelarasan Data Antar Profil Chrome & Fitur 1-Klik Restore Topbar**:
     - **Penyebab Masalah (Root Cause)**:
       - Aplikasi menyimpan data pada **LocalStorage** browser (`JAREE_DB_V1`).
       - Google Chrome secara ketat memisahkan (*sandbox*) ruang LocalStorage untuk setiap profil akun pengguna (misal profil `fajaromadhan@gmail.com` vs akun Google lainnya di laptop). Akibatnya, pesanan/invoice baru yang dibuat di Profil A tersimpan di storage Profil A dan tidak otomatis ada di storage Profil B.
     - **Tindakan**:
       - Menambahkan tombol **`[📥 Restore Data (.json)]`** langsung di Topbar sejajar dengan tombol `[Backup Data (.json)]`.
       - Mengimplementasikan `app.handleRestoreJSON(event)` di `js/app.js` untuk kemudahan sinkronisasi instan antar akun/perangkat dengan 1 klik unggah file cadangan `.json`.
       - Menyiapkan opsi integrasi Cloud Database online (Firebase Firestore / Supabase) jika Founder menginginkan sinkronisasi data live 24/7 tanpa ekspor-impor manual.
     - **Versi Cache-Busting**: Di-bump ke `?v=20260909_v21`.

---

## 5. INSTRUKSI HANDOVER UNTUK SESI BERIKUTNYA

Bagi AI Agent yang membaca file ini pada sesi berikutnya saat pengguna memberi perintah *"cek update pekerjaan apa saja"* atau *"lanjutkan"*:
1. **Verifikasi File**: Baca [GEMINI.md](file:///E:/PROJECT/JAREE/GEMINI.md) untuk blueprint sistem dan [PROGRESS.md](file:///E:/PROJECT/JAREE/PROGRESS.md) untuk rekam jejak kerja.
2. **Status Data**: Dimas Imansyah memiliki pesanan awal `3 Agustus 2026 – 3 September 2026` dengan status **Selesai (Lunas)**. Tombol "Order Lagi" siap dipakai untuk pesanan periode selanjutnya (`3 September 2026 – 3 Oktober 2026`).
3. **Patuhi Format Invoice**: Banner total tagihan wajib berwarna Slate Blue `#4F7BAE` dan rekening SeaBank `9014-4868-3446` a.n. Fajar Romadhan.
4. **Verifikasi Sintaks**: Selalu jalankan `node -c` setelah melakukan pengeditan JavaScript.
5. **Efisiensi Token**: DILARANG menjalankan sub-browser / `browser_subagent` kecuali ada perintah eksplisit dari pengguna.

