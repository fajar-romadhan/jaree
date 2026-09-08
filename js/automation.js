/**
 * JAREE — Automation Engine (automation.js)
 * Skenario Simple & Otomatis Penuh:
 * 1. Deteksi status H-1 secara real-time.
 * 2. Otomatis terbitkan Invoice baru jika belum dibuat untuk periode berikutnya.
 * 3. Otomatis kirim email peringatan & tagihan ke klien via EmailJS.
 * 4. Sediakan tautan 1-klik WhatsApp dengan template resmi.
 */

class AutomationEngine {
  constructor() {
    this.logs = [];
  }

  // Utilitas Tanggal Lokal (Bebas Pergeseran Zona Waktu UTC)
  parseLocalDate(str) {
    if (!str) return new Date();
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  formatToISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  addMonths(startDateStr, months) {
    const date = this.parseLocalDate(startDateStr);
    date.setMonth(date.getMonth() + months);
    return this.formatToISO(date);
  }

  getTodayISO() {
    return this.formatToISO(new Date());
  }

  // Hitung selisih hari dari hari ini ke target date
  getDaysDifference(endDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = endDateStr.split('-').map(Number);
    const end = new Date(y, m - 1, d, 0, 0, 0);
    return Math.round((end - today) / (1000 * 60 * 60 * 24));
  }

  // Hitung status langganan berdasarkan selisih hari
  calculateStatus(daysLeft) {
    if (daysLeft > 7) return 'active';
    if (daysLeft > 1) return 'expiring_soon';
    if (daysLeft >= 0) return 'critical_h1';
    return 'overdue';
  }

  formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  }

  formatDateId(dateStr) {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12, 0, 0);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  }

  // Skenario Utama: Eksekusi Otomasi Penuh (Auto-Invoice + Auto-Email)
  async executeFullAutomation(subId, force = false) {
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) return { success: false, message: 'Langganan tidak ditemukan.' };

    const client = window.db.getClientById(sub.clientId);
    const settings = window.db.getSettings();
    const daysLeft = this.getDaysDifference(sub.endDate);
    const todayISO = this.getTodayISO();

    const steps = [];

    // Langkah 1: Evaluasi Kebutuhan Invoice
    steps.push(`Mengecek masa aktif ${sub.serviceSnapshot.name}: sisa ${daysLeft} hari.`);
    let invoice = null;

    // Cek apakah invoice periode berjalan / perpanjangan sudah ada
    if (sub.lastInvoiceId) {
      invoice = window.db.getInvoiceById(sub.lastInvoiceId);
    }

    // Jika H-1 atau force triggered, dan belum ada invoice unpaid untuk perpanjangan:
    // Otomatis terbitkan invoice baru untuk periode berikutnya!
    const needsNewInvoice = force || (daysLeft <= 1 && (!invoice || invoice.status === 'paid'));

    if (needsNewInvoice) {
      const invNumber = window.invoiceEngine.generateInvoiceNumber();
      
      // Hitung tanggal periode baru
      const newStart = sub.endDate;
      const newEnd = this.addMonths(newStart, 1);

      invoice = {
        id: invNumber,
        invoiceNumber: invNumber,
        subscriptionId: sub.id,
        clientId: client.id,
        clientSnapshot: {
          name: client.name,
          email: client.email,
          phone: client.phone
        },
        issueDate: todayISO,
        dueDate: sub.endDate,
        servicePeriod: {
          from: newStart,
          to: newEnd
        },
        items: [
          {
            description: `${sub.serviceSnapshot.name} · 1 akun · berbayar per bulan`,
            qty: 1,
            unit: 'bulan',
            unitPrice: sub.price,
            total: sub.price
          }
        ],
        subtotal: sub.price,
        tax: 0,
        total: sub.price,
        paymentDetails: {
          bankName: settings.payment.bankName,
          accountNumber: settings.payment.accountNumber,
          accountName: settings.payment.accountName
        },
        notes: [
          'Tagihan perpanjangan masa aktif Penyimpanan Drive 5 TB.',
          'Mohon lakukan transfer sebelum tanggal jatuh tempo agar akun tetap aktif.',
          'Kirimkan bukti transfer setelah pembayaran dilakukan.'
        ],
        status: 'unpaid',
        paidAt: null,
        createdAt: new Date().toISOString()
      };

      window.db.saveInvoice(invoice);
      sub.lastInvoiceId = invoice.invoiceNumber;
      steps.push(`✅ Otomatis menerbitkan Invoice baru: ${invoice.invoiceNumber}`);
    } else {
      steps.push(`Invoice ${invoice.invoiceNumber} sudah tersedia.`);
    }

    // Langkah 2: Otomatis Kirim Email Notifikasi & Tagihan
    let emailResult = 'Simulated / Logged';
    const emailConfig = settings.email;
    const isEmailConfigured = emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey;

    const subject = `⚠️ [JAREE] Tagihan Perpanjangan: Langganan ${sub.serviceSnapshot.name} Berakhir Besok!`;

    if (isEmailConfigured && window.emailjs && client.email) {
      try {
        emailjs.init(emailConfig.publicKey);
        await emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
          to_name: client.name,
          to_email: client.email,
          service_name: sub.serviceSnapshot.name,
          invoice_number: invoice ? invoice.invoiceNumber : '-',
          due_date: this.formatDateId(sub.endDate),
          price: this.formatRupiah(sub.price),
          bank_name: settings.payment.bankName,
          account_number: settings.payment.accountNumber,
          account_name: settings.payment.accountName,
          reply_to: settings.profile.email
        });
        emailResult = 'Terkirim Sukses via EmailJS';
        steps.push(`✅ Email tagihan terkirim ke ${client.email}`);
      } catch (err) {
        emailResult = 'Gagal kirim: ' + (err.text || err.message);
        steps.push(`⚠️ Gagal mengirim email: ${err.message || 'API key belum valid'}`);
      }
    } else {
      steps.push(`ℹ️ Email otomatis dicatat dalam log antrean (EmailJS API Key belum diisi di Pengaturan).`);
    }

    // Update timestamp reminder
    sub.remindersSent = sub.remindersSent || {};
    sub.remindersSent.h1 = new Date().toISOString();
    window.db.saveSubscription(sub);

    // Catat Log Pengiriman
    window.db.addReminderLog({
      subscriptionId: sub.id,
      clientId: client.id,
      channel: 'email',
      triggerType: 'h1',
      recipient: client.email,
      subjectOrPreview: `${subject} (Invoice: ${invoice ? invoice.invoiceNumber : '-'})`,
      status: emailResult.includes('Sukses') ? 'success' : 'manual_sent'
    });

    const wa = this.generateWhatsAppBillingLink(sub, client, invoice);

    return {
      success: true,
      steps,
      invoice,
      waLink: wa.link,
      message: `Automasi selesai! Invoice ${invoice ? invoice.invoiceNumber : ''} aktif & notifikasi telah disiapkan.`
    };
  }

  // Template Pesan WhatsApp 1-Klik yang Sopan dan Jelas
  generateWhatsAppBillingLink(sub, client, invoice = null) {
    const settings = window.db.getSettings();
    const daysLeft = this.getDaysDifference(sub.endDate);
    const invNum = invoice ? invoice.invoiceNumber : (sub.lastInvoiceId || 'INV-TERBARU');

    let deadlineNote = `besok (${this.formatDateId(sub.endDate)})`;
    if (daysLeft === 0) deadlineNote = `hari ini (${this.formatDateId(sub.endDate)})`;
    if (daysLeft < 0) deadlineNote = `pada ${this.formatDateId(sub.endDate)}`;

    const message = 
`Halo Kak *${client.name}*, salam dari *JAREE* 🙏

Mengingatkan bahwa langganan:
📦 *Layanan:* ${sub.serviceSnapshot.name}
🗓️ *Jatuh Tempo:* Akan berakhir *${deadlineNote}*
📄 *No. Invoice:* \`${invNum}\`
💰 *Total Tagihan:* *${this.formatRupiah(sub.price)}*

Pembayaran dapat ditransfer melalui:
🏦 *${settings.payment.bankName}*
💳 Rekening: *${settings.payment.accountNumber}*
👤 a.n: *${settings.payment.accountName}*

Jika sudah melakukan transfer, mohon kirimkan bukti pembayaran ke sini ya kak agar kapasitas akun Google Drive langsung kami perpanjang tanpa jeda. Terima kasih banyak! ✨

_JAREE · Digital IT Solutions_`;

    let cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
    if (!cleanPhone.startsWith('62') && cleanPhone.length > 5) cleanPhone = '62' + cleanPhone;

    return {
      phone: cleanPhone,
      message,
      link: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    };
  }

  // =========================================================
  // MODUL EMAIL OTOMATIS (EMAILJS & GMAIL 1-KLIK)
  // =========================================================

  // Menghasilkan draf email resmi (Subjek & Isi Teks) sesuai jenis notifikasi
  generateEmailDraft(type, client, invoice = null, sub = null) {
    const settings = window.db.getSettings();
    const serviceName = (invoice && invoice.items && invoice.items[0]?.description)
      ? invoice.items[0].description.split('·')[0].trim().replace(/Google One/g, 'Penyimpanan Drive')
      : (sub?.serviceSnapshot?.name ? sub.serviceSnapshot.name.replace(/Google One/g, 'Penyimpanan Drive') : 'Penyimpanan Drive 5 TB');

    const invNumber = invoice ? invoice.invoiceNumber : (sub?.lastInvoiceId || 'INV-2026-0803-01');
    const priceStr = invoice ? this.formatRupiah(invoice.total) : (sub ? this.formatRupiah(sub.price) : 'Rp 150.000');
    
    let periodStr = '-';
    if (invoice?.servicePeriod?.from && invoice?.servicePeriod?.to) {
      periodStr = `${this.formatDateId(invoice.servicePeriod.from)} – ${this.formatDateId(invoice.servicePeriod.to)}`;
    } else if (sub?.startDate && sub?.endDate) {
      periodStr = `${this.formatDateId(sub.startDate)} – ${this.formatDateId(sub.endDate)}`;
    }

    const dueDateStr = invoice?.dueDate ? this.formatDateId(invoice.dueDate) : (sub?.endDate ? this.formatDateId(sub.endDate) : '-');

    let subject = '';
    let body = '';

    const officialEmail = 'fajaromadhan@gmail.com';
    const officialPhone = '085783656335';
    const officialWaLink = 'https://wa.me/6285783656335';

    const contactFooterText = 
`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 INFORMASI & BANTUAN LANJUTAN:
Jika ada pertanyaan, butuh bantuan perpanjangan, atau ingin konfirmasi pembayaran:
✉️ Email Resmi: ${officialEmail}
💬 WhatsApp Resmi: ${officialWaLink} (${officialPhone})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Salam hangat,
JAREE — Digital IT Solutions & Cloud Service
Fajar Romadhan (Founder)`;

    const isPaid = (invoice && invoice.status === 'paid') || (sub && (sub.status === 'completed' || sub.status === 'paid'));
    const paidDateStr = (invoice && invoice.paidAt) 
      ? this.formatDateId(invoice.paidAt.slice(0, 10)) 
      : (invoice?.issueDate ? this.formatDateId(invoice.issueDate) : this.formatDateId(this.getTodayISO()));

    // Buat tautan faktur digital resmi (Online PDF Viewer)
    let digitalInvoiceLink = '';
    try {
      const origin = window.location.origin;
      if (origin && origin !== 'null' && !origin.startsWith('file:') && invoice) {
        const encoded = this.encodeInvoiceForUrl(invoice, client, settings);
        if (encoded) digitalInvoiceLink = `${origin}/?d=${encoded}`;
      }
    } catch (e) {
      console.warn('Could not generate digital invoice link', e);
    }

    if (type === 'paid_confirmation' || (type === 'invoice' && isPaid)) {
      // 1. DRAF BUKTI PEMBAYARAN / KWITANSI RESMI (STATUS LUNAS)
      subject = `[JAREE] Bukti Pembayaran Lunas (Kwitansi) — Invoice ${invNumber}`;
      body = 
`Halo Kak ${client.name},

Terima kasih banyak atas pembayaran Anda!
Kami mengonfirmasi bahwa tagihan invoice ${invNumber} sebesar ${priceStr} telah KAMI TERIMA & DIVERIFIKASI LUNAS.

📄 Tanda Terima & Rincian Layanan:
• No. Invoice: ${invNumber}
• Layanan: ${serviceName}
• Periode Masa Aktif: ${periodStr}
• Status Pembayaran: LUNAS (Terverifikasi Resmi)
• Tanggal Pembayaran: ${paidDateStr}

Akun ${serviceName} Anda telah aktif sepenuhnya untuk periode di atas tanpa jeda atau kendala. Dokumen ini berlaku sebagai bukti pembayaran dan kwitansi resmi dari JAREE.

${contactFooterText}`;

    } else if (type === 'reminder_h1') {
      if (isPaid) {
        // Jika sudah lunas, tidak boleh menagih pembayaran lagi
        subject = `[JAREE] Info Masa Aktif Layanan ${serviceName} — Periode Berjalan Lunas`;
        body = 
`Halo Kak ${client.name},

Mengingatkan bahwa periode masa aktif berjalan untuk layanan ${serviceName} Anda akan berakhir besok (${dueDateStr}).

Rincian Status Layanan:
• Layanan: ${serviceName}
• Periode Masa Aktif: ${periodStr}
• Status Pembayaran: LUNAS (Tidak ada tagihan tertunggak)

Terima kasih atas kerja sama dan kepercayaan Anda bersama JAREE. Akun Anda tetap aktif lancar.

${contactFooterText}`;
      } else {
        // Belum lunas: Pengingat penagihan H-1 mendesak
        subject = `⚠️ [JAREE] Pengingat Jatuh Tempo: Layanan ${serviceName} Berakhir Besok!`;
        body = 
`Halo Kak ${client.name},

Mengingatkan bahwa masa aktif layanan ${serviceName} Anda akan berakhir besok (${dueDateStr}).

Rincian Tagihan:
📄 No. Invoice: ${invNumber}
🗓️ Periode Perpanjangan: ${periodStr}
💰 Total Tagihan: ${priceStr}
⏰ Batas Waktu: ${dueDateStr}

Instruksi Pembayaran:
Bank: ${settings.payment.bankName}
No. Rekening: ${settings.payment.accountNumber}
Atas Nama: ${settings.payment.accountName}

Agar kapasitas penyimpanan akun Google Drive Anda tetap aktif lancar tanpa jeda, mohon selesaikan transfer sebelum jatuh tempo ya kak.

${contactFooterText}`;
      }

    } else {
      // Default: Invoice Tagihan Baru (Khusus Belum Lunas)
      subject = `[JAREE] Tagihan Invoice Layanan ${serviceName} — ${invNumber}`;
      body = 
`Halo Kak ${client.name},

Terima kasih atas kepercayaan Anda menggunakan layanan di JAREE.
Berikut kami sampaikan rincian tagihan invoice untuk periode layanan Anda:

📄 No. Invoice: ${invNumber}
📦 Layanan: ${serviceName}
🗓️ Periode Layanan: ${periodStr}
⏰ Jatuh Tempo: ${dueDateStr}
💰 Total Tagihan: ${priceStr}

Pembayaran dapat ditransfer melalui rekening resmi JAREE:
🏦 Bank: ${settings.payment.bankName}
💳 No. Rekening: ${settings.payment.accountNumber}
👤 Atas Nama: ${settings.payment.accountName}

Mohon lakukan transfer sebelum tanggal jatuh tempo. Setelah melakukan transfer, Anda dapat langsung mengirimkan bukti pembayaran melalui WhatsApp atau email resmi kami di bawah ini:

${contactFooterText}`;
    }

    const templateParams = {
      to_name: client.name,
      to_email: client.email || '',
      service_name: serviceName,
      invoice_number: invNumber,
      service_period: periodStr,
      due_date: dueDateStr,
      total_amount: priceStr,
      bank_name: settings.payment.bankName,
      account_number: settings.payment.accountNumber,
      account_name: settings.payment.accountName,
      reply_to: officialEmail,
      sender_email: officialEmail,
      sender_phone: officialPhone,
      sender_wa_link: officialWaLink,
      sender_name: settings.profile.ownerName || 'Fajar Romadhan',
      contact_info: `Email: ${officialEmail} | WhatsApp: ${officialWaLink} (${officialPhone})`,
      subject: subject,
      message: body,
      clientId: client.id,
      subscriptionId: sub?.id || (invoice?.subscriptionId || '')
    };

    return {
      recipient: client.email || '',
      clientName: client.name || '',
      subject,
      body,
      templateParams
    };
  }

  // Menghasilkan tautan compose Gmail Web 1-klik (Gratis selamanya)
  generateGmailComposeUrl(recipient, subject, body) {
    const base = 'https://mail.google.com/mail/?view=cm&fs=1';
    return `${base}&to=${encodeURIComponent(recipient || '')}&su=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
  }

  // Mengirim email secara otomatis di latar belakang menggunakan EmailJS
  async sendEmailDirect(recipient, subject, body, templateParams = {}) {
    const settings = window.db.getSettings();
    const emailConfig = settings.email || {};
    const isConfigured = emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey;

    if (!isConfigured) {
      return {
        success: false,
        reason: 'not_configured',
        message: 'Kunci EmailJS (Service ID, Template ID, Public Key) belum diisi di menu Pengaturan.'
      };
    }

    if (!window.emailjs) {
      return {
        success: false,
        reason: 'library_missing',
        message: 'Pustaka EmailJS belum termuat di peramban.'
      };
    }

    try {
      window.emailjs.init(emailConfig.publicKey);
      const res = await window.emailjs.send(emailConfig.serviceId, emailConfig.templateId, {
        ...templateParams,
        to_email: recipient,
        subject: subject,
        message: body
      });

      // Catat riwayat ke log database
      window.db.addReminderLog({
        subscriptionId: templateParams.subscriptionId || 'MANUAL',
        clientId: templateParams.clientId || 'MANUAL',
        channel: 'email',
        triggerType: 'invoice_issued',
        recipient: recipient,
        subjectOrPreview: subject,
        status: 'success'
      });

      return {
        success: true,
        response: res,
        message: `Email otomatis berhasil terkirim ke ${recipient}!`
      };
    } catch (err) {
      const errMsg = err.text || err.message || JSON.stringify(err);
      window.db.addReminderLog({
        subscriptionId: templateParams.subscriptionId || 'MANUAL',
        clientId: templateParams.clientId || 'MANUAL',
        channel: 'email',
        triggerType: 'invoice_issued',
        recipient: recipient,
        subjectOrPreview: subject,
        status: 'failed',
        error: errMsg
      });

      return {
        success: false,
        reason: 'api_error',
        message: `Gagal mengirim email via EmailJS: ${errMsg}`
      };
    }
  }

  // Serialisasi data invoice menjadi string aman URL untuk Client Viewer
  encodeInvoiceForUrl(invoice, client, settings) {
    try {
      const payload = {
        id: invoice.invoiceNumber || invoice.id,
        c: client?.name || invoice.clientSnapshot?.name || 'Pelanggan',
        e: client?.email || invoice.clientSnapshot?.email || '',
        p: client?.phone || invoice.clientSnapshot?.phone || '',
        desc: invoice.items?.[0]?.description || 'Penyimpanan Drive 5 TB',
        tot: invoice.total || 150000,
        from: invoice.servicePeriod?.from || '',
        to: invoice.servicePeriod?.to || '',
        due: invoice.dueDate || '',
        st: invoice.status || 'paid',
        pa: invoice.paidAt || '',
        b: settings.payment?.bankName || 'SeaBank',
        r: settings.payment?.accountNumber || '901448683446',
        a: settings.payment?.accountName || 'Fajar Romadhan'
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    } catch (err) {
      return '';
    }
  }

  // Dekode data invoice dari parameter URL
  decodeInvoiceFromUrl(encodedStr) {
    try {
      const json = decodeURIComponent(escape(atob(encodedStr)));
      const p = JSON.parse(json);
      return {
        id: p.id,
        invoiceNumber: p.id,
        clientId: 'CLT-ONLINE',
        clientSnapshot: { name: p.c, email: p.e, phone: p.p },
        servicePeriod: { from: p.from, to: p.to },
        dueDate: p.due,
        issueDate: p.due || p.from,
        items: [{
          description: p.desc,
          qty: 1,
          unit: 'periode',
          unitPrice: p.tot,
          total: p.tot
        }],
        subtotal: p.tot,
        tax: 0,
        total: p.tot,
        status: p.st,
        paidAt: p.pa,
        paymentDetails: {
          bankName: p.b,
          accountNumber: p.r,
          accountName: p.a
        },
        notes: p.st === 'paid' ? [
          'Pembayaran telah diterima — terima kasih.',
          'Akun Penyimpanan Drive 5 TB aktif untuk periode layanan di atas.',
          'Perpanjangan ditagihkan pada awal periode berikutnya.'
        ] : [
          'Menunggu konfirmasi pembayaran transfer bank.',
          'Silakan transfer sebelum tanggal jatuh tempo.',
          'Kirim bukti transfer ke WhatsApp atau email resmi JAREE.'
        ]
      };
    } catch (e) {
      return null;
    }
  }
}

window.automation = new AutomationEngine();


