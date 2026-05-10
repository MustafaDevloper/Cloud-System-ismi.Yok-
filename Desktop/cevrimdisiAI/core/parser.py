"""
core/parser.py
==============
Komut ayrıştırma motoru.
Kullanıcı girdisini analiz ederek intent ve parametreler çıkarır.

Özellikler:
  - Keyword matching (JSON kuralları)
  - Regex pattern desteği
  - Intent detection (soru, oluşturma, silme vb.)
  - Parametre çıkarma (dosya adı, içerik vb.)
  - Skor tabanlı eşleşme
"""

import re
from typing import Any, Optional

from core.brain  import Brain
from core.logger import get_logger

log = get_logger(__name__)


class CommandParser:
    """
    Kullanıcı girdisini analiz edip yapılandırılmış intent döndürür.

    Intent Yapısı:
        {
            "action"    : str,          # Çalıştırılacak action adı
            "command_id": str | None,   # Eşleşen komut ID'si
            "raw"       : str,          # Ham girdi
            "tokens"    : list[str],    # Kelimeler
            "intent"    : str,          # creation/deletion/question vb.
            "params"    : dict,         # Çıkarılan parametreler
            "confidence": float,        # 0.0 – 1.0
        }
    """

    # ─── Regex Kalıpları ─────────────────────────────────────

    # Dosya adı: örn. "test.html", "myscript.py", "dosya.txt"
    _FILE_PATTERN = re.compile(
        r'\b([\w\-]+\.(html?|css|js|py|txt|json|md|xml|csv|yaml|yml|sh|bat))\b',
        re.IGNORECASE,
    )

    # Tırnak içindeki metin
    _QUOTED_PATTERN = re.compile(r'["\'](.+?)["\']')

    # Sayısal değer
    _NUMBER_PATTERN = re.compile(r'\b(\d+)\b')

    # ─── Init ────────────────────────────────────────────────

    def __init__(self, brain: Brain) -> None:
        """
        Args:
            brain: Brain örneği (komut tanımları için).
        """
        self.brain = brain

    # ─── Ana Parse ───────────────────────────────────────────

    def parse(self, text: str) -> dict[str, Any]:
        """
        Ham kullanıcı metnini yapılandırılmış intent'e çevir.

        Args:
            text: Kullanıcı girdisi.

        Returns:
            Intent sözlüğü.
        """
        # Hot-reload kontrolü
        self.brain.reload_if_needed()

        # Ön işleme
        cleaned = text.strip()
        lower   = cleaned.lower()
        tokens  = self._tokenize(lower)

        # Intent tür tespiti
        intent_type = self._detect_intent_type(lower, tokens)

        # Parametreleri çıkar
        params = self._extract_params(cleaned)

        # Komut eşleştir
        command = self._match_command(lower, tokens)

        if command:
            log.debug(f"Komut eşleşti: {command['id']} | intent: {intent_type}")
            return {
                "action"    : command.get("action", "unknown"),
                "command_id": command.get("id"),
                "response_key": command.get("response_key"),
                "raw"       : cleaned,
                "tokens"    : tokens,
                "intent"    : intent_type,
                "params"    : params,
                "confidence": self._calculate_confidence(lower, command),
            }

        # Eşleşme yok
        log.debug(f"Komut eşleşmedi: '{cleaned}'")
        return {
            "action"    : "unknown",
            "command_id": None,
            "response_key": None,
            "raw"       : cleaned,
            "tokens"    : tokens,
            "intent"    : intent_type,
            "params"    : params,
            "confidence": 0.0,
        }

    # ─── Tokenize ────────────────────────────────────────────

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        """
        Metni kelimelere böl.
        Noktalama işaretlerini kaldır, boş token'ları ele.

        Args:
            text: Küçük harfli metin.

        Returns:
            Token listesi.
        """
        # Noktalama kaldır (ama nokta uzantıları koru: .py .html)
        clean = re.sub(r'[^\w\s\.\-]', ' ', text)
        return [t for t in clean.split() if len(t) > 0]

    # ─── Intent Tip Tespiti ───────────────────────────────────

    def _detect_intent_type(self, text: str, tokens: list[str]) -> str:
        """
        Metnin genel niyetini tespit et.
        (question, creation, deletion, read, execute, save, unknown)

        Args:
            text  : Küçük harfli ham metin.
            tokens: Token listesi.

        Returns:
            Intent tipi string.
        """
        patterns = self.brain.intent_patterns

        for intent_name, keywords in patterns.items():
            for kw in keywords:
                if kw in text or kw in tokens:
                    return intent_name

        return "unknown"

    # ─── Parametre Çıkarma ───────────────────────────────────

    def _extract_params(self, text: str) -> dict[str, Any]:
        """
        Metinden dosya adı, tırnaklı içerik ve sayıları çıkar.

        Args:
            text: Ham (orijinal büyük/küçük harf korunmuş) metin.

        Returns:
            Parametre sözlüğü:
                filename   : str | None
                quoted     : list[str]
                numbers    : list[int]
                extra_text : str  (dosya adı/sayılar çıkarıldıktan sonraki metin)
        """
        filename_match = self._FILE_PATTERN.search(text)
        filename       = filename_match.group(0) if filename_match else None

        quoted  = self._QUOTED_PATTERN.findall(text)
        numbers = [int(n) for n in self._NUMBER_PATTERN.findall(text)]

        # Dosya adı ve sayılar çıkarıldıktan sonraki "serbest metin"
        extra = text
        if filename:
            extra = extra.replace(filename, "").strip()
        extra = self._NUMBER_PATTERN.sub("", extra).strip()
        extra = re.sub(r'\s+', ' ', extra)

        return {
            "filename"  : filename,
            "quoted"    : quoted,
            "numbers"   : numbers,
            "extra_text": extra,
        }

    # ─── Komut Eşleştirme ────────────────────────────────────

    def _match_command(self, lower_text: str, tokens: list[str]) -> Optional[dict]:
        """
        Brain'deki komutlarla en iyi eşleşmeyi bul.

        Skor sistemi:
          - Komutun her keyword'ü metinde tam geçiyorsa +2
          - Token'lar arasında kısmi geçiyorsa +1

        Args:
            lower_text: Küçük harfli ham metin.
            tokens    : Tokenize edilmiş liste.

        Returns:
            En iyi komut dict'i veya None.
        """
        best_cmd: Optional[dict] = None
        best_score: float        = 0.0

        for cmd in self.brain.commands:
            score: float = 0.0
            cmd_keywords = cmd.get("keywords", [])

            for kw in cmd_keywords:
                kw_lower = kw.lower()
                if kw_lower in lower_text:
                    # Tam geçiş (cümle içinde)
                    score += 2.0
                    # Keyword çok kelimeli ve tam eşleşiyorsa bonus
                    if len(kw_lower.split()) > 1:
                        score += 1.0
                else:
                    # Kısmi: keyword'ün her kelimesi token'larda var mı?
                    kw_tokens = kw_lower.split()
                    if all(kt in tokens for kt in kw_tokens):
                        score += 1.0

            # Öncelik faktörü (öncelik ne kadar küçükse o kadar önemli)
            priority  = cmd.get("priority", 5)
            weighted  = score / priority if priority > 0 else score

            if weighted > best_score:
                best_score = weighted
                best_cmd   = cmd

        return best_cmd if best_score > 0 else None

    # ─── Güven Skoru ─────────────────────────────────────────

    def _calculate_confidence(self, lower_text: str, command: dict) -> float:
        """
        0.0 – 1.0 arası güven skoru hesapla.

        Args:
            lower_text: Küçük harfli metin.
            command   : Eşleşen komut dict'i.

        Returns:
            Güven skoru (float).
        """
        keywords = command.get("keywords", [])
        if not keywords:
            return 0.5

        matched = sum(
            1 for kw in keywords if kw.lower() in lower_text
        )
        return round(min(matched / len(keywords), 1.0), 2)
