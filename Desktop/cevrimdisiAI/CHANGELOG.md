# Changelog

Tüm önemli değişiklikler bu dosyada belgelenir.

Format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standardına uygundur.

---

## [1.0.0] - 2025-01-XX

### ✨ Eklenenler

#### Çekirdek Sistem
- **Brain System** - JSON tabanlı yapılandırma yönetimi
- **Command Parser** - Doğal dil komut ayrıştırma
- **Action Engine** - Modüler action handler sistemi
- **Memory System** - Kalıcı hafıza ve geçmiş yönetimi
- **Security Manager** - Çok katmanlı güvenlik sistemi
- **Terminal Manager** - Güvenli terminal komut çalıştırma
- **Template Engine** - Dosya şablonu yönetimi
- **Logger System** - Renkli ve yapılandırılabilir logging

#### Özellikler
- Tamamen offline çalışma
- Düşük RAM kullanımı (<100 MB)
- GPU gerektirmez
- Hot-reload desteği
- Renkli terminal çıktısı
- Komut geçmişi (readline)
- Alias sistemi
- Plugin desteği

#### Komutlar
- **Dosya İşlemleri:** oluştur, oku, sil, düzenle, listele
- **Şablon Üretimi:** HTML, CSS, Python, Flask, Discord bot
- **Terminal:** Güvenli komut çalıştırma
- **Hafıza:** göster, kaydet, sil, geçmiş
- **Sistem:** yardım, bilgi, plugin listesi

#### Güvenlik
- Path traversal koruması
- Command injection engelleme
- Whitelist tabanlı terminal
- Sistem dosyası koruması
- Input sanitization

#### Plugin'ler
- **hesap_makinesi** - Matematiksel hesaplama

#### Template'ler
- **basic_html** - Temel HTML5 şablonu
- **flask_api** - Flask REST API
- **discord_bot** - Discord bot iskelet

#### Dokümantasyon
- README.md - Ana dokümantasyon
- INSTALLATION.md - Kurulum kılavuzu
- DEVELOPMENT.md - Geliştirici kılavuzu
- CHANGELOG.md - Değişiklik günlüğü

### 🔧 Teknik Detaylar
- Python 3.8+ desteği
- Windows/Linux/macOS uyumluluğu
- Type hints kullanımı
- Comprehensive logging
- Modüler mimari

---

## [Unreleased]

### Planlanan Özellikler
- Web UI (Flask tabanlı)
- Fuzzy matching (rapidfuzz)
- Sesli yanıt (pyttsx3)
- Daha fazla template
- Test suite (pytest)
- Docker desteği
- Multi-language support
- API endpoint'leri

---

## Versiyon Formatı

- **Major.Minor.Patch** (Semantic Versioning)
- **Major:** Geriye uyumsuz değişiklikler
- **Minor:** Yeni özellikler (geriye uyumlu)
- **Patch:** Hata düzeltmeleri

---

[1.0.0]: https://github.com/yourusername/aria/releases/tag/v1.0.0
