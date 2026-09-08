/**
 * JAREE — Cloud Realtime Database Synchronization Engine (Firebase Firestore)
 * 100% Free Tier (50,000 reads / 20,000 writes per day).
 * Sinkronisasi data invoice, pesanan, dan pelanggan otomatis antar akun Chrome, Laptop, dan HP.
 */

class CloudSyncEngine {
  constructor() {
    this.firestore = null;
    this.unsubscribe = null;
    this.isSyncing = false;
    this.status = 'disconnected'; // 'connected' | 'syncing' | 'disconnected' | 'error'
  }

  init() {
    const settings = window.db ? window.db.getSettings() : {};
    const config = settings.firebase;

    if (!config || !config.projectId || !config.apiKey) {
      this.status = 'disconnected';
      this.updateUIStatus();
      return;
    }

    if (!window.firebase) {
      console.warn('Firebase SDK belum termuat.');
      this.status = 'error';
      this.updateUIStatus('Firebase SDK belum termuat di browser.');
      return;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(config);
      }
      this.firestore = firebase.firestore();
      this.status = 'connected';
      this.updateUIStatus();

      // Pasang listener realtime untuk mendeteksi perubahan dari profil/perangkat lain
      this.listenToRemoteChanges();

      // Sinkronisasi data saat pertama kali aplikasi dibuka
      this.syncInitial();
    } catch (err) {
      console.error('Firebase initialization error:', err);
      this.status = 'error';
      this.updateUIStatus(err.message);
    }
  }

  updateUIStatus(errMsg = '') {
    const badge = document.getElementById('cloud-sync-status-badge');
    const desc = document.getElementById('cloud-sync-status-desc');
    const topbarBadge = document.getElementById('topbar-cloud-badge');
    if (!badge && !topbarBadge) return;

    if (this.status === 'connected') {
      if (badge) {
        badge.className = 'status-badge badge-active';
        badge.style.background = '#ecfdf5';
        badge.style.color = '#15803d';
        badge.innerHTML = '🟢 Cloud Sync: Terhubung Real-Time';
      }
      if (desc) {
        desc.textContent = 'Sinkronisasi cloud aktif 24/7. Data otomatis tersinkron live ke semua akun Chrome, laptop, dan HP Anda.';
      }
      if (topbarBadge) {
        topbarBadge.style.display = 'inline-flex';
        topbarBadge.innerHTML = '🟢 Cloud Live';
        topbarBadge.title = 'Tersambung ke Cloud Database. Data otomatis tersinkron.';
      }
    } else if (this.status === 'syncing') {
      if (badge) {
        badge.className = 'status-badge';
        badge.style.background = '#fef3c7';
        badge.style.color = '#b45309';
        badge.innerHTML = '🔄 Menyinkronkan...';
      }
      if (topbarBadge) {
        topbarBadge.style.display = 'inline-flex';
        topbarBadge.innerHTML = '🔄 Syncing...';
      }
    } else if (this.status === 'error') {
      if (badge) {
        badge.className = 'status-badge';
        badge.style.background = '#fee2e2';
        badge.style.color = '#b91c1c';
        badge.innerHTML = '⚠️ Gagal Terhubung';
      }
      if (desc) {
        desc.textContent = errMsg || 'Periksa kembali konfigurasi Firebase di Pengaturan.';
      }
      if (topbarBadge) {
        topbarBadge.style.display = 'none';
      }
    } else {
      if (badge) {
        badge.className = 'status-badge';
        badge.style.background = '#f1f5f9';
        badge.style.color = '#64748b';
        badge.innerHTML = '🟡 Mode Lokal (Belum Terhubung)';
      }
      if (desc) {
        desc.textContent = 'Data saat ini tersimpan di memori browser (LocalStorage). Hubungkan Firebase agar sinkron otomatis.';
      }
      if (topbarBadge) {
        topbarBadge.style.display = 'none';
      }
    }
  }

  listenToRemoteChanges() {
    if (!this.firestore) return;
    if (this.unsubscribe) this.unsubscribe();

    const docRef = this.firestore.collection('jaree_db').doc('current');
    this.unsubscribe = docRef.onSnapshot((doc) => {
      if (!doc.exists) return;
      if (this.isSyncing) return; // Abaikan jika dipicu oleh penyimpanan lokal sendiri

      const remoteData = doc.data();
      if (!remoteData || !remoteData.invoices) return;

      const localStr = localStorage.getItem('JAREE_DB_V1') || '';
      const remoteStr = JSON.stringify(remoteData);

      // Jika data di cloud berbeda dengan data lokal, perbarui data lokal
      if (localStr !== remoteStr) {
        console.log('Perubahan data terdeteksi dari Cloud Firebase!');
        window.db.data = remoteData;
        window.db.saveLocalOnly();

        if (window.app) {
          window.app.renderAll();
          if (typeof window.app.showToast === 'function') {
            window.app.showToast('Data otomatis tersinkron dari Cloud!', 'info');
          }
        }
      }
    }, (err) => {
      console.warn('Firestore onSnapshot warning:', err);
    });
  }

  async syncInitial() {
    if (!this.firestore) return;
    try {
      this.status = 'syncing';
      this.updateUIStatus();

      const docRef = this.firestore.collection('jaree_db').doc('current');
      const doc = await docRef.get();

      if (!doc.exists) {
        // Jika di cloud masih kosong, unggah data lokal saat ini
        await this.pushLocalToRemote();
      } else {
        const remoteData = doc.data();
        const localInvoices = window.db ? window.db.getInvoices() : [];
        const remoteInvoices = remoteData.invoices || [];

        // Ambil data yang paling mutakhir / lengkap
        if (remoteInvoices.length >= localInvoices.length) {
          window.db.data = remoteData;
          window.db.saveLocalOnly();
          if (window.app) window.app.renderAll();
        } else {
          await this.pushLocalToRemote();
        }
      }

      this.status = 'connected';
      this.updateUIStatus();
    } catch (e) {
      console.warn('Initial sync error:', e);
      this.status = 'error';
      this.updateUIStatus(e.message);
    }
  }

  async pushLocalToRemote() {
    if (!this.firestore || !window.db) return;
    this.isSyncing = true;
    try {
      const docRef = this.firestore.collection('jaree_db').doc('current');
      await docRef.set(window.db.data);
    } catch (e) {
      console.error('Failed to push to Firebase:', e);
    } finally {
      setTimeout(() => { this.isSyncing = false; }, 600);
    }
  }

  // Parse string konfigurasi Firebase baik berupa objek JSON maupun javascript code
  parseFirebaseConfigString(str) {
    if (!str || typeof str !== 'string') return null;
    const cleanStr = str.trim();

    // 1. Coba JSON.parse langsung
    try {
      const parsed = JSON.parse(cleanStr);
      if (parsed.apiKey && parsed.projectId) return parsed;
    } catch {}

    // 2. Ekstrak dari potongan kode JS (misal: const firebaseConfig = { ... };)
    try {
      const apiKeyMatch = cleanStr.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = cleanStr.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = cleanStr.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = cleanStr.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = cleanStr.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = cleanStr.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch && projectIdMatch) {
        return {
          apiKey: apiKeyMatch[1],
          authDomain: authDomainMatch ? authDomainMatch[1] : `${projectIdMatch[1]}.firebaseapp.com`,
          projectId: projectIdMatch[1],
          storageBucket: storageBucketMatch ? storageBucketMatch[1] : `${projectIdMatch[1]}.appspot.com`,
          messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '',
          appId: appIdMatch ? appIdMatch[1] : ''
        };
      }
    } catch (err) {
      console.error('Error parsing firebase config string:', err);
    }

    return null;
  }
}

window.cloudSync = new CloudSyncEngine();
