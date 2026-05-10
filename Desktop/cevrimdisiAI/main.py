"""
ARIA - Autonomous Rule-based Intelligence Agent
================================================
Ana giriş noktası. Tüm modülleri başlatır ve
terminal döngüsünü yönetir.

Yazar    : ARIA System
Versiyon : 1.0.0
Lisans   : MIT
"""
import os
import sys
import signal

try:
    import readline
except ImportError:
    import pyreadline3 as readline

import atexit
from pathlib import Path
from typing import Optional

ROOT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(ROOT_DIR))

from core.brain    import Brain
from core.parser   import CommandParser
from core.actions  import ActionEngine
from core.memory   import MemorySystem
from core.security import SecurityManager
from core.terminal import TerminalManager
from core.logger   import setup_logger, get_logger

BANNER = r"""
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║    █████╗ ██████╗ ██╗ █████╗                              ║
  ║   ██╔══██╗██╔══██╗██║██╔══██╗                             ║
  ║   ███████║██████╔╝██║███████║                             ║
  ║   ██╔══██║██╔══██╗██║██╔══██║                             ║
  ║   ██║  ██║██║  ██║██║██║  ██║                             ║
  ║   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝                             ║
  ║                                                           ║
  ║   Autonomous Rule-based Intelligence Agent  v1.0.0        ║
  ║   %s Çevrim Dışı Mod | Hazır%s                            ║
  ╚═══════════════════════════════════════════════════════════╝
"""

HISTORY_FILE = ROOT_DIR / ".aria_history"
MAX_HISTORY  = 500

# ─── ANSI Renk Kodları ───────────────────────────────────────
class Colors:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    RED     = "\033[91m"
    GREEN   = "\033[92m"
    YELLOW  = "\033[93m"
    CYAN    = "\033[96m"
    MAGENTA = "\033[95m"
    BLUE    = "\033[94m"
    WHITE   = "\033[97m"
    DIM     = "\033[2m"


def print_banner() -> None:
    """Renkli banner yazdır."""
    try:
        print(Colors.CYAN + Colors.BOLD + BANNER % (Colors.GREEN, Colors.CYAN) + Colors.RESET)
    except Exception:
        print("ARIA - Autonomous Rule-based Intelligence Agent v1.0.0")
        print("Çevrim Dışı Mod | Hazır\n")


def setup_readline() -> None:
    """GNU Readline ayarları: tarih ve otomatik tamamlama."""
    try:
        # Komut geçmişini yükle
        if HISTORY_FILE.exists():
            readline.read_history_file(str(HISTORY_FILE))
        readline.set_history_length(MAX_HISTORY)

        # Programdan çıkışta geçmişi kaydet
        atexit.register(readline.write_history_file, str(HISTORY_FILE))

        # Sekme ile tamamlama (temel)
        readline.parse_and_bind("tab: complete")
    except Exception:
        pass  # Readline yoksa sessizce devam et (Windows uyumluluğu)


def signal_handler(sig: int, frame) -> None:
    """Ctrl+C ile güvenli çıkış."""
    print(f"\n\n{Colors.YELLOW}[ARIA]{Colors.RESET} Çıkış için 'exit' veya 'quit' yazın.")


class ARIAAgent:
    """
    ARIA ana agent sınıfı.
    Tüm alt sistemleri başlatır ve ana döngüyü yönetir.
    """

    def __init__(self) -> None:
        # Temel dizinleri oluştur
        self._ensure_dirs()

        # Logger en önce başlatılmalı
        setup_logger(ROOT_DIR / "logs" / "aria.log")
        self.log = get_logger(__name__)
        self.log.info("ARIA başlatılıyor...")

        # Alt sistemler
        self.security = SecurityManager(ROOT_DIR)
        self.memory   = MemorySystem(ROOT_DIR / "memory")
        self.brain    = Brain(ROOT_DIR / "config" / "brain.json")
        self.terminal = TerminalManager(self.brain.config, self.security)
        self.actions  = ActionEngine(
            root_dir  = ROOT_DIR,
            brain     = self.brain,
            memory    = self.memory,
            terminal  = self.terminal,
            security  = self.security,
        )
        self.parser   = CommandParser(self.brain)

        # Plugin sistemi başlat
        self._load_plugins()

        # Oturum başlat
        self.memory.start_session()
        self.running = True

        self.log.info("ARIA hazır.")

    # ─── İç yardımcılar ──────────────────────────────────────

    def _ensure_dirs(self) -> None:
        """Gerekli dizinleri oluştur."""
        for d in ["logs", "workspace", "plugins", "templates",
                  "memory", "config"]:
            (ROOT_DIR / d).mkdir(parents=True, exist_ok=True)

    def _load_plugins(self) -> None:
        """plugins/ klasöründen tüm plugin'leri yükle."""
        plugin_dir = ROOT_DIR / "plugins"
        loaded = 0

        for plugin_file in plugin_dir.glob("*.py"):
            if plugin_file.name.startswith("_"):
                continue
            try:
                import importlib.util
                spec   = importlib.util.spec_from_file_location(
                    plugin_file.stem, plugin_file
                )
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)

                if hasattr(module, "register"):
                    module.register(self.brain, self.actions)
                    self.log.info(f"Plugin yüklendi: {plugin_file.name}")
                    loaded += 1
                else:
                    self.log.warning(
                        f"Plugin register() içermiyor, atlandı: {plugin_file.name}"
                    )
            except Exception as exc:
                self.log.error(f"Plugin yükleme hatası [{plugin_file.name}]: {exc}")

        if loaded:
            print(f"{Colors.GREEN}[+]{Colors.RESET} {loaded} plugin yüklendi.")

    # ─── Prompt ──────────────────────────────────────────────

    def _prompt(self) -> str:
        """Kullanıcıya göre renkli prompt oluştur."""
        user = self.memory.get("user.name") or "kullanıcı"
        return (
            f"\n{Colors.CYAN}┌─[{Colors.MAGENTA}{Colors.BOLD}ARIA"
            f"{Colors.RESET}{Colors.CYAN}]─[{Colors.GREEN}{user}{Colors.CYAN}]"
            f"\n└─▶ {Colors.WHITE}"
        )

    # ─── Ana Döngü ───────────────────────────────────────────

    def run(self) -> None:
        """Ana etkileşim döngüsü."""
        print_banner()

        # Başlangıç karşılaması
        welcome = self.brain.get_response("greeting")
        print(f"\n{Colors.CYAN}[ARIA]{Colors.RESET} {welcome}\n")

        while self.running:
            try:
                raw_input = input(self._prompt()).strip()
                print(Colors.RESET, end="")

                if not raw_input:
                    continue

                # Alias dönüşümü
                raw_input = self.brain.resolve_alias(raw_input)

                # Komutu parse et
                intent = self.parser.parse(raw_input)
                self.log.debug(f"Intent: {intent}")

                # Geçmişe kaydet
                self.memory.log_command(raw_input, intent.get("action", "unknown"))

                # Action engine'i çalıştır
                result = self.actions.execute(intent, raw_input)

                # Çıktıyı göster
                if result.get("exit"):
                    self.running = False
                elif result.get("output"):
                    print(f"\n{Colors.CYAN}[ARIA]{Colors.RESET} {result['output']}")
                elif result.get("error"):
                    print(f"\n{Colors.RED}[HATA]{Colors.RESET} {result['error']}")

            except KeyboardInterrupt:
                print(f"\n{Colors.YELLOW}[ARIA]{Colors.RESET} Ctrl+C algılandı. Çıkmak için 'exit' yazın.")
            except EOFError:
                # Pipe/stdin kapandı
                self.running = False

        self._shutdown()

    def _shutdown(self) -> None:
        """Temiz kapanış."""
        self.memory.end_session()
        bye = self.brain.get_response("farewell")
        print(f"\n{Colors.CYAN}[ARIA]{Colors.RESET} {bye}\n")
        self.log.info("ARIA kapatıldı.")


# ─── Giriş Noktası ───────────────────────────────────────────

def main() -> None:
    """Program giriş noktası."""
    # Windows'ta ANSI renkleri etkinleştir
    if sys.platform == "win32":
        os.system("")   # VT100 modu

    # Sinyal yöneticisi
    signal.signal(signal.SIGINT, signal_handler)

    # Readline geçmişi
    setup_readline()

    # Agent başlat
    agent = ARIAAgent()
    agent.run()


if __name__ == "__main__":
    main()
