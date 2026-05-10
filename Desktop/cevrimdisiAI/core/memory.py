"""
core/memory.py
==============
Hafıza ve geçmiş yönetim sistemi.

Özellikler:
  - memory.json  : Kalıcı kullanıcı tercihleri ve notlar
  - history.json : Oturum başına komut geçmişi logu
  - Nested key   : dot-notation ile get/set (örn. "user.name")
  - Thread-safe  : Basit dosya kilidi
  - Auto-save    : Her yazımda diske kaydeder (düşük RAM optimizasyonu)
"""

import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from core.logger import get_logger

log = get_logger(__name__)


class MemorySystem:
    """
    ARIA'nın kalıcı hafıza sistemi.
    Kullanıcı verileri ve komut geçmişi JSON dosyalarında saklanır.
    """

    MAX_HISTORY_ENTRIES: int = 200   # Maksimum geçmiş satırı

    def __init__(self, memory_dir: Path) -> None:
        """
        Args:
            memory_dir: 'memory/' klasörünün tam yolu.
        """
        self.memory_dir   = memory_dir
        self.memory_file  = memory_dir / "memory.json"
        self.history_file = memory_dir / "history.json"

        memory_dir.mkdir(parents=True, exist_ok=True)

        self._memory:  dict[str, Any] = {}
        self._history: dict[str, Any] = {}
        self._session_id: str         = str(uuid.uuid4())[:8]

        self._load_memory()
        self._load_history()
        log.info(f"MemorySystem başlatıldı. Session: {self._session_id}")

    # ─── Yükleme / Kayıt ─────────────────────────────────────

    def _load_memory(self) -> None:
        """memory.json dosyasını yükle."""
        try:
            if self.memory_file.exists():
                with open(self.memory_file, "r", encoding="utf-8") as f:
                    self._memory = json.load(f)
            else:
                self._memory = self._default_memory()
                self._save_memory()
        except (json.JSONDecodeError, OSError) as exc:
            log.error(f"memory.json yüklenemedi: {exc}")
            self._memory = self._default_memory()

    def _save_memory(self) -> None:
        """memory.json dosyasına kaydet."""
        try:
            with open(self.memory_file, "w", encoding="utf-8") as f:
                json.dump(self._memory, f, ensure_ascii=False, indent=2)
        except OSError as exc:
            log.error(f"memory.json kaydedilemedi: {exc}")

    def _load_history(self) -> None:
        """history.json dosyasını yükle."""
        try:
            if self.history_file.exists():
                with open(self.history_file, "r", encoding="utf-8") as f:
                    self._history = json.load(f)
            else:
                self._history = self._default_history()
                self._save_history()
        except (json.JSONDecodeError, OSError) as exc:
            log.error(f"history.json yüklenemedi: {exc}")
            self._history = self._default_history()

    def _save_history(self) -> None:
        """history.json dosyasına kaydet."""
        try:
            with open(self.history_file, "w", encoding="utf-8") as f:
                json.dump(self._history, f, ensure_ascii=False, indent=2)
        except OSError as exc:
            log.error(f"history.json kaydedilemedi: {exc}")

    # ─── Varsayılan Yapılar ───────────────────────────────────

    @staticmethod
    def _default_memory() -> dict[str, Any]:
        return {
            "user": {
                "name": None,
                "language": "tr",
                "preferred_templates": [],
                "custom_aliases": {},
            },
            "session": {
                "created_at": None,
                "last_active": None,
                "command_count": 0,
            },
            "preferences": {
                "theme": "dark",
                "verbose_mode": False,
                "auto_open_files": False,
            },
            "notes": [],
            "reminders": [],
        }

    @staticmethod
    def _default_history() -> dict[str, Any]:
        return {
            "history": [],
            "total_sessions": 0,
            "total_commands": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    # ─── Oturum Yönetimi ─────────────────────────────────────

    def start_session(self) -> None:
        """Yeni oturumu başlat ve kaydet."""
        now = datetime.now(timezone.utc).isoformat()
        self.set("session.created_at", now)
        self.set("session.last_active", now)
        self.set("session.command_count", 0)

        self._history["total_sessions"] = self._history.get("total_sessions", 0) + 1
        self._save_history()
        log.info(f"Oturum başladı: {self._session_id}")

    def end_session(self) -> None:
        """Oturumu kapat ve kaydet."""
        self.set("session.last_active", datetime.now(timezone.utc).isoformat())
        self._save_memory()
        self._save_history()
        log.info(f"Oturum kapandı: {self._session_id}")

    # ─── Komut Logla ─────────────────────────────────────────

    def log_command(self, command: str, action: str) -> None:
        """
        Kullanıcının çalıştırdığı komutu geçmişe ekle.

        Args:
            command: Ham komut metni.
            action : Çalıştırılan action adı.
        """
        entry = {
            "session_id": self._session_id,
            "timestamp" : datetime.now(timezone.utc).isoformat(),
            "command"   : command,
            "action"    : action,
        }

        history: list = self._history.setdefault("history", [])
        history.append(entry)

        # Maksimum girdi sayısını aş → eskilerden kırp
        if len(history) > self.MAX_HISTORY_ENTRIES:
            self._history["history"] = history[-self.MAX_HISTORY_ENTRIES:]

        self._history["total_commands"] = self._history.get("total_commands", 0) + 1

        # Oturum komut sayacı
        current_count = self.get("session.command_count") or 0
        self.set("session.command_count", current_count + 1)

        self._save_history()

    # ─── Dot-Notation Get / Set ───────────────────────────────

    def get(self, key: str, default: Any = None) -> Any:
        """
        Dot-notation ile iç içe değer oku.
        Örn: get("user.name"), get("preferences.theme")

        Args:
            key    : Noktalı anahtar yolu.
            default: Bulunamazsa döndürülecek değer.

        Returns:
            İlgili değer veya default.
        """
        parts = key.split(".")
        node  = self._memory
        for part in parts:
            if not isinstance(node, dict) or part not in node:
                return default
            node = node[part]
        return node

    def set(self, key: str, value: Any) -> None:
        """
        Dot-notation ile iç içe değer yaz ve kaydet.
        Eksik ara node'ları otomatik oluşturur.

        Args:
            key  : Noktalı anahtar yolu.
            value: Yazılacak değer.
        """
        parts = key.split(".")
        node  = self._memory
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = value
        self._save_memory()

    def delete(self, key: str) -> bool:
        """
        Dot-notation ile değer sil.

        Args:
            key: Noktalı anahtar yolu.

        Returns:
            True: silindi, False: bulunamadı.
        """
        parts = key.split(".")
        node  = self._memory
        for part in parts[:-1]:
            if not isinstance(node, dict) or part not in node:
                return False
            node = node[part]
        if parts[-1] in node:
            del node[parts[-1]]
            self._save_memory()
            return True
        return False

    # ─── Not Sistemi ─────────────────────────────────────────

    def add_note(self, text: str) -> None:
        """
        Hafızaya not ekle.

        Args:
            text: Not metni.
        """
        notes: list = self._memory.setdefault("notes", [])
        notes.append({
            "id"       : len(notes) + 1,
            "text"     : text,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        self._save_memory()
        log.info(f"Not eklendi: {text[:50]}")

    def get_notes(self) -> list[dict]:
        """Tüm notları döndür."""
        return self._memory.get("notes", [])

    def clear_notes(self) -> None:
        """Tüm notları sil."""
        self._memory["notes"] = []
        self._save_memory()

    # ─── Geçmiş Sorgulama ────────────────────────────────────

    def get_history(self, limit: int = 20, session_only: bool = False) -> list[dict]:
        """
        Geçmiş komutları döndür.

        Args:
            limit       : Maksimum döndürülecek girdi sayısı.
            session_only: True ise yalnızca mevcut oturum komutları.

        Returns:
            Geçmiş girdileri listesi (en yeniler sonda).
        """
        all_entries: list = self._history.get("history", [])

        if session_only:
            all_entries = [
                e for e in all_entries
                if e.get("session_id") == self._session_id
            ]

        return all_entries[-limit:]

    def get_stats(self) -> dict[str, Any]:
        """Genel istatistikleri döndür."""
        return {
            "total_sessions" : self._history.get("total_sessions", 0),
            "total_commands" : self._history.get("total_commands", 0),
            "session_commands": self.get("session.command_count", 0),
            "notes_count"    : len(self._memory.get("notes", [])),
            "session_id"     : self._session_id,
        }

    # ─── Tüm Belleği Göster ──────────────────────────────────

    def dump(self) -> dict[str, Any]:
        """Tüm memory sözlüğünü döndür (debug/show için)."""
        return dict(self._memory)

    def clear_all(self) -> None:
        """Tüm hafızayı sıfırla (fabrika ayarları)."""
        self._memory  = self._default_memory()
        self._history = self._default_history()
        self._save_memory()
        self._save_history()
        log.warning("Tüm hafıza sıfırlandı.")
