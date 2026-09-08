# SPESIFIKASI DESAIN: MODEL PESANAN MANDIRI (STANDALONE ORDER MODEL)
**Tanggal**: 08 September 2026  
**Dokumen**: `docs/superpowers/specs/2026-09-08-standalone-order-model-design.md`  
**Sistem**: JAREE IT Ecosystem  
**Founder / Owner**: Fajar Romadhan  

---

## 1. Latar Belakang & Masalah (Problem Statement)
Sebelumnya, sistem JAREE menggunakan mekanisme *Renewal Workflow* (Perpanjangan) berantai. Ketika pengguna menekan tombol "Perpanjang", sistem mengubah status entri lama menjadi `renewed` ("Selesai (Diperpanjang)") dan membuat entri baru yang ditautkan ke entri lama. 

Mekanisme ini menimbulkan beberapa kelemahan:
1. **Kompleksitas State**: Muncul status ganda antara status masa aktif riil (*Aktif*, *Kedaluwarsa*) dengan status proses (*Selesai (Diperpanjang)*).
2. **Ketergantungan Data**: Baris lama terikat dengan baris baru, menyulitkan jika pengguna hanya ingin mencatat transaksi pesanan secara mandiri.
3. **Pengalaman Pengguna (UX)**: Alur penambahan periode terasa kaku karena harus melalui modal konfirmasi perpanjangan khusus.

Founder menginginkan penyederhanaan:
> *"hilangkan saja perpanjangan itu, jd 1 kali memproses data pesanan hanya 1 kali dan jika nambah data baru dgn nama klient sama kan ada perbedaan tanggal"*

---

## 2. Solusi Desain: Model Pesanan Mandiri (Standalone Order Model)

### 2.1 Konsep Fundamental
* **Satu Baris = Satu Pesanan Layanan Mandiri**: Setiap entri data pesanan adalah transaksi independen dengan tanggal mulai, tanggal berakhir, harga, dan faktur (invoice) sendiri.
* **Status Berbasis Waktu Nyata**: Status hanya mengacu pada tanggal jatuh tempo pesanan tersebut:
  * `active` (*Aktif*): Masih dalam masa aktif (> 7 hari).
  * `expiring_soon` (*Segera Berakhir*): Masa aktif sisa 2–7 hari.
  * `critical_h1` (*Kritis H-1*): Sisa 1 hari.
  * `expired` / `overdue` (*Kedaluwarsa*): Tanggal berakhir telah lewat.
* **Tidak Ada Status `renewed`**: Pesanan periode lalu yang sudah lewat tanggal berakhirnya murni berstatus *Kedaluwarsa / Selesai Masa Aktif*, tanpa status relasi buatan.

---

## 3. Alur Kerja Pengguna (User Workflows)

### 3.1 Alur Shortcut "Order Lagi" (Repeat Order)
Tombol **"Order Lagi"** menggantikan tombol "Perpanjang" di setiap baris tabel.
1. Pengguna mengklik tombol **"Order Lagi"** pada baris pesanan klien tertentu (misal: Dimas Imansyah periode Agustus).
2. Modal input pesanan terbuka dengan *field* otomatis terisi:
   * **Klien**: Terpilih otomatis (Nama, Email, dan WhatsApp otomatis tersinkronisasi).
   * **Layanan**: Otomatis terpilih (default: Google One 5 TB, Rp 150.000).
   * **Tanggal Mulai**: Otomatis terisi tanggal berakhir dari pesanan yang dipilih (contoh: `2026-09-03`).
   * **Tanggal Berakhir**: Otomatis dihitung +1 bulan menggunakan perhitungan lokal bebas deviasi UTC (`2026-10-03`).
   * **Nominal**: Rp 150.000 (dapat diedit jika ada promo/penyesuaian).
3. Pengguna menekan tombol **"Simpan & Buat Invoice"**:
   * Sistem membuat 1 entri pesanan baru.
   * Sistem menerbitkan invoice resmi baru (`INV-YYYY-MMDD-NN`).
   * Pop-up pratinjau invoice PDF langsung terbuka siap cetak atau dikirim via WhatsApp.
   * Tabel langsung me-refresh dan pesanan baru muncul di baris teratas.

### 3.2 Alur Tombol "+ Tambah Pesanan Baru" (Di Atas Tabel)
1. Pengguna mengklik tombol **"+ Tambah Pesanan Baru"**.
2. Modal menyediakan pilihan:
   * **Pilih Klien yang Sudah Ada**: Dropdown daftar klien yang sudah tersimpan (memilih klien akan otomatis mengisi data kontak dan menyarankan tanggal lanjutan dari pesanan terakhir klien tersebut).
   * **Input Klien Baru**: Input nama, email, nomor WhatsApp untuk klien yang belum terdaftar.
3. Tentukan periode layanan dan nominal.
4. Klik **"Simpan & Buat Invoice"**.

---

## 4. Perubahan Komponen Teknis

### 4.1 UI & Layout (`index.html`)
* Hapus modal perpanjangan lama (`modal-renew`).
* Perbarui modal pesanan (`modal-new-order`) dengan dukungan mode input baru atau pre-fill dari shortcut "Order Lagi".
* Pada tabel daftar langganan:
  * Tombol aksi per baris:
    1. 🖨️ **Cetak Invoice** (`app.previewInvoice(sub.lastInvoiceId || sub.id)`)
    2. 🔄 **Order Lagi** (`app.openRepeatOrder(sub.id)`)
    3. ✏️ **Ubah Periode** (`app.openEditPeriod(sub.id)`)
    4. 🗑️ **Hapus** (`app.deleteSub(sub.id)`)

### 4.2 Logika Aplikasi (`js/app.js`)
* Hapus fungsi `openRenewModal()`, `updateRenewalDates()`, dan `executeRenewalConfirmed()`.
* Tambahkan fungsi `openRepeatOrder(subId)`:
  * Mengambil data pesanan sumber.
  * Menghitung tanggal mulai (`sub.endDate`) dan tanggal berakhir (+1 bulan via `automation.addMonths`).
  * Membuka form pesanan baru dengan data terisi.
* Fungsi `saveNewOrder(formData)`:
  * Memproses penyimpanan 1 kali.
  * Menghasilkan invoice baru.
  * Membuka pratinjau PDF.

### 4.3 Database Layer (`js/db.js`)
* Hilangkan dependensi status `'renewed'`.
* Standarisasi query `getSubscriptions()` agar mengurutkan pesanan berdasarkan tanggal mulai / pembuatan terbaru (`createdAt` desc).
* Pastikan entri baseline Dimas Imansyah tersimpan sebagai pesanan mandiri yang bersih.

---

## 5. Kriteria Keberhasilan & Verifikasi
1. Tidak ada lagi tombol atau teks bertuliskan "Perpanjang" atau status "Diperpanjang".
2. Mengklik "Order Lagi" pada pesanan Dimas Imansyah otomatis mengisi nama Dimas, tanggal mulai `2026-09-03`, tanggal berakhir `2026-10-03`, dan nominal Rp 150.000.
3. Menyimpan pesanan menghasilkan baris baru independen di tabel dan invoice baru yang dapat dicetak.
4. Baris pesanan lama tetap memiliki tombol cetak invoice dokumen lamanya (`INV-2026-0803-01`).
5. Seluruh fungsi JavaScript lolos verifikasi `node -c` (0 syntax error).
