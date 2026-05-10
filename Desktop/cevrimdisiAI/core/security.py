"""
core/security.py
================
Güvenlik yöneticisi.
Tüm güvenlik kontrolleri bu modülden geçer.

Koruma katmanları:
  1. Path traversal önleme  (../../ gibi saldırılar)
  2. Workspace izolasyonu   (yalnızca workspace/ içinde çalışma)
  3. Terminal whitelist     (izin verilen komutlar)
  4. Command injection      (; | & ` $ gibi karakterler)
  5. Sistem dosyası koruması (C:\\Windows, /etc vb.)
"""

import os
import re
from pathlib import Path
from typing import Optional

from core.logger import get_logger

log = get_logger(__name__)


class SecurityError(Exception):
    """Güvenlik ihlali tespit edildiğinde fırlatılır."""


class SecurityManager:
    """
    ARIA güvenlik katmanı.

    Tüm dosya yolu ve terminal komutu işlemleri
    bu sınıftan geçirilmeli; izinsiz erişim SecurityError
    ile engellenmelidir.
    """

    # ─── Tehlikeli Karakterler ────────────────────────────────
    _INJECTION_PATTERN = re.compile(
        r'[;&|`$<>\\^!{}\[\]]'   # Shell meta-karakterleri
        r'|\.{2,}'                # '..' path traversal
        r'|\beval\b|\bexec\b'    # kod çalıştırma
        r'|\bimport\b.*\bos\b',  # python injection girişimi
        re.IGNORECASE,
    )

    # ─── Korumalı Sistem Dizinleri ───────────────────────────
    _BLOCKED_PREFIXES: tuple[str, ...] = (
        "c:\\windows",
        "c:\\program files",
        "c:\\programdata",
        "c:\\users\\default",
        "/etc",
        "/bin",
        "/sbin",
        "/usr",
        "/boot",
        "/sys",
        "/proc",
        "/root",
    )

    def __init__(self, root_dir: Path) -> None:
        """
        Args:
            root_dir: Projenin kök dizini.
        """
        self.root_dir      = root_dir.resolve()
        self.workspace_dir = (root_dir / "workspace").resolve()
        self.workspace_dir.mkdir(parents=True, exist_ok=True)
        log.info(f"SecurityManager başlatıldı. Workspace: {self.workspace_dir}")

    # ─── Yol Güvenliği ───────────────────────────────────────

    def safe_path(self, filename: str) -> Path:
        """
        Kullanıcının verdiği dosya adını/yolunu güvenli
        workspace yoluna dönüştür.

        Path traversal ve sistem dizini erişimini engeller.

        Args:
            filename: Kullanıcının belirttiği dosya adı veya göreli yol.

        Returns:
            Güvenli, mutlak Path nesnesi (workspace içinde).

        Raises:
            SecurityError: Geçersiz veya tehlikeli yol.
        """
        # Boş isim kontrolü
        if not filename or not filename.strip():
            raise SecurityError("Dosya adı boş olamaz.")

        # Null byte kontrolü
        if "\x00" in filename:
            raise SecurityError("Dosya adında geçersiz karakter (null byte).")

        # Göreli yolu workspace'e bağla
        candidate = (self.workspace_dir / filename).resolve()

        # Workspace dışına çıkma kontrolü
        try:
            candidate.relative_to(self.workspace_dir)
        except ValueError:
            log.warning(f"[SECURITY] Path traversal girişimi engellendi: '{filename}'")
            raise SecurityError(
                f"Güvenlik ihlali: '{filename}' workspace dışına erişmeye çalışıyor."
            )

        # Sistem dizini kontrolü
        candidate_lower = str(candidate).lower()
        for blocked in self._BLOCKED_PREFIXES:
            if candidate_lower.startswith(blocked):
                log.warning(f"[SECURITY] Sistem dizini erişimi engellendi: '{candidate}'")
                raise SecurityError(
                    f"Güvenlik ihlali: Sistem dizinine erişim yasak ({blocked})."
                )

        return candidate

    def is_safe_path(self, filename: str) -> tuple[bool, str]:
        """
        safe_path'i exception yerine bool döndürecek şekilde sarmalar.

        Returns:
            (True, "") veya (False, hata_mesajı)
        """
        try:
            self.safe_path(filename)
            return True, ""
        except SecurityError as exc:
            return False, str(exc)

    # ─── Terminal Güvenliği ───────────────────────────────────

    def validate_terminal_command(
        self,
        command: str,
        whitelist: list[str],
    ) -> tuple[bool, str]:
        """
        Terminal komutunu whitelist ve injection kontrolünden geçir.

        Args:
            command  : Kullanıcının girdiği komut satırı.
            whitelist: İzin verilen komut adları listesi.

        Returns:
            (True, "") komutu güvenli.
            (False, sebep) komutu reddedildi.
        """
        if not command or not command.strip():
            return False, "Boş komut."

        stripped = command.strip()

        # İnjection karakteri kontrolü
        if self._INJECTION_PATTERN.search(stripped):
            log.warning(f"[SECURITY] Injection karakteri engellendi: '{stripped}'")
            return False, f"Komut güvenli değil: yasak karakter içeriyor."

        # İlk kelime (program adı) whitelist kontrolü
        base_cmd = stripped.split()[0].lower()
        # Windows'ta .exe uzantısını kaldır
        base_cmd = base_cmd.removesuffix(".exe")

        if base_cmd not in [w.lower() for w in whitelist]:
            log.warning(f"[SECURITY] Whitelist dışı komut engellendi: '{base_cmd}'")
            return False, (
                f"'{base_cmd}' komutu izin verilenler listesinde değil.\n"
                f"İzin verilenler: {', '.join(whitelist)}"
            )

        return True, ""

    # ─── İçerik Güvenliği ────────────────────────────────────

    def sanitize_content(self, content: str, max_length: int = 100_000) -> str:
        """
        Dosyaya yazılacak içeriği temizle.

        - Null byte kaldır
        - Uzunluk sınırla

        Args:
            content   : Ham içerik.
            max_length: Maksimum karakter sayısı.

        Returns:
            Temizlenmiş içerik.
        """
        content = content.replace("\x00", "")
        if len(content) > max_length:
            log.warning(
                f"İçerik {len(content)} karakter, {max_length}'e kırpıldı."
            )
            content = content[:max_length]
        return content

    # ─── Dosya Uzantısı Kontrolü ─────────────────────────────

    @staticmethod
    def allowed_extension(filename: str) -> bool:
        """
        Yalnızca güvenli dosya uzantılarına izin ver.

        Args:
            filename: Dosya adı.

        Returns:
            True → uzantı güvenli.
        """
        allowed = {
            ".html", ".htm", ".css", ".js", ".py",
            ".txt", ".json", ".md", ".xml", ".csv",
            ".yaml", ".yml", ".sh", ".bat", ".ini",
            ".cfg", ".log", ".ts", ".jsx", ".tsx",
        }
        ext = Path(filename).suffix.lower()
        if ext not in allowed:
            log.warning(f"[SECURITY] İzinsiz uzantı: '{ext}' ({filename})")
            return False
        return True
