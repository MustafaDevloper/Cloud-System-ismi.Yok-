import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import multer from "multer";
import { randomUUID } from "crypto";
import os from "os";
import { createServer } from "http";
import { Server } from "socket.io";
import { spawn } from "child_process";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});
const PORT = 4000;

// Yollar (UI'dan tamamen bağımsız, Pure Backend yapısı)
const UPLOADS_DIR = path.resolve("./uploads");
const STORAGE_DIR = path.resolve("./RemoteStorage");
const USERS_FILE = path.resolve("./users.json");
const SHARES_FILE = path.resolve("./shares.json");
const AVATAR_DIR = path.join(UPLOADS_DIR, "avatars");

// Klasörlerin garantilenmesi
await fs.promises.mkdir(STORAGE_DIR, { recursive: true });
await fs.promises.mkdir(AVATAR_DIR, { recursive: true });

// Kullanıcı Veritabanı
let usersDb = {};
if (fs.existsSync(USERS_FILE)) {
usersDb = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
} else {
  usersDb["admin"] = {
    password: "admin",
token: "cloud-vault-token-2024",
createdAt: new Date().toISOString()
  };
fs.writeFileSync(USERS_FILE, JSON.stringify(usersDb, null, 2));
}

// Paylaşım Veritabanı
let sharesDb = [];
if (fs.existsSync(SHARES_FILE)) {
sharesDb = JSON.parse(fs.readFileSync(SHARES_FILE, "utf-8"));
} else {
fs.writeFileSync(SHARES_FILE, "[]");
}

async function saveUsers() {
await fs.promises.writeFile(USERS_FILE, JSON.stringify(usersDb, null, 2));
}

async function saveShares() {
await fs.promises.writeFile(SHARES_FILE, JSON.stringify(sharesDb, null, 2));
}

app.use(cors()); // Frontend (Port 3000) erişimi için CORS eklendi
app.use(express.json());
// Sadece gerekli assetleri (avatar vb.) dışarı açıyoruz, UI kodlarını değil
app.use("/avatars", express.static(AVATAR_DIR));

// Frontend static files
const UI_DIST = path.resolve("./cloud-ui/dist");
if (fs.existsSync(UI_DIST)) {
  app.use(express.static(UI_DIST));
  app.get("*", (req, res, next) => {
    // API veya static asset değilse index.html gönder (SPA routing için)
    if (req.path.startsWith("/auth") || req.path.startsWith("/files") || req.path.startsWith("/upload") || req.path.startsWith("/events") || req.path.startsWith("/health") || req.path.startsWith("/admin") || req.path.startsWith("/avatars") || req.path.startsWith("/users")) {
      return next();
    }
    res.sendFile(path.join(UI_DIST, "index.html"));
  });
}

// Avatar Upload Ayarları
const avatarStorage = multer.diskStorage({
destination: (req, file, cb) => cb(null, AVATAR_DIR),
filename: (req, file, cb) => {
const ext = path.extname(file.originalname);
cb(null, `${req.user}${ext}`);
  }
});
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } }); // Maks 5 MB

// ── Otorizasyon Middleware ──
const authGuard = (req, res, next) => {
const token = req.headers["x-auth-token"] || req.query.token;
if (!token) return res.status(401).json({ success: false, message: "Token eksik." });

  // Kullanıcıyı bul
const user = Object.keys(usersDb).find((k) => usersDb[k].token === token);
if (!user) return res.status(401).json({ success: false, message: "Geçersiz token." });

  req.user = user;
  next();
};



app.post("/auth/register", async (req, res) => {
const { username, password } = req.body;
if (!username || !password) return res.status(400).json({ success: false, message: "Kullanıcı adı ve şifre zorunlu." });
if (usersDb[username]) return res.status(400).json({ success: false, message: "Bu kullanıcı adı alınmış." });

const token = randomUUID();
  usersDb[username] = { 
    password, 
    token,
createdAt: new Date().toISOString()
  };
  await saveUsers();

// Kullanıcı için depo oluştur
await fs.promises.mkdir(path.join(STORAGE_DIR, username), { recursive: true });

res.json({ success: true, token, username });
});

app.post("/auth/login", (req, res) => {
const { username, password } = req.body;
const user = usersDb[username];
if (!user || user.password !== password) {
return res.status(400).json({ success: false, message: "Kullanıcı adı veya şifre hatalı." });
  }

res.json({ success: true, token: user.token, username });
});

app.get("/auth/me", authGuard, (req, res) => {
const user = usersDb[req.user];
  res.json({
    success: true,
    username: req.user,
avatar: user.avatar || null,
createdAt: user.createdAt || new Date().toISOString()
  });
});

app.post("/auth/avatar", authGuard, uploadAvatar.single("avatar"), async (req, res) => {
if (!req.file) return res.status(400).json({ success: false, message: "Dosya yüklenemedi." });
  
const avatarUrl = `/avatars/${req.file.filename}`;
usersDb[req.user].avatar = avatarUrl;
  await saveUsers();
  
res.json({ success: true, avatar: avatarUrl });
});

app.delete("/auth/account", authGuard, async (req, res) => {
  const user = req.user;
  delete usersDb[user];
  await saveUsers();
  
// Hesabın tüm dosyalarını acımasızca sil
  try {
await fs.promises.rm(path.join(STORAGE_DIR, user), { recursive: true, force: true });
  } catch (err) {
console.error("Hesap klasörü silinemedi:", err.message);
  }
  
res.json({ success: true });
});

// ── PAYLAŞIM API'LARI ──

app.get("/users", authGuard, (req, res) => {
const users = Object.keys(usersDb)
.filter(u => u !== req.user)
.map(u => ({ username: u, avatar: usersDb[u].avatar }));
res.json({ success: true, users });
});

app.post("/files/share", authGuard, async (req, res) => {
const { filename, targetUser } = req.body;
  
if (!usersDb[targetUser]) return res.json({ success: false, message: "Hedef kullanıcı bulunamadı." });
  
const existing = sharesDb.find(s => s.owner === req.user && s.filename === filename && s.sharedWith === targetUser);
if (existing) return res.json({ success: true, message: "Zaten paylaşıldı." });

  sharesDb.push({
    id: randomUUID(),
    owner: req.user,
    filename,
sharedWith: targetUser,
at: new Date().toISOString()
  });

  await saveShares();
broadcast(targetUser, "file-shared", { owner: req.user, filename });

res.json({ success: true });
});

app.get("/files/shared", authGuard, async (req, res) => {
const myShares = sharesDb.filter(s => s.sharedWith === req.user);
  const results = [];

for (const s of myShares) {
const filePath = path.join(STORAGE_DIR, s.owner, s.filename);
if (fs.existsSync(filePath)) {
const st = await fs.promises.stat(filePath);
      results.push({
        ...s,
sizeHuman: prettySize(st.size),
modified: st.mtime,
icon: getFileIcon(path.extname(s.filename))
      });
    }
  }

res.json({ success: true, files: results });
});



const clients = new Map();

function broadcast(user, eventName, payload) {
if (!clients.has(user)) return;
const dataStr = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
for (const res of clients.get(user)) {
    res.write(dataStr);
  }
}

app.get("/events", authGuard, (req, res) => {
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Connection", "keep-alive");

  const user = req.user;
if (!clients.has(user)) clients.set(user, new Set());
clients.get(user).add(res);

res.write(`event: connected\ndata: {"status":"ok"}\n\n`);

  req.on("close", () => {
if (clients.has(user)) {
clients.get(user).delete(res);
if (clients.get(user).size === 0) clients.delete(user);
    }
  });
});

app.get("/health", authGuard, async (req, res) => {
  try {
const userDir = path.join(STORAGE_DIR, req.user);
if (!fs.existsSync(userDir)) await fs.promises.mkdir(userDir, { recursive: true });

const files = await fs.promises.readdir(userDir);
    let totalSize = 0;

for (const f of files) {
const sp = path.join(userDir, f);
const st = await fs.promises.stat(sp);
totalSize += st.size;
    }

const upSecs = Math.floor(process.uptime());
    res.json({
      status: "ok",
fileCount: files.length,
totalSize: prettySize(totalSize),
uptime: `${Math.floor(upSecs / 60)}dk ${upSecs % 60}sn`
    });
  } catch (err) {
res.status(500).json({ status: "error", error: err.message });
  }
});

// Dosya yükleme ayarları
const upload = multer({
storage: multer.diskStorage({
destination: async (req, file, cb) => {
const userDir = path.join(STORAGE_DIR, req.user);
await fs.promises.mkdir(userDir, { recursive: true });
      cb(null, userDir);
    },
filename: (req, file, cb) => {
cb(null, file.originalname);
    }
  })
});

app.post("/upload", authGuard, upload.single("file"), (req, res) => {
if (!req.file) return res.status(400).json({ error: "Dosya alınamadı!" });

broadcast(req.user, "file-uploaded", {
originalName: req.file.originalname,
savedAs: req.file.filename,
sizeHuman: prettySize(req.file.size)
  });

res.json({ success: true, file: req.file.filename });
});

app.get("/files", authGuard, async (req, res) => {
const userDir = path.join(STORAGE_DIR, req.user);
if (!fs.existsSync(userDir)) await fs.promises.mkdir(userDir, { recursive: true });

  try {
const list = await fs.promises.readdir(userDir);
    const files = [];

for (const file of list) {
if (file.startsWith(".")) continue;
const sp = path.join(userDir, file);
const st = await fs.promises.stat(sp);
      if (st.isFile()) {
        files.push({
          name: file,
sizeHuman: prettySize(st.size),
          size: st.size,
modified: st.mtime,
icon: getFileIcon(path.extname(file))
        });
      }
    }

    // En yeni en üste
files.sort((a, b) => b.modified - a.modified);

    res.json({ files });
  } catch (err) {
res.status(500).json({ error: err.message });
  }
});

app.get("/files/:name/download", authGuard, (req, res) => {
const filename = req.params.name;
  let owner = req.user;

// Paylaşım kontrolü: Eğer dosya bana ait değilse, bir başkası benimle paylaşmış mı?
const shareRecord = sharesDb.find(s => s.filename === filename && s.sharedWith === req.user);
  if (shareRecord) {
owner = shareRecord.owner;
  }

const filePath = path.join(STORAGE_DIR, owner, filename);
if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Bulunamadı" });
  res.download(filePath);
});

app.delete("/files/:name", authGuard, async (req, res) => {
const filePath = path.join(STORAGE_DIR, req.user, req.params.name);
  try {
if (fs.existsSync(filePath)) {
await fs.promises.unlink(filePath);
broadcast(req.user, "file-deleted", { name: req.params.name });
res.json({ success: true });
    } else {
res.status(404).json({ success: false, message: "Dosya yok." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMİN API ──
app.get("/admin/system", authGuard, async (req, res) => {
  if (req.user !== "admin") return res.status(403).json({ error: "Erişim reddedildi" });

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const usersStats = [];
  for (const username of Object.keys(usersDb)) {
    const userDir = path.join(STORAGE_DIR, username);
    let size = 0;
    let count = 0;
    if (fs.existsSync(userDir)) {
      const files = await fs.promises.readdir(userDir);
      for (const f of files) {
        if (f.startsWith(".")) continue;
        const st = await fs.promises.stat(path.join(userDir, f));
        if (st.isFile()) {
           size += st.size;
           count++;
        }
      }
    }
    usersStats.push({
      username,
      tier: usersDb[username].tier || (username === "admin" ? "SuperAdmin" : "Premium Plus"),
      usedSpace: prettySize(size),
      rawSize: size,
      fileCount: count,
      createdAt: usersDb[username].createdAt
    });
  }

  const sysStats = {
    os: `${os.type()} ${os.release()}`,
    uptime: `${Math.floor(os.uptime() / 3600)} saat ${Math.floor((os.uptime() % 3600) / 60)} dk`,
    ramInfo: `${prettySize(usedMem)} / ${prettySize(totalMem)}`,
    ramPercent: Math.round((usedMem / totalMem) * 100)
  };

  res.json({ success: true, system: sysStats, users: usersStats });
});

// Yardımcılar
function prettySize(bytes) {
if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
if (bytes >= 1_048_576)     return `${(bytes / 1_048_576).toFixed(2)} MB`;
if (bytes >= 1_024)         return `${(bytes / 1_024).toFixed(2)} KB`;
return `${Math.max(bytes, 0)} B`;
}

function getFileIcon(ext) {
  const map = {
".pdf": "📄", ".doc": "📝", ".docx": "📝", ".xls": "📊", ".xlsx": "📊",
".ppt": "📑", ".pptx": "📑", ".txt": "📃", ".md": "📃",
".jpg": "🖼️", ".jpeg": "🖼️", ".png": "🖼️", ".gif": "🖼️", ".webp": "🖼️", ".svg": "🖼️",
".mp4": "🎬", ".mkv": "🎬", ".avi": "🎬", ".mov": "🎬", ".webm": "🎬",
".mp3": "🎵", ".wav": "🎵", ".flac": "🎵", ".aac": "🎵",
".zip": "📦", ".rar": "📦", ".7z": "📦", ".tar": "📦", ".gz": "📦",
".js": "💻", ".ts": "💻", ".py": "🐍", ".go": "🔵", ".rs": "🦀",
".html": "🌐", ".css": "🎨", ".json": "⚙️", ".sh": "⚡",
  };
return map[ext?.toLowerCase()] || "📁";
}

// ── MULTI-ROOM WORKSPACE STATE ──────────────────────────────────
const rooms = {}; 

function getRoomState(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      code: {
        html: '<div class="container">\n  <h1>✨ Oda: ' + roomId + '</h1>\n  <p>Arkadaşlarını bu odaya davet et!</p>\n</div>',
        css: 'body { background: #0f1115; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }\n.container { text-align: center; border: 1px solid #333; padding: 2rem; border-radius: 12px; }',
        js: 'console.log("Oda Hazır!");'
      },
      notes: '📌 Oda Notları:',
      chat: [],
      whiteboard: [],
      music: { url: '', playing: false },
      users: {} // { socketId: username }
    };
  }
  return rooms[roomId];
}

// ── SOCKET.IO (GERÇEK ZAMANLI ORTAK ÇALIŞMA) ──
io.on("connection", (socket) => {
  console.log(`[Socket] Yeni bağlantı: ${socket.id}`);

  let currentRoomId = null;
  let termProcess = null;

  // Odaya Katılma
  socket.on("room:join", ({ roomId, username }) => {
    socket.join(roomId);
    currentRoomId = roomId;
    const state = getRoomState(roomId);
    state.users[socket.id] = username || "Anonim";
    
    // Odaya özel ilk durumu gönder
    socket.emit("room:init", {
      code: state.code,
      notes: state.notes,
      chat: state.chat,
      whiteboard: state.whiteboard,
      music: state.music,
      users: Object.values(state.users)
    });

    // Odadakilere yeni kullanıcı listesini duyur
    io.to(roomId).emit("room:users", Object.values(state.users));
    
    const joinMsg = { user: "Sistem", text: `${username} odaya katıldı.`, system: true };
    state.chat.push(joinMsg);
    io.to(roomId).emit("chat:message", joinMsg);
  });

  // 1. Terminal Başlatma
  socket.on("terminal:start", (shellType) => {
    if (termProcess) {
      termProcess.kill();
    }
    
    const shell = shellType === "powershell" ? "powershell.exe" 
                : (shellType === "bash" || shellType === "wsl") ? "bash"
                : os.platform() === "win32" ? "cmd.exe" : "bash";
    
    try {
      termProcess = spawn(shell, [], {
        cwd: STORAGE_DIR, // Ortak alanda başlat
        env: process.env
      });

      termProcess.stdout.on("data", (data) => {
        socket.emit("terminal:data", data.toString());
      });

      termProcess.stderr.on("data", (data) => {
        socket.emit("terminal:data", data.toString());
      });

      termProcess.on("exit", (code) => {
        socket.emit("terminal:data", `\r\n[İşlem sonlandırıldı: ${code}]\r\n`);
      });
    } catch (err) {
      socket.emit("terminal:data", `\r\n[Hata]: Terminal başlatılamadı - ${err.message}\r\n`);
    }
  });

  // Terminal Girdisi Al
  socket.on("terminal:input", (data) => {
    if (termProcess) {
      termProcess.stdin.write(data);
    }
  });

  // 2. Takım İçi Chat
  socket.on("chat:message", (msgInfo) => {
    if (!currentRoomId) return;
    const state = rooms[currentRoomId];
    state.chat.push(msgInfo);
    if (state.chat.length > 50) state.chat.shift();
    io.to(currentRoomId).emit("chat:message", msgInfo); 
  });

  // 3. Ortak Kod Editörü
  socket.on("code:change", (data) => {
    if (!currentRoomId) return;
    const state = rooms[currentRoomId];
    if (data.type && state.code[data.type] !== undefined) {
      state.code[data.type] = data.value;
    }
    socket.to(currentRoomId).emit("code:change", data); 
  });

  // 4. Ortak Not Alanı
  socket.on("notes:change", (data) => {
    if (!currentRoomId) return;
    rooms[currentRoomId].notes = data;
    socket.to(currentRoomId).emit("notes:change", data);
  });

  // 5. Ortak Beyaz Tahta (Whiteboard)
  socket.on("whiteboard:draw", (data) => {
    if (!currentRoomId) return;
    const state = rooms[currentRoomId];
    state.whiteboard.push(data);
    if (state.whiteboard.length > 2000) state.whiteboard.shift();
    socket.to(currentRoomId).emit("whiteboard:draw", data);
  });
  
  // 6. Beyaz Tahta Temizleme
  socket.on("whiteboard:clear", () => {
    if (!currentRoomId) return;
    rooms[currentRoomId].whiteboard = [];
    io.to(currentRoomId).emit("whiteboard:clear");
  });

  // 7. Müzik Senkronizasyonu
  socket.on("music:sync", (data) => {
    if (!currentRoomId) return;
    rooms[currentRoomId].music = data;
    socket.to(currentRoomId).emit("music:sync", data);
  });

  socket.on("disconnect", () => {
    if (termProcess) termProcess.kill();
    
    if (currentRoomId && rooms[currentRoomId]) {
      const state = rooms[currentRoomId];
      const username = state.users[socket.id];
      delete state.users[socket.id];
      
      // Kullanıcı listesini güncelle
      io.to(currentRoomId).emit("room:users", Object.values(state.users));
      
      // Eğer oda boş kaldıysa belli bir süre sonra silinebilir veya boş durabilir
      if (Object.keys(state.users).length === 0) {
        // console.log(`Oda ${currentRoomId} boşaldı.`);
      }
    }
    
    console.log(`[Socket] Ayrıldı: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
console.log(`\n☁️  CloudVault Sunucusu + WebSocket BAŞLADI`);
console.log(`🌐  http://localhost:${PORT}`);
console.log(`------------------------------------------------`);
});