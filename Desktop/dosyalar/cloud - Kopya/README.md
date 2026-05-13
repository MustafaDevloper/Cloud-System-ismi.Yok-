# ☁️ Cloud Sync — Gerçek Zamanlı Bulut Depolama Sistemi

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-black)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📋 Proje Hakkında

**Cloud Sync**, gerçek zamanlı iki taraflı senkronizasyon özelliğine sahip, modern bir bulut depolama sistemidir. Projesi tamamen ayrıştırılmış (Separated Architecture) bir yapıya sahiptir. Backend ve Frontend katmanları birbirlerinden bağımsız çalışır ve sadece API üzerinden haberleşir.

### 🎯 Temel Özellikler

- ✅ **Gerçek Zamanlı Senkronizasyon** — Chokidar ile dosya sistem izleme
- ✅ **WebSocket Desteği** — Socket.IO ile canlı güncellemeler
- ✅ **Çok Katmanlı Mimari** — Backend, Frontend ve CLI Client
- ✅ **Kullanıcı Yönetimi** — Kayıt, giriş ve profil yönetimi
- ✅ **Dosya Yönetimi** — Upload, download, paylaşım işlemleri
- ✅ **Admin Paneli** — Sistem yönetimi ve kontrol
- ✅ **Responsive Design** — Tailwind CSS ile modern UI
- ✅ **Dosya Paylaşımı** — Diğer kullanıcılarla dosya ve klasör paylaşma
- ✅ **Bildirim Sistemi** — Gerçek zamanlı event notifikasyonları

---

## 🛠️ Teknoloji Stack

### Backend
| Teknoloji | Açıklama |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **Socket.IO** | Real-time communication |
| **Chokidar** | Dosya sistem izleme |
| **Multer** | Dosya upload |
| **Cors** | Cross-origin requests |

### Frontend
| Teknoloji | Açıklama |
|-----------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **Socket.IO Client** | Real-time updates |
| **Axios** | HTTP requests |

### Ek Araçlar
| Araç | Amaç |
|------|------|
| **Chokidar** | Dosya değişikliği izleme |
| **Ngrok** | Tunnel (opsiyonel) |
| **CLI Progress** | Terminal progress bars |

---

## 📁 Proje Yapısı

```
cloud-sync/
├── server.js                 # Ana backend entry point
├── client.js                 # CLI Watcher (The Watcher)
├── package.json              # Root bağımlılıkları
├── ngrok.yml                 # Ngrok konfigürasyonu
├── users.json                # Kullanıcı veritabanı
├── shares.json               # Paylaşım veritabanı
│
├── server/                   # 🔧 Backend Uygulaması
│   ├── app.js               # Express app konfigürasyonu
│   ├── package.json         # Backend bağımlılıkları
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── fileController.js
│   │   ├── adminController.js
│   │   └── planController.js
│   ├── models/              # Data models
│   │   ├── User.js
│   │   ├── File.js
│   │   └── Log.js
│   ├── routes/              # API rotaları
│   │   ├── authRoutes.js
│   │   ├── fileRoutes.js
│   │   ├── adminRoutes.js
│   │   └── planRoutes.js
│   ├── middlewares/         # Express middleware'ler
│   │   ├── auth.js
│   │   └── logger.js
│   └── services/            # Yardımcı servisler
│
├── cloud-ui/                # 🎨 Frontend Uygulaması
│   ├── index.html
│   ├── package.json         # Frontend bağımlılıkları
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api.ts           # API client
│       ├── App.css
│       ├── index.css
│       └── components/
│           ├── Login.tsx
│           ├── Register.tsx
│           ├── Dashboard.tsx
│           ├── Workspace.tsx
│           ├── Shared.tsx
│           ├── Settings.tsx
│           ├── Notifications.tsx
│           ├── AdminPanel.tsx
│           └── Sidebar.tsx
│
├── secure-ngrok/            # Ngrok tunnel yönetimi
│   └── package.json
│
└── RemoteStorage/           # 📦 Sunucu dosya depolanması
    └── [user files]
```

---

## 📊 Katmansal Mimari

### ⚙️ Backend (The Vault)
Sistem merkezini oluşturan, iş mantığı ve API servislerini barındıran katmandır.

**Sorumlulukları:**
- ✅ RESTful API sunma
- ✅ Kullanıcı ve dosya yönetimi
- ✅ Veritabanı işlemleri (JSON-based)
- ✅ WebSocket ile real-time güncellemeler
- ✅ Dosya depolama ve senkronizasyon
- ✅ Güvenlik ve yetkilendirme

**Dosya:** `server.js` | **Port:** `4000`

**Not:** Backend kesinlikle UI/HTML kodu içermez. Sadece JSON veri döndürür.

### 🎨 Frontend (Cloud UI)
Modern, React tabanlı, responsive kullanıcı arayüzüdür.

**Sorumlulukları:**
- ✅ Kullanıcı deneyimi sağlama
- ✅ React bileşenleri ve state yönetimi
- ✅ Real-time UI güncellemeleri
- ✅ Dosya ve klasör yönetim arayüzü
- ✅ Admin paneli
- ✅ Bildirim sistemi

**Dizin:** `./cloud-ui` | **Port:** `3000`

### 👁️ The Watcher (CLI Client)
Dosya sistemini izleyen ve sunucuya otomatik yükleme yapan arka plan aracıdır.

**Sorumlulukları:**
- ✅ Yerel dosya sistem izleme
- ✅ Otomatik upload/sync
- ✅ Batch işlem yönetimi
- ✅ Progress tracking

**Dosya:** `client.js`

---

## 🚀 Başlarken

### Ön Gereksinimler

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git
```

### Kurulum Adımları

#### 1️⃣ Depo'yu Clone Et
```bash
git clone https://github.com/MustafaDevloper/Cloud-System-ismi.Yok-.git
cd cloud-sync
```

#### 2️⃣ Root Bağımlılıklarını Yükle
```bash
npm install
```

#### 3️⃣ Backend Bağımlılıklarını Yükle
```bash
cd server
npm install
cd ..
```

#### 4️⃣ Frontend Bağımlılıklarını Yükle
```bash
cd cloud-ui
npm install
cd ..
```

---

## 📱 Çalıştırma

### **Geliştirme Modu (Tüm Bileşenler)**
```bash
npm run dev
```

Bu komut eşzamanlı olarak:
- Backend dev server (port 4000)
- Frontend dev server (port 3000)
- Hot reload ile geliştirmeyi başlatır

### **Sadece Backend**
```bash
npm run dev:server
```

### **Sadece Frontend**
```bash
cd cloud-ui
npm run dev
```

### **Sadece CLI Watcher**
```bash
npm run client
```

### **Production Build**
```bash
cd cloud-ui
npm run build
```

---

## 🌐 API Endpoints

### 📝 Authentication Routes (`/api/auth`)
```
POST   /register         — Yeni kullanıcı kaydı
POST   /login            — Kullanıcı girişi
POST   /logout           — Çıkış
GET    /profile          — Kullanıcı profili
PUT    /profile          — Profil güncelleme
```

### 📂 File Routes (`/api/files`)
```
GET    /                 — Dosya listesi
GET    /:fileId          — Dosya detayları
POST   /upload           — Dosya yükle
DELETE /:fileId          — Dosya sil
GET    /download/:fileId — Dosya indir
POST   /share            — Dosya paylaş
```

### 👥 Admin Routes (`/api/admin`)
```
GET    /users            — Tüm kullanıcılar
GET    /logs             — Sistem logları
GET    /stats            — İstatistikler
DELETE /user/:userId     — Kullanıcı sil
```

### 📋 Plan Routes (`/api/plans`)
```
GET    /                 — Tüm planları getir
POST   /subscribe        — Plan satın al
GET    /active           — Aktif plan
```

---

## 🔗 Bağlantı Mantığı & CORS

Pre-defined CORS ayarları sayesinde:
- **Frontend** (port 3000) → **Backend** (port 4000) API'lerine güvenli erişim
- **WebSocket** ile real-time iletişim
- Statik dosyalar Vite üzerinden servis edilir
- Backend sadece `/avatars` ve API endpoint'leri açar

```javascript
// Backend CORS ayarı
cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"]
})
```

---

## 🔒 Güvenlik Notları

⚠️ **Önemli:** Aşağıdaki kurallara uyunuz:

1. ❌ Backend dosyasına (`server.js`) React veya HTML kodu KOPYALAMAYIN
2. ✅ UI geliştirmelerini sadece `cloud-ui` klasörü içinde yapın
3. ✅ Environment variables kullanın (API keys, secrets için)
4. ✅ Giriş toke'larını secure storage'da tutun
5. ✅ Dosya yükleme boyutu limitini ayarlayın

---

## 📚 Kullanım Örnekleri

### Frontend API Kullanımı
```typescript
// api.ts dosyasından
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Dosya yükleme
await API.post('/files/upload', formData);

// Dosya listesi
const files = await API.get('/files');
```

### WebSocket Olayları
```javascript
// Real-time dosya güncellemeleri
socket.on('fileCreated', (file) => {
  console.log('Yeni dosya:', file);
});

socket.on('fileDeleted', (fileId) => {
  console.log('Dosya silindi:', fileId);
});
```

---

## 🤝 Katkıda Bulunma

Projeye katkı yapmak isterseniz:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişiklikleri commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

## 📊 Proje İstatistikleri

| Metrik | Değer |
|--------|-------|
| **Toplam Dosya Sayısı** | 50+ |
| **Backend Controllers** | 4 |
| **Frontend Components** | 9 |
| **API Endpoints** | 20+ |
| **Desteklenen Node Sürümü** | 18+ |

---

## 📄 Lisans

Bu proje MIT Lisansı altında yayınlanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

---

## 👨‍💻 Yazar

**Muhammed Mustafa AYDOĞAN** (MustafaDevloper)
- GitHub: [@MustafaDevloper](https://github.com/MustafaDevloper)
- Email: mustfa966o@gmail.com

---

## 📞 Destek

Sorun veya öneriler için:
- Issues: [GitHub Issues](https://github.com/MustafaDevloper/Cloud-System-ismi.Yok-/issues)
- Discussions: [GitHub Discussions](https://github.com/MustafaDevloper/Cloud-System-ismi.Yok-/discussions)

---

## 🔄 Son Güncellemeler

- ✨ Real-time WebSocket entegrasyonu
- 🎨 Responsive Tailwind CSS tasarımı
- 🔐 Geliştirilmiş güvenlik kontrolleri
- ⚡ Performance optimizasyonları
- 📱 Mobile-friendly arayüz

---

**⭐ Eğer projeyi beğendiyseniz, bir yıldız vermekten çekinmeyin!**
