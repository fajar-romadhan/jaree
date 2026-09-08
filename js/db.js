/**
 * JAREE — Data Layer & Persistence Engine (db.js)
 * Zero-cost LocalStorage persistence with schema validation & backup/restore.
 * Configured specifically for Fajar Romadhan with Private Owner Security.
 */

const DB_KEY = 'JAREE_DB_V1';

const DEFAULT_SETTINGS = {
  profile: {
    brandName: 'JAREE',
    ownerName: 'Fajar Romadhan',
    email: 'fajaromadhan@gmail.com',
    phone: '6285783656335'
  },
  payment: {
    bankName: 'SeaBank',
    accountNumber: '901448683446',
    accountName: 'Fajar Romadhan'
  },
  security: {
    pinEnabled: false, // Default dinonaktifkan sesuai permintaan Founder (langsung masuk konsol tanpa PIN)
    pinCode: '260803', // PIN Cadangan (jika sewaktu-waktu diaktifkan kembali di Pengaturan)
    autoLockMinutes: 30
  },
  email: {
    provider: 'emailjs',
    serviceId: 'service_qz3z9jq',
    templateId: 'template_277378i',
    publicKey: '33YWwbogyPk8u4NFH'
  },
  invoice: {
    prefix: 'INV',
    taxPercent: 0,
    defaultDueDays: 7,
    defaultNotes: [
      'Pembayaran telah diterima — terima kasih.',
      'Akun Penyimpanan Drive 5 TB aktif untuk periode layanan di atas.',
      'Perpanjangan ditagihkan pada awal periode berikutnya.'
    ]
  },
  reminders: {
    enabled: true,
    triggers: [7, 3, 1, 0],
    overdueGraceDays: 3
  },
  firebase: {
    enabled: true,
    apiKey: "AIzaSyBQOb4otLRsETQgTCCppcQGauYtuVTBACc",
    authDomain: "jaree-946de.firebaseapp.com",
    projectId: "jaree-946de",
    storageBucket: "jaree-946de.firebasestorage.app",
    messagingSenderId: "347412861890",
    appId: "1:347412861890:web:083acb53483e0bbc177c5b",
    measurementId: "G-4D8203SF90"
  }
};

const DEFAULT_SERVICES = [
  {
    id: 'SVC-001',
    code: 'GDRIVE-5TB',
    name: 'Penyimpanan Drive 5 TB',
    description: 'Penyimpanan Drive 5 TB · 1 akun · berbayar per bulan',
    category: 'storage',
    defaultPrice: 150000,
    billingCycle: 'monthly',
    isActive: true
  },
  {
    id: 'SVC-002',
    code: 'GDRIVE-2TB',
    name: 'Penyimpanan Drive 2 TB',
    description: 'Penyimpanan Drive 2 TB · 1 akun · berbayar per bulan',
    category: 'storage',
    defaultPrice: 45000,
    billingCycle: 'monthly',
    isActive: true
  },
  {
    id: 'SVC-003',
    code: 'UNDANGAN-BASIC',
    name: 'Undangan Digital Basic',
    description: 'Undangan Web Digital Responsive & Custom Domain Subdomain',
    category: 'invitation',
    defaultPrice: 100000,
    billingCycle: 'custom',
    isActive: true
  },
  {
    id: 'SVC-004',
    code: 'UNDANGAN-PREMIUM',
    name: 'Undangan Digital Premium',
    description: 'Undangan Web Digital + Fitur RSVP WhatsApp + Galeri + Musik',
    category: 'invitation',
    defaultPrice: 200000,
    billingCycle: 'custom',
    isActive: true
  }
];

// DATA RESMI DARI INVOICE INV-2026-0803-01
const INITIAL_CLIENTS = [
  {
    id: 'CLT-20260803-001',
    name: 'Dimas Imansyah',
    email: 'frekuensipicture@gmail.com',
    phone: '6281234567890',
    type: 'personal',
    company: '',
    notes: 'Klien perorangan — Langganan Penyimpanan Drive 5 TB (INV-2026-0803-01)',
    createdAt: '2026-08-03T00:00:00Z',
    updatedAt: '2026-08-03T00:00:00Z'
  }
];

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 'SUB-20260803-001',
    clientId: 'CLT-20260803-001',
    serviceId: 'SVC-001',
    serviceSnapshot: {
      name: 'Penyimpanan Drive 5 TB',
      description: 'Penyimpanan Drive 5 TB · 1 akun · berbayar per bulan',
      price: 150000
    },
    startDate: '2026-08-03',
    endDate: '2026-09-03', // Periode awal: 3 Agustus 2026 – 3 September 2026
    billingCycle: 'monthly',
    price: 150000,
    status: 'completed', // Selesai & Lunas (Sesuai Invoice resmi INV-2026-0803-01)
    remindersSent: {
      h7: '2026-08-27T10:00:00Z',
      h3: '2026-08-31T10:00:00Z',
      h1: '2026-09-02T10:00:00Z',
      h0: '2026-09-03T10:00:00Z',
      overdue: '2026-09-04T10:00:00Z'
    },
    lastInvoiceId: 'INV-2026-0803-01',
    notes: 'Penyimpanan Drive 5 TB Dimas Imansyah - Periode 3 Agt - 3 Sep 2026',
    createdAt: '2026-08-03T00:00:00Z',
    updatedAt: '2026-09-03T00:00:00Z'
  }
];

const INITIAL_INVOICES = [
  {
    id: 'INV-2026-0803-01',
    invoiceNumber: 'INV-2026-0803-01',
    subscriptionId: 'SUB-20260803-001',
    clientId: 'CLT-20260803-001',
    clientSnapshot: {
      name: 'Dimas Imansyah',
      email: 'frekuensipicture@gmail.com',
      phone: '6281234567890'
    },
    issueDate: '2026-08-03',
    dueDate: '2026-08-03',
    servicePeriod: {
      from: '2026-08-03',
      to: '2026-09-03'
    },
    items: [
      {
        description: 'Penyimpanan Drive 5 TB · 1 akun · berbayar per bulan',
        qty: 1,
        unit: 'bulan',
        unitPrice: 150000,
        total: 150000
      }
    ],
    subtotal: 150000,
    tax: 0,
    total: 150000,
    paymentDetails: {
      bankName: 'SeaBank',
      accountNumber: '901448683446',
      accountName: 'Fajar Romadhan'
    },
    notes: [
      'Pembayaran telah diterima — terima kasih.',
      'Akun Penyimpanan Drive 5 TB aktif untuk periode layanan di atas.',
      'Perpanjangan ditagihkan pada awal periode berikutnya.'
    ],
    status: 'paid',
    paidAt: '2026-08-03T10:00:00Z',
    paymentProofUrl: null,
    sentAt: '2026-08-03T10:05:00Z',
    createdAt: '2026-08-03T10:00:00Z'
  }
];

class JareeDB {
  constructor() {
    this.init();
  }

  init() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      this.data = {
        settings: DEFAULT_SETTINGS,
        services: DEFAULT_SERVICES,
        clients: INITIAL_CLIENTS,
        subscriptions: INITIAL_SUBSCRIPTIONS,
        invoices: INITIAL_INVOICES,
        reminderLogs: []
      };
      this.save();
    } else {
      try {
        this.data = JSON.parse(raw);
        this.data.settings = { ...DEFAULT_SETTINGS, ...(this.data.settings || {}) };
        this.data.services = this.data.services || DEFAULT_SERVICES;
        this.data.clients = this.data.clients || INITIAL_CLIENTS;
        this.data.subscriptions = this.data.subscriptions || INITIAL_SUBSCRIPTIONS;
        this.data.invoices = this.data.invoices || INITIAL_INVOICES;
        this.data.reminderLogs = this.data.reminderLogs || [];

        // Auto-migrasi profil kontak resmi Fajar Romadhan
        if (!this.data.settings.profile.phone || this.data.settings.profile.phone === '6281234567890') {
          this.data.settings.profile.phone = '6285783656335';
        }
        if (!this.data.settings.profile.email) {
          this.data.settings.profile.email = 'fajaromadhan@gmail.com';
        }

        // Auto-migrasi kredensial EmailJS dari dashboard EmailJS Fajar Romadhan
        if (!this.data.settings.email) this.data.settings.email = {};
        if (!this.data.settings.email.serviceId || this.data.settings.email.serviceId === '') {
          this.data.settings.email.serviceId = 'service_qz3z9jq';
        }
        if (!this.data.settings.email.templateId || this.data.settings.email.templateId === '') {
          this.data.settings.email.templateId = 'template_277378i';
        }
        if (!this.data.settings.email.publicKey || this.data.settings.email.publicKey === '') {
          this.data.settings.email.publicKey = '33YWwbogyPk8u4NFH';
        }

        // Auto-migrasi kredensial Firebase Cloud Sync resmi Fajar Romadhan
        if (!this.data.settings.firebase || !this.data.settings.firebase.apiKey || this.data.settings.firebase.projectId !== 'jaree-946de') {
          this.data.settings.firebase = {
            enabled: true,
            apiKey: "AIzaSyBQOb4otLRsETQgTCCppcQGauYtuVTBACc",
            authDomain: "jaree-946de.firebaseapp.com",
            projectId: "jaree-946de",
            storageBucket: "jaree-946de.firebasestorage.app",
            messagingSenderId: "347412861890",
            appId: "1:347412861890:web:083acb53483e0bbc177c5b",
            measurementId: "G-4D8203SF90"
          };
        }
        this.saveLocalOnly();

        // Sinkronisasi data awal Dimas Imansyah jika belum ada
        if (this.data.clients.length === 0 || !this.data.clients.find(c => c.name === 'Dimas Imansyah')) {
          this.data.clients = INITIAL_CLIENTS;
          this.data.subscriptions = INITIAL_SUBSCRIPTIONS;
          this.data.invoices = INITIAL_INVOICES;
          this.save();
        } else {
          // Auto-migrasi periode awal Dimas Imansyah jika tanggalnya sebelumnya 2026-08-03 atau 2026-09-09
          const dimasSub = this.data.subscriptions.find(s => s.id === 'SUB-20260803-001' || s.clientId === 'CLT-20260803-001');
          if (dimasSub) {
            dimasSub.status = 'completed'; // Selesai & Lunas
            if (dimasSub.endDate === '2026-08-03' || dimasSub.endDate === '2026-09-09') {
              dimasSub.startDate = '2026-08-03';
              dimasSub.endDate = '2026-09-03';
            }
          }
          const dimasInv = this.data.invoices.find(i => i.id === 'INV-2026-0803-01' || i.invoiceNumber === 'INV-2026-0803-01');
          if (dimasInv) {
            dimasInv.status = 'paid';
            if (!dimasInv.paidAt) dimasInv.paidAt = '2026-08-03T10:00:00Z';
            if (dimasInv.servicePeriod && (dimasInv.servicePeriod.to === '2026-08-03' || dimasInv.servicePeriod.to === '2026-09-09')) {
              dimasInv.servicePeriod.from = '2026-08-03';
              dimasInv.servicePeriod.to = '2026-09-03';
            }
          }

          // Hubungkan semua subscriptions dengan invoice terkait jika belum terhubung
          this.data.subscriptions.forEach(sub => {
            if (!sub.lastInvoiceId) {
              const inv = this.data.invoices.find(i => i.subscriptionId === sub.id || i.clientId === sub.clientId);
              if (inv) sub.lastInvoiceId = inv.id || inv.invoiceNumber;
            }
            // Jika invoice-nya sudah lunas dan tanggalnya sudah lewat, tandai sebagai completed
            const inv = this.data.invoices.find(i => i.id === sub.lastInvoiceId || i.subscriptionId === sub.id);
            if (inv && inv.status === 'paid') {
              if (sub.endDate <= '2026-09-08' || sub.id === 'SUB-20260803-001') {
                sub.status = 'completed';
              }
            }
          });

          // Auto-migrasi nama layanan: ubah 'Google One' menjadi 'Penyimpanan Drive'
          if (this.data.services) {
            this.data.services.forEach(svc => {
              svc.name = svc.name.replace(/Google One/g, 'Penyimpanan Drive');
              svc.description = svc.description.replace(/Google One/g, 'Penyimpanan Drive');
            });
          }
          if (this.data.subscriptions) {
            this.data.subscriptions.forEach(sub => {
              if (sub.serviceSnapshot) {
                sub.serviceSnapshot.name = (sub.serviceSnapshot.name || '').replace(/Google One/g, 'Penyimpanan Drive');
                sub.serviceSnapshot.description = (sub.serviceSnapshot.description || '').replace(/Google One/g, 'Penyimpanan Drive');
              }
              if (sub.notes) {
                sub.notes = sub.notes.replace(/Google One/g, 'Penyimpanan Drive');
              }
            });
          }
          if (this.data.invoices) {
            this.data.invoices.forEach(inv => {
              if (inv.items) {
                inv.items.forEach(item => {
                  item.description = (item.description || '').replace(/Google One/g, 'Penyimpanan Drive');
                });
              }
              if (inv.notes) {
                inv.notes = inv.notes.map(note => note.replace(/Google One/g, 'Penyimpanan Drive'));
              }
            });
          }

          // Auto-migrasi: nonaktifkan kewajiban PIN di cache browser agar langsung masuk tanpa PIN
          if (this.data.settings && this.data.settings.security && this.data.settings.security.pinEnabled) {
            this.data.settings.security.pinEnabled = false;
          }

          this.save();
        }
      } catch (e) {
        console.error('Failed to parse database, resetting to defaults:', e);
        this.data = {
          settings: DEFAULT_SETTINGS,
          services: DEFAULT_SERVICES,
          clients: INITIAL_CLIENTS,
          subscriptions: INITIAL_SUBSCRIPTIONS,
          invoices: INITIAL_INVOICES,
          reminderLogs: []
        };
        this.save();
      }
    }
  }

  saveLocalOnly() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.error('LocalStorage save error:', err);
    }
  }

  save() {
    this.saveLocalOnly();
    if (window.cloudSync && typeof window.cloudSync.pushLocalToRemote === 'function') {
      window.cloudSync.pushLocalToRemote();
    }
  }

  // --- Clients CRUD ---
  getClients() {
    return this.data.clients || [];
  }

  getClientById(id) {
    return this.data.clients.find(c => c.id === id) || null;
  }

  saveClient(client) {
    const now = new Date().toISOString();
    if (!client.id) {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(this.data.clients.length + 1).padStart(3, '0');
      client.id = `CLT-${stamp}-${seq}`;
      client.createdAt = now;
      client.updatedAt = now;
      this.data.clients.push(client);
    } else {
      const idx = this.data.clients.findIndex(c => c.id === client.id);
      if (idx !== -1) {
        client.updatedAt = now;
        this.data.clients[idx] = { ...this.data.clients[idx], ...client };
      } else {
        this.data.clients.push(client);
      }
    }
    this.save();
    return client;
  }

  deleteClient(id) {
    this.data.clients = this.data.clients.filter(c => c.id !== id);
    this.save();
  }

  // --- Services CRUD ---
  getServices() {
    return this.data.services || [];
  }

  getServiceById(id) {
    return this.data.services.find(s => s.id === id) || null;
  }

  saveService(service) {
    if (!service.id) {
      const seq = String(this.data.services.length + 1).padStart(3, '0');
      service.id = `SVC-${seq}`;
      this.data.services.push(service);
    } else {
      const idx = this.data.services.findIndex(s => s.id === service.id);
      if (idx !== -1) {
        this.data.services[idx] = { ...this.data.services[idx], ...service };
      } else {
        this.data.services.push(service);
      }
    }
    this.save();
    return service;
  }

  deleteService(id) {
    this.data.services = this.data.services.filter(s => s.id !== id);
    this.save();
  }

  // --- Subscriptions CRUD ---
  getSubscriptions() {
    return (this.data.subscriptions || []).slice().sort((a, b) => {
      // Prioritaskan langganan aktif, lalu urutkan tanggal mulai terbaru
      if (a.status !== 'renewed' && b.status === 'renewed') return -1;
      if (a.status === 'renewed' && b.status !== 'renewed') return 1;
      return (b.startDate || b.createdAt || '').localeCompare(a.startDate || a.createdAt || '');
    });
  }

  getSubscriptionById(id) {
    return this.data.subscriptions.find(s => s.id === id) || null;
  }

  saveSubscription(sub) {
    const now = new Date().toISOString();
    if (!sub.id) {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(this.data.subscriptions.length + 1).padStart(3, '0');
      sub.id = `SUB-${stamp}-${seq}`;
      sub.createdAt = now;
      sub.updatedAt = now;
      sub.remindersSent = sub.remindersSent || { h7: null, h3: null, h1: null, h0: null, overdue: null };
      this.data.subscriptions.push(sub);
    } else {
      const idx = this.data.subscriptions.findIndex(s => s.id === sub.id);
      if (idx !== -1) {
        sub.updatedAt = now;
        this.data.subscriptions[idx] = { ...this.data.subscriptions[idx], ...sub };
      } else {
        this.data.subscriptions.push(sub);
      }
    }
    this.save();
    return sub;
  }

  deleteSubscription(id) {
    this.data.subscriptions = this.data.subscriptions.filter(s => s.id !== id);
    this.save();
  }

  // --- Invoices CRUD ---
  getInvoices() {
    return (this.data.invoices || []).slice().sort((a, b) => {
      return (b.issueDate || b.createdAt || '').localeCompare(a.issueDate || a.createdAt || '');
    });
  }

  getInvoiceById(id) {
    if (!id) return null;
    return this.data.invoices.find(i => i.id === id || i.invoiceNumber === id) || null;
  }

  saveInvoice(invoice) {
    const now = new Date().toISOString();
    if (!invoice.id) {
      invoice.id = invoice.invoiceNumber;
      invoice.createdAt = now;
      this.data.invoices.unshift(invoice);
    } else {
      const idx = this.data.invoices.findIndex(i => i.id === invoice.id || i.invoiceNumber === invoice.id || (invoice.invoiceNumber && i.invoiceNumber === invoice.invoiceNumber));
      if (idx !== -1) {
        this.data.invoices[idx] = { ...this.data.invoices[idx], ...invoice };
      } else {
        this.data.invoices.unshift(invoice);
      }
    }
    this.save();
    return invoice;
  }

  deleteInvoice(id) {
    this.data.invoices = this.data.invoices.filter(i => i.id !== id);
    this.save();
  }

  // --- Reminder Logs ---
  getReminderLogs() {
    return this.data.reminderLogs || [];
  }

  addReminderLog(log) {
    log.id = `REM-${Date.now()}`;
    log.timestamp = new Date().toISOString();
    this.data.reminderLogs.unshift(log);
    if (this.data.reminderLogs.length > 200) {
      this.data.reminderLogs = this.data.reminderLogs.slice(0, 200);
    }
    this.save();
    return log;
  }

  // --- Settings ---
  getSettings() {
    return this.data.settings;
  }

  saveSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  // --- Backup & Restore Protocol ---
  exportJSON() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.href = url;
    a.download = `jaree_backup_${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.clients || !parsed.subscriptions || !parsed.invoices) {
        throw new Error('Format file backup tidak valid. Key utama tidak ditemukan.');
      }
      this.data = parsed;
      this.save();
      return { success: true, message: 'Database JAREE berhasil dipulihkan!' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  resetAllData() {
    localStorage.removeItem(DB_KEY);
    this.init();
  }
}

window.db = new JareeDB();
