import chokidar    from "chokidar";
import axios       from "axios";
import FormData    from "form-data";
import fs          from "fs";
import path        from "path";
import cliProgress from "cli-progress";
import { fileURLToPath } from "url";

// ── ES Module için __dirname polyfill ────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const CONFIG = {
  watchDir   : path.join(__dirname, "LocalSync"),
  serverUrl  : process.env.SERVER_URL  || "http://localhost:4000/upload",
  healthUrl  : process.env.SERVER_URL?.replace("/upload", "/health")
                 ?? "http://localhost:4000/health",
  authToken  : process.env.AUTH_TOKEN  || "cloud-vault-token-2024",
  maxRetries : 3,          // Kaç kez yeniden dene
  retryDelay : 5_000,      // Deneme arası bekleme (ms) — 5 saniye
  maxFileMB  : 500,        // Maksimum dosya boyutu kabul sınırı (MB)
};

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const prettySize = (bytes) => {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
  if (bytes >= 1_024)     return `${(bytes / 1_024).toFixed(2)} KB`;
  return `${bytes} B`;
};


const ts = () => new Date().toLocaleTimeString("tr-TR", { hour12: false });


class UploadQueue {
  #queue   = [];   
  #running = false; 

  enqueue(filePath) {
    if (this.#queue.includes(filePath)) {
      console.log(`⏭️  [${ts()}] Zaten kuyrukta: ${path.basename(filePath)}`);
      return;
    }
    this.#queue.push(filePath);
    console.log(`📥 [${ts()}] Kuyruğa eklendi: ${path.basename(filePath)} (Kuyruk: ${this.#queue.length})`);
    this.#process(); 
  }

  async #process() {
    if (this.#running || this.#queue.length === 0) return;
    this.#running = true;

    while (this.#queue.length > 0) {
      const filePath = this.#queue.shift(); 
      await uploadWithRetry(filePath);
    }

    this.#running = false;
  }
}


async function uploadWithRetry(filePath) {
  const fileName = path.basename(filePath);

  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      await uploadFile(filePath, attempt);
      return;
    } catch (err) {
      const isLastAttempt = attempt === CONFIG.maxRetries;

      console.error(`❌ [${ts()}] Deneme ${attempt}/${CONFIG.maxRetries} başarısız: ${fileName}`);
      console.error(`   Sebep: ${err.message}`);

      if (!isLastAttempt) {
        console.log(`⏳ [${ts()}] ${CONFIG.retryDelay / 1000} saniye sonra tekrar deneniyor…`);
        await sleep(CONFIG.retryDelay);
      } else {
        console.error(`🚫 [${ts()}] Tüm denemeler tükendi. Dosya atlanıyor: ${fileName}\n`);
      }
    }
  }
}


async function uploadFile(filePath, attempt = 1) {
  const fileName = path.basename(filePath);

  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch {
    throw new Error(`Dosya okunamıyor veya bulunamıyor: ${filePath}`);
  }

  
  const { size } = await fs.promises.stat(filePath);

  if (size === 0) {
    console.warn(`⚠️  [${ts()}] Boş dosya, atlanıyor: ${fileName}`);
    return;
  }

  if (size > CONFIG.maxFileMB * 1_048_576) {
    throw new Error(`Dosya boyutu (${prettySize(size)}) ${CONFIG.maxFileMB} MB sınırını aşıyor.`);
  }

  const bar = new cliProgress.SingleBar({
    format : `  📤 {filename} [{bar}] {percentage}% | {loaded}/{total} | ⚡ {speed}`,
    barCompleteChar   : "█",
    barIncompleteChar : "░",
    hideCursor        : true,
    clearOnComplete   : false,
    stopOnComplete    : true,
    formatValue(value, _options, type) {
      if (type === "total" || type === "value") {
        return prettySize(value * 1024);
      }
      if (type === "speed") {
        return value ? prettySize(value * 1024) + "/s" : "…";
      }
      return value;
    },
  }, cliProgress.Presets.shades_classic);

  const totalKB = Math.ceil(size / 1024);
  bar.start(totalKB, 0, { filename: fileName.padEnd(25).slice(0, 25), speed: 0 });

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), {
    filename    : fileName,
    contentType : "application/octet-stream",
    knownLength : size,
  });

  const startTime = Date.now();

  const response = await axios.post(CONFIG.serverUrl, form, {
    headers: {
      ...form.getHeaders(),
      "x-auth-token" : CONFIG.authToken,
      "x-client-id"  : "the-watcher-v2",
    },
    maxContentLength : Infinity,
    maxBodyLength    : Infinity,

    onUploadProgress: (evt) => {
      const uploadedKB  = Math.round(evt.loaded   / 1024);
      const elapsedSec  = (Date.now() - startTime) / 1000;
      const speedKBps   = elapsedSec > 0 ? Math.round(uploadedKB / elapsedSec) : 0;
      bar.update(uploadedKB, { speed: speedKBps });
    },
  });

  bar.stop();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (response.data?.success) {
    console.log(`  ✅ [${ts()}] Başarılı (deneme ${attempt}) | ${fileName} → ${response.data.file.savedAs}`);
    console.log(`     📦 Boyut: ${prettySize(size)} | ⏱ Süre: ${elapsed}s\n`);
  } else {
    throw new Error(`Sunucu başarısız yanıt verdi: ${JSON.stringify(response.data)}`);
  }
}


await fs.promises.mkdir(CONFIG.watchDir, { recursive: true });


console.log(`\n🔍 Sunucu bağlantısı kontrol ediliyor: ${CONFIG.healthUrl}`);
try {
  const health = await axios.get(CONFIG.healthUrl, {
    headers: { "x-auth-token": CONFIG.authToken },
    timeout: 5000,
  });
  console.log(`✅ Sunucu çevrimiçi | Uptime: ${health.data.uptime}\n`);
} catch {
  console.warn(`⚠️  Sunucu şu an erişilemiyor. İzleme başlıyor, yüklemeler kuyrukta bekleyecek.\n`);
}


const queue = new UploadQueue();

console.log("╔═══════════════════════════════════════════════╗");
console.log("║        👁️   The Watcher — Klasör İzleyici      ║");
console.log("╠═══════════════════════════════════════════════╣");
console.log(`║  📂 İzleniyor : ${CONFIG.watchDir.slice(-35).padStart(35)} ║`);
console.log(`║  🌐 Sunucu    : ${CONFIG.serverUrl.slice(-35).padStart(35)} ║`);
console.log(`║  🔁 Max Retry : ${String(CONFIG.maxRetries).padStart(35)} ║`);
console.log(`║  ⏳ Bekleme   : ${String(CONFIG.retryDelay / 1000 + "s").padStart(35)} ║`);
console.log("╚═══════════════════════════════════════════════╝\n");


const watcher = chokidar.watch(CONFIG.watchDir, {
  ignored            : /(^|[/\\])\../,
  persistent         : true,
  ignoreInitial      : true,
  awaitWriteFinish   : {
    stabilityThreshold : 2000,
    pollInterval       : 300,
  },
});

// ── Olay: Yeni dosya eklendi ──────────────────────────────────────
watcher.on("add", (filePath) => {
  console.log(`\n➕ [${ts()}] Yeni dosya: ${path.basename(filePath)}`);
  queue.enqueue(filePath);
});

// ── Olay: Mevcut dosya güncellendi ───────────────────────────────
watcher.on("change", (filePath) => {
  console.log(`\n🔄 [${ts()}] Dosya değişti: ${path.basename(filePath)}`);
  queue.enqueue(filePath);
});

// ── Olay: Yerel dosya silindiğinde (Remote'dan da sil) ───────────
watcher.on("unlink", async (filePath) => {
  const fileName = path.basename(filePath);
  console.log(`\n🗑️  [${ts()}] Yerel dosya silindi: ${fileName}`);
  
  try {
    const deleteUrl = CONFIG.serverUrl.replace("/upload", "/files") + "/" + encodeURIComponent(fileName);
    await axios.delete(deleteUrl, {
      headers: { "x-auth-token": CONFIG.authToken }
    });
    console.log(`   ✅ Sunucudan da başarıyla silindi: ${fileName}`);
  } catch (err) {
    if (err.response?.status === 404) {
      console.log(`   ⚠️ Sunucuda zaten yok: ${fileName}`);
    } else {
      console.error(`   ❌ Sunucudan silinirken hata: ${err.message}`);
    }
  }
});

// ── Olay: İzleyici hatası ─────────────────────────────────────────
watcher.on("error", (error) => {
  console.error(`❌ [${ts()}] İzleyici hatası: ${error.message}`);
});

// ── Olay: İzleyici hazır ─────────────────────────────────────────
watcher.on("ready", () => {
  console.log(`✅ İzleyici hazır. LocalSync klasörüne dosya ekleyin…`);
  console.log(`   📁 Klasör: ${CONFIG.watchDir}\n`);
});

process.on("SIGINT", async () => {
  console.log("\n\n⛔ Kapatma sinyali alındı. İzleyici durduruluyor…");
  await watcher.close();
  console.log("✅ Temiz kapanma tamamlandı. Güle güle!\n");
  process.exit(0);
});
