# ☁️ SecureCloud — Multi-Layered Architecture

Bu proje tamamen ayrıştırılmış (Separated Architecture) bir yapıya sahiptir. Backend ve Frontend katmanları birbirlerinden bağımsız çalışır ve sadece API üzerinden haberleşir.

---

## 🏗️ Proje Yapısı

### ⚙️ Backend (The Vault)
Sistem merkezini oluşturan, iş mantığı ve API servislerini barındıran katmandır.
- **Dosya:** `server.js`
- **Görev:** API sunma, veritabanı işlemleri (users.json), dosya depolama yönetimi.
- **Don't Do:** Kesinlikle UI/HTML kodu içermez. Sadece JSON veri döndürür.
- **Port:** `4000`

### 🎨 Frontend (Cloud UI)
Modern, React tabanlı kullanıcı arayüzüdür.
- **Dizin:** `./cloud-ui`
- **Görev:** Kullanıcı deneyimi, React bileşenleri, Dashboard arayüzü.
- **Bağlantı:** Backend API'lerini (`http://localhost:4000`) kullanarak veri çeker.
- **Port:** `3000`

### 👁️ The Watcher (CLI Client)
Dosya sistemini izleyen ve sunucuya otomatik yükleme yapan yardımcı araçtır.
- **Dosya:** `client.js`

---

## 🚀 Başlatma Talimatları

### 1. Backend'i Başlat (Root terminal)
```bash
npm run dev:server
```

### 2. Frontend'i Başlat (Cloud-UI terminal)
```bash
cd cloud-ui
npm install   # İlk seferde bir kez
npm run dev
```

---

## 🔗 Bağlantı Mantığı
Pre-defined CORS ayarları sayesinde `cloud-ui` (port 3000), backend API'lerine (port 4000) güvenli bir şekilde erişebilir. UI tarafında statik dosyalar Vite üzerinden servis edilir, backend sadece `/avatars` gibi gerekli sistem assetlerini dışarı açar.

❗ **Kural:** Backend dosyasına (`server.js`) React veya HTML kodu KOPYALAMAYIN. UI geliştirmelerini sadece `cloud-ui` klasörü içinde yapın.
