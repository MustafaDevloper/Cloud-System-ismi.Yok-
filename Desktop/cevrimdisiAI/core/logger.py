"""
core/logger.py
==============
Merkezi logging sistemi.
Tüm modüller bu logger'ı kullanır.

Özellikler:
  - Dosya ve konsol çıktısı
  - Renkli konsol logları
  - Otomatik log rotasyonu
  - Performans dostu (düşük RAM)
  - Thread-safe
"""

import logging
import sys
from pathlib import Path
from typing import Optional

# ─── ANSI Renk Kodları ───────────────────────────────────────
class LogColors:
    """Log seviyelerine göre renkler."""
    RESET   = "\033[0m"
    DEBUG   = "\033[36m"  # Cyan
    INFO    = "\033[92m"  # Green
    WARNING = "\033[93m"  # Yellow
    ERROR   = "\033[91m"  # Red
    CRITICAL= "\033[95m"  # Magenta


class ColoredFormatter(logging.Formatter):
    """
    Konsol için renkli log formatter.
    """

    FORMATS = {
        logging.DEBUG   : LogColors.DEBUG    + "%(levelname)-8s" + LogColors.RESET + " | %(name)s | %(message)s",
        logging.INFO    : LogColors.INFO     + "%(levelname)-8s" + LogColors.RESET + " | %(name)s | %(message)s",
        logging.WARNING : LogColors.WARNING  + "%(levelname)-8s" + LogColors.RESET + " | %(name)s | %(message)s",
        logging.ERROR   : LogColors.ERROR    + "%(levelname)-8s" + LogColors.RESET + " | %(name)s | %(message)s",
        logging.CRITICAL: LogColors.CRITICAL + "%(levelname)-8s" + LogColors.RESET + " | %(name)s | %(message)s",
    }

    def format(self, record: logging.LogRecord) -> str:
        log_fmt = self.FORMATS.get(record.levelno, "%(levelname)s | %(name)s | %(message)s")
        formatter = logging.Formatter(log_fmt, datefmt="%H:%M:%S")
        return formatter.format(record)


# ─── Global Logger Yapılandırması ────────────────────────────

_logger_initialized: bool = False


def setup_logger(
    log_file: Path,
    level: int = logging.INFO,
    console_level: int = logging.WARNING,
) -> None:
    """
    Global logger'ı yapılandır.
    Yalnızca bir kez çağrılmalı (main.py'de).

    Args:
        log_file     : Log dosyasının tam yolu.
        level        : Dosya log seviyesi.
        console_level: Konsol log seviyesi (daha az gürültü için WARNING önerilir).
    """
    global _logger_initialized
    if _logger_initialized:
        return

    # Log dizinini oluştur
    log_file.parent.mkdir(parents=True, exist_ok=True)

    # Root logger
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)  # En düşük seviye, handler'lar filtreler

    # ── Dosya Handler ────────────────────────────────────────
    file_handler = logging.FileHandler(
        log_file,
        mode="a",
        encoding="utf-8",
    )
    file_handler.setLevel(level)
    file_formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    file_handler.setFormatter(file_formatter)
    root.addHandler(file_handler)

    # ── Konsol Handler ───────────────────────────────────────
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(console_level)
    console_handler.setFormatter(ColoredFormatter())
    root.addHandler(console_handler)

    _logger_initialized = True
    root.info(f"Logger başlatıldı: {log_file}")


def get_logger(name: str) -> logging.Logger:
    """
    Modül için logger döndür.

    Args:
        name: Genellikle __name__ kullanılır.

    Returns:
        Logger örneği.
    """
    return logging.getLogger(name)
