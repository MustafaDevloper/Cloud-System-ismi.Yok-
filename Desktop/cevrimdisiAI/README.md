# ARIA - Autonomous Rule-based Intelligence Agent

<div align="center">

```
  █████╗ ██████╗ ██╗ █████╗ 
 ██╔══██╗██╔══██╗██║██╔══██╗
 ███████║██████╔╝██║███████║
 ██╔══██║██╔══██╗██║██╔══██║
 ██║  ██║██║  ██║██║██║  ██║
 ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝
```

**Tamamen Çevrim Dışı | Düşük Sistem Gereksinimi | Modüler Mimari**

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)](https://github.com)

</div>

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Sistem Gereksinimleri](#-sistem-gereksinimleri)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Mimari](#-mimari)
- [Komutlar](#-komutlar)
- [Plugin Sistemi](#-plugin-sistemi)
- [Güvenlik](#-güvenlik)
- [Geliştirme](#-geliştirme)
- [Lisans](#-lisans)

---

## ✨ Özellikler

### 🔌 Çevrim Dışı Çalışma
- **İnternet gerektirmez** - Tamamen offline
- **LLM/GPU gerektirmez** - Rule-based sistem
- **Düşük RAM kullanımı** - 4GB RAM'de sorunsuz çalışır
- **Hızlı başlangıç** - Anında hazır

### 🧠 Akıllı Komut Sistemi
- **JSON tabanlı beyin** - Kolay yapılandırma
- **Keyword matching** - Doğal dil anlama
- **Intent detection** - Amaç tespiti
- **Alias desteği** - Kısayol komutlar
- **Hot-reload** - Yeniden başlatmadan güncelleme

### 📁 Dosya Yönetimi
- **Güvenli dosya işlemleri** - Path traversal koruması
- **Workspace izolasyonu** - Sistem dosyalarına erişim yok
- **Çoklu format desteği** - HTML, CSS, JS, Python, JSON vb.
- **Template engine** - Hazır şablonlar

### 🖥️ Terminal Entegrasyonu
- **Whitelist sistemi** - Güvenli komut çalıştırma
- **Command injection koruması** - Zararlı komut engelleme
- **Timeout desteği** - Asılı kalan komutları sonlandırma
- **Çıktı yönetimi** - stdout/stderr ayrımı

### 💾 Hafıza Sistemi
- **Kalıcı bellek** - JSON tabanlı depolama
- **Komut geçmişi** - Tüm işlemler loglanır
- **Not sistemi** - Önemli bilgileri kaydetme
- **Oturum yönetimi** - Çoklu oturum desteği

### 🔐 Güvenlik
- **Path sanitization** - Güvenli yol işleme
- **Command validation** - Komut doğrulama
- **Injection prevention** - Enjeksiyon koruması
- **Sistem dosyası koruması** - Kritik dizinlere erişim engeli

### 🎨 Kullanıcı Deneyimi
- **Renkli terminal** - ANSI renk desteği
- **Komut geçmişi** - Readline entegrasyonu
- **Auto-complete** - Sekme tamamlama
- **Profesyonel arayüz** - Modern CLI tasarımı

---

## 💻 Sistem Gereksinimleri

### Minimum
- **İşletim Sistemi:** Windows 7+ / Linux / macOS
- **Python:** 3.8 veya üzeri
- **RAM:** 512 MB (önerilen: 1 GB)
- **Disk:** 50 MB boş alan
- **İşlemci:** Herhangi bir modern CPU

### Önerilen
- **RAM:** 2 GB+
- **Python:** 3.10+
- **Terminal:** Windows Terminal / iTerm2 / GNOME Terminal

---

## 🚀 Kurulum

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/yourusername/aria.git
cd aria
```

### 2. Sanal Ortam Oluşturun (Opsiyonel ama Önerilir)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

> **Not:** Tüm bağımlılıklar opsiyoneldir. Çekirdek sistem Python stdlib ile çalışır.

### 4. ARIA'yı Başlatın

```bash
python main.py
```

---

## 📖 Kullanım

### İlk Başlangıç

```
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║    █████╗ ██████╗ ██╗ █████╗                              ║
  ║   ██╔══██╗██╔══██╗██║██╔══██╗                             ║
  ║   ███████║██████╔╝██║███████║                             ║
  ║   ██╔══██║██╔══██╗██║██╔══██║                             ║
  ║   ██║  ██║██║  ██║██║██║  ██║                             ║
  ║   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝                             ║
  ║                                                           ║
  ║   Autonomous Rule-based Intelligence Agent  v1.0.0        ║
  ║   ✓ Çevrim Dışı Mod | Hazır                               ║
  ╚═══════════════════════════════════════════════════════════╝

[ARIA] Merhaba! Ben ARIA, çevrimiçi AI asistanınızım. Size nasıl yardımcı olabilirim?

┌─[ARIA]─[kullanıcı]
└─▶ 
```

### Temel Komutlar

```bash
# Yardım menüsü
yardım

# HTML dosyası oluştur
html oluştur index.html

# Python script oluştur
python kodu oluştur script.py

# Dosya oku
dosya oku index.html

# Terminal komutu çalıştır
terminal çalıştır dir

# Hafızayı göster
belleği göster

# Not kaydet
hatırla "toplantı saat 3"

# Geçmişi göster
geçmişi göster

# Çıkış
exit
```

---

## 🏗️ Mimari

### Proje Yapısı

```
aria/
│
├── main.py                 # Ana giriş noktası
│
├── core/                   # Çekirdek modüller
│   ├── __init__.py
│   ├── brain.py           # JSON tabanlı beyin sistemi
│   ├── parser.py          # Komut ayrıştırıcı
│   ├── actions.py         # Action engine
│   ├── memory.py          # Hafıza yönetimi
│   ├── security.py        # Güvenlik katmanı
│   ├── terminal.py        # Terminal yöneticisi
│   ├── templates.py       # Template motoru
│   └── logger.py          # Logging sistemi
│
├── plugins/               # Plugin sistemi
│   ├── __init__.py
│   └── hesap_makinesi.py # Örnek plugin
│
├── templates/             # Dosya şablonları
│   ├── basic_html/
│   ├── flask_api/
│   └── discord_bot/
│
├── memory/                # Hafıza dosyaları
│   ├── memory.json       # Kalıcı bellek
│   └── history.json      # Komut geçmişi
│
├── workspace/             # Kullanıcı çalışma alanı
│
├── config/                # Yapılandırma
│   └── brain.json        # Ana yapılandırma
│
├── logs/                  # Log dosyaları
│   └── aria.log
│
├── requirements.txt       # Python bağımlılıkları
└── README.md             # Bu dosya
```

### Modül Açıklamaları

#### 🧠 Brain (core/brain.py)
- JSON tabanlı yapılandırma yönetimi
- Komut tanımları ve yanıtlar
- Alias çözümleme
- Hot-reload desteği

#### 🔍 Parser (core/parser.py)
- Doğal dil işleme (keyword matching)
- Intent detection
- Parametre çıkarma
- Güven skoru hesaplama

#### ⚡ Actions (core/actions.py)
- Action handler'lar
- Dosya işlemleri
- Template üretimi
- Terminal komutları

#### 💾 Memory (core/memory.py)
- JSON tabanlı depolama
- Dot-notation erişim
- Oturum yönetimi
- Komut geçmişi

#### 🔐 Security (core/security.py)
- Path traversal koruması
- Command injection engelleme
- Whitelist sistemi
- Sistem dosyası koruması

#### 🖥️ Terminal (core/terminal.py)
- Güvenli komut çalıştırma
- Timeout yönetimi
- stdout/stderr yakalama
- Platform uyumluluğu

---

## 📝 Komutlar

### Dosya İşlemleri

| Komut | Açıklama | Örnek |
|-------|----------|-------|
| `dosya oluştur <ad>` | Yeni dosya oluştur | `dosya oluştur notlar.txt` |
| `dosya oku <ad>` | Dosya içeriğini göster | `dosya oku notlar.txt` |
| `dosya sil <ad>` | Dosyayı sil | `dosya sil notlar.txt` |
| `dosya düzenle <ad> "içerik"` | Dosyayı düzenle | `dosya düzenle test.txt "merhaba"` |
| `dosyaları listele` | Workspace'i listele | `dosyaları listele` |

### Şablon Üretimi

| Komut | Açıklama | Çıktı |
|-------|----------|-------|
| `html oluştur` | Temel HTML5 | `index.html` |
| `portfolio` | Portfolio sayfası | `portfolio.html` |
| `python kodu oluştur` | Python script | `script.py` |
| `flask api` | Flask REST API | `app.py` |
| `css oluştur` | CSS stylesheet | `style.css` |
| `discord bot` | Discord bot | `bot.py` |

### Terminal

| Komut | Açıklama | Örnek |
|-------|----------|-------|
| `terminal çalıştır <komut>` | Terminal komutu çalıştır | `terminal çalıştır dir` |

### Hafıza

| Komut | Açıklama |
|-------|----------|
| `belleği göster` | Hafıza durumunu göster |
| `hatırla "not"` | Not kaydet |
| `belleği sil` | Hafızayı sıfırla |
| `geçmişi göster` | Komut geçmişini göster |

### Sistem

| Komut | Açıklama |
|-------|----------|
| `yardım` | Komut listesi |
| `sistem bilgisi` | Sistem durumu |
| `pluginler` | Yüklü plugin'ler |
| `ekranı temizle` | Ekranı temizle |
| `merhaba` | Selamlaşma |
| `exit` | Çıkış |

---

## 🔌 Plugin Sistemi

### Plugin Oluşturma

1. `plugins/` klasöründe yeni `.py` dosyası oluşturun
2. `register(brain, actions)` fonksiyonu tanımlayın
3. Komut ve action handler'ı kaydedin

### Örnek Plugin

```python
# plugins/my_plugin.py

from core.logger import get_logger

log = get_logger(__name__)

def my_action_handler(intent, raw):
    """Action handler."""
    return {"output": "Plugin çalıştı!"}

def register(brain, actions):
    """Plugin kaydı."""
    # Komut ekle
    brain.register_command({
        "id": "my_command",
        "keywords": ["özel komut"],
        "action": "my_action",
        "priority": 5
    })
    
    # Handler kaydet
    actions.register("my_action", my_action_handler)
    
    log.info("Plugin kaydedildi: my_plugin")
```

### Mevcut Plugin'ler

- **hesap_makinesi.py** - Matematiksel hesaplama
  - Kullanım: `hesapla 5 + 3 * 2`

---

## 🔐 Güvenlik

### Güvenlik Katmanları

1. **Path Traversal Koruması**
   - `../../` gibi saldırılar engellenir
   - Yalnızca workspace içinde çalışma

2. **Command Injection Koruması**
   - `;`, `|`, `&`, `` ` `` gibi karakterler engellenir
   - Whitelist tabanlı komut filtresi

3. **Sistem Dosyası Koruması**
   - `/etc`, `C:\Windows` gibi dizinlere erişim yok
   - Kritik sistem dosyaları korunur

4. **Input Sanitization**
   - Null byte kontrolü
   - Uzunluk sınırlaması
   - Karakter filtresi

### Whitelist Yapılandırması

`config/brain.json` içinde:

```json
{
  "allowed_terminal_commands": [
    "dir", "ls", "echo", "python", "ping"
  ]
}
```

---

## 🛠️ Geliştirme

### Yeni Komut Ekleme

`config/brain.json` dosyasını düzenleyin:

```json
{
  "commands": [
    {
      "id": "my_command",
      "keywords": ["anahtar kelime"],
      "action": "action_adi",
      "priority": 5
    }
  ]
}
```

### Yeni Action Handler Ekleme

`core/actions.py` içinde:

```python
def _my_action(self, intent: dict, raw: str) -> dict:
    """Yeni action handler."""
    return {"output": "Sonuç"}

# __init__ içinde kaydet
self._handlers["action_adi"] = self._my_action
```

### Yeni Template Ekleme

1. `templates/my_template/` klasörü oluşturun
2. `meta.json` dosyası ekleyin:

```json
{
  "name": "my_template",
  "description": "Açıklama",
  "files": ["file1.html"],
  "placeholders": ["title", "author"]
}
```

3. Template dosyalarını ekleyin

### Test Etme

```bash
# Tüm testleri çalıştır (gelecek sürüm)
python -m pytest tests/

# Belirli modül test et
python -m pytest tests/test_parser.py
```

---

## 📊 Performans

### Bellek Kullanımı
- **Başlangıç:** ~15 MB
- **Çalışma zamanı:** ~30-50 MB
- **Maksimum:** <100 MB

### Başlangıç Süresi
- **İlk başlatma:** <1 saniye
- **Hot-reload:** <100 ms

### Desteklenen Dosya Boyutları
- **Maksimum dosya içeriği:** 100 KB (yapılandırılabilir)
- **Maksimum çıktı:** 4000 karakter

---

## 🗺️ Yol Haritası

### v1.1.0 (Planlanan)
- [ ] Web UI (Flask tabanlı)
- [ ] Fuzzy matching (rapidfuzz)
- [ ] Sesli yanıt (pyttsx3)
- [ ] Daha fazla template
- [ ] Test suite

### v1.2.0 (Gelecek)
- [ ] Cog sistemi (plugin grupları)
- [ ] API endpoint'leri
- [ ] Docker desteği
- [ ] Multi-language support

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit yapın (`git commit -m 'feat: amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Yazar

**ARIA System**

---

## 🙏 Teşekkürler

- Python topluluğu
- Tüm açık kaynak katkıcıları

---

<div align="center">

**[⬆ Başa Dön](#aria---autonomous-rule-based-intelligence-agent)**

Made with ❤️ by ARIA System

</div>
