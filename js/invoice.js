/**
 * JAREE — Invoice Generator & Renderer (invoice.js)
 * Replicates the exact layout, typography, and styling of INV-2026-0803-01.
 */

class InvoiceEngine {
  constructor() {
    this._stampCache = {};
  }

  // Format nomor invoice: INV-YYYY-MMDD-NN
  generateInvoiceNumber(dateObj = new Date()) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const mmdd = `${month}${day}`;

    const invoices = window.db.getInvoices();
    const prefixToday = `INV-${year}-${mmdd}`;
    const todayInvs = invoices.filter(i => i.invoiceNumber && i.invoiceNumber.startsWith(prefixToday));

    const seq = String(todayInvs.length + 1).padStart(2, '0');
    return `${prefixToday}-${seq}`;
  }

  // Menghitung tanggal jatuh tempo default (misal 7 hari dari issue date)
  calculateDueDate(issueDateStr, dueDays = 7) {
    const [y, m, d] = issueDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    date.setDate(date.getDate() + dueDays);
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const dy = String(date.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  }

  // Format rupiah
  formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  }

  // Format tanggal Indonesia
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

  // Generate Cap Stempel Resmi sebagai High-Resolution Base64 PNG via HTML5 Canvas
  // Solusi 100% kompatibel dengan html2pdf.js, html2canvas, dan window.print()
  generateStampDataUrl(isPaid) {
    const cacheKey = isPaid ? 'paid' : 'unpaid';
    if (this._stampCache && this._stampCache[cacheKey]) {
      return this._stampCache[cacheKey];
    }
    if (!this._stampCache) this._stampCache = {};

    try {
      if (typeof document === 'undefined') return null;
      const canvas = document.createElement('canvas');
      const size = 320;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const cx = size / 2; // 160
      const cy = size / 2; // 160
      const stampColor = isPaid ? '#b91c1c' : '#4F7BAE';

      ctx.clearRect(0, 0, size, size);

      // 1. Lingkaran luar solid
      ctx.strokeStyle = stampColor;
      ctx.lineWidth = 4.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 146, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Lingkaran kedua (tepi dalam ring)
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 136, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Lingkaran ketiga (garis putus-putus inner)
      ctx.lineWidth = 1.6;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, 94, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Dua garis pemisah horizontal tengah
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(64, 120);
      ctx.lineTo(256, 120);
      ctx.moveTo(64, 200);
      ctx.lineTo(256, 200);
      ctx.stroke();

      // 5. Teks Melingkar Atas: ★ JAREE IT ECOSYSTEM ★
      const topText = '★ JAREE IT ECOSYSTEM ★';
      const topChars = topText.split('');
      const topRadius = 114;
      const topStartAngle = -Math.PI * 0.78;
      const topEndAngle = -Math.PI * 0.22;
      const topStep = (topEndAngle - topStartAngle) / (topChars.length - 1);

      ctx.fillStyle = stampColor;
      ctx.font = "bold 15px 'Plus Jakarta Sans', Inter, Arial, sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < topChars.length; i++) {
        const char = topChars[i];
        const angle = topStartAngle + i * topStep;
        const x = cx + topRadius * Math.cos(angle);
        const y = cy + topRadius * Math.sin(angle);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      // 6. Teks Melingkar Bawah: ★ FAJAR ROMADHAN · SAH ★
      const botText = '★ FAJAR ROMADHAN · SAH ★';
      const botChars = botText.split('');
      const botRadius = 114;
      const botStartAngle = Math.PI * 0.78;
      const botEndAngle = Math.PI * 0.22;
      const botStep = (botEndAngle - botStartAngle) / (botChars.length - 1);

      ctx.font = "bold 13.5px 'Plus Jakarta Sans', Inter, Arial, sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < botChars.length; i++) {
        const char = botChars[i];
        const angle = botStartAngle + i * botStep;
        const x = cx + botRadius * Math.cos(angle);
        const y = cy + botRadius * Math.sin(angle);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle - Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      // 7. Teks Inti Stempel Tengah
      ctx.font = `900 ${isPaid ? '28px' : '24px'} 'Plus Jakarta Sans', Inter, Arial, sans-serif`;
      ctx.fillText(isPaid ? 'L U N A S' : 'TAGIHAN', cx, 148);

      ctx.font = "bold 11.5px 'Plus Jakarta Sans', Inter, Arial, sans-serif";
      ctx.fillText(isPaid ? 'TERVERIFIKASI RESMI' : 'ORIGINAL INVOICE', cx, 176);

      const dataUrl = canvas.toDataURL('image/png');
      this._stampCache[cacheKey] = dataUrl;
      return dataUrl;
    } catch (e) {
      console.warn('Gagal generate canvas stamp:', e);
      return null;
    }
  }

  // Render Cap Stempel Perusahaan Resmi & Profesional (High-Res Canvas PNG Rasterization)
  renderOfficialStamp(invoice) {
    const isPaid = invoice.status === 'paid';
    const stampDataUrl = this.generateStampDataUrl(isPaid);

    if (stampDataUrl) {
      return `
        <div class="official-stamp-badge ${isPaid ? 'stamp-paid' : 'stamp-unpaid'}">
          <img class="stamp-img" src="${stampDataUrl}" alt="${isPaid ? 'Cap Lunas JAREE' : 'Cap Tagihan JAREE'}" />
        </div>
      `;
    }

    // Fallback jika canvas tidak didukung
    return this.renderOfficialStampSVG(invoice);
  }

  // Render Cap Stempel Perusahaan Resmi & Profesional (Double Ring Curved SVG Fallback)
  renderOfficialStampSVG(invoice) {
    const isPaid = invoice.status === 'paid';
    const stampColor = isPaid ? '#b91c1c' : '#4F7BAE';
    const uid = (invoice.invoiceNumber || 'INV').replace(/[^a-zA-Z0-9]/g, '');

    return `
      <div class="official-stamp-badge ${isPaid ? 'stamp-paid' : 'stamp-unpaid'}">
        <svg class="stamp-svg" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Jalur teks melingkar atas (radius 48) -->
            <path id="top-arc-${uid}" d="M 16,70 A 48,48 0 0,1 124,70" fill="none" />
            <!-- Jalur teks melingkar bawah (radius 48) -->
            <path id="bot-arc-${uid}" d="M 124,70 A 48,48 0 0,1 16,70" fill="none" />
          </defs>

          <!-- Lingkaran Ganda Luar & Dalam -->
          <circle cx="70" cy="70" r="66" fill="none" stroke="${stampColor}" stroke-width="2.5" />
          <circle cx="70" cy="70" r="61" fill="none" stroke="${stampColor}" stroke-width="1" />
          <circle cx="70" cy="70" r="40" fill="none" stroke="${stampColor}" stroke-width="0.8" stroke-dasharray="3 2" />

          <!-- Teks Melingkar Atas: JAREE IT ECOSYSTEM -->
          <text font-family="'Plus Jakarta Sans', Inter, Arial, sans-serif" font-size="7.6" font-weight="800" fill="${stampColor}" letter-spacing="1.5">
            <textPath href="#top-arc-${uid}" xlink:href="#top-arc-${uid}" startOffset="50%" text-anchor="middle">★ JAREE IT ECOSYSTEM ★</textPath>
          </text>

          <!-- Teks Melingkar Bawah: FAJAR ROMADHAN -->
          <text font-family="'Plus Jakarta Sans', Inter, Arial, sans-serif" font-size="7.2" font-weight="800" fill="${stampColor}" letter-spacing="1.2">
            <textPath href="#bot-arc-${uid}" xlink:href="#bot-arc-${uid}" startOffset="50%" text-anchor="middle">★ FAJAR ROMADHAN · SAH ★</textPath>
          </text>

          <!-- Garis Pemisah Horizontal Tengah -->
          <line x1="28" y1="52" x2="112" y2="52" stroke="${stampColor}" stroke-width="1.5" />
          <line x1="28" y1="88" x2="112" y2="88" stroke="${stampColor}" stroke-width="1.5" />

          <!-- Teks Inti Stempel -->
          <text x="70" y="72" text-anchor="middle" font-family="'Plus Jakarta Sans', Inter, Arial, sans-serif" font-size="${isPaid ? '15' : '13'}" font-weight="900" fill="${stampColor}" letter-spacing="${isPaid ? '3.5' : '2'}">${isPaid ? 'L U N A S' : 'TAGIHAN'}</text>
          <text x="70" y="82" text-anchor="middle" font-family="'Plus Jakarta Sans', Inter, Arial, sans-serif" font-size="6.5" font-weight="700" fill="${stampColor}" letter-spacing="0.8">${isPaid ? 'TERVERIFIKASI RESMI' : 'ORIGINAL INVOICE'}</text>
        </svg>
      </div>
    `;
  }

  // Eksekusi siklus perpanjangan (Renewal Workflow)
  renewSubscription(subId, markAsPaid = true) {
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) throw new Error('Langganan tidak ditemukan');

    const client = window.db.getClientById(sub.clientId);
    const settings = window.db.getSettings();

    // Hitung periode baru: startDate = old endDate, new endDate = old endDate + 1 month
    const newStart = sub.endDate;
    const newEnd = window.automation ? window.automation.addMonths(newStart, 1) : this.calculateDueDate(newStart, 30);
    const todayStr = window.automation ? window.automation.getTodayISO() : newStart;
    const invoiceNum = this.generateInvoiceNumber();

    // Buat Invoice baru
    const newInvoice = {
      id: invoiceNum,
      invoiceNumber: invoiceNum,
      subscriptionId: sub.id,
      clientId: client.id,
      clientSnapshot: {
        name: client.name,
        email: client.email,
        phone: client.phone
      },
      issueDate: todayStr,
      dueDate: this.calculateDueDate(todayStr, settings.invoice.defaultDueDays),
      servicePeriod: {
        from: newStart,
        to: newEnd
      },
      items: [
        {
          description: sub.serviceSnapshot.description || `${sub.serviceSnapshot.name} · berbayar per bulan`,
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
        markAsPaid ? 'Pembayaran telah diterima — terima kasih.' : 'Menunggu konfirmasi pembayaran transfer bank.',
        `Akun ${sub.serviceSnapshot.name} aktif untuk periode layanan di atas.`,
        'Perpanjangan ditagihkan pada awal periode berikutnya.'
      ],
      status: markAsPaid ? 'paid' : 'unpaid',
      paidAt: markAsPaid ? new Date().toISOString() : null,
      createdAt: new Date().toISOString()
    };

    // Simpan Invoice
    window.db.saveInvoice(newInvoice);

    // Update Subscription (reset reminders, perpanjang periode)
    sub.startDate = newStart;
    sub.endDate = newEnd;
    sub.status = 'active';
    sub.lastInvoiceId = newInvoice.invoiceNumber;
    sub.remindersSent = {
      h7: null,
      h3: null,
      h1: null,
      h0: null,
      overdue: null
    };
    window.db.saveSubscription(sub);

    return { subscription: sub, invoice: newInvoice };
  }

  // Render Template HTML Invoice Resmi JAREE (Spesifikasi INV-2026-0803-01)
  renderInvoiceHTML(invoice) {
    const settings = window.db.getSettings();
    const isPaid = invoice.status === 'paid';
    const statusBadgeClass = isPaid ? 'badge-paid' : 'badge-unpaid';
    const statusText = isPaid ? 'LUNAS' : 'MENUNGGU PEMBAYARAN';

    return `
    <div class="jaree-invoice-sheet" id="invoice-printable-area">
      <!-- 1. HEADER ROW -->
      <div class="inv-header">
        <div class="inv-brand-col">
          <div class="inv-brand-row">
            <div class="inv-logo-mark">J</div>
            <div>
              <div class="inv-brand-name">${settings.profile.brandName || 'JAREE'}</div>
              <div class="inv-brand-sub">Digital IT Solutions & Cloud Service</div>
            </div>
          </div>
          <div class="inv-brand-meta">
            <span>${settings.profile.email}</span> · <span>${settings.payment.bankName} ${settings.payment.accountNumber}</span>
          </div>
        </div>
        <div class="inv-title-col">
          <div class="inv-title">INVOICE</div>
          <div class="inv-number-badge">${invoice.invoiceNumber}</div>
          <div class="inv-status-pill ${statusBadgeClass}">
            <span class="status-dot"></span> ${statusText}
          </div>
        </div>
      </div>

      <div class="inv-divider-thick"></div>

      <!-- 2. METADATA & CLIENT ROW -->
      <div class="inv-meta-grid">
        <div class="inv-client-box">
          <div class="inv-section-tag">TAGIHAN KEPADA</div>
          <div class="inv-client-name">${invoice.clientSnapshot.name || 'Pelanggan'}</div>
          <div class="inv-client-info">${invoice.clientSnapshot.email || '-'}</div>
          <div class="inv-client-info">${invoice.clientSnapshot.phone || '-'}</div>
        </div>

        <div class="inv-details-box">
          <div class="inv-section-tag">RINCIAN DOKUMEN</div>
          <div class="inv-detail-row">
            <span class="inv-detail-label">Tanggal Terbit</span>
            <span class="inv-detail-value">${this.formatDateId(invoice.issueDate)}</span>
          </div>
          <div class="inv-detail-row">
            <span class="inv-detail-label">Jatuh Tempo</span>
            <span class="inv-detail-value">${this.formatDateId(invoice.dueDate)}</span>
          </div>
          <div class="inv-detail-row highlight-period">
            <span class="inv-detail-label">Periode Layanan</span>
            <span class="inv-detail-value inv-period">${this.formatDateId(invoice.servicePeriod?.from)} – ${this.formatDateId(invoice.servicePeriod?.to)}</span>
          </div>
        </div>
      </div>

      <!-- 3. TABLE OF ITEMS -->
      <table class="inv-table">
        <thead>
          <tr>
            <th class="th-num">#</th>
            <th class="th-desc">DESKRIPSI LAYANAN</th>
            <th class="th-qty">QTY</th>
            <th class="th-price">HARGA SATUAN</th>
            <th class="th-total">JUMLAH</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map((item, idx) => `
            <tr>
              <td class="td-num">0${idx + 1}</td>
              <td class="td-desc">
                <div class="item-title">${(item.description || '').replace(/Google One/g, 'Penyimpanan Drive')}</div>
                <div class="item-subtitle">Akses penyimpanan cloud berkecepatan tinggi & pencadangan data resmi</div>
              </td>
              <td class="td-qty">${item.qty} ${item.unit || 'periode'}</td>
              <td class="td-price">${this.formatRupiah(item.unitPrice)}</td>
              <td class="td-total">${this.formatRupiah(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 4. TOTALS SECTION (SLATE BLUE BANNER) -->
      <div class="inv-summary-section">
        <div class="inv-summary-rows">
          <div class="summary-sub-row">
            <span>Subtotal Layanan</span>
            <span>${this.formatRupiah(invoice.subtotal)}</span>
          </div>
          <div class="summary-sub-row">
            <span>Pajak & Biaya Admin</span>
            <span>${this.formatRupiah(invoice.tax || 0)}</span>
          </div>
        </div>

        <!-- TOTAL TAGIHAN BANNER (KHAS JAREE #4F7BAE) -->
        <div class="jaree-total-banner">
          <div>
            <div class="banner-label">TOTAL TAGIHAN</div>
            <div class="banner-note">Termasuk seluruh biaya layanan</div>
          </div>
          <div class="banner-amount">${this.formatRupiah(invoice.total)}</div>
        </div>
      </div>

      <!-- 5. PAYMENT & NOTES ROW -->
      <div class="inv-bottom-grid">
        <!-- METODE PEMBAYARAN DENGAN SUDUT + (CROSSHAIR) -->
        <div class="inv-payment-box">
          <span class="corner-cross cross-tl">+</span>
          <span class="corner-cross cross-tr">+</span>
          <span class="corner-cross cross-bl">+</span>
          <span class="corner-cross cross-br">+</span>

          <div class="payment-box-title">METODE PEMBAYARAN RESMI</div>
          <div class="payment-bank-name">Transfer Bank — ${invoice.paymentDetails?.bankName || settings.payment.bankName || 'SeaBank'}</div>
          <div class="payment-account-number">${invoice.paymentDetails?.accountNumber || settings.payment.accountNumber || '901448683446'}</div>
          <div class="payment-account-name">Atas Nama: <b>${invoice.paymentDetails?.accountName || settings.payment.accountName || 'Fajar Romadhan'}</b></div>
        </div>

        <!-- CATATAN -->
        <div class="inv-notes-box">
          <div class="notes-title">KETENTUAN & CATATAN</div>
          <ul class="notes-list">
            ${(invoice.notes || []).map(note => `<li>${note.replace(/Google One/g, 'Penyimpanan Drive')}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- 6. DIGITAL VERIFICATION SEAL & SIGNATURE -->
      <div class="inv-footer-area">
        <div class="inv-seal-container">
          <!-- STEMPEL DIGITAL RESMI JAREE -->
          <div class="jaree-digital-seal">
            <svg class="seal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
            <div class="seal-text">
              <div class="seal-title">JAREE VERIFIED</div>
              <div class="seal-desc">DOKUMEN RESMI SAH</div>
            </div>
          </div>
          <div class="inv-legal-disclaimer">
            Invoice ini diterbitkan secara digital oleh sistem billing JAREE dan sah tanpa tanda tangan basah.
          </div>
        </div>

        <div class="inv-signature-block">
          <div class="signature-stamp-wrapper">
            ${this.renderOfficialStamp(invoice)}
            <div class="signature-seal-stamp">DIGITAL INVOICE</div>
            <div class="signature-line"></div>
            <div class="signature-signer">JAREE</div>
            <div class="signature-role">Penerbit Resmi Invoice</div>
          </div>
        </div>
      </div>

      <!-- 7. MICRO FOOTER BAR -->
      <div class="inv-micro-footer">
        <span>JAREE IT ECOSYSTEM · ${settings.profile.email.toUpperCase()}</span>
        <span>DOKUMEN ASLI RESMI · ${invoice.invoiceNumber}</span>
      </div>
    </div>
    `;
  }

  // Dapatkan nama file standar untuk invoice PDF (Format: INV-YYYY-MMDD-NN - Nama Klien)
  getInvoicePdfFileName(invoice) {
    if (!invoice) return 'INV-JAREE';
    const cleanInvNum = (invoice.invoiceNumber || 'INV').trim().replace(/[/\\?%*:|"<>]/g, '-');
    const clientName = (invoice.clientSnapshot?.name || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
    return clientName ? `${cleanInvNum} - ${clientName}` : cleanInvNum;
  }

  // Print atau simpan PDF via native browser print dengan penyesuaian nama file otomatis
  printInvoice(invoice) {
    if (!invoice) return;
    const fileName = this.getInvoicePdfFileName(invoice);

    // 1. Simpan judul dokumen asli & set document.title ke nama invoice resmi
    const originalTitle = document.title;
    document.title = fileName;

    // 2. Pastikan area cetak invoice di halaman utama terisi & modal terbuka
    const modalContent = document.getElementById('invoice-modal-content');
    const previewModal = document.getElementById('invoice-preview-modal');
    if (modalContent) {
      modalContent.innerHTML = this.renderInvoiceHTML(invoice);
    }
    if (previewModal && !previewModal.classList.contains('show')) {
      previewModal.classList.add('show');
    }

    // 3. Kembalikan document.title setelah dialog cetak selesai
    let restored = false;
    const restoreDocTitle = () => {
      if (restored) return;
      restored = true;
      document.title = originalTitle;
      window.removeEventListener('afterprint', restoreDocTitle);
    };
    window.addEventListener('afterprint', restoreDocTitle);

    // 4. Trigger print native browser (nama file otomatis terisi di dialog Simpan PDF Windows & Chrome)
    setTimeout(() => {
      window.print();
      // Fallback pemulihan judul dokumen untuk browser yang tidak memicu event afterprint
      setTimeout(restoreDocTitle, 2000);
    }, 150);
  }

  // Unduh PDF langsung (1-klik download) tanpa perlu melalui dialog cetak browser
  downloadInvoicePDF(invoiceOrId) {
    let invoice = invoiceOrId;
    if (typeof invoiceOrId === 'string' && window.db) {
      invoice = window.db.getInvoiceById(invoiceOrId) || (window.app?.currentViewingInvoice);
    }
    if (!invoice) return;
    const fileName = this.getInvoicePdfFileName(invoice);

    // Pastikan konten invoice ada di DOM & cocok dengan invoice yang diminta
    let tempContainer = null;
    let element = document.getElementById('invoice-printable-area');

    const previewModal = document.getElementById('invoice-preview-modal');
    const isModalOpen = previewModal && (previewModal.classList.contains('show') || previewModal.classList.contains('active') || previewModal.style.display === 'flex');
    const isCurrentInvoice = window.app?.currentViewingInvoice?.id === invoice.id;

    if (!element || !isModalOpen || !isCurrentInvoice) {
      tempContainer = document.createElement('div');
      tempContainer.id = 'temp-pdf-render-box';
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.background = '#ffffff';
      tempContainer.style.zIndex = '-999';
      tempContainer.innerHTML = this.renderInvoiceHTML(invoice);
      document.body.appendChild(tempContainer);
      element = tempContainer.querySelector('.jaree-invoice-sheet') || tempContainer;
    }

    const cleanup = () => {
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    };

    if (window.html2pdf) {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(`Menyiapkan unduhan PDF: ${fileName}.pdf...`, 'info');
      }

      const opt = {
        margin: [8, 10, 8, 10], // mm
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true, 
          logging: false,
          allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(element).save().then(() => {
        cleanup();
        if (window.app && typeof window.app.showToast === 'function') {
          window.app.showToast(`Berhasil mengunduh: ${fileName}.pdf`, 'success');
        }
      }).catch(err => {
        cleanup();
        console.warn('html2pdf fallback ke native print:', err);
        this.printInvoice(invoice);
      });
    } else {
      cleanup();
      this.printInvoice(invoice);
    }
  }
}

window.invoiceEngine = new InvoiceEngine();

