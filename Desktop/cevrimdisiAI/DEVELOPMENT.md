# ARIA - Geliştirici Kılavuzu

Bu dokümanda ARIA'nın iç yapısı, geliştirme süreci ve katkıda bulunma yöntemleri anlatılmaktadır.

---

## 📋 İçindekiler

- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kod Yapısı](#kod-yapısı)
- [Yeni Özellik Ekleme](#yeni-özellik-ekleme)
- [Plugin Geliştirme](#plugin-geliştirme)
- [Test Yazma](#test-yazma)
- [Kod Standartları](#kod-standartları)
- [Debugging](#debugging)

---

## Geliştirme Ortamı

### Gereksinimler

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Geliştirme bağımlılıkları
```

### requirements-dev.txt

```
pytest>=7.4.0
pytest-cov>=4.1.0
black>=23.0.0
flake8>=6.0.0
mypy>=1.5.0
isort>=5.12.0
```

### Pre-commit Hooks

```bash
pip install pre-commit
pre-commit install
```

---

## Kod Yapısı

### Modül Hiyerarşisi

```
core/
├── brain.py       → JSON yapılandırma yönetimi
├── parser.py      → Komut ayrıştırma
├── actions.py     → Action handler'lar
├── memory.py      → Hafıza sistemi
├── security.py    → Güvenlik katmanı
├── terminal.py    → Terminal yönetimi
├── templates.py   → Template motoru
└── logger.py      → Logging sistemi
```

### Veri Akışı

```
Kullanıcı Girdisi
    ↓
CommandParser (parser.py)
    ↓
Intent Dict
    ↓
ActionEngine (actions.py)
    ↓
Handler Fonksiyonu
    ↓
Result Dict
    ↓
Kullanıcıya Çıktı
```

---

## Yeni Özellik Ekleme

### 1. Yeni Komut Ekleme

#### brain.json'a Ekleyin

```json
{
  "commands": [
    {
      "id": "my_feature",
      "keywords": ["özellik", "yeni komut"],
      "action": "my_action",
      "priority": 5,
      "response_key": "my_response"
    }
  ],
  "responses": {
    "my_response": ["Özellik çalıştı!"]
  }
}
```

#### Action Handler Ekleyin

`core/actions.py` içinde:

```python
def _my_action(self, intent: dict, raw: str) -> dict:
    """
    Yeni özellik handler'ı.
    
    Args:
        intent: Parser'dan gelen intent dict'i.
        raw   : Ham kullanıcı girdisi.
    
    Returns:
        Result dict: {"output": str} veya {"error": str}
    """
    # Parametreleri al
    params = intent.get("params", {})
    filename = params.get("filename")
    
    # İşlem yap
    try:
        result = self._do_something(filename)
        return {"output": f"Başarılı: {result}"}
    except Exception as e:
        return {"error": f"Hata: {e}"}

# __init__ içinde kaydet
self._handlers["my_action"] = self._my_action
```

### 2. Yeni Intent Tipi Ekleme

`brain.json` içinde:

```json
{
  "intent_patterns": {
    "my_intent": ["anahtar1", "anahtar2", "?"]
  }
}
```

`core/parser.py` içinde intent tespiti otomatik çalışır.

### 3. Yeni Template Ekleme

#### Template Klasörü Oluşturun

```
templates/my_template/
├── meta.json
├── file1.html
└── file2.css
```

#### meta.json

```json
{
  "name": "my_template",
  "description": "Açıklama",
  "files": ["file1.html", "file2.css"],
  "placeholders": ["title", "author", "color"]
}
```

#### Template Dosyası

```html
<!-- file1.html -->
<!DOCTYPE html>
<html>
<head>
  <title>{title}</title>
  <meta name="author" content="{author}">
</head>
<body style="background: {color}">
  <h1>{title}</h1>
</body>
</html>
```

#### Kullanım

```python
from core.templates import TemplateEngine

engine = TemplateEngine(Path("templates"))
files = engine.load("my_template", {
    "title": "Test",
    "author": "ARIA",
    "color": "#000"
})
```

---

## Plugin Geliştirme

### Plugin Yapısı

```python
# plugins/my_plugin.py

from typing import Any
from core.logger import get_logger

log = get_logger(__name__)

# ─── Action Handler ──────────────────────────────────────────

def _my_handler(intent: dict, raw: str) -> dict:
    """Plugin action handler'ı."""
    log.info(f"Plugin çalıştırıldı: {raw}")
    return {"output": "Plugin sonucu"}

# ─── Yardımcı Fonksiyonlar ───────────────────────────────────

def _helper_function(data: str) -> str:
    """İç yardımcı fonksiyon."""
    return data.upper()

# ─── Plugin Kaydı ────────────────────────────────────────────

def register(brain: Any, actions: Any) -> None:
    """
    Plugin'i ARIA sistemine kaydet.
    
    Args:
        brain  : Brain örneği (komut ekleme için).
        actions: ActionEngine örneği (handler ekleme için).
    """
    # Komut ekle
    brain.register_command({
        "id"      : "my_plugin_cmd",
        "keywords": ["plugin", "özel"],
        "action"  : "my_plugin_action",
        "priority": 5,
    })
    
    # Yanıt ekle (opsiyonel)
    brain.register_response("my_plugin_response", [
        "Plugin yanıtı 1",
        "Plugin yanıtı 2"
    ])
    
    # Handler kaydet
    actions.register("my_plugin_action", _my_handler)
    
    log.info("Plugin kaydedildi: my_plugin")
```

### Plugin Test Etme

```python
# Test için main.py'yi çalıştırın
python main.py

# Plugin komutunu deneyin
> plugin özel
```

### Plugin Hata Ayıklama

```python
# Plugin içinde log kullanın
log.debug("Debug mesajı")
log.info("Bilgi mesajı")
log.warning("Uyarı mesajı")
log.error("Hata mesajı")

# Log dosyasını kontrol edin
# logs/aria.log
```

---

## Test Yazma

### Test Yapısı

```
tests/
├── __init__.py
├── test_parser.py
├── test_actions.py
├── test_memory.py
├── test_security.py
└── test_terminal.py
```

### Örnek Test

```python
# tests/test_parser.py

import pytest
from core.parser import CommandParser
from core.brain import Brain
from pathlib import Path

@pytest.fixture
def parser():
    """Parser fixture."""
    brain = Brain(Path("config/brain.json"))
    return CommandParser(brain)

def test_parse_html_command(parser):
    """HTML oluşturma komutunu test et."""
    intent = parser.parse("html oluştur index.html")
    
    assert intent["action"] == "create_html"
    assert intent["params"]["filename"] == "index.html"
    assert intent["confidence"] > 0.5

def test_parse_unknown_command(parser):
    """Bilinmeyen komut test et."""
    intent = parser.parse("asdfghjkl")
    
    assert intent["action"] == "unknown"
    assert intent["confidence"] == 0.0

def test_parameter_extraction(parser):
    """Parametre çıkarma test et."""
    intent = parser.parse('dosya oluştur "test.txt" içerik')
    
    params = intent["params"]
    assert params["filename"] == "test.txt"
    assert "içerik" in params["extra_text"]
```

### Test Çalıştırma

```bash
# Tüm testler
pytest

# Belirli dosya
pytest tests/test_parser.py

# Coverage ile
pytest --cov=core --cov-report=html

# Verbose
pytest -v
```

---

## Kod Standartları

### Python Style Guide

- **PEP 8** standartlarına uyun
- **Type hints** kullanın
- **Docstring** yazın (Google style)

### Örnek Fonksiyon

```python
def process_data(
    input_data: str,
    max_length: int = 100,
    validate: bool = True,
) -> dict[str, Any]:
    """
    Veriyi işle ve sonuç döndür.
    
    Args:
        input_data: İşlenecek ham veri.
        max_length: Maksimum uzunluk sınırı.
        validate  : Doğrulama yapılsın mı.
    
    Returns:
        İşlenmiş veri dict'i:
            {
                "processed": str,
                "length": int,
                "valid": bool
            }
    
    Raises:
        ValueError: Geçersiz girdi.
    
    Example:
        >>> process_data("test", max_length=10)
        {"processed": "TEST", "length": 4, "valid": True}
    """
    if not input_data:
        raise ValueError("Boş girdi")
    
    processed = input_data.upper()[:max_length]
    
    return {
        "processed": processed,
        "length": len(processed),
        "valid": validate and len(processed) > 0
    }
```

### Kod Formatlama

```bash
# Black (otomatik formatlama)
black core/ plugins/ main.py

# isort (import sıralama)
isort core/ plugins/ main.py

# flake8 (linting)
flake8 core/ plugins/ main.py

# mypy (type checking)
mypy core/ plugins/ main.py
```

### Commit Mesajları

```
feat: yeni özellik eklendi
fix: hata düzeltildi
docs: dokümantasyon güncellendi
style: kod formatı düzenlendi
refactor: kod yeniden yapılandırıldı
test: test eklendi
chore: genel bakım
```

---

## Debugging

### Log Seviyeleri

```python
from core.logger import get_logger

log = get_logger(__name__)

log.debug("Detaylı debug bilgisi")
log.info("Genel bilgi")
log.warning("Uyarı mesajı")
log.error("Hata mesajı")
log.critical("Kritik hata")
```

### Log Dosyası

```bash
# Log dosyasını takip et
tail -f logs/aria.log

# Son 100 satır
tail -n 100 logs/aria.log

# Hata loglarını filtrele
grep ERROR logs/aria.log
```

### Python Debugger

```python
# Breakpoint ekle
import pdb; pdb.set_trace()

# Veya Python 3.7+
breakpoint()
```

### VS Code Debug Yapılandırması

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ARIA Debug",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/main.py",
      "console": "integratedTerminal",
      "justMyCode": false
    }
  ]
}
```

---

## Performans Optimizasyonu

### Profiling

```python
import cProfile
import pstats

# Profiling başlat
profiler = cProfile.Profile()
profiler.enable()

# Kod çalıştır
# ...

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)
```

### Memory Profiling

```bash
pip install memory_profiler

# Fonksiyon üzerine decorator ekle
@profile
def my_function():
    pass

# Çalıştır
python -m memory_profiler main.py
```

---

## Katkıda Bulunma

### Pull Request Süreci

1. Fork yapın
2. Feature branch oluşturun
3. Değişiklikleri yapın
4. Test yazın
5. Commit yapın
6. Push edin
7. PR açın

### PR Checklist

- [ ] Kod PEP 8 uyumlu
- [ ] Type hints eklenmiş
- [ ] Docstring yazılmış
- [ ] Test yazılmış
- [ ] Dokümantasyon güncellenmiş
- [ ] Changelog güncellenmiş

---

## Kaynaklar

- [Python Docs](https://docs.python.org/3/)
- [PEP 8](https://pep8.org/)
- [Type Hints](https://docs.python.org/3/library/typing.html)
- [pytest](https://docs.pytest.org/)

---

**İyi geliştirmeler!** 🚀
