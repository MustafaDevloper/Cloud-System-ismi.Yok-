"""
core/brain.py
=============
JSON tabanlı beyin sistemi.
Tüm komut tanımları, yanıtlar ve yapılandırma
brain.json dosyasından okunur.

Özellikler:
  - JSON hot-reload desteği
  - Alias çözümleme
  - Rastgele yanıt seçimi
  - Komut öncelik sıralaması
"""

import json
import random
import time
from pathlib import Path
from typing import Any, Optional

from core.logger import get_logger

log = get_logger(__name__)


class Brain:
    """
    ARIA'nın merkezi bilgi ve yapılandırma yöneticisi.
    JSON dosyasından komut tanımlarını ve yanıtları yönetir.
    """

    # Yeniden yükleme aralığı (saniye) — hot-reload için
    RELOAD_INTERVAL: float = 30.0

    def __init__(self, config_path: Path) -> None:
        """
        Args:
            config_path: brain.json dosyasının tam yolu.
        """
        self.config_path  = config_path
        self._last_reload = 0.0
        self.config: dict[str, Any] = {}
        self._load()

    # ─── Yükleme ─────────────────────────────────────────────

    def _load(self) -> None:
        """JSON yapılandırmasını yükle."""
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                self.config = json.load(f)
            self._last_reload = time.monotonic()
            log.info(f"Brain yapılandırması yüklendi: {self.config_path.name}")
        except FileNotFoundError:
            log.error(f"brain.json bulunamadı: {self.config_path}")
            self.config = self._default_config()
        except json.JSONDecodeError as exc:
            log.error(f"brain.json JSON hatası: {exc}")
            self.config = self._default_config()

    def reload_if_needed(self) -> bool:
        """
        RELOAD_INTERVAL'den uzun süre geçmişse dosyayı yeniden yükle.

        Returns:
            True: Yeniden yüklendi. False: Atlandı.
        """
        if time.monotonic() - self._last_reload >= self.RELOAD_INTERVAL:
            self._load()
            return True
        return False

    def force_reload(self) -> None:
        """Zorla yeniden yükle (hot-reload komutu)."""
        self._load()

    @staticmethod
    def _default_config() -> dict[str, Any]:
        """Yükleme başarısız olursa minimal yapılandırma."""
        return {
            "agent_name": "ARIA",
            "commands": [],
            "responses": {
                "greeting": ["Merhaba!"],
                "farewell": ["Görüşürüz!"],
                "unknown":  ["Bu komutu anlayamadım."],
            },
            "aliases": {},
            "allowed_terminal_commands": [],
            "intent_patterns": {},
        }

    # ─── Özellikler ──────────────────────────────────────────

    @property
    def agent_name(self) -> str:
        return self.config.get("agent_name", "ARIA")

    @property
    def commands(self) -> list[dict]:
        return self.config.get("commands", [])

    @property
    def aliases(self) -> dict[str, str]:
        return self.config.get("aliases", {})

    @property
    def responses(self) -> dict[str, list[str]]:
        return self.config.get("responses", {})

    @property
    def intent_patterns(self) -> dict[str, list[str]]:
        return self.config.get("intent_patterns", {})

    @property
    def allowed_terminal_commands(self) -> list[str]:
        return self.config.get("allowed_terminal_commands", [])

    # ─── Yanıt Üretimi ───────────────────────────────────────

    def get_response(self, key: str, **kwargs: Any) -> str:
        """
        Belirtilen anahtara ait yanıtlar içinden rastgele birini döndür.
        {agent_name} gibi placeholderları doldurur.

        Args:
            key   : 'greeting', 'farewell', 'unknown' vb.
            kwargs: Placeholder değerleri.

        Returns:
            Doldurulmuş yanıt metni.
        """
        pool: list[str] = self.responses.get(key, [f"[{key}] yanıtı bulunamadı."])
        template: str   = random.choice(pool)

        # Varsayılan placeholder değerleri
        kwargs.setdefault("agent_name", self.agent_name)

        try:
            return template.format(**kwargs)
        except KeyError:
            return template

    # ─── Alias ───────────────────────────────────────────────

    def resolve_alias(self, text: str) -> str:
        """
        Kullanıcı girdisindeki alias'ı gerçek komuta çevir.
        Büyük/küçük harf duyarsız.

        Args:
            text: Ham kullanıcı girdisi.

        Returns:
            Alias çözümlenmiş metin.
        """
        lower = text.lower()
        for alias, real in self.aliases.items():
            if lower == alias.lower():
                log.debug(f"Alias çözümlendi: '{alias}' → '{real}'")
                return real
        return text

    # ─── Komut Arama ─────────────────────────────────────────

    def find_command(self, keywords_found: list[str]) -> Optional[dict]:
        """
        Eşleşen keywordlere göre en yüksek öncelikli komutu döndür.

        Args:
            keywords_found: Parser'ın bulduğu keyword listesi.

        Returns:
            Komut dict'i veya None.
        """
        best_match: Optional[dict] = None
        best_score: int            = -1

        for cmd in self.commands:
            cmd_keywords = [k.lower() for k in cmd.get("keywords", [])]
            score = sum(1 for kw in keywords_found if kw in cmd_keywords)

            if score > 0 and score > best_score:
                best_score = score
                best_match = cmd

        return best_match

    # ─── Plugin Komut Ekleme ─────────────────────────────────

    def register_command(self, command: dict) -> None:
        """
        Plugin'ler tarafından çalışma zamanında yeni komut ekle.

        Args:
            command: Komut dict'i (id, keywords, action zorunlu).
        """
        required = {"id", "keywords", "action"}
        if not required.issubset(command.keys()):
            log.warning(f"Eksik alanlar, komut eklenmedi: {command}")
            return
        self.config.setdefault("commands", []).append(command)
        log.info(f"Yeni komut eklendi: {command['id']}")

    def register_response(self, key: str, responses: list[str]) -> None:
        """
        Plugin'ler için yeni yanıt seti ekle.

        Args:
            key      : Yanıt anahtarı.
            responses: Yanıt metinleri listesi.
        """
        self.config.setdefault("responses", {})[key] = responses
        log.info(f"Yanıt seti eklendi: {key}")
