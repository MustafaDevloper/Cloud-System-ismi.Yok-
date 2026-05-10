# ARIA - Kullanım Örnekleri

Bu dokümanda ARIA'nın gerçek dünya kullanım senaryoları ve örnekleri bulunmaktadır.

---

## 📋 İçindekiler

- [Web Geliştirme](#web-geliştirme)
- [Python Projeleri](#python-projeleri)
- [Otomasyon](#otomasyon)
- [Veri İşleme](#veri-i̇şleme)
- [Bot Geliştirme](#bot-geliştirme)

---

## Web Geliştirme

### Örnek 1: Landing Page Oluşturma

```
└─▶ html oluştur landing.html
[ARIA] ✓ HTML oluşturuldu → workspace/landing.html

└─▶ css oluştur style.css
[ARIA] ✓ CSS oluşturuldu → workspace/style.css

└─▶ dosya oku landing.html
[ARIA] 📄 landing.html:
────────────────────────────────────────
<!DOCTYPE html>
<html lang="tr">
...
```

**Sonuç:** Modern, responsive landing page hazır!

### Örnek 2: Portfolio Sitesi

```
└─▶ portfolio
[ARIA] ✓ Portfolio HTML oluşturuldu → workspace/portfolio.html

└─▶ dosyaları listele
[ARIA] Workspace → C:\Users\...\aria\workspace
  📄 portfolio.html  (5,234 B)
```

**Özelleştirme:**

```
└─▶ dosya düzenle portfolio.html
```

Tarayıcıda açın: `workspace/portfolio.html`

### Örnek 3: REST API Backend

```
└─▶ flask api
[ARIA] ✓ Flask API oluşturuldu → workspace/app.py
  pip install flask  →  python app.py

└─▶ terminal çalıştır pip install flask
[ARIA] [stdout]
Successfully installed flask-3.0.0

└─▶ terminal çalıştır python app.py
[ARIA] [stdout]
 * Running on http://0.0.0.0:5000
```

**Test:**

```bash
curl http://localhost:5000/
curl -X POST http://localhost:5000/api/echo -d '{"message":"test"}'
```

---

## Python Projeleri

### Örnek 4: Veri Analiz Script'i

```
└─▶ python kodu oluştur analiz.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/analiz.py

└─▶ dosya düzenle analiz.py "
import pandas as pd
import matplotlib.pyplot as plt

# Veri yükle
df = pd.read_csv('data.csv')

# Analiz
print(df.describe())

# Grafik
df.plot()
plt.savefig('grafik.png')
"
[ARIA] ✓ Düzenlendi: analiz.py
```

### Örnek 5: Web Scraper

```
└─▶ python kodu oluştur scraper.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/scraper.py
```

**scraper.py içeriği:**

```python
#!/usr/bin/env python3
"""
Web Scraper
"""
import requests
from bs4 import BeautifulSoup

def scrape(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Başlıkları çek
    titles = soup.find_all('h1')
    for title in titles:
        print(title.text)

if __name__ == "__main__":
    scrape("https://example.com")
```

### Örnek 6: Hesaplama Aracı

```
└─▶ hesapla 15 + 25
[ARIA] 📊 15 + 25 = 40

└─▶ hesapla (100 - 20) * 1.5
[ARIA] 📊 (100 - 20) * 1.5 = 120.0

└─▶ hesapla 2 ** 10
[ARIA] 📊 2 ** 10 = 1024
```

---

## Otomasyon

### Örnek 7: Toplu Dosya Oluşturma

```
└─▶ python kodu oluştur toplu_olustur.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/toplu_olustur.py
```

**toplu_olustur.py:**

```python
#!/usr/bin/env python3
"""Toplu dosya oluşturucu"""

import os

# 10 adet test dosyası oluştur
for i in range(1, 11):
    filename = f"test_{i}.txt"
    with open(filename, 'w') as f:
        f.write(f"Test dosyası {i}\n")
    print(f"✓ {filename} oluşturuldu")
```

```
└─▶ terminal çalıştır python toplu_olustur.py
[ARIA] [stdout]
✓ test_1.txt oluşturuldu
✓ test_2.txt oluşturuldu
...
```

### Örnek 8: Log Analizi

```
└─▶ python kodu oluştur log_analiz.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/log_analiz.py
```

**log_analiz.py:**

```python
#!/usr/bin/env python3
"""Log dosyası analizi"""

import re
from collections import Counter

def analyze_log(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    # ERROR satırlarını say
    errors = [l for l in lines if 'ERROR' in l]
    
    # IP adreslerini çıkar
    ips = re.findall(r'\d+\.\d+\.\d+\.\d+', ''.join(lines))
    ip_counts = Counter(ips)
    
    print(f"Toplam satır: {len(lines)}")
    print(f"Hata sayısı: {len(errors)}")
    print(f"En çok istek: {ip_counts.most_common(5)}")

if __name__ == "__main__":
    analyze_log("../logs/aria.log")
```

### Örnek 9: Hafıza Kullanımı

```
└─▶ hatırla "API key: abc123xyz"
[ARIA] ✓ Not kaydedildi: API key: abc123xyz

└─▶ hatırla "Database: postgresql://localhost:5432/mydb"
[ARIA] ✓ Not kaydedildi: Database: postgresql://localhost:5432/mydb

└─▶ belleği göster
[ARIA] Hafıza Durumu
────────────────────────────────────────
Not sayısı    : 2
────────────────────────────────────────
{
  "notes": [
    {
      "id": 1,
      "text": "API key: abc123xyz",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "text": "Database: postgresql://localhost:5432/mydb",
      "timestamp": "2025-01-15T10:31:00Z"
    }
  ]
}
```

---

## Veri İşleme

### Örnek 10: CSV İşleme

```
└─▶ python kodu oluştur csv_islem.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/csv_islem.py
```

**csv_islem.py:**

```python
#!/usr/bin/env python3
"""CSV veri işleme"""

import csv
import json

def csv_to_json(csv_file, json_file):
    """CSV'yi JSON'a çevir."""
    data = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✓ {len(data)} kayıt dönüştürüldü")

if __name__ == "__main__":
    csv_to_json("data.csv", "data.json")
```

### Örnek 11: JSON Düzenleme

```
└─▶ dosya oluştur config.json
[ARIA] ✓ Dosya oluşturuldu → workspace/config.json

└─▶ dosya düzenle config.json '{
  "app_name": "MyApp",
  "version": "1.0.0",
  "debug": true,
  "database": {
    "host": "localhost",
    "port": 5432
  }
}'
[ARIA] ✓ Düzenlendi: config.json

└─▶ dosya oku config.json
[ARIA] 📄 config.json:
────────────────────────────────────────
{
  "app_name": "MyApp",
  "version": "1.0.0",
  ...
}
```

---

## Bot Geliştirme

### Örnek 12: Discord Bot

```
└─▶ discord bot
[ARIA] ✓ Discord bot oluşturuldu → workspace/bot.py
  pip install discord.py  →  python bot.py

└─▶ dosyaları listele
[ARIA] Workspace → C:\Users\...\aria\workspace
  📄 bot.py  (8,456 B)
  📄 requirements.txt  (45 B)
  📄 .env.example  (89 B)
```

**Kurulum:**

```
└─▶ terminal çalıştır pip install discord.py python-dotenv
[ARIA] [stdout]
Successfully installed discord.py-2.3.0 python-dotenv-1.0.0
```

**.env dosyası:**

```
└─▶ dosya oluştur .env
[ARIA] ✓ Dosya oluşturuldu → workspace/.env

└─▶ dosya düzenle .env "DISCORD_TOKEN=your_token_here"
[ARIA] ✓ Düzenlendi: .env
```

**Çalıştır:**

```
└─▶ terminal çalıştır python bot.py
[ARIA] [stdout]
Bot hazır: MyBot (ID: 123456789)
```

### Örnek 13: Telegram Bot

```
└─▶ python kodu oluştur telegram_bot.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/telegram_bot.py
```

**telegram_bot.py:**

```python
#!/usr/bin/env python3
"""Telegram Bot"""

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

TOKEN = "YOUR_BOT_TOKEN"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start komutu."""
    await update.message.reply_text("Merhaba! Ben bir Telegram botuyum.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Help komutu."""
    await update.message.reply_text("Komutlar:\n/start - Başlat\n/help - Yardım")

def main():
    """Bot başlat."""
    app = Application.builder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    
    print("Bot başlatılıyor...")
    app.run_polling()

if __name__ == "__main__":
    main()
```

---

## Gelişmiş Senaryolar

### Örnek 14: Proje İskeleti Oluşturma

```
└─▶ python kodu oluştur proje_olustur.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/proje_olustur.py
```

**proje_olustur.py:**

```python
#!/usr/bin/env python3
"""Proje iskeleti oluşturucu"""

import os
from pathlib import Path

def create_project(name):
    """Python projesi iskeleti oluştur."""
    base = Path(name)
    
    # Klasör yapısı
    dirs = [
        base / "src",
        base / "tests",
        base / "docs",
        base / "data",
    ]
    
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)
        (d / "__init__.py").touch()
    
    # Dosyalar
    files = {
        base / "README.md": f"# {name}\n\nProje açıklaması.",
        base / "requirements.txt": "# Bağımlılıklar\n",
        base / ".gitignore": "__pycache__/\n*.pyc\nvenv/\n",
        base / "main.py": "#!/usr/bin/env python3\n\ndef main():\n    pass\n",
    }
    
    for path, content in files.items():
        path.write_text(content)
    
    print(f"✓ Proje oluşturuldu: {name}/")

if __name__ == "__main__":
    create_project("my_project")
```

```
└─▶ terminal çalıştır python proje_olustur.py
[ARIA] [stdout]
✓ Proje oluşturuldu: my_project/
```

### Örnek 15: Komut Zinciri

```
└─▶ html oluştur index.html
[ARIA] ✓ HTML oluşturuldu → workspace/index.html

└─▶ css oluştur style.css
[ARIA] ✓ CSS oluşturuldu → workspace/style.css

└─▶ python kodu oluştur server.py
[ARIA] ✓ Python dosyası oluşturuldu → workspace/server.py

└─▶ dosyaları listele
[ARIA] Workspace → C:\Users\...\aria\workspace
  📄 index.html  (2,345 B)
  📄 style.css  (1,234 B)
  📄 server.py  (567 B)

└─▶ hatırla "Proje dosyaları oluşturuldu"
[ARIA] ✓ Not kaydedildi: Proje dosyaları oluşturuldu

└─▶ geçmişi göster
[ARIA] Son 6 Komut
────────────────────────────────────────
  1. [2025-01-15 10:30] html oluştur index.html  →  create_html
  2. [2025-01-15 10:31] css oluştur style.css  →  create_css
  3. [2025-01-15 10:32] python kodu oluştur server.py  →  create_python
  4. [2025-01-15 10:33] dosyaları listele  →  list_files
  5. [2025-01-15 10:34] hatırla "Proje dosyaları oluşturuldu"  →  save_memory
  6. [2025-01-15 10:35] geçmişi göster  →  show_history
```

---

## 💡 İpuçları

### Verimli Çalışma

1. **Alias kullanın:** Sık kullanılan komutlar için kısayol oluşturun
2. **Hafızayı kullanın:** Önemli bilgileri kaydedin
3. **Geçmişi kontrol edin:** Önceki komutları tekrar kullanın
4. **Template'leri özelleştirin:** Kendi şablonlarınızı oluşturun

### Hata Ayıklama

```
└─▶ sistem bilgisi
[ARIA] ARIA v1.0.0
────────────────────────────────────────
Platform  : Windows 10
Python    : 3.10.0
Workspace : C:\Users\...\aria\workspace
Session   : a1b2c3d4
```

### Log Kontrolü

```bash
# Terminal'de
tail -f logs/aria.log

# Veya ARIA içinde
└─▶ terminal çalıştır type logs\aria.log
```

---

## 🚀 Daha Fazla Örnek

Daha fazla örnek için:

- [README.md](README.md) - Genel dokümantasyon
- [DEVELOPMENT.md](DEVELOPMENT.md) - Geliştirici örnekleri
- [GitHub Issues](https://github.com/yourusername/aria/issues) - Topluluk örnekleri

---

**Keyifli kodlamalar!** 🎉
