"""
core/terminal.py
================
Güvenli terminal komut yöneticisi.

Özellikler:
  - Whitelist tabanlı komut filtresi
  - subprocess ile güvenli çalıştırma
  - stdout / stderr ayrı yakalanır
  - Zaman aşımı (timeout) desteği
  - Çıktı karakter sınırı (memory dostu)
  - Platform algılama (Windows / POSIX)
"""

import platform
import subprocess
import shlex
from pathlib import Path
from typing import Any

from core.logger   import get_logger
from core.security import SecurityManager

log = get_logger(__name__)


class TerminalResult:
    """
    Terminal çalıştırma sonucu.

    Attributes:
        success    : Komut başarıyla tamamlandı mı.
        returncode : Sürecin çıkış kodu.
        stdout     : Standart çıktı.
        stderr     : Hata çıktısı.
        command    : Çalıştırılan komut satırı.
    """

    __slots__ = ("success", "returncode", "stdout", "stderr", "command")

    def __init__(
        self,
        success: bool,
        returncode: int,
        stdout: str,
        stderr: str,
        command: str,
    ) -> None:
        self.success    = success
        self.returncode = returncode
        self.stdout     = stdout
        self.stderr     = stderr
        self.command    = command

    def to_dict(self) -> dict[str, Any]:
        return {
            "success"   : self.success,
            "returncode": self.returncode,
            "stdout"    : self.stdout,
            "stderr"    : self.stderr,
            "command"   : self.command,
        }

    def __repr__(self) -> str:
        status = "OK" if self.success else f"ERR({self.returncode})"
        return f"<TerminalResult {status} cmd='{self.command[:40]}'>"


class TerminalManager:
    """
    Güvenli terminal komut çalıştırıcı.

    SecurityManager ile entegre çalışır;
    whitelist ve injection kontrolü burada yapılır.
    """

    MAX_OUTPUT_CHARS: int = 4_000    # Bellek dostu çıktı limiti
    IS_WINDOWS: bool      = platform.system() == "Windows"

    def __init__(self, config: dict, security: SecurityManager) -> None:
        """
        Args:
            config  : brain.json yapılandırması (allowed_terminal_commands dahil).
            security: SecurityManager örneği.
        """
        self.config   = config
        self.security = security
        self.timeout  = config.get("command_timeout", 30)
        self.whitelist: list[str] = config.get("allowed_terminal_commands", [])
        log.info(
            f"TerminalManager başlatıldı. "
            f"Whitelist: {len(self.whitelist)} komut | "
            f"Timeout: {self.timeout}s"
        )

    # ─── Çalıştır ────────────────────────────────────────────

    def execute(self, command: str) -> TerminalResult:
        """
        Komutu güvenlik kontrolünden geçirip çalıştır.

        Args:
            command: Ham komut satırı.

        Returns:
            TerminalResult nesnesi.
        """
        # 1. Güvenlik doğrulaması
        ok, reason = self.security.validate_terminal_command(command, self.whitelist)
        if not ok:
            log.warning(f"[SECURITY] Terminal komutu reddedildi: '{command}' | Sebep: {reason}")
            return TerminalResult(
                success    = False,
                returncode = -1,
                stdout     = "",
                stderr     = reason,
                command    = command,
            )

        # 2. Workspace dizinini çalışma dizini olarak kullan
        cwd = str(self.security.workspace_dir)

        # 3. Komutu çalıştır
        try:
            log.info(f"Terminal komutu çalıştırılıyor: '{command}'")

            if self.IS_WINDOWS:
                # Windows: shell=True ile cmd.exe üzerinden
                args = command
                shell = True
            else:
                # POSIX: shlex ile güvenli parse
                args  = shlex.split(command)
                shell = False

            proc = subprocess.run(
                args,
                capture_output = True,
                text           = True,
                timeout        = self.timeout,
                cwd            = cwd,
                shell          = shell,
                encoding       = "utf-8",
                errors         = "replace",
            )

            stdout = self._trim(proc.stdout)
            stderr = self._trim(proc.stderr)
            ok     = proc.returncode == 0

            if ok:
                log.info(f"Komut tamamlandı (rc=0): '{command}'")
            else:
                log.warning(f"Komut hatayla bitti (rc={proc.returncode}): '{command}'")

            return TerminalResult(
                success    = ok,
                returncode = proc.returncode,
                stdout     = stdout,
                stderr     = stderr,
                command    = command,
            )

        except subprocess.TimeoutExpired:
            log.error(f"Komut zaman aşımına uğradı ({self.timeout}s): '{command}'")
            return TerminalResult(
                success    = False,
                returncode = -2,
                stdout     = "",
                stderr     = f"Zaman aşımı: komut {self.timeout} saniyede tamamlanamadı.",
                command    = command,
            )
        except FileNotFoundError:
            log.error(f"Komut bulunamadı: '{command}'")
            return TerminalResult(
                success    = False,
                returncode = -3,
                stdout     = "",
                stderr     = f"Komut bulunamadı: '{command.split()[0]}'",
                command    = command,
            )
        except Exception as exc:
            log.error(f"Terminal beklenmeyen hata: {exc}", exc_info=True)
            return TerminalResult(
                success    = False,
                returncode = -99,
                stdout     = "",
                stderr     = f"Beklenmeyen hata: {exc}",
                command    = command,
            )

    # ─── Yardımcılar ─────────────────────────────────────────

    def _trim(self, text: str) -> str:
        """
        Çıktıyı MAX_OUTPUT_CHARS ile sınırla.

        Args:
            text: Ham çıktı.

        Returns:
            Kırpılmış metin + bildirim satırı (gerekirse).
        """
        if len(text) <= self.MAX_OUTPUT_CHARS:
            return text.strip()
        trimmed = text[: self.MAX_OUTPUT_CHARS].strip()
        return trimmed + f"\n\n... [Çıktı {len(text)} karakter, ilk {self.MAX_OUTPUT_CHARS} gösteriliyor]"

    def get_whitelist(self) -> list[str]:
        """İzin verilen komutlar listesini döndür."""
        return list(self.whitelist)

    def add_to_whitelist(self, command: str) -> None:
        """
        Çalışma zamanında whitelist'e yeni komut ekle.

        Args:
            command: Eklenecek komut adı (örn. 'npm').
        """
        cmd = command.lower().strip()
        if cmd not in self.whitelist:
            self.whitelist.append(cmd)
            log.info(f"Whitelist güncellendi, eklendi: '{cmd}'")
