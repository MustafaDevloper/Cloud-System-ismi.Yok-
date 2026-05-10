# ARIA - Kurulum Kılavuzu

Bu dokümanda ARIA'nın farklı işletim sistemlerinde nasıl kurulacağı detaylı olarak anlatılmaktadır.

---

## 📋 İçindekiler

- [Sistem Gereksinimleri](#sistem-gereksinimleri)
- [Windows Kurulumu](#windows-kurulumu)
- [Linux Kurulumu](#linux-kurulumu)
- [macOS Kurulumu](#macos-kurulumu)
- [Sorun Giderme](#sorun-giderme)

---

## Sistem Gereksinimleri

### Minimum Gereksinimler
- **Python:** 3.8 veya üzeri
- **RAM:** 512 MB
- **Disk:** 50 MB boş alan
- **İşlemci:** Herhangi bir modern CPU

### Önerilen Gereksinimler
- **Python:** 3.10 veya üzeri
- **RAM:** 2 GB
- **Disk:** 200 MB boş alan

---

## Windows Kurulumu

### 1. Python Kurulumu

#### Python Yüklü mü Kontrol Edin

```cmd
python --version
```

Eğer Python yüklü değilse:

1. [python.org](https://www.python.org/downloads/) adresinden Python 3.10+ indirin
2. Kurulum sırasında **"Add Python to PATH"** seçeneğini işaretleyin
3. Kurulumu tamamlayın

### 2. ARIA'yı İndirin

#### Git ile (Önerilen)

```cmd
git clone https://github.com/yourusername/aria.git
cd aria
```

#### ZIP ile

1. GitHub'dan ZIP olarak indirin
2. Arşivi çıkarın
3. Klasöre gidin

### 3. Sanal Ortam Oluşturun

```cmd
python -m venv venv
venv\Scripts\activate
```

Sanal ortam aktif olduğunda komut satırında `(venv)` görünür.

### 4. Bağımlılıkları Yükleyin

```cmd
pip install -r requirements.txt
```

### 5. ARIA'yı Başlatın

```cmd
python main.py
```

### Windows Terminal Önerileri

Daha iyi bir deneyim için:

1. **Windows Terminal** yükleyin (Microsoft Store'dan)
2. Ayarlar → Varsayılan profil → Command Prompt veya PowerShell
3. Renkli çıktı için ANSI desteği otomatik aktiftir

---

## Linux Kurulumu

### 1. Python Kurulumu

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv git
```

#### Fedora/RHEL

```bash
sudo dnf install python3 python3-pip git
```

#### Arch Linux

```bash
sudo pacman -S python python-pip git
```

### 2. ARIA'yı İndirin

```bash
git clone https://github.com/yourusername/aria.git
cd aria
```

### 3. Sanal Ortam Oluşturun

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

### 5. ARIA'yı Başlatın

```bash
python main.py
```

### İzinler (Opsiyonel)

Çalıştırılabilir yapmak için:

```bash
chmod +x main.py
./main.py
```

---

## macOS Kurulumu

### 1. Homebrew Kurulumu (Yoksa)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Python Kurulumu

```bash
brew install python@3.10
```

### 3. ARIA'yı İndirin

```bash
git clone https://github.com/yourusername/aria.git
cd aria
```

### 4. Sanal Ortam Oluşturun

```bash
python3 -m venv venv
source venv/bin/activate
```

### 5. Bağımlılıkları Yükleyin

```bash
pip install -r requirements.txt
```

### 6. ARIA'yı Başlatın

```bash
python main.py
```

---

## Docker ile Kurulum (Tüm Platformlar)

### 1. Dockerfile Oluşturun

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

### 2. Image Oluşturun

```bash
docker build -t aria .
```

### 3. Container Çalıştırın

```bash
docker run -it --rm \
  -v $(pwd)/workspace:/app/workspace \
  -v $(pwd)/memory:/app/memory \
  aria
```

---

## Sorun Giderme

### Python Bulunamadı

**Windows:**
```cmd
# PATH'e ekleyin
setx PATH "%PATH%;C:\Python310"
```

**Linux/macOS:**
```bash
# .bashrc veya .zshrc'ye ekleyin
export PATH="/usr/local/bin/python3:$PATH"
```

### pip Bulunamadı

```bash
# Windows
python -m ensurepip --upgrade

# Linux/macOS
python3 -m ensurepip --upgrade
```

### Readline Hatası (Windows)

```cmd
pip install pyreadline3
```

### Renk Desteği Yok (Windows)

```cmd
pip install colorama
```

### İzin Hatası (Linux/macOS)

```bash
# Sanal ortam klasörüne izin verin
chmod -R 755 venv/
```

### ModuleNotFoundError

```bash
# Sanal ortamın aktif olduğundan emin olun
# Bağımlılıkları yeniden yükleyin
pip install --force-reinstall -r requirements.txt
```

### Encoding Hatası

Python dosyalarının başına ekleyin:

```python
# -*- coding: utf-8 -*-
```

Veya ortam değişkeni ayarlayın:

```bash
# Windows
set PYTHONIOENCODING=utf-8

# Linux/macOS
export PYTHONIOENCODING=utf-8
```

---

## Güncelleme

### Git ile

```bash
git pull origin main
pip install -r requirements.txt
```

### Manuel

1. Yeni sürümü indirin
2. Eski `memory/` ve `workspace/` klasörlerini yedekleyin
3. Yeni dosyaları kopyalayın
4. Yedekleri geri yükleyin

---

## Kaldırma

### Sanal Ortam ile

```bash
# Sanal ortamı devre dışı bırakın
deactivate

# Klasörü silin
rm -rf aria/  # Linux/macOS
rmdir /s aria  # Windows
```

### Global Kurulum

```bash
pip uninstall -r requirements.txt
```

---

## Destek

Sorun yaşıyorsanız:

1. [GitHub Issues](https://github.com/yourusername/aria/issues) açın
2. Log dosyasını paylaşın: `logs/aria.log`
3. Sistem bilgilerinizi belirtin

---

**Başarılı kurulum!** 🎉

Artık `python main.py` ile ARIA'yı başlatabilirsiniz.
