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
        topbarBadge.style.background = '#ecfdf5';
        topbarBadge.style.color = '#15803d';
        topbarBadge.style.borderColor = '#a7f3d0';
        topbarBadge.innerHTML = '🟢 Cloud Live';
        topbarBadge.title = 'Tersambung ke Cloud Database. Data otomatis tersinkron 24/7.';
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
        topbarBadge.style.background = '#fef3c7';
        topbarBadge.style.color = '#b45309';
        topbarBadge.style.borderColor = '#fde68a';
        topbarBadge.innerHTML = '🔄 Syncing...';
      }
    } else if (this.status === 'error') {
      const lowerMsg = (errMsg || '').toLowerCase();
      const isPermissionDenied = lowerMsg.includes('permission') || lowerMsg.includes('permission-denied') || lowerMsg.includes('insufficient permissions');
      const isDbNotCreated = lowerMsg.includes('disabled') || lowerMsg.includes('not been used') || lowerMsg.includes('does not exist');

      if (badge) {
        badge.className = 'status-badge';
        badge.style.background = '#fee2e2';
        badge.style.color = '#b91c1c';
        if (isPermissionDenied) {
          badge.innerHTML = '⚠️ Aturan Firestore Masih Terkunci (Rules)';
        } else if (isDbNotCreated) {
          badge.innerHTML = '⚠️ Firestore Belum Diaktifkan di Firebase';
        } else {
          badge.innerHTML = '⚠️ Perlu Refresh / Sambungkan Cloud';
        }
      }
      if (desc) {
        if (isPermissionDenied) {
          desc.innerHTML = '<b>Langkah Terakhir (Aturan Rules):</b> Firestore sudah dibuat tapi terkunci (Production Mode). Buka <a href="https://console.firebase.google.com/project/jaree-946de/firestore/rules" target="_blank" style="color:#0369a1;font-weight:700;text-decoration:underline;">Firebase Console &rarr; Firestore Database &rarr; Tab "Rules"</a>, ubah menjadi <code>allow read, write: if true;</code> lalu klik <b>Publish</b> agar sinkronisasi aktif!';
        } else if (isDbNotCreated) {
          desc.innerHTML = '<b>Langkah Terakhir:</b> Database Firestore belum dibuat di Firebase Console. Buka <a href="https://console.firebase.google.com/project/jaree-946de/firestore" target="_blank" style="color:#0369a1;font-weight:700;text-decoration:underline;">Firebase Console &rarr; Firestore Database &rarr; Create Database</a> (Pilih <i>Start in test mode</i>) agar sinkronisasi aktif!';
        } else {
          desc.innerHTML = errMsg || 'Periksa kembali koneksi atau konfigurasi Firebase di Pengaturan.';
        }
      }
      if (topbarBadge) {
        topbarBadge.style.display = 'inline-flex';
        topbarBadge.style.background = '#fee2e2';
        topbarBadge.style.color = '#b91c1c';
        topbarBadge.style.borderColor = '#fca5a5';
        topbarBadge.style.cursor = 'pointer';
        topbarBadge.onclick = () => {
          if (window.app && typeof window.app.navigate === 'function') {
            window.app.navigate('settings');
            const target = document.getElementById('cloud-sync-status-badge');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }
        };
        if (isPermissionDenied) {
          topbarBadge.innerHTML = '⚠️ Cloud: Buka Aturan Rules Firestore';
          topbarBadge.title = 'Klik untuk membuka panduan buka Rules di Firebase Console';
        } else if (isDbNotCreated) {
          topbarBadge.innerHTML = '⚠️ Cloud: Perlu Aktifkan Firestore';
          topbarBadge.title = 'Buka Firebase Console -> Firestore Database -> Create database';
        } else {
          topbarBadge.innerHTML = '⚠️ Cloud: Cek Koneksi';
          topbarBadge.title = errMsg || 'Klik untuk cek status di pengaturan';
        }
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

  // Penggabungan dataset dua arah cerdas (ID-based smart merge) agar tidak ada invoice / data yang hilang
  mergeData(localData, remoteData) {
    if (!remoteData) return localData;
    if (!localData) return remoteData;

    const merged = { ...localData };

    const mergeArray = (localArr = [], remoteArr = []) => {
      const map = new Map();
      // Masukkan data remote terlebih dahulu
      remoteArr.forEach(item => { if (item && item.id) map.set(item.id, item); });
      // Masukkan / perbarui dengan data lokal
      localArr.forEach(item => {
        if (!item || !item.id) return;
        if (map.has(item.id)) {
          const remoteItem = map.get(item.id);
          const localTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
          const remoteTime = new Date(remoteItem.updatedAt || remoteItem.createdAt || 0).getTime();
          if (localTime >= remoteTime) {
            map.set(item.id, item);
          }
        } else {
          map.set(item.id, item);
        }
      });
      return Array.from(map.values());
    };

    merged.clients = mergeArray(localData.clients, remoteData.clients);
    merged.services = mergeArray(localData.services, remoteData.services);
    merged.subscriptions = mergeArray(localData.subscriptions, remoteData.subscriptions);
    merged.invoices = mergeArray(localData.invoices, remoteData.invoices);
    merged.reminderLogs = mergeArray(localData.reminderLogs, remoteData.reminderLogs);

    merged.settings = { ...(remoteData.settings || {}), ...(localData.settings || {}) };

    return merged;
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

      // Jika data di cloud berbeda dengan data lokal, gabungkan secara cerdas
      if (localStr !== remoteStr) {
        console.log('Perubahan data terdeteksi dari Cloud Firebase!');
        const merged = this.mergeData(window.db ? window.db.data : null, remoteData);
        if (window.db) {
          window.db.data = merged;
          window.db.saveLocalOnly();
        }

        if (window.app) {
          if (typeof window.app.renderAllViews === 'function') {
            window.app.renderAllViews();
          } else if (typeof window.app.renderAll === 'function') {
            window.app.renderAll();
          }
          if (typeof window.app.showToast === 'function') {
            window.app.showToast('Data riwayat otomatis tersinkron dari Cloud!', 'info');
          }
        }
      }
    }, (err) => {
      console.warn('Firestore onSnapshot warning:', err);
      this.status = 'error';
      this.updateUIStatus(err.message || '');
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
        const localData = window.db ? window.db.data : null;

        // Smart merge
        const merged = this.mergeData(localData, remoteData);
        if (window.db) {
          window.db.data = merged;
          window.db.saveLocalOnly();
        }
        if (window.app) {
          if (typeof window.app.renderAllViews === 'function') {
            window.app.renderAllViews();
          } else if (typeof window.app.renderAll === 'function') {
            window.app.renderAll();
          }
        }

        // Jika data gabungan lebih baru/banyak dari remote, perbarui cloud
        const remoteInvoicesCount = (remoteData.invoices || []).length;
        const mergedInvoicesCount = (merged.invoices || []).length;
        if (mergedInvoicesCount > remoteInvoicesCount) {
          await this.pushLocalToRemote();
        }
      }

      this.status = 'connected';
      this.updateUIStatus();
    } catch (e) {
      console.warn('Initial sync error:', e);
      this.status = 'error';
      this.updateUIStatus(e.message || '');
    }
  }

  async pushLocalToRemote() {
    if (!this.firestore || !window.db) return;
    this.isSyncing = true;
    try {
      const docRef = this.firestore.collection('jaree_db').doc('current');
      const payload = JSON.parse(JSON.stringify(window.db.data));
      await docRef.set(payload);
      console.log('Database JAREE berhasil disinkronkan ke Firebase Cloud!');
      this.status = 'connected';
      this.updateUIStatus();
    } catch (e) {
      console.error('Failed to push to Firebase:', e);
      this.status = 'error';
      this.updateUIStatus(e.message || '');
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
