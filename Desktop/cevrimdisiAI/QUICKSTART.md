# ARIA - Hızlı Başlangıç Kılavuzu

5 dakikada ARIA'yı kurun ve kullanmaya başlayın!

---

## ⚡ Hızlı Kurulum

### 1. İndirin ve Kurun

```bash
# Depoyu klonlayın
git clone https://github.com/yourusername/aria.git
cd aria

# Bağımlılıkları yükleyin (opsiyonel)
pip install -r requirements.txt

# Başlatın
python main.py
```

### 2. İlk Komutunuz

```
┌─[ARIA]─[kullanıcı]
└─▶ merhaba

[ARIA] Merhaba! Ben ARIA, çevrimiçi AI asistanınızım. Size nasıl yardımcı olabilirim?
```

---

## 🎯 Temel Kullanım Senaryoları

### Senaryo 1: Web Sayfası Oluşturma

```
└─▶ html oluştur portfolio.html

[ARIA] ✓ HTML oluşturuldu → workspace/portfolio.html
```

**Sonuç:** Modern, responsive bir HTML sayfası oluşturuldu.

### Senaryo 2: Python Script Yazma

```
└─▶ python kodu oluştur hesaplama.py

[ARIA] ✓ Python dosyası oluşturuldu → workspace/hesaplama.py
```

**Sonuç:** Temel Python script şablonu oluşturuldu.

### Senaryo 3: Flask API Oluşturma

```
└─▶ flask api

[ARIA] ✓ Flask API oluşturuldu → workspace/app.py
  pip install flask  →  python app.py
```

**Sonuç:** Çalışır durumda REST API şablonu.

### Senaryo 4: Dosya Okuma

```
└─▶ dosya oku portfolio.html

[ARIA] 📄 portfolio.html:
────────────────────────────────────────
<!DOCTYPE html>
<html lang="tr">
...
```

### Senaryo 5: Terminal Komutu

```
└─▶ terminal çalıştır dir

[ARIA] [stdout]
 Volume in drive C is Windows
 Directory of C:\Users\...\aria\workspace

portfolio.html
hesaplama.py
app.py
```

### Senaryo 6: Hesaplama

```
└─▶ hesapla (15 + 5) * 2

[ARIA] 📊 (15 + 5) * 2 = 40
```

### Senaryo 7: Not Kaydetme

```
└─▶ hatırla "proje teslim tarihi 15 Ocak"

[ARIA] ✓ Not kaydedildi: proje teslim tarihi 15 Ocak
```

### Senaryo 8: Hafızayı Görüntüleme

```
└─▶ belleği göster

[ARIA] Hafıza Durumu
────────────────────────────────────────
Toplam oturum : 5
Toplam komut  : 127
Not sayısı    : 3
────────────────────────────────────────
{
  "user": {
    "name": null,
    "language": "tr"
  },
  "notes": [
    {
      "id": 1,
      "text": "proje teslim tarihi 15 Ocak",
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

## 📚 Sık Kullanılan Komutlar

### Dosya İşlemleri

```bash
# Yeni dosya
dosya oluştur notlar.txt

# Dosya oku
dosya oku notlar.txt

# Dosya düzenle
dosya düzenle notlar.txt "yeni içerik"

# Dosya sil
dosya sil notlar.txt

# Dosyaları listele
dosyaları listele
```

### Şablon Üretimi

```bash
# HTML
html oluştur
html oluştur index.html

# Portfolio
portfolio

# Python
python kodu oluştur

# Flask API
flask api

# CSS
css oluştur

# Discord Bot
discord bot
```

### Sistem

```bash
# Yardım
yardım

# Sistem bilgisi
sistem bilgisi

# Plugin'ler
pluginler

# Ekranı temizle
ekranı temizle

# Çıkış
exit
```

---

## 🎨 Özelleştirme

### Alias Ekleme

`config/brain.json` dosyasını düzenleyin:

```json
{
  "aliases": {
    "html yap": "html oluştur",
    "py": "python kodu oluştur",
    "temizle": "ekranı temizle"
  }
}
```

Artık kısayolları kullanabilirsiniz:

```
└─▶ html yap
└─▶ py
└─▶ temizle
```

### Yeni Komut Ekleme

`config/brain.json` içinde:

```json
{
  "commands": [
    {
      "id": "my_command",
      "keywords": ["özel komut"],
      "action": "respond",
      "response_key": "my_response",
      "priority": 5
    }
  ],
  "responses": {
    "my_response": ["Özel komut çalıştı!"]
  }
}
```

---

## 🔧 Sorun Giderme

### Python Bulunamadı

```bash
# Windows
python --version

# Linux/macOS
python3 --version
```

Yüklü değilse: [python.org](https://www.python.org/downloads/)

### Renk Desteği Yok

```bash
pip install colorama
```

### Komut Geçmişi Çalışmıyor (Windows)

```bash
pip install pyreadline3
```

### ModuleNotFoundError

```bash
pip install -r requirements.txt
```

---

## 💡 İpuçları

### 1. Komut Geçmişi

Yukarı/aşağı ok tuşları ile önceki komutlara erişin.

### 2. Sekme Tamamlama

Tab tuşu ile komut tamamlama (sınırlı destek).

### 3. Ctrl+C

Ctrl+C ile komutu iptal etmeyin, `exit` yazın.

### 4. Log Dosyası

Hata durumunda `logs/aria.log` dosyasını kontrol edin.

### 5. Workspace

Tüm dosyalar `workspace/` klasöründe oluşturulur.

---

## 🚀 İleri Seviye

### Plugin Oluşturma

```python
# plugins/my_plugin.py

def register(brain, actions):
    brain.register_command({
        "id": "my_cmd",
        "keywords": ["özel"],
        "action": "my_action",
        "priority": 5
    })
    
    def handler(intent, raw):
        return {"output": "Çalıştı!"}
    
    actions.register("my_action", handler)
```

### Template Oluşturma

```
templates/my_template/
├── meta.json
└── template.html
```

`meta.json`:

```json
{
  "name": "my_template",
  "description": "Özel şablon",
  "files": ["template.html"],
  "placeholders": ["title"]
}
```

---

## 📖 Daha Fazla Bilgi

- **Tam Dokümantasyon:** [README.md](README.md)
- **Kurulum Kılavuzu:** [INSTALLATION.md](INSTALLATION.md)
- **Geliştirici Kılavuzu:** [DEVELOPMENT.md](DEVELOPMENT.md)

---

## 🎉 Başarılı!

Artık ARIA'yı kullanmaya hazırsınız. Keyifli kodlamalar!

```
└─▶ merhaba dünya!
```
