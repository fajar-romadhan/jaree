/**
 * JAREE — Admin Dashboard & Auto-Renewal Controller (app.js)
 * Skenario: Klik "Perpanjang" -> Otomatis Buat Invoice Baru -> Otomatis Kirim Email -> Otomatis Buka Cetak PDF.
 */

class JareeApp {
  constructor() {
    this.currentView = 'dashboard';
    this.activeRenewalSub = null;
    this.init();
  }

  init() {
    this.checkSecurityLock();
    this.setupEventListeners();
    this.renderAllViews();

    if (window.feather) feather.replace();
    console.log('JAREE Admin System Ready.');

    // Auto-scan dan trigger peringatan H-1 otomatis di latar belakang
    setTimeout(() => {
      this.checkAndTriggerH1Reminders();
    }, 1500);
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // Navigasi View
  navigate(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.menu-btn').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active-panel');
    });

    const activePanel = document.getElementById(`view-${viewName}`);
    if (activePanel) activePanel.classList.add('active-panel');

    const titles = {
      dashboard: 'Dashboard Langganan',
      subscriptions: 'Manajemen Langganan Aktif',
      invoices: 'Riwayat Seluruh Invoice',
      clients: 'Daftar Pelanggan',
      settings: 'Pengaturan & Rekening'
    };
    const heading = document.getElementById('page-heading');
    if (heading) heading.textContent = titles[viewName] || 'Dashboard';

    this.renderAllViews();
    if (window.feather) feather.replace();
  }

  renderAllViews() {
    this.renderDashboard();
    this.renderSubscriptionsView();
    this.renderInvoicesView();
    this.renderClientsView();
    this.renderSettingsView();
    this.renderAlertBanner();
  }

  // 1. ALERT BANNER H-1 DI DASHBOARD
  renderAlertBanner() {
    const bannerArea = document.getElementById('alert-banner-area');
    if (!bannerArea) return;

    // Alert banner HANYA untuk halaman Dashboard
    if (this.currentView !== 'dashboard') {
      bannerArea.innerHTML = '';
      return;
    }

    const subs = window.db.getSubscriptions();
    const clients = window.db.getClients();
    const invoices = window.db.getInvoices();
    if (subs.length === 0) {
      bannerArea.innerHTML = '';
      return;
    }

    // Cari pesanan aktif yang benar-benar belum selesai / belum lunas dan mendekati jatuh tempo
    const sub = subs.find(s => {
      if (s.status === 'completed' || s.status === 'cancelled') return false;
      const inv = invoices.find(i => i.id === s.lastInvoiceId || i.subscriptionId === s.id);
      const isPaid = inv ? inv.status === 'paid' : false;
      if (isPaid) return false; // JIKA SUDAH LUNAS, JANGAN PERNAH MUNCULKAN PERINGATAN!
      const days = window.automation.getDaysDifference(s.endDate);
      return days <= 1;
    });

    if (!sub) {
      bannerArea.innerHTML = '';
      return;
    }

    const client = clients.find(c => c.id === sub.clientId) || { name: 'Pelanggan' };
    const daysLeft = window.automation.getDaysDifference(sub.endDate);
    const wa = window.automation.generateWhatsAppBillingLink(sub, client);
    let alertHeadline = '';
    if (daysLeft === 1) alertHeadline = 'berakhir BESOK (H-1)';
    else if (daysLeft === 0) alertHeadline = 'berakhir HARI INI';
    else alertHeadline = `telah lewat tempo (${Math.abs(daysLeft)} hari lalu)`;

    bannerArea.innerHTML = `
      <div class="alert-banner">
        <div>
          <div class="alert-title-row">
            <i data-feather="alert-circle"></i>
            <span>Peringatan Tagihan: ${client.name} (${sub.serviceSnapshot.name}) ${alertHeadline}!</span>
          </div>
          <div class="alert-desc">
            Jatuh tempo: <b>${window.automation.formatDateId(sub.endDate)}</b> · Total: <b>${window.automation.formatRupiah(sub.price)}</b>. Belum lunas — siap ditagih atau catat pembayaran.
          </div>
        </div>
        <div class="alert-btn-group">
          <button class="btn btn-status-paid btn-sm" onclick="app.toggleOrderPaymentStatus('${sub.id}')" title="Tandai pembayaran telah diterima">
            <i data-feather="check-circle"></i> Tandai Lunas
          </button>
          <button class="btn btn-primary btn-sm" onclick="app.openRepeatOrder('${sub.id}')" title="Catat pesanan periode lanjutan">
            <i data-feather="plus-circle"></i> Order Lagi
          </button>
          <button class="btn btn-secondary btn-sm" onclick="app.previewInvoice('${sub.lastInvoiceId}')" title="Cetak Invoice">
            <i data-feather="printer"></i> Cetak Invoice
          </button>
          <button class="btn btn-secondary btn-sm" onclick="app.openSendEmailModalForSubscription('${sub.id}', 'reminder_h1')" title="Kirim Email Pengingat H-1">
            <i data-feather="mail"></i> Kirim Email H-1
          </button>
          <a href="${wa.link}" target="_blank" class="btn btn-whatsapp btn-sm">
            <i data-feather="message-circle"></i> Chat WhatsApp
          </a>
        </div>
      </div>
    `;
    if (window.feather) feather.replace();
  }

  // 2. DASHBOARD VIEW
  renderDashboard() {
    const subs = window.db.getSubscriptions();
    const clients = window.db.getClients();
    const invoices = window.db.getInvoices();

    // Stats
    document.getElementById('stat-client-count').textContent = clients.length;
    document.getElementById('stat-inv-count').textContent = invoices.length;

    const expiringCount = subs.filter(s => {
      if (s.status === 'completed' || s.status === 'cancelled') return false;
      const inv = invoices.find(i => i.id === s.lastInvoiceId || i.subscriptionId === s.id);
      const isPaid = inv ? inv.status === 'paid' : false;
      if (isPaid) return false;
      const days = window.automation.getDaysDifference(s.endDate);
      return days <= 1;
    }).length;
    document.getElementById('stat-expiring-count').textContent = expiringCount;

    const totalRev = invoices
      .filter(i => i.status === 'paid')
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
    document.getElementById('stat-revenue').textContent = window.automation.formatRupiah(totalRev);

    // Tabel Langganan di Dashboard
    const subTbody = document.getElementById('dashboard-subs-tbody');
    if (subTbody) {
      subTbody.innerHTML = subs.map(s => {
        const client = clients.find(c => c.id === s.clientId) || { name: 'Dimas Imansyah', phone: '' };
        const days = window.automation.getDaysDifference(s.endDate);
        const wa = window.automation.generateWhatsAppBillingLink(s, client);
        const inv = invoices.find(i => i.id === s.lastInvoiceId || i.subscriptionId === s.id);
        const isPaid = inv ? inv.status === 'paid' : false;

        let badgeHtml = '';
        if (s.status === 'completed' || (days < 0 && isPaid)) {
          badgeHtml = `<span class="status-badge badge-completed">Selesai (Lunas)</span>`;
        } else if (isPaid && days >= 0) {
          badgeHtml = `<span class="status-badge badge-paid">Lunas (Aktif ${days} hr)</span>`;
        } else if (days > 7) {
          badgeHtml = `<span class="status-badge badge-active">Belum Lunas (${days} hari lagi)</span>`;
        } else if (days > 1) {
          badgeHtml = `<span class="status-badge badge-expiring">Mendekati Tempo (${days} hari)</span>`;
        } else if (days >= 0) {
          badgeHtml = `<span class="status-badge badge-critical_h1">${days === 0 ? 'Hari Ini (Belum Lunas)' : 'H-1 Besok (Belum Lunas)'}</span>`;
        } else {
          badgeHtml = `<span class="status-badge badge-expired">Menunggak ${Math.abs(days)} hari</span>`;
        }

        const isFullyPaid = isPaid || s.status === 'completed';

        return `
          <tr>
            <td>
              <div style="font-weight:700;color:var(--text-main);">${client.name}</div>
              <div style="font-size:11.5px;color:var(--text-muted);">${client.email || client.phone}</div>
            </td>
            <td style="font-weight:600;">${s.serviceSnapshot.name}</td>
            <td>
              <div style="font-weight:600;color:var(--text-main);">${window.automation.formatDateId(s.startDate)} – ${window.automation.formatDateId(s.endDate)}</div>
            </td>
            <td>${badgeHtml}</td>
            <td style="font-weight:700;color:var(--text-main);">${window.automation.formatRupiah(s.price)}</td>
            <td>
              <span style="font-family:monospace;font-size:12px;font-weight:600;color:var(--text-secondary);">${s.lastInvoiceId || '-'}</span>
            </td>
            <td>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <button class="btn ${isFullyPaid ? 'btn-status-paid' : 'btn-status-unpaid'} btn-sm" onclick="app.toggleOrderPaymentStatus('${s.id}')" title="${isFullyPaid ? 'Status Lunas. Klik untuk ubah ke Belum Lunas' : 'Status Belum Lunas. Klik untuk tandai LUNAS'}">
                  <i data-feather="${isFullyPaid ? 'check' : 'dollar-sign'}"></i> ${isFullyPaid ? 'Lunas' : 'Set Lunas'}
                </button>
                <button class="btn btn-primary btn-sm" onclick="app.openRepeatOrder('${s.id}')" title="Buat pesanan lanjutan berikutnya">
                  <i data-feather="plus"></i> Order Lagi
                </button>
                <button class="btn btn-secondary btn-sm" onclick="app.previewInvoice('${s.lastInvoiceId}')" title="Cetak Dokumen Invoice">
                  <i data-feather="printer"></i> Cetak
                </button>
                <button class="btn btn-secondary btn-sm" onclick="app.openEditSubModal('${s.id}')" title="Ubah Periode & Status">
                  <i data-feather="calendar"></i> Ubah
                </button>
                <a href="${wa.link}" target="_blank" class="btn btn-whatsapp btn-sm" title="Kirim Pesan WA">
                  <i data-feather="message-circle"></i> WA
                </a>
                <button class="btn btn-secondary btn-sm" onclick="app.openSendEmailModalForSubscription('${s.id}')" title="Kirim Email Tagihan / Notifikasi">
                  <i data-feather="mail"></i> Email
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Tabel Invoice di Dashboard
    const invTbody = document.getElementById('dashboard-invoices-tbody');
    if (invTbody) {
      invTbody.innerHTML = invoices.slice(0, 4).map(inv => {
        const isPaid = inv.status === 'paid';
        return `
          <tr>
            <td style="font-weight:700;font-family:monospace;">${inv.invoiceNumber}</td>
            <td>${inv.clientSnapshot?.name || 'Dimas Imansyah'}</td>
            <td>${window.automation.formatDateId(inv.issueDate)}</td>
            <td style="font-size:12px;color:var(--text-secondary);">${window.automation.formatDateId(inv.servicePeriod?.from)} – ${window.automation.formatDateId(inv.servicePeriod?.to)}</td>
            <td style="font-weight:700;">${window.automation.formatRupiah(inv.total)}</td>
            <td>
              <button class="btn ${isPaid ? 'btn-status-paid' : 'btn-status-unpaid'} btn-sm" onclick="app.toggleInvoiceStatus('${inv.id}')" title="${isPaid ? 'Klik untuk ubah ke Belum Lunas' : 'Klik untuk tandai Lunas'}">
                <i data-feather="${isPaid ? 'check-circle' : 'clock'}"></i> ${isPaid ? 'Lunas' : 'Belum Lunas'}
              </button>
            </td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-secondary btn-sm" onclick="app.previewInvoice('${inv.id}')" title="Cetak PDF">
                  <i data-feather="printer"></i> PDF
                </button>
                <button class="btn btn-secondary btn-sm" onclick="app.openEditInvoicePeriodModal('${inv.id}')" title="Ubah Periode Dokumen">
                  <i data-feather="calendar"></i> Periode
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 3. SEMUA LANGGANAN VIEW
  renderSubscriptionsView() {
    const subs = window.db.getSubscriptions();
    const clients = window.db.getClients();
    const tbody = document.getElementById('all-subs-tbody');
    if (!tbody) return;

    const invoices = window.db.getInvoices();
    tbody.innerHTML = subs.map(s => {
      const client = clients.find(c => c.id === s.clientId) || { name: 'Dimas Imansyah' };
      const days = window.automation.getDaysDifference(s.endDate);
      const wa = window.automation.generateWhatsAppBillingLink(s, client);
      const inv = invoices.find(i => i.id === s.lastInvoiceId || i.subscriptionId === s.id);
      const isPaid = inv ? inv.status === 'paid' : false;

      let badgeHtml = '';
      if (s.status === 'completed' || (days < 0 && isPaid)) {
        badgeHtml = `<span class="status-badge badge-completed">Selesai (Lunas)</span>`;
      } else if (isPaid && days >= 0) {
        badgeHtml = `<span class="status-badge badge-paid">Lunas (Aktif ${days} hr)</span>`;
      } else if (days > 7) {
        badgeHtml = `<span class="status-badge badge-active">Belum Lunas (${days} hari lagi)</span>`;
      } else if (days > 1) {
        badgeHtml = `<span class="status-badge badge-expiring">Mendekati Tempo (${days} hari)</span>`;
      } else if (days >= 0) {
        badgeHtml = `<span class="status-badge badge-critical_h1">${days === 0 ? 'Hari Ini (Belum Lunas)' : 'H-1 Besok (Belum Lunas)'}</span>`;
      } else {
        badgeHtml = `<span class="status-badge badge-expired">Menunggak ${Math.abs(days)} hari</span>`;
      }

      const isFullyPaid = isPaid || s.status === 'completed';

      return `
        <tr>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${client.name}</div>
            <div style="font-size:11.5px;color:var(--text-muted);">${client.email}</div>
          </td>
          <td style="font-weight:600;">${s.serviceSnapshot.name}</td>
          <td>
            <div style="font-weight:600;color:var(--text-main);">${window.automation.formatDateId(s.startDate)} – ${window.automation.formatDateId(s.endDate)}</div>
          </td>
          <td>${badgeHtml}</td>
          <td style="font-weight:700;color:var(--text-main);">${window.automation.formatRupiah(s.price)}</td>
          <td>
            <span style="font-family:monospace;font-size:12px;font-weight:600;color:var(--text-secondary);">${s.lastInvoiceId || '-'}</span>
          </td>
          <td>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
              <button class="btn ${isFullyPaid ? 'btn-status-paid' : 'btn-status-unpaid'} btn-sm" onclick="app.toggleOrderPaymentStatus('${s.id}')" title="${isFullyPaid ? 'Status Lunas. Klik untuk ubah ke Belum Lunas' : 'Status Belum Lunas. Klik untuk tandai LUNAS'}">
                <i data-feather="${isFullyPaid ? 'check' : 'dollar-sign'}"></i> ${isFullyPaid ? 'Lunas' : 'Set Lunas'}
              </button>
              <button class="btn btn-primary btn-sm" onclick="app.openRepeatOrder('${s.id}')" title="Buat pesanan lanjutan berikutnya">
                <i data-feather="plus"></i> Order Lagi
              </button>
              <button class="btn btn-secondary btn-sm" onclick="app.previewInvoice('${s.lastInvoiceId}')" title="Cetak Dokumen Invoice PDF">
                <i data-feather="printer"></i> Cetak
              </button>
              <button class="btn btn-secondary btn-sm" onclick="app.openEditSubModal('${s.id}')" title="Ubah Periode & Status">
                <i data-feather="calendar"></i> Ubah
              </button>
              <a href="${wa.link}" target="_blank" class="btn btn-whatsapp btn-sm" title="Kirim Pesan WA">
                <i data-feather="message-circle"></i> WA
              </a>
              <button class="btn btn-secondary btn-sm" onclick="app.openSendEmailModalForSubscription('${s.id}')" title="Kirim Email Tagihan / Notifikasi">
                <i data-feather="mail"></i> Email
              </button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteSubscription('${s.id}')" title="Hapus Pesanan Ini">
                <i data-feather="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 4. RIWAYAT INVOICE VIEW
  renderInvoicesView() {
    const invoices = window.db.getInvoices();
    const tbody = document.getElementById('all-invoices-tbody');
    if (!tbody) return;

    tbody.innerHTML = invoices.map(inv => {
      const isPaid = inv.status === 'paid';
      return `
        <tr>
          <td style="font-weight:700;font-family:monospace;">${inv.invoiceNumber}</td>
          <td>${inv.clientSnapshot?.name || 'Dimas Imansyah'}</td>
          <td>${window.automation.formatDateId(inv.issueDate)}</td>
          <td style="font-size:12px;color:var(--text-secondary);">${window.automation.formatDateId(inv.servicePeriod?.from)} – ${window.automation.formatDateId(inv.servicePeriod?.to)}</td>
          <td style="font-weight:700;">${window.automation.formatRupiah(inv.total)}</td>
          <td>
            <button class="btn ${isPaid ? 'btn-status-paid' : 'btn-status-unpaid'} btn-sm" onclick="app.toggleInvoiceStatus('${inv.id}')" title="${isPaid ? 'Status: LUNAS. Klik untuk ubah ke Belum Lunas' : 'Status: BELUM LUNAS. Klik untuk tandai Lunas'}">
              <i data-feather="${isPaid ? 'check-circle' : 'clock'}"></i> ${isPaid ? 'Lunas' : 'Belum Lunas'}
            </button>
          </td>
          <td>
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="btn btn-secondary btn-sm" onclick="app.previewInvoice('${inv.id}')" title="Lihat & Cetak Dokumen PDF">
                <i data-feather="printer"></i> Cetak PDF
              </button>
              <button class="btn btn-secondary btn-sm" onclick="app.openSendEmailModalForInvoice('${inv.id}')" title="Kirim Dokumen Invoice Ini ke Email Pelanggan">
                <i data-feather="mail"></i> Email
              </button>
              <button class="btn btn-secondary btn-sm" onclick="app.openEditInvoicePeriodModal('${inv.id}')" title="Ubah Periode & Data Invoice">
                <i data-feather="edit-2"></i> Ubah Periode
              </button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteInvoice('${inv.id}')" title="Hapus Invoice Ini">
                <i data-feather="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 5. DATA CLIENTS VIEW
  renderClientsView() {
    const clients = window.db.getClients();
    const tbody = document.getElementById('all-clients-tbody');
    if (!tbody) return;

    tbody.innerHTML = clients.map(c => {
      const waLink = `https://wa.me/${c.phone ? c.phone.replace(/[^0-9]/g, '') : ''}`;
      return `
        <tr>
          <td style="font-weight:700;color:var(--text-main);">${c.name}</td>
          <td>${c.email || '-'}</td>
          <td style="font-family:monospace;">${c.phone || '-'}</td>
          <td><span class="status-badge badge-active">${c.type === 'business' ? 'Bisnis' : 'Personal'}</span></td>
          <td style="font-size:12px;color:var(--text-secondary);">${c.notes || '-'}</td>
          <td>
            <div style="display:flex;gap:6px;align-items:center;">
              <button class="btn btn-primary btn-sm" onclick="app.openRepeatOrderForClient('${c.id}')" title="Buat Pesanan Layanan Baru Untuk Pelanggan Ini">
                <i data-feather="plus"></i> Order Lagi
              </button>
              ${c.phone ? `
                <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm" title="Chat WhatsApp Pelanggan">
                  <i data-feather="message-circle"></i> Chat WA
                </a>
              ` : ''}
              ${c.email ? `
                <button class="btn btn-outline-primary btn-sm" onclick="app.openSendEmailModalForClient('${c.id}')" title="Kirim Email Tagihan / Notifikasi ke ${c.email}">
                  <i data-feather="mail"></i> Email
                </button>
              ` : ''}
              <button class="btn btn-secondary btn-sm" onclick="app.openEditClientModal('${c.id}')" title="Edit Data Pelanggan">
                <i data-feather="edit-2"></i> Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="app.deleteClient('${c.id}')" title="Hapus Data Pelanggan">
                <i data-feather="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 6. SETTINGS VIEW
  renderSettingsView() {
    const settings = window.db.getSettings();
    document.getElementById('set-brand-name').value = settings.profile.brandName || 'JAREE';
    document.getElementById('set-owner-name').value = settings.profile.ownerName || 'Fajar Romadhan';
    document.getElementById('set-owner-email').value = settings.profile.email || 'fajaromadhan@gmail.com';
    const ownerPhoneInput = document.getElementById('set-owner-phone');
    if (ownerPhoneInput) {
      ownerPhoneInput.value = settings.profile.phone || '085783656335';
    }
    document.getElementById('set-bank-name').value = settings.payment.bankName || 'SeaBank';
    document.getElementById('set-account-number').value = settings.payment.accountNumber || '901448683446';
    document.getElementById('set-account-name').value = settings.payment.accountName || 'Fajar Romadhan';
    const pinEnabledCheckbox = document.getElementById('set-pin-enabled');
    const pinGroup = document.getElementById('pin-input-group');
    if (pinEnabledCheckbox) {
      pinEnabledCheckbox.checked = !!settings.security?.pinEnabled;
      if (pinGroup) {
        pinGroup.style.display = pinEnabledCheckbox.checked ? 'block' : 'none';
      }
      pinEnabledCheckbox.onchange = (e) => {
        if (pinGroup) pinGroup.style.display = e.target.checked ? 'block' : 'none';
      };
    }
    const pinInput = document.getElementById('set-owner-pin');
    if (pinInput) {
      pinInput.value = settings.security?.pinCode || '260803';
    }

    document.getElementById('set-emailjs-service').value = settings.email.serviceId || '';
    document.getElementById('set-emailjs-template').value = settings.email.templateId || '';
    document.getElementById('set-emailjs-key').value = settings.email.publicKey || '';
    this.updateEmailSetupStatusBadge();
  }

  saveSettingsFromForm() {
    const newSettings = {
      profile: {
        brandName: document.getElementById('set-brand-name').value.trim(),
        ownerName: document.getElementById('set-owner-name').value.trim(),
        email: document.getElementById('set-owner-email').value.trim() || 'fajaromadhan@gmail.com',
        phone: (document.getElementById('set-owner-phone')?.value.trim()) || '085783656335'
      },
      payment: {
        bankName: document.getElementById('set-bank-name').value.trim(),
        accountNumber: document.getElementById('set-account-number').value.trim(),
        accountName: document.getElementById('set-account-name').value.trim()
      },
      security: {
        pinEnabled: document.getElementById('set-pin-enabled') ? document.getElementById('set-pin-enabled').checked : false,
        pinCode: (document.getElementById('set-owner-pin') && document.getElementById('set-owner-pin').value.trim()) || '260803'
      },
      email: {
        provider: 'emailjs',
        serviceId: document.getElementById('set-emailjs-service').value.trim(),
        templateId: document.getElementById('set-emailjs-template').value.trim(),
        publicKey: document.getElementById('set-emailjs-key').value.trim()
      }
    };
    window.db.saveSettings(newSettings);
    this.updateEmailSetupStatusBadge();
    this.showToast('Pengaturan JAREE berhasil disimpan.', 'success');
  }

  // =========================================================
  // =========================================================
  // WORKFLOW PESANAN MANDIRI: MODAL PESANAN BARU & ORDER LAGI
  // =========================================================
  populateClientSelect(selectedClientId = null) {
    const clients = window.db.getClients();
    const select = document.getElementById('order-client-select');
    if (!select) return;

    let html = clients.map(c => `<option value="${c.id}">${c.name} (${c.email || c.phone})</option>`).join('');
    html += '<option value="__new__">+ Tambah Pelanggan Baru...</option>';
    select.innerHTML = html;

    if (selectedClientId) {
      select.value = selectedClientId;
    } else if (clients.length > 0) {
      select.value = clients[0].id;
    }
    this.onOrderClientSelectChange();
  }

  onOrderClientSelectChange() {
    const select = document.getElementById('order-client-select');
    const newFields = document.getElementById('new-client-fields');
    if (!select || !newFields) return;
    newFields.style.display = select.value === '__new__' ? 'block' : 'none';
  }

  openOrderModal() {
    this.openNewOrderModal();
  }

  openRepeatOrderForClient(clientId) {
    const subs = window.db.getSubscriptions().filter(s => s.clientId === clientId);
    if (subs.length > 0) {
      const latestSub = subs[subs.length - 1];
      this.openRepeatOrder(latestSub.id);
    } else {
      this.populateClientSelect(clientId);
      const today = window.automation.getTodayISO();
      document.getElementById('order-start-date').value = today;
      this.setOrderDuration(1);
      const statusSel = document.getElementById('order-payment-status');
      if (statusSel) statusSel.value = 'paid';
      document.getElementById('order-modal-title').textContent = 'Buat Pesanan Pelanggan';
      document.getElementById('order-modal').classList.add('show');
      if (window.feather) feather.replace();
    }
  }

  openNewOrderModal() {
    this.populateClientSelect();
    const today = window.automation.getTodayISO();
    document.getElementById('order-start-date').value = today;
    this.setOrderDuration(1);
    const statusSel = document.getElementById('order-payment-status');
    if (statusSel) statusSel.value = 'paid';
    document.getElementById('order-modal-title').textContent = 'Buat Pesanan Layanan Baru';
    document.getElementById('order-modal').classList.add('show');
    if (window.feather) feather.replace();
  }

  openRepeatOrder(subId) {
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) return;

    this.populateClientSelect(sub.clientId);
    document.getElementById('order-start-date').value = sub.endDate;
    this.setOrderDuration(1);
    document.getElementById('order-price').value = sub.price;
    const statusSel = document.getElementById('order-payment-status');
    if (statusSel) statusSel.value = 'paid';
    document.getElementById('order-modal-title').textContent = `Order Lagi (Periode Lanjutan)`;
    document.getElementById('order-modal').classList.add('show');
    if (window.feather) feather.replace();
  }

  closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) modal.classList.remove('show');
  }

  setOrderDuration(months) {
    const startVal = document.getElementById('order-start-date').value || window.automation.getTodayISO();
    const endVal = window.automation.addMonths(startVal, months);
    document.getElementById('order-end-date').value = endVal;
    document.getElementById('order-price').value = 150000 * months;

    document.querySelectorAll('#order-presets .preset-pill').forEach((pill, idx) => {
      const pillMonths = [1, 3, 6, 12][idx];
      if (pillMonths === months) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  onOrderStartDateChange() {
    const startVal = document.getElementById('order-start-date').value;
    if (!startVal) return;
    const activePill = document.querySelector('#order-presets .preset-pill.active');
    let months = 1;
    if (activePill) {
      const text = activePill.textContent;
      if (text.includes('1 Bulan')) months = 1;
      else if (text.includes('3 Bulan')) months = 3;
      else if (text.includes('6 Bulan')) months = 6;
      else if (text.includes('1 Tahun')) months = 12;
    }
    const endVal = window.automation.addMonths(startVal, months);
    document.getElementById('order-end-date').value = endVal;
  }

  async saveNewOrder(e) {
    e.preventDefault();
    const select = document.getElementById('order-client-select');
    let clientId = select.value;
    let client = null;

    if (clientId === '__new__') {
      const name = document.getElementById('order-new-client-name').value.trim();
      const email = document.getElementById('order-new-client-email').value.trim();
      const phone = document.getElementById('order-new-client-phone').value.trim();
      if (!name) {
        alert('Harap masukkan nama pelanggan baru.');
        return;
      }
      const newClientId = `CLT-${Date.now().toString().slice(-6)}`;
      client = {
        id: newClientId,
        name: name,
        email: email || '',
        phone: phone || '',
        type: 'personal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      window.db.saveClient(client);
      clientId = newClientId;
    } else {
      client = window.db.getClientById(clientId) || { id: clientId, name: 'Dimas Imansyah', email: 'frekuensipicture@gmail.com' };
    }

    const startDate = document.getElementById('order-start-date').value;
    const endDate = document.getElementById('order-end-date').value;
    const price = Number(document.getElementById('order-price').value) || 150000;

    if (!startDate || !endDate) {
      alert('Harap tentukan tanggal mulai dan tanggal akhir.');
      return;
    }

    const btn = document.getElementById('btn-submit-order');
    btn.innerHTML = '<i data-feather="loader"></i> Memproses Pesanan...';
    btn.disabled = true;

    try {
      const settings = window.db.getSettings();
      const invNum = window.invoiceEngine.generateInvoiceNumber();
      const todayISO = window.automation.getTodayISO();

      const payStatus = document.getElementById('order-payment-status')?.value || 'paid';
      const isPaid = payStatus === 'paid';

      // 1. Buat Subscription Baru (Pesanan Mandiri)
      const stamp = startDate.replace(/-/g, '');
      const newSubId = `SUB-${stamp}-${String(Date.now()).slice(-3)}`;
      const daysLeft = window.automation.getDaysDifference(endDate);

      const newSub = {
        id: newSubId,
        clientId: client.id,
        serviceId: 'SVC-GDRIVE-5TB',
        serviceSnapshot: {
          name: 'Penyimpanan Drive 5 TB',
          description: 'Penyimpanan Drive 5 TB · 1 akun · berbayar per bulan',
          price: price
        },
        startDate: startDate,
        endDate: endDate,
        billingCycle: 'monthly',
        price: price,
        status: isPaid ? ((daysLeft < 0) ? 'completed' : 'active') : window.automation.calculateStatus(daysLeft),
        remindersSent: { h7: null, h3: null, h1: null, h0: null, overdue: null },
        lastInvoiceId: invNum,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      window.db.saveSubscription(newSub);

      // 2. Buat Invoice Baru Terhubung
      const newInvoice = {
        id: invNum,
        invoiceNumber: invNum,
        subscriptionId: newSub.id,
        clientId: client.id,
        clientSnapshot: {
          name: client.name,
          email: client.email || '',
          phone: client.phone || ''
        },
        issueDate: todayISO,
        dueDate: startDate,
        servicePeriod: {
          from: startDate,
          to: endDate
        },
        items: [
          {
            description: `Penyimpanan Drive 5 TB · 1 akun · berbayar per bulan`,
            qty: 1,
            unit: 'periode',
            unitPrice: price,
            total: price
          }
        ],
        subtotal: price,
        tax: 0,
        total: price,
        paymentDetails: {
          bankName: settings.payment.bankName,
          accountNumber: settings.payment.accountNumber,
          accountName: settings.payment.accountName
        },
        notes: isPaid ? [
          'Pembayaran telah diterima — terima kasih.',
          `Akun Penyimpanan Drive 5 TB aktif untuk periode layanan di atas.`,
          'Perpanjangan ditagihkan pada awal periode berikutnya.'
        ] : [
          'Menunggu konfirmasi pembayaran transfer bank.',
          'Silakan transfer sebelum tanggal jatuh tempo.',
          'Kirim bukti transfer ke WhatsApp atau email resmi JAREE.'
        ],
        status: isPaid ? 'paid' : 'unpaid',
        paidAt: isPaid ? new Date().toISOString() : null,
        createdAt: new Date().toISOString()
      };
      window.db.saveInvoice(newInvoice);

      this.closeOrderModal();
      this.showToast(`Pesanan berhasil disimpan & Invoice ${invNum} diterbitkan!`);
      this.renderAllViews();

      const shouldOpenPdf = document.getElementById('order-check-open-pdf')?.checked;
      if (shouldOpenPdf) {
        setTimeout(() => {
          this.previewInvoice(newInvoice.id);
        }, 350);
      }
    } catch (err) {
      alert('Gagal membuat pesanan: ' + err.message);
    } finally {
      btn.innerHTML = '<i data-feather="check"></i> Simpan Pesanan & Terbitkan Invoice';
      btn.disabled = false;
      if (window.feather) feather.replace();
    }
  }

  // =========================================================
  // UBAH PERIODE LANGGANAN LANGSUNG (MANUAL EDIT)
  // =========================================================
  openEditSubModal(subId) {
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) return;
    this.activeEditSub = sub;
    const client = window.db.getClientById(sub.clientId) || { name: 'Dimas Imansyah' };

    document.getElementById('edit-sub-id').value = sub.id;
    document.getElementById('edit-sub-client-name').textContent = client.name;
    document.getElementById('edit-sub-service-name').textContent = sub.serviceSnapshot.name;
    document.getElementById('edit-sub-start').value = sub.startDate;
    document.getElementById('edit-sub-end').value = sub.endDate;
    document.getElementById('edit-sub-price').value = sub.price;

    // Sinkronkan pilihan status pembayaran saat ini
    const inv = sub.lastInvoiceId ? window.db.getInvoiceById(sub.lastInvoiceId) : null;
    const isPaid = (inv ? inv.status === 'paid' : false) || sub.status === 'completed';
    const statusSelect = document.getElementById('edit-sub-payment-status');
    if (statusSelect) {
      statusSelect.value = sub.status === 'cancelled' ? 'cancelled' : (isPaid ? 'paid' : 'unpaid');
    }

    const syncContainer = document.getElementById('edit-sub-sync-inv-container');
    const lastInvText = document.getElementById('edit-sub-last-inv-text');
    if (sub.lastInvoiceId) {
      syncContainer.style.display = 'block';
      lastInvText.textContent = sub.lastInvoiceId;
    } else {
      syncContainer.style.display = 'none';
    }

    this.onEditSubDateChange();
    document.getElementById('edit-sub-modal').classList.add('show');
    if (window.feather) feather.replace();
  }

  closeEditSubModal() {
    document.getElementById('edit-sub-modal').classList.remove('show');
    this.activeEditSub = null;
  }

  setEditSubDuration(months) {
    const startVal = document.getElementById('edit-sub-start').value;
    if (!startVal) return;
    const endVal = window.automation.addMonths(startVal, months);
    document.getElementById('edit-sub-end').value = endVal;

    document.querySelectorAll('#edit-sub-presets .preset-pill').forEach((pill, idx) => {
      const pillMonths = [1, 3, 6, 12][idx];
      if (pillMonths === months) pill.classList.add('active');
      else pill.classList.remove('active');
    });

    this.onEditSubDateChange();
  }

  onEditSubDateChange(source) {
    if (source === 'start') {
      const activePill = document.querySelector('#edit-sub-presets .preset-pill.active');
      if (activePill) {
        let months = 1;
        const text = activePill.textContent;
        if (text.includes('1 Bulan')) months = 1;
        else if (text.includes('3 Bulan')) months = 3;
        else if (text.includes('6 Bulan')) months = 6;
        else if (text.includes('1 Tahun')) months = 12;
        const startVal = document.getElementById('edit-sub-start').value;
        if (startVal) {
          document.getElementById('edit-sub-end').value = window.automation.addMonths(startVal, months);
        }
      }
    } else if (source === 'end') {
      document.querySelectorAll('#edit-sub-presets .preset-pill').forEach(pill => pill.classList.remove('active'));
    }

    const endVal = document.getElementById('edit-sub-end').value;
    if (!endVal) return;

    const days = window.automation.getDaysDifference(endVal);
    const badge = document.getElementById('edit-sub-status-badge');
    const previewText = document.getElementById('edit-sub-preview-text');

    if (previewText) {
      if (days > 0) {
        previewText.textContent = `Sisa ${days} hari lagi (s/d ${window.automation.formatDateId(endVal)})`;
      } else if (days === 0) {
        previewText.textContent = `Jatuh tempo hari ini (${window.automation.formatDateId(endVal)})`;
      } else {
        previewText.textContent = `Sudah lewat ${Math.abs(days)} hari (${window.automation.formatDateId(endVal)})`;
      }
    }

    if (badge) {
      if (days > 7) {
        badge.className = 'status-badge badge-active';
        badge.textContent = 'Aktif';
      } else if (days > 1) {
        badge.className = 'status-badge badge-expiring';
        badge.textContent = 'Mendekati Tempo';
      } else if (days >= 0) {
        badge.className = 'status-badge badge-critical_h1';
        badge.textContent = 'H-1 / Jatuh Tempo';
      } else {
        badge.className = 'status-badge badge-critical_h1';
        badge.textContent = 'Menunggak';
      }
    }
  }

  saveSubPeriodEdit(e) {
    if (e) e.preventDefault();
    const subId = document.getElementById('edit-sub-id').value;
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) return;

    const newStart = document.getElementById('edit-sub-start').value;
    const newEnd = document.getElementById('edit-sub-end').value;
    const newPrice = Number(document.getElementById('edit-sub-price').value) || sub.price;
    const newStatus = document.getElementById('edit-sub-payment-status')?.value || 'paid';

    if (!newStart || !newEnd) {
      alert('Tanggal mulai dan akhir harus diisi.');
      return;
    }

    sub.startDate = newStart;
    sub.endDate = newEnd;
    sub.price = newPrice;
    
    // Terapkan status pembayaran
    const daysLeft = window.automation.getDaysDifference(newEnd);
    if (newStatus === 'paid') {
      sub.status = (daysLeft < 0) ? 'completed' : 'active';
    } else if (newStatus === 'unpaid') {
      sub.status = window.automation.calculateStatus(daysLeft);
    } else {
      sub.status = 'cancelled';
    }
    sub.updatedAt = new Date().toISOString();
    window.db.saveSubscription(sub);

    // Sinkronisasi ke Invoice terakhir
    const shouldSyncInvoice = document.getElementById('edit-sub-sync-invoice')?.checked;
    if (sub.lastInvoiceId) {
      const inv = window.db.getInvoiceById(sub.lastInvoiceId);
      if (inv) {
        if (shouldSyncInvoice) {
          inv.servicePeriod = { from: newStart, to: newEnd };
          inv.dueDate = newEnd;
        }
        if (newStatus === 'paid') {
          inv.status = 'paid';
          if (!inv.paidAt) inv.paidAt = new Date().toISOString();
        } else if (newStatus === 'unpaid') {
          inv.status = 'unpaid';
          inv.paidAt = null;
        } else {
          inv.status = 'cancelled';
        }
        window.db.saveInvoice(inv);
      }
    }

    this.closeEditSubModal();
    this.showToast(`Data pesanan & status ${sub.serviceSnapshot.name} berhasil disimpan!`);
    this.renderAllViews();
  }

  // =========================================================
  // UBAH PERIODE DOKUMEN INVOICE LANGSUNG
  // =========================================================
  openEditInvoicePeriodModal(invoiceId) {
    if (!invoiceId && this.currentViewingInvoice) {
      invoiceId = this.currentViewingInvoice.id || this.currentViewingInvoice.invoiceNumber;
    }
    let inv = null;
    if (invoiceId) {
      inv = window.db.getInvoiceById(invoiceId);
      if (!inv) {
        inv = window.db.getInvoices().find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
      }
    }
    if (!inv && this.currentViewingInvoice) {
      inv = this.currentViewingInvoice;
    }
    if (!inv) {
      this.showToast('Dokumen invoice tidak ditemukan.');
      return;
    }
    this.activeEditInvoice = inv;

    const idInput = document.getElementById('edit-inv-id');
    if (idInput) idInput.value = inv.id || inv.invoiceNumber;

    const numPreview = document.getElementById('edit-inv-number-preview');
    if (numPreview) numPreview.textContent = inv.invoiceNumber;

    const clientPreview = document.getElementById('edit-inv-client-preview');
    if (clientPreview) clientPreview.textContent = inv.clientSnapshot?.name || 'Pelanggan';

    const fromInput = document.getElementById('edit-inv-period-from');
    if (fromInput) fromInput.value = inv.servicePeriod?.from || inv.issueDate || '';

    const toInput = document.getElementById('edit-inv-period-to');
    if (toInput) toInput.value = inv.servicePeriod?.to || inv.dueDate || '';

    const issueInput = document.getElementById('edit-inv-issue-date');
    if (issueInput) issueInput.value = inv.issueDate || '';

    const dueInput = document.getElementById('edit-inv-due-date');
    if (dueInput) dueInput.value = inv.dueDate || '';

    const totalInput = document.getElementById('edit-inv-total');
    if (totalInput) totalInput.value = inv.total || 150000;

    const statusSelect = document.getElementById('edit-inv-payment-status');
    if (statusSelect) {
      statusSelect.value = inv.status || 'paid';
    }

    // Reset preset pills
    document.querySelectorAll('#edit-inv-presets .preset-pill').forEach(pill => pill.classList.remove('active'));

    const modal = document.getElementById('edit-inv-modal');
    if (modal) modal.classList.add('show');
    if (window.feather) feather.replace();
  }

  closeEditInvoiceModal() {
    const modal = document.getElementById('edit-inv-modal');
    if (modal) modal.classList.remove('show');
    this.activeEditInvoice = null;
  }

  setEditInvoiceDuration(months) {
    const startVal = document.getElementById('edit-inv-period-from').value;
    if (!startVal) return;
    const endVal = window.automation.addMonths(startVal, months);
    document.getElementById('edit-inv-period-to').value = endVal;

    document.querySelectorAll('#edit-inv-presets .preset-pill').forEach((pill, idx) => {
      const pillMonths = [1, 3, 6, 12][idx];
      if (pillMonths === months) pill.classList.add('active');
      else pill.classList.remove('active');
    });
  }

  onEditInvoiceDateChange(source) {
    if (source === 'start') {
      const activePill = document.querySelector('#edit-inv-presets .preset-pill.active');
      if (activePill) {
        let months = 1;
        const text = activePill.textContent;
        if (text.includes('1 Bulan')) months = 1;
        else if (text.includes('3 Bulan')) months = 3;
        else if (text.includes('6 Bulan')) months = 6;
        else if (text.includes('1 Tahun')) months = 12;
        const startVal = document.getElementById('edit-inv-period-from').value;
        if (startVal) {
          const endVal = window.automation.addMonths(startVal, months);
          document.getElementById('edit-inv-period-to').value = endVal;
        }
      }
    } else if (source === 'end') {
      document.querySelectorAll('#edit-inv-presets .preset-pill').forEach(pill => pill.classList.remove('active'));
    }
  }

  saveInvoicePeriodEdit(e) {
    if (e) e.preventDefault();
    const invId = document.getElementById('edit-inv-id').value;
    let inv = window.db.getInvoiceById(invId);
    if (!inv && invId) {
      inv = window.db.getInvoices().find(i => i.id === invId || i.invoiceNumber === invId);
    }
    if (!inv && this.activeEditInvoice) {
      inv = this.activeEditInvoice;
    }
    if (!inv) {
      this.showToast('Data invoice gagal ditemukan.');
      return;
    }

    const fromDate = document.getElementById('edit-inv-period-from').value;
    const toDate = document.getElementById('edit-inv-period-to').value;
    const issueDate = document.getElementById('edit-inv-issue-date').value;
    const dueDate = document.getElementById('edit-inv-due-date').value;
    const newTotal = Number(document.getElementById('edit-inv-total')?.value) || inv.total || 150000;
    const newStatus = document.getElementById('edit-inv-payment-status')?.value || inv.status;

    if (!fromDate || !toDate) {
      alert('Harap isi periode layanan mulai dan berakhir.');
      return;
    }

    inv.servicePeriod = { from: fromDate, to: toDate };
    inv.issueDate = issueDate;
    inv.dueDate = dueDate;
    inv.total = newTotal;
    inv.subtotal = newTotal;
    if (inv.items && inv.items.length > 0) {
      inv.items[0].total = newTotal;
      inv.items[0].unitPrice = newTotal;
    }
    inv.status = newStatus;
    if (newStatus === 'paid' && !inv.paidAt) inv.paidAt = new Date().toISOString();
    if (newStatus !== 'paid') inv.paidAt = null;

    // Sinkronkan ke Langganan aktif jika dipilih
    const shouldSyncSub = document.getElementById('edit-inv-sync-sub')?.checked;
    if (shouldSyncSub) {
      let sub = null;
      if (inv.subscriptionId) {
        sub = window.db.getSubscriptionById(inv.subscriptionId);
      }
      if (!sub && inv.clientId) {
        sub = window.db.getSubscriptions().find(s => s.clientId === inv.clientId);
      }
      if (sub) {
        sub.startDate = fromDate;
        sub.endDate = toDate;
        sub.price = newTotal;
        const daysLeft = window.automation.getDaysDifference(toDate);
        if (newStatus === 'paid') {
          sub.status = (daysLeft < 0) ? 'completed' : 'active';
        } else if (newStatus === 'unpaid') {
          sub.status = window.automation.calculateStatus(daysLeft);
        } else {
          sub.status = 'cancelled';
        }
        sub.updatedAt = new Date().toISOString();
        window.db.saveSubscription(sub);
      }
    }

    window.db.saveInvoice(inv);
    this.closeEditInvoiceModal();
    this.showToast(`Periode invoice ${inv.invoiceNumber} berhasil diperbarui!`);

    // Jika modal preview invoice sedang terbuka, refresh kontennya secara langsung
    const previewModal = document.getElementById('invoice-preview-modal');
    if (previewModal && previewModal.classList.contains('show')) {
      this.previewInvoice(inv.id || inv.invoiceNumber);
    }

    this.renderAllViews();
  }

  // PRATINJAU DOKUMEN INVOICE RESMI JAREE
  previewInvoice(invoiceId) {
    if (!invoiceId) return;
    let inv = window.db.getInvoiceById(invoiceId);
    if (!inv) {
      inv = window.db.getInvoices().find(i => i.invoiceNumber === invoiceId || i.id === invoiceId);
    }
    if (!inv) {
      alert(`Dokumen invoice ${invoiceId} tidak ditemukan.`);
      return;
    }
    const modal = document.getElementById('invoice-preview-modal');
    const container = document.getElementById('invoice-modal-content');
    container.innerHTML = window.invoiceEngine.renderInvoiceHTML(inv);
    modal.classList.add('show');
    this.currentViewingInvoice = inv;

    const toggleBtn = document.getElementById('btn-toggle-inv-preview-status');
    if (toggleBtn) {
      if (inv.status === 'paid') {
        toggleBtn.className = 'btn btn-outline-secondary btn-sm';
        toggleBtn.innerHTML = '<i data-feather="x-circle"></i> Ubah ke Belum Lunas';
      } else {
        toggleBtn.className = 'btn btn-status-paid btn-sm';
        toggleBtn.innerHTML = '<i data-feather="check-circle"></i> Tandai Lunas Sekarang';
      }
    }

    if (window.feather) feather.replace();
  }

  closeInvoiceModal() {
    const previewModal = document.getElementById('invoice-preview-modal');
    if (previewModal) previewModal.classList.remove('show');
    this.closeEditInvoiceModal();
    this.currentViewingInvoice = null;
  }

  printCurrentInvoice() {
    if (this.currentViewingInvoice) {
      window.invoiceEngine.printInvoice(this.currentViewingInvoice);
    }
  }

  downloadCurrentInvoicePDF() {
    if (this.currentViewingInvoice) {
      window.invoiceEngine.downloadInvoicePDF(this.currentViewingInvoice);
    }
  }

  toggleCurrentViewingInvoiceStatus() {
    if (this.currentViewingInvoice) {
      this.toggleInvoiceStatus(this.currentViewingInvoice.id);
    }
  }

  // =========================================================
  // TOGGLE STATUS PEMBAYARAN (LUNAS / BELUM LUNAS)
  // =========================================================
  toggleOrderPaymentStatus(subId) {
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) return;

    const invoices = window.db.getInvoices();
    let inv = window.db.getInvoiceById(sub.lastInvoiceId) || invoices.find(i => i.subscriptionId === sub.id);

    const isCurrentlyPaid = sub.status === 'completed' || (inv && inv.status === 'paid');

    if (isCurrentlyPaid) {
      // Ubah ke BELUM LUNAS
      const daysLeft = window.automation.getDaysDifference(sub.endDate);
      sub.status = window.automation.calculateStatus(daysLeft);
      sub.updatedAt = new Date().toISOString();
      window.db.saveSubscription(sub);

      if (inv) {
        inv.status = 'unpaid';
        inv.paidAt = null;
        window.db.saveInvoice(inv);
      }
      this.showToast(`Status pesanan ${sub.serviceSnapshot?.name || ''} diubah: BELUM LUNAS`);
    } else {
      // Ubah ke LUNAS
      const daysLeft = window.automation.getDaysDifference(sub.endDate);
      sub.status = (daysLeft < 0) ? 'completed' : 'active';
      sub.updatedAt = new Date().toISOString();
      window.db.saveSubscription(sub);

      if (inv) {
        inv.status = 'paid';
        inv.paidAt = new Date().toISOString();
        window.db.saveInvoice(inv);
      }
      this.showToast(`Pesanan berhasil ditandai LUNAS!`);
    }

    if (this.currentViewingInvoice && inv && this.currentViewingInvoice.id === inv.id) {
      this.previewInvoice(inv.id);
    }

    this.renderAllViews();
  }

  toggleInvoiceStatus(invoiceId) {
    let inv = window.db.getInvoiceById(invoiceId);
    if (!inv) {
      inv = window.db.getInvoices().find(i => i.invoiceNumber === invoiceId || i.id === invoiceId);
    }
    if (!inv) return;

    const isCurrentlyPaid = inv.status === 'paid';

    if (isCurrentlyPaid) {
      inv.status = 'unpaid';
      inv.paidAt = null;
      window.db.saveInvoice(inv);

      if (inv.subscriptionId) {
        const sub = window.db.getSubscriptionById(inv.subscriptionId);
        if (sub) {
          const daysLeft = window.automation.getDaysDifference(sub.endDate);
          sub.status = window.automation.calculateStatus(daysLeft);
          sub.updatedAt = new Date().toISOString();
          window.db.saveSubscription(sub);
        }
      }
      this.showToast(`Invoice ${inv.invoiceNumber} diubah ke BELUM LUNAS`);
    } else {
      inv.status = 'paid';
      inv.paidAt = new Date().toISOString();
      window.db.saveInvoice(inv);

      if (inv.subscriptionId) {
        const sub = window.db.getSubscriptionById(inv.subscriptionId);
        if (sub) {
          const daysLeft = window.automation.getDaysDifference(sub.endDate);
          sub.status = (daysLeft < 0) ? 'completed' : 'active';
          sub.updatedAt = new Date().toISOString();
          window.db.saveSubscription(sub);
        }
      }
      this.showToast(`Invoice ${inv.invoiceNumber} berhasil ditandai LUNAS!`);
    }

    if (this.currentViewingInvoice && this.currentViewingInvoice.id === inv.id) {
      this.previewInvoice(inv.id);
    }

    this.renderAllViews();
  }

  // KEAMANAN PIN LOCK SCREEN
  checkSecurityLock() {
    const settings = window.db.getSettings();
    const isUnlocked = sessionStorage.getItem('jaree_unlocked') === 'true';
    const lockScreen = document.getElementById('lock-screen');
    const lockBtn = document.getElementById('btn-lock-console');
    
    if (lockBtn) {
      lockBtn.style.display = settings.security?.pinEnabled ? 'inline-flex' : 'none';
    }

    if (settings.security?.pinEnabled && !isUnlocked && lockScreen) {
      lockScreen.style.display = 'flex';
      const pinInput = document.getElementById('owner-pin-input');
      if (pinInput) setTimeout(() => pinInput.focus(), 120);
    } else if (lockScreen) {
      lockScreen.style.display = 'none';
    }
  }

  unlockConsole(enteredPin) {
    const settings = window.db.getSettings();
    const correctPin = settings.security?.pinCode || '260803';
    const errorEl = document.getElementById('lock-error-msg');
    const pinInput = document.getElementById('owner-pin-input');

    if (enteredPin === correctPin) {
      sessionStorage.setItem('jaree_unlocked', 'true');
      document.getElementById('lock-screen').style.display = 'none';
      if (errorEl) errorEl.textContent = '';
      if (pinInput) pinInput.value = '';
      this.showToast('Selamat datang, Fajar Romadhan! Konsol terbuka.');
    } else {
      if (errorEl) errorEl.textContent = 'PIN salah. Akses ditolak.';
      if (pinInput) {
        pinInput.value = '';
        pinInput.focus();
      }
    }
  }

  lockConsole() {
    sessionStorage.removeItem('jaree_unlocked');
    this.checkSecurityLock();
    this.showToast('Konsol JAREE dikunci.');
  }

  // =========================================================
  // CRUD OPERATIONS: INVOICES, SUBSCRIPTIONS & CLIENTS
  // =========================================================
  openNewInvoiceModal() {
    this.openNewOrderModal();
  }

  deleteInvoice(invoiceId) {
    let inv = window.db.getInvoiceById(invoiceId);
    if (!inv) {
      inv = window.db.getInvoices().find(i => i.id === invoiceId || i.invoiceNumber === invoiceId);
    }
    if (!inv) return;
    if (confirm(`Apakah Anda yakin ingin menghapus invoice "${inv.invoiceNumber}"?\nTindakan ini tidak dapat dibatalkan.`)) {
      window.db.deleteInvoice(inv.id || inv.invoiceNumber);
      this.showToast(`Dokumen invoice "${inv.invoiceNumber}" berhasil dihapus.`);
      this.renderAllViews();
    }
  }

  deleteCurrentViewingInvoice() {
    if (this.currentViewingInvoice) {
      const inv = this.currentViewingInvoice;
      if (confirm(`Apakah Anda yakin ingin menghapus dokumen invoice "${inv.invoiceNumber}"?`)) {
        this.closeInvoiceModal();
        window.db.deleteInvoice(inv.id || inv.invoiceNumber);
        this.showToast(`Dokumen invoice "${inv.invoiceNumber}" berhasil dihapus.`);
        this.renderAllViews();
      }
    }
  }

  deleteSubscription(subId) {
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) return;
    const name = sub.serviceSnapshot?.name || 'layanan';
    if (confirm(`Apakah Anda yakin ingin menghapus data pesanan "${name}" ini?\nTindakan ini tidak dapat dibatalkan.`)) {
      window.db.deleteSubscription(sub.id);
      this.showToast(`Data pesanan "${name}" berhasil dihapus.`);
      this.renderAllViews();
    }
  }

  openClientModal() {
    const form = document.getElementById('client-form');
    if (form) form.reset();
    document.getElementById('client-modal-id').value = '';
    document.getElementById('client-modal-title').textContent = 'Tambah Pelanggan Baru';
    document.getElementById('client-modal').classList.add('show');
    if (window.feather) feather.replace();
  }

  openEditClientModal(clientId) {
    const client = window.db.getClientById(clientId);
    if (!client) return;
    document.getElementById('client-modal-id').value = client.id;
    document.getElementById('client-modal-name').value = client.name || '';
    document.getElementById('client-modal-email').value = client.email || '';
    document.getElementById('client-modal-phone').value = client.phone || '';
    document.getElementById('client-modal-type').value = client.type || 'personal';
    document.getElementById('client-modal-notes').value = client.notes || '';
    document.getElementById('client-modal-title').textContent = 'Edit Data Pelanggan';
    document.getElementById('client-modal').classList.add('show');
    if (window.feather) feather.replace();
  }

  closeClientModal() {
    document.getElementById('client-modal').classList.remove('show');
  }

  saveClientFromModal(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('client-modal-id').value;
    const name = document.getElementById('client-modal-name').value.trim();
    const email = document.getElementById('client-modal-email').value.trim();
    const phone = document.getElementById('client-modal-phone').value.trim();
    const type = document.getElementById('client-modal-type').value;
    const notes = document.getElementById('client-modal-notes').value.trim();

    if (!name || !email) {
      alert('Nama dan email wajib diisi.');
      return;
    }

    const clientData = {
      name,
      email,
      phone,
      type,
      notes
    };
    if (id) {
      clientData.id = id;
    }

    const saved = window.db.saveClient(clientData);
    this.closeClientModal();
    this.showToast(`Data pelanggan "${saved.name}" berhasil disimpan!`);
    this.renderAllViews();
  }

  deleteClient(clientId) {
    const client = window.db.getClientById(clientId);
    if (!client) return;
    if (confirm(`Apakah Anda yakin ingin menghapus data pelanggan "${client.name}"?\n(Data pesanan & invoice yang sudah ada tidak akan terhapus).`)) {
      window.db.deleteClient(client.id);
      this.showToast(`Pelanggan "${client.name}" berhasil dihapus.`);
      this.renderAllViews();
    }
  }

  setupEventListeners() {
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.onsubmit = (e) => {
        e.preventDefault();
        this.saveSettingsFromForm();
      };
    }

    const pinForm = document.getElementById('pin-unlock-form');
    if (pinForm) {
      pinForm.onsubmit = (e) => {
        e.preventDefault();
        const pin = document.getElementById('owner-pin-input').value.trim();
        this.unlockConsole(pin);
      };
    }

    const editSubForm = document.getElementById('edit-sub-form');
    if (editSubForm) {
      editSubForm.onsubmit = (e) => this.saveSubPeriodEdit(e);
    }

    const fileRestore = document.getElementById('file-restore-json');
    if (fileRestore) {
      fileRestore.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = window.db.importJSON(evt.target.result);
          if (res.success) {
            alert(res.message);
            location.reload();
          } else {
            alert('Gagal restore: ' + res.message);
          }
        };
        reader.readAsText(file);
      };
    }
  }

  // =========================================================
  // MODUL PENGIRIMAN EMAIL OTOMATIS & PANDUAN SETUP EMAILJS
  // =========================================================

  updateEmailSetupStatusBadge() {
    const badge = document.getElementById('email-setup-status-badge');
    if (!badge) return;
    const service = document.getElementById('set-emailjs-service')?.value.trim();
    const template = document.getElementById('set-emailjs-template')?.value.trim();
    const key = document.getElementById('set-emailjs-key')?.value.trim();

    if (service && template && key) {
      badge.className = 'status-badge badge-active';
      badge.style.backgroundColor = '#ecfdf5';
      badge.style.color = '#15803d';
      badge.style.border = '1px solid #a7f3d0';
      badge.innerHTML = '🟢 EmailJS Siap Digunakan (200/Bulan)';
    } else {
      badge.className = 'status-badge badge-warning';
      badge.style.backgroundColor = '#fffbeb';
      badge.style.color = '#b45309';
      badge.style.border = '1px solid #fde68a';
      badge.innerHTML = '🟡 Belum Terhubung (Gratis 200 Email)';
    }
  }

  openSendEmailModalForClient(clientId) {
    const client = window.db.getClientById(clientId);
    if (!client) {
      this.showToast('Data pelanggan tidak ditemukan.', 'danger');
      return;
    }
    if (!client.email) {
      alert(`Pelanggan ${client.name} belum memiliki alamat email terdaftar.`);
      return;
    }

    // Cari invoice terakhir atau langganan aktif klien ini
    const invoices = window.db.getInvoices().filter(i => i.clientId === clientId);
    const latestInvoice = invoices.length > 0 ? invoices[0] : null;

    const subs = window.db.getSubscriptions().filter(s => s.clientId === clientId);
    const latestSub = subs.length > 0 ? subs[0] : null;

    const defaultType = (latestInvoice && latestInvoice.status === 'paid') ? 'paid_confirmation' : 'invoice';
    this.populateAndShowEmailModal(client, latestInvoice, latestSub, defaultType);
  }

  openSendEmailModalForInvoice(invoiceId) {
    let inv = window.db.getInvoiceById(invoiceId);
    if (!inv) {
      inv = window.db.getInvoices().find(i => i.invoiceNumber === invoiceId || i.id === invoiceId);
    }
    if (!inv) {
      this.showToast('Dokumen invoice tidak ditemukan.', 'danger');
      return;
    }

    let client = window.db.getClientById(inv.clientId);
    if (!client && inv.clientSnapshot) {
      client = {
        id: inv.clientId || 'CLT-GUEST',
        name: inv.clientSnapshot.name || 'Pelanggan',
        email: inv.clientSnapshot.email || '',
        phone: inv.clientSnapshot.phone || ''
      };
    }

    if (!client || !client.email) {
      alert('Invoice ini tidak memiliki email pelanggan yang valid.');
      return;
    }

    const sub = inv.subscriptionId ? window.db.getSubscriptionById(inv.subscriptionId) : null;
    const defaultType = inv.status === 'paid' ? 'paid_confirmation' : 'invoice';
    this.populateAndShowEmailModal(client, inv, sub, defaultType);
  }

  openSendEmailModalForSubscription(subId, preferredType = null) {
    const sub = window.db.getSubscriptionById(subId);
    if (!sub) return;

    const client = window.db.getClientById(sub.clientId);
    if (!client || !client.email) {
      alert('Pelanggan langganan ini tidak memiliki alamat email terdaftar.');
      return;
    }

    const inv = sub.lastInvoiceId ? window.db.getInvoiceById(sub.lastInvoiceId) : null;
    const days = window.automation.getDaysDifference(sub.endDate);

    let defaultType = preferredType;
    if (!defaultType) {
      if (inv && inv.status === 'paid') {
        defaultType = 'paid_confirmation';
      } else if (days <= 1) {
        defaultType = 'reminder_h1'; // Otomatis pilih Pengingat H-1 jika mendekati jatuh tempo
      } else {
        defaultType = 'invoice';
      }
    }

    this.populateAndShowEmailModal(client, inv, sub, defaultType);
  }

  openSendEmailModalForCurrentInvoice() {
    if (this.currentViewingInvoice) {
      this.openSendEmailModalForInvoice(this.currentViewingInvoice.id);
    }
  }

  populateAndShowEmailModal(client, invoice, sub, type = null) {
    const isPaid = (invoice && invoice.status === 'paid') || (sub && (sub.status === 'completed' || sub.status === 'paid'));
    
    // Jika tipe belum ditentukan secara eksplisit:
    // Jika lunas -> otomatis pilih 'paid_confirmation' (Kwitansi Lunas)!
    // Jika belum lunas -> otomatis 'invoice' (Tagihan Baru)!
    if (!type) {
      type = isPaid ? 'paid_confirmation' : 'invoice';
    }

    this.activeEmailContext = { client, invoice, sub, type };
    const draft = window.automation.generateEmailDraft(type, client, invoice, sub);

    const modal = document.getElementById('send-email-modal');
    const recInput = document.getElementById('email-modal-recipient');
    const typeSelect = document.getElementById('email-modal-type');
    const subInput = document.getElementById('email-modal-subject');
    const bodyInput = document.getElementById('email-modal-body');
    const banner = document.getElementById('email-service-status-banner');

    if (recInput) recInput.value = draft.recipient;
    if (typeSelect) typeSelect.value = type;
    if (subInput) subInput.value = draft.subject;
    if (bodyInput) bodyInput.value = draft.body;

    const settings = window.db.getSettings();
    const emailConfig = settings.email || {};
    const isConfigured = emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey;

    if (banner) {
      const paymentStatusBadge = isPaid 
        ? `<div style="display:inline-block;padding:3px 9px;border-radius:4px;font-size:11px;font-weight:700;margin-top:6px;background:#dcfce7;color:#15803d;border:1px solid #86efac;">✅ Status Transaksi: LUNAS — Pesan otomatis diatur sebagai Bukti Pembayaran / Kwitansi Resmi (tanpa instruksi tagihan).</div>`
        : `<div style="display:inline-block;padding:3px 9px;border-radius:4px;font-size:11px;font-weight:700;margin-top:6px;background:#fef3c7;color:#b45309;border:1px solid #fcd34d;">⏳ Status Transaksi: BELUM LUNAS — Pesan otomatis diatur sebagai Lembar Tagihan & Instruksi Transfer Bank.</div>`;

      const contactInfoBar = `
        <div style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(0,0,0,0.12);display:flex;justify-content:space-between;align-items:center;font-size:11.5px;">
          <span>📞 Kontak Resmi Otomatis: <b>fajaromadhan@gmail.com</b> · <b>0857-8365-6335</b></span>
          <a href="https://wa.me/6285783656335" target="_blank" class="btn btn-whatsapp btn-sm" style="padding:2px 8px;font-size:11px;text-decoration:none;">
            <i data-feather="message-circle"></i> Chat WA
          </a>
        </div>
      `;

      if (isConfigured) {
        banner.style.backgroundColor = '#ecfdf5';
        banner.style.border = '1px solid #a7f3d0';
        banner.style.color = '#065f46';
        banner.innerHTML = `
          <div>
            <strong>🟢 EmailJS Siap:</strong> Pengiriman otomatis di latar belakang aktif (Service: <code>${emailConfig.serviceId}</code>).
            ${paymentStatusBadge}
            ${contactInfoBar}
          </div>
        `;
      } else {
        banner.style.backgroundColor = '#fffbeb';
        banner.style.border = '1px solid #fde68a';
        banner.style.color = '#92400e';
        banner.innerHTML = `
          <div>
            <strong>💡 Setup Otomatis:</strong> Kunci EmailJS belum diisi. Anda dapat mengisinya di menu <b>Pengaturan</b> untuk kirim otomatis latar belakang, atau klik tombol <b>Buka di Gmail</b> di bawah untuk kirim langsung gratis 100%!
            ${paymentStatusBadge}
            ${contactInfoBar}
          </div>
        `;
      }
    }

    if (modal) modal.classList.add('show');
    if (window.feather) feather.replace();
  }

  onEmailModalTypeChange() {
    if (!this.activeEmailContext) return;
    const typeSelect = document.getElementById('email-modal-type');
    const newType = typeSelect ? typeSelect.value : 'invoice';
    this.activeEmailContext.type = newType;

    const draft = window.automation.generateEmailDraft(
      newType,
      this.activeEmailContext.client,
      this.activeEmailContext.invoice,
      this.activeEmailContext.sub
    );

    const subInput = document.getElementById('email-modal-subject');
    const bodyInput = document.getElementById('email-modal-body');
    if (subInput) subInput.value = draft.subject;
    if (bodyInput) bodyInput.value = draft.body;
  }

  closeSendEmailModal() {
    const modal = document.getElementById('send-email-modal');
    if (modal) modal.classList.remove('show');
    this.activeEmailContext = null;
  }

  // Automasi Latar Belakang: Cek dan Kirim Peringatan H-1 Otomatis
  async checkAndTriggerH1Reminders() {
    const settings = window.db.getSettings();
    const emailConfig = settings.email || {};
    const isConfigured = emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey;
    if (!isConfigured || !window.emailjs) return;

    const subs = window.db.getSubscriptions();
    const invoices = window.db.getInvoices();
    const clients = window.db.getClients();
    const todayISO = window.automation.getTodayISO();

    for (const sub of subs) {
      if (sub.status === 'completed' || sub.status === 'cancelled') continue;

      const inv = invoices.find(i => i.id === sub.lastInvoiceId || i.subscriptionId === sub.id);
      const isPaid = inv ? inv.status === 'paid' : false;
      if (isPaid) continue; // Jika sudah lunas, jangan kirim peringatan

      const daysLeft = window.automation.getDaysDifference(sub.endDate);
      // Peringatan H-1 atau hari-H (0 <= daysLeft <= 1)
      if (daysLeft >= 0 && daysLeft <= 1) {
        // Cek idempoten harian: jika sudah dikirim hari ini, lewati
        if (sub.remindersSent?.h1 && sub.remindersSent.h1.startsWith(todayISO)) {
          continue;
        }

        const client = clients.find(c => c.id === sub.clientId);
        if (!client || !client.email) continue;

        console.log(`[JAREE Auto-Pilot] Mengirim email peringatan H-1 otomatis ke ${client.name} (${client.email})...`);
        const draft = window.automation.generateEmailDraft('reminder_h1', client, inv, sub);
        const res = await window.automation.sendEmailDirect(draft.recipient, draft.subject, draft.body, draft.templateParams);

        if (res.success) {
          sub.remindersSent = sub.remindersSent || {};
          sub.remindersSent.h1 = new Date().toISOString();
          window.db.saveSubscription(sub);
          this.showToast(`⚡ Email Peringatan H-1 otomatis terkirim ke ${client.name}!`, 'success');
        }
      }
    }
  }

  openInGmailWeb() {
    const recipient = document.getElementById('email-modal-recipient')?.value.trim();
    const subject = document.getElementById('email-modal-subject')?.value.trim();
    const body = document.getElementById('email-modal-body')?.value;

    if (!recipient) {
      alert('Alamat email penerima tidak boleh kosong.');
      return;
    }

    const gmailUrl = window.automation.generateGmailComposeUrl(recipient, subject, body);
    window.open(gmailUrl, '_blank');
    this.showToast('Membuka draft email di tab Gmail...', 'info');
    this.closeSendEmailModal();
  }

  async sendAutoEmailViaEmailJS() {
    const recipient = document.getElementById('email-modal-recipient')?.value.trim();
    const subject = document.getElementById('email-modal-subject')?.value.trim();
    const body = document.getElementById('email-modal-body')?.value;

    if (!recipient) {
      alert('Alamat email penerima tidak boleh kosong.');
      return;
    }

    const settings = window.db.getSettings();
    const emailConfig = settings.email || {};
    const isConfigured = emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey;

    if (!isConfigured) {
      const confirmSetup = confirm(
        'Kunci EmailJS (Service ID, Template ID, Public Key) belum diatur di menu Pengaturan.\n\n' +
        'Apakah Anda ingin membuka menu Pengaturan sekarang untuk melengkapi setup EmailJS gratis (200 email/bln)?\n\n' +
        'Klik "Cancel" jika ingin mengirim langsung lewat Gmail Web sekarang.'
      );
      if (confirmSetup) {
        this.closeSendEmailModal();
        this.switchTab('settings');
      } else {
        this.openInGmailWeb();
      }
      return;
    }

    const btn = document.getElementById('btn-email-send-auto');
    const oldHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-feather="loader"></i> Mengirim email...';
      if (window.feather) feather.replace();
    }

    const templateParams = this.activeEmailContext ? this.activeEmailContext.draft?.templateParams || {} : {};

    const result = await window.automation.sendEmailDirect(recipient, subject, body, templateParams);

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = oldHtml;
      if (window.feather) feather.replace();
    }

    if (result.success) {
      this.showToast(result.message, 'success');
      this.closeSendEmailModal();
    } else {
      alert(`${result.message}\n\nTips: Anda juga dapat menggunakan opsi tombol "Buka di Gmail" jika kuota habis atau API sedang bermasalah.`);
    }
  }

  async testEmailJS() {
    const serviceId = document.getElementById('set-emailjs-service')?.value.trim();
    const templateId = document.getElementById('set-emailjs-template')?.value.trim();
    const publicKey = document.getElementById('set-emailjs-key')?.value.trim();
    const ownerEmail = document.getElementById('set-owner-email')?.value.trim() || 'fajaromadhan@gmail.com';

    if (!serviceId || !templateId || !publicKey) {
      alert('Harap isi Service ID, Template ID, dan Public Key terlebih dahulu sebelum melakukan tes.');
      return;
    }

    if (!window.emailjs) {
      alert('Pustaka EmailJS belum termuat.');
      return;
    }

    const btn = document.getElementById('btn-test-emailjs');
    const oldHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-feather="loader"></i> Mengirim email percobaan...';
      if (window.feather) feather.replace();
    }

    try {
      window.emailjs.init(publicKey);
      await window.emailjs.send(serviceId, templateId, {
        to_name: 'Fajar Romadhan (Founder JAREE)',
        to_email: ownerEmail,
        service_name: 'Penyimpanan Drive 5 TB (Tes EmailJS)',
        invoice_number: 'INV-TEST-001',
        service_period: 'Tes Periode',
        due_date: 'Hari ini',
        total_amount: 'Rp 150.000',
        bank_name: 'SeaBank',
        account_number: '901448683446',
        account_name: 'Fajar Romadhan',
        reply_to: ownerEmail,
        subject: '[JAREE TEST] Konfigurasi EmailJS Berhasil!',
        message: 'Halo Fajar, ini adalah email tes otomatis dari JAREE Billing System. Konfigurasi EmailJS Anda berhasil terhubung!'
      });

      this.showToast(`✅ Berhasil! Email tes terkirim ke ${ownerEmail}`, 'success');
      this.updateEmailSetupStatusBadge();
    } catch (err) {
      const msg = err.text || err.message || JSON.stringify(err);
      alert(`⚠️ Tes Email Gagal: ${msg}\n\nPastikan Service ID, Template ID, dan Public Key sesuai dengan akun EmailJS Anda.`);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = oldHtml;
        if (window.feather) feather.replace();
      }
    }
  }

  copyEmailJSTemplate() {
    const tpl = `{{{message}}}`;

    navigator.clipboard.writeText(tpl).then(() => {
      this.showToast('✅ Teks template `{{{message}}}` berhasil disalin! Tempel di bagian Content EmailJS.', 'success');
    }).catch(() => {
      prompt('Salin teks di bawah ini ke Body/Content template EmailJS:', tpl);
    });
  }
}

window.app = new JareeApp();

