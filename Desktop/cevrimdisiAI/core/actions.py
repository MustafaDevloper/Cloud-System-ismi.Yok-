"""
core/actions.py  —  ARIA Action Engine
Tüm action handler'larını barındırır.
"""

import os
import sys
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from core.brain     import Brain
from core.memory    import MemorySystem
from core.security  import SecurityManager, SecurityError
from core.terminal  import TerminalManager
from core.templates import TemplateEngine
from core.logger    import get_logger

log = get_logger(__name__)

# ── ANSI ──────────────────────────────────────────────────────
R  = "\033[0m"
G  = "\033[92m"
Y  = "\033[93m"
C  = "\033[96m"
M  = "\033[95m"
B  = "\033[1m"

OK   = f"{G}✓{R}"
FAIL = f"{Y}✗{R}"


class ActionEngine:
    """
    intent dict → handler çağrısı → result dict

    Result yapısı:
        {"output": str}           → normal çıktı
        {"error":  str}           → hata mesajı
        {"exit":   True}          → programı kapat
    """

    def __init__(
        self,
        root_dir : Path,
        brain    : Brain,
        memory   : MemorySystem,
        terminal : TerminalManager,
        security : SecurityManager,
    ) -> None:
        self.root_dir  = root_dir
        self.brain     = brain
        self.memory    = memory
        self.terminal  = terminal
        self.security  = security
        self.workspace = security.workspace_dir
        self.templates = TemplateEngine(root_dir / "templates")

        # action_id → handler
        self._handlers: dict[str, Any] = {
            "respond"         : self._respond,
            "exit_agent"      : self._exit,
            "show_help"       : self._show_help,
            "clear_screen"    : self._clear_screen,
            "create_html"     : self._create_html,
            "create_python"   : self._create_python,
            "create_flask"    : self._create_flask,
            "create_css"      : self._create_css,
            "create_portfolio": self._create_portfolio,
            "create_discord_bot": self._create_discord_bot,
            "create_file"     : self._create_file,
            "read_file"       : self._read_file,
            "delete_file"     : self._delete_file,
            "edit_file"       : self._edit_file,
            "list_files"      : self._list_files,
            "terminal_execute": self._terminal_execute,
            "show_memory"     : self._show_memory,
            "save_memory"     : self._save_memory,
            "clear_memory"    : self._clear_memory,
            "show_history"    : self._show_history,
            "system_info"     : self._system_info,
            "list_plugins"    : self._list_plugins,
            "unknown"         : self._unknown,
        }

    # ── Dispatch ──────────────────────────────────────────────

    def execute(self, intent: dict, raw: str) -> dict:
        action = intent.get("action", "unknown")
        handler = self._handlers.get(action, self._unknown)
        try:
            return handler(intent, raw)
        except SecurityError as e:
            log.warning(f"[SECURITY] {e}")
            return {"error": f"🔒 Güvenlik engeli: {e}"}
        except Exception as e:
            log.error(f"Action hatası [{action}]: {e}", exc_info=True)
            return {"error": f"Beklenmeyen hata: {e}"}

    def register(self, action_id: str, handler) -> None:
        """Plugin'ler yeni action ekler."""
        self._handlers[action_id] = handler
        log.info(f"Yeni action kaydedildi: {action_id}")

    # ── Temel ─────────────────────────────────────────────────

    def _respond(self, intent: dict, raw: str) -> dict:
        key = intent.get("response_key", "greeting")
        return {"output": self.brain.get_response(key)}

    def _exit(self, intent: dict, raw: str) -> dict:
        return {"exit": True}

    def _clear_screen(self, intent: dict, raw: str) -> dict:
        os.system("cls" if sys.platform == "win32" else "clear")
        return {"output": "Ekran temizlendi."}

    def _unknown(self, intent: dict, raw: str) -> dict:
        return {"output": self.brain.get_response("unknown")}

    # ── Yardım ────────────────────────────────────────────────

    def _show_help(self, intent: dict, raw: str) -> dict:
        lines = [
            f"\n{C}{B}ARIA — Komut Referansı{R}",
            f"{'─'*50}",
            f"{G}Dosya İşlemleri:{R}",
            "  dosya oluştur <ad>    → Yeni dosya",
            "  dosya oku <ad>        → Dosya içeriği",
            "  dosya sil <ad>        → Dosya sil",
            "  dosya düzenle <ad>    → Dosya düzenle",
            "  dosyaları listele     → Workspace listesi",
            f"{G}Şablon Üretimi:{R}",
            "  html oluştur          → Temel HTML5",
            "  portfolio             → Portfolio HTML",
            "  python kodu oluştur   → Python script",
            "  flask api             → Flask REST API",
            "  css oluştur           → CSS stylesheet",
            "  discord bot           → Discord bot iskelet",
            f"{G}Terminal:{R}",
            "  terminal çalıştır <komut>",
            f"{G}Hafıza:{R}",
            "  belleği göster / kaydet / sil",
            "  geçmişi göster",
            f"{G}Sistem:{R}",
            "  sistem bilgisi | pluginler | ekranı temizle",
            "  merhaba / güle güle",
            f"{'─'*50}",
        ]
        return {"output": "\n".join(lines)}

    # ── Şablon Dosyası Yardımcısı ─────────────────────────────

    def _write_workspace(self, filename: str, content: str) -> str:
        """Dosyayı workspace'e güvenli yaz, yol döndür."""
        path = self.security.safe_path(filename)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        log.info(f"Dosya yazıldı: {path}")
        return str(path)

    def _ask_filename(self, intent: dict, default: str) -> str:
        fn = intent["params"].get("filename")
        if fn:
            return fn
        quoted = intent["params"].get("quoted", [])
        return quoted[0] if quoted else default

    # ── HTML ──────────────────────────────────────────────────

    def _create_html(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, "index.html")
        html = self._html_basic(name.replace(".html","").replace("-"," ").title())
        path = self._write_workspace(name, html)
        return {"output": f"{OK} HTML oluşturuldu → {path}"}

    def _create_portfolio(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, "portfolio.html")
        html = self._html_portfolio()
        path = self._write_workspace(name, html)
        return {"output": f"{OK} Portfolio HTML oluşturuldu → {path}"}

    # ── Python ────────────────────────────────────────────────

    def _create_python(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, "script.py")
        if not name.endswith(".py"):
            name += ".py"
        code = self._py_basic(name)
        path = self._write_workspace(name, code)
        return {"output": f"{OK} Python dosyası oluşturuldu → {path}"}

    # ── Flask ─────────────────────────────────────────────────

    def _create_flask(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, "app.py")
        code = self._py_flask()
        path = self._write_workspace(name, code)
        return {"output": f"{OK} Flask API oluşturuldu → {path}\n  pip install flask  →  python {name}"}

    # ── CSS ───────────────────────────────────────────────────

    def _create_css(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, "style.css")
        css = self._css_basic()
        path = self._write_workspace(name, css)
        return {"output": f"{OK} CSS oluşturuldu → {path}"}

    # ── Discord Bot ───────────────────────────────────────────

    def _create_discord_bot(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, "bot.py")
        code = self._py_discord()
        path = self._write_workspace(name, code)
        return {"output": f"{OK} Discord bot oluşturuldu → {path}\n  pip install discord.py  →  python {name}"}

    # ── Dosya CRUD ────────────────────────────────────────────

    def _create_file(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, None)
        if not name:
            return {"output": "Dosya adını belirtin. Örn: dosya oluştur notlar.txt"}
        quoted = intent["params"].get("quoted", [])
        content = quoted[0] if quoted else ""
        path = self._write_workspace(name, content)
        return {"output": f"{OK} Dosya oluşturuldu → {path}"}

    def _read_file(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, None)
        if not name:
            return {"output": "Dosya adını belirtin. Örn: dosya oku notlar.txt"}
        path = self.security.safe_path(name)
        if not path.exists():
            return {"error": f"Dosya bulunamadı: {name}"}
        content = path.read_text(encoding="utf-8", errors="replace")
        if len(content) > 3000:
            content = content[:3000] + "\n... [devamı kırpıldı]"
        return {"output": f"📄 {name}:\n{'─'*40}\n{content}"}

    def _delete_file(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, None)
        if not name:
            return {"output": "Dosya adını belirtin. Örn: dosya sil notlar.txt"}
        path = self.security.safe_path(name)
        if not path.exists():
            return {"error": f"Dosya bulunamadı: {name}"}
        path.unlink()
        log.info(f"Dosya silindi: {path}")
        return {"output": f"{OK} Silindi: {name}"}

    def _edit_file(self, intent: dict, raw: str) -> dict:
        name = self._ask_filename(intent, None)
        if not name:
            return {"output": "Dosya adını belirtin. Örn: dosya düzenle notlar.txt \"yeni içerik\""}
        quoted = intent["params"].get("quoted", [])
        if not quoted:
            return {"output": "Yeni içeriği tırnak içinde belirtin. Örn: dosya düzenle test.txt \"merhaba\""}
        path = self.security.safe_path(name)
        path.write_text(quoted[0], encoding="utf-8")
        return {"output": f"{OK} Düzenlendi: {name}"}

    def _list_files(self, intent: dict, raw: str) -> dict:
        files = list(self.workspace.rglob("*"))
        if not files:
            return {"output": "Workspace boş."}
        lines = [f"\n{C}Workspace → {self.workspace}{R}"]
        for f in sorted(files):
            rel = f.relative_to(self.workspace)
            size = f"{f.stat().st_size:,} B" if f.is_file() else "klasör"
            icon = "📄" if f.is_file() else "📁"
            lines.append(f"  {icon} {rel}  ({size})")
        return {"output": "\n".join(lines)}

    # ── Terminal ──────────────────────────────────────────────

    def _terminal_execute(self, intent: dict, raw: str) -> dict:
        # Komut kısmını çıkar: "terminal çalıştır dir" → "dir"
        for kw in ["terminal çalıştır", "komut çalıştır", "terminal", "çalıştır"]:
            if kw in raw.lower():
                cmd = raw[raw.lower().index(kw) + len(kw):].strip()
                break
        else:
            cmd = intent["params"].get("extra_text", "").strip()

        if not cmd:
            return {"output": "Çalıştırılacak komutu belirtin. Örn: terminal çalıştır dir"}

        result = self.terminal.execute(cmd)
        out = []
        if result.stdout:
            out.append(f"{G}[stdout]{R}\n{result.stdout}")
        if result.stderr:
            out.append(f"{Y}[stderr]{R}\n{result.stderr}")
        if not out:
            out.append(f"{OK} Komut tamamlandı (çıktı yok).")
        return {"output": "\n".join(out)}

    # ── Hafıza ────────────────────────────────────────────────

    def _show_memory(self, intent: dict, raw: str) -> dict:
        data = self.memory.dump()
        formatted = json.dumps(data, ensure_ascii=False, indent=2)
        stats = self.memory.get_stats()
        header = (
            f"\n{C}Hafıza Durumu{R}\n{'─'*40}\n"
            f"Toplam oturum : {stats['total_sessions']}\n"
            f"Toplam komut  : {stats['total_commands']}\n"
            f"Not sayısı    : {stats['notes_count']}\n"
            f"{'─'*40}\n"
        )
        return {"output": header + formatted}

    def _save_memory(self, intent: dict, raw: str) -> dict:
        quoted = intent["params"].get("quoted", [])
        extra  = intent["params"].get("extra_text", "").strip()
        # "bunu hatırla: ..." veya "hatırla 'not metni'"
        note_text = quoted[0] if quoted else extra
        for kw in ["belleği kaydet", "hatırla", "bunu kaydet", "bunu hatırla", "kaydet"]:
            note_text = note_text.replace(kw, "").strip()
        if note_text:
            self.memory.add_note(note_text)
            return {"output": f"{OK} Not kaydedildi: {note_text}"}
        return {"output": "Ne kaydetmek istediğinizi belirtin. Örn: hatırla \"toplantı saat 3\""}

    def _clear_memory(self, intent: dict, raw: str) -> dict:
        self.memory.clear_all()
        return {"output": f"{OK} Hafıza sıfırlandı."}

    def _show_history(self, intent: dict, raw: str) -> dict:
        entries = self.memory.get_history(limit=15)
        if not entries:
            return {"output": "Geçmiş boş."}
        lines = [f"\n{C}Son {len(entries)} Komut{R}\n{'─'*40}"]
        for i, e in enumerate(entries, 1):
            ts  = e.get("timestamp", "")[:19].replace("T", " ")
            cmd = e.get("command", "")[:60]
            act = e.get("action", "")
            lines.append(f"  {i:>2}. [{ts}] {cmd}  →  {act}")
        return {"output": "\n".join(lines)}

    # ── Sistem ────────────────────────────────────────────────

    def _system_info(self, intent: dict, raw: str) -> dict:
        import platform
        stats = self.memory.get_stats()
        info = [
            f"\n{C}{B}ARIA v1.0.0{R}",
            f"{'─'*40}",
            f"Platform  : {platform.system()} {platform.release()}",
            f"Python    : {sys.version.split()[0]}",
            f"Workspace : {self.workspace}",
            f"Session   : {stats['session_id']}",
            f"Oturum komut : {stats['session_commands']}",
            f"Toplam komut : {stats['total_commands']}",
            f"{'─'*40}",
        ]
        return {"output": "\n".join(info)}

    def _list_plugins(self, intent: dict, raw: str) -> dict:
        plugin_dir = self.root_dir / "plugins"
        plugins = [p.name for p in plugin_dir.glob("*.py") if not p.name.startswith("_")]
        if not plugins:
            return {"output": "Yüklü plugin yok. plugins/ klasörüne .py dosyası ekleyin."}
        lines = [f"\n{C}Yüklü Plugin'ler{R}\n{'─'*30}"]
        for p in plugins:
            lines.append(f"  🔌 {p}")
        return {"output": "\n".join(lines)}

    # ═══════════════════════════════════════════════════════════
    # İÇ ŞABLONLAr  (templates/ olmasa da çalışır)
    # ═══════════════════════════════════════════════════════════

    @staticmethod
    def _html_basic(title: str = "ARIA Sayfası") -> str:
        return f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f0f1a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }}
    h1 {{ font-size: 2.5rem; color: #7c3aed; margin-bottom: .5rem; }}
    p  {{ color: #94a3b8; }}
  </style>
</head>
<body>
  <h1>{title}</h1>
  <p>ARIA tarafından oluşturuldu.</p>
</body>
</html>
"""

    @staticmethod
    def _html_portfolio() -> str:
        return """<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0a16; --surface: #12122a; --accent: #7c3aed;
      --text: #e2e8f0; --muted: #64748b;
    }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: var(--text); }
    header {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center; padding: 2rem;
      background: radial-gradient(ellipse at top, #1e1b4b 0%, var(--bg) 70%);
    }
    header h1 { font-size: 3.5rem; font-weight: 800; color: var(--accent); }
    header p  { margin-top: .75rem; color: var(--muted); font-size: 1.2rem; }
    .btn {
      margin-top: 2rem; padding: .8rem 2rem; background: var(--accent);
      color: #fff; border: none; border-radius: 9999px;
      font-size: 1rem; cursor: pointer; text-decoration: none;
      transition: opacity .2s;
    }
    .btn:hover { opacity: .8; }
    section { max-width: 900px; margin: 4rem auto; padding: 0 1.5rem; }
    section h2 { font-size: 1.8rem; color: var(--accent); margin-bottom: 1.5rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem; }
    .card {
      background: var(--surface); border-radius: .75rem; padding: 1.5rem;
      border: 1px solid #1e1b4b; transition: transform .2s;
    }
    .card:hover { transform: translateY(-4px); }
    .card h3 { color: var(--accent); margin-bottom: .5rem; }
    footer { text-align: center; padding: 2rem; color: var(--muted); font-size: .85rem; }
  </style>
</head>
<body>
  <header>
    <h1>Merhaba, Ben {İsim}</h1>
    <p>Full-Stack Geliştirici &amp; Tasarımcı</p>
    <a href="#projeler" class="btn">Projelerimi Gör</a>
  </header>

  <section id="projeler">
    <h2>Projeler</h2>
    <div class="cards">
      <div class="card">
        <h3>Proje 1</h3>
        <p>Açıklama buraya gelecek.</p>
      </div>
      <div class="card">
        <h3>Proje 2</h3>
        <p>Açıklama buraya gelecek.</p>
      </div>
      <div class="card">
        <h3>Proje 3</h3>
        <p>Açıklama buraya gelecek.</p>
      </div>
    </div>
  </section>

  <footer>ARIA tarafından oluşturuldu &copy; 2025</footer>
</body>
</html>
"""

    @staticmethod
    def _py_basic(name: str = "script.py") -> str:
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return f'''#!/usr/bin/env python3
"""
{name}
Oluşturulma: {ts}
ARIA tarafından üretildi.
"""


def main() -> None:
    """Ana fonksiyon."""
    print("Merhaba, Dünya!")


if __name__ == "__main__":
    main()
'''

    @staticmethod
    def _py_flask() -> str:
        return '''#!/usr/bin/env python3
"""
Flask REST API — ARIA tarafından oluşturuldu.
Kurulum : pip install flask
Çalıştır: python app.py
"""

from flask import Flask, jsonify, request

app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "ok", "message": "ARIA Flask API"})


@app.route("/api/echo", methods=["POST"])
def echo():
    data = request.get_json(silent=True) or {}
    return jsonify({"echo": data})


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Bulunamadı"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
'''

    @staticmethod
    def _css_basic() -> str:
        return """/* ───── ARIA CSS Şablonu ───── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg      : #0f0f1a;
  --surface : #16213e;
  --accent  : #7c3aed;
  --text    : #e2e8f0;
  --muted   : #64748b;
  --radius  : .75rem;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background : var(--bg);
  color      : var(--text);
  line-height: 1.6;
}

/* ── Navbar ── */
nav {
  display        : flex;
  align-items    : center;
  justify-content: space-between;
  padding        : 1rem 2rem;
  background     : var(--surface);
  border-bottom  : 1px solid #1e293b;
  position       : sticky;
  top            : 0;
  z-index        : 100;
}

nav .logo { font-weight: 700; font-size: 1.25rem; color: var(--accent); }

nav ul { list-style: none; display: flex; gap: 1.5rem; }

nav a {
  color          : var(--text);
  text-decoration: none;
  font-size      : .95rem;
  transition     : color .2s;
}
nav a:hover { color: var(--accent); }

/* ── Buton ── */
.btn {
  padding    : .6rem 1.4rem;
  background : var(--accent);
  color      : #fff;
  border     : none;
  border-radius: var(--radius);
  cursor     : pointer;
  font-size  : .9rem;
  transition : opacity .2s, transform .15s;
}
.btn:hover  { opacity: .85; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }

/* ── Kart ── */
.card {
  background   : var(--surface);
  border-radius: var(--radius);
  padding      : 1.5rem;
  border       : 1px solid #1e293b;
  transition   : transform .2s, box-shadow .2s;
}
.card:hover {
  transform  : translateY(-4px);
  box-shadow : 0 8px 24px rgba(124,58,237,.15);
}
"""

    @staticmethod
    def _py_discord() -> str:
        return '''#!/usr/bin/env python3
"""
Discord Bot — ARIA tarafından oluşturuldu.
Kurulum : pip install discord.py
Çalıştır: python bot.py
"""

import discord
from discord.ext import commands

TOKEN = "BURAYA_BOT_TOKEN_GIRIN"

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)


@bot.event
async def on_ready():
    print(f"Bot hazır: {bot.user} (ID: {bot.user.id})")


@bot.command(name="ping")
async def ping(ctx):
    """Bota ping atar."""
    await ctx.send(f"Pong! {round(bot.latency * 1000)}ms")


@bot.command(name="merhaba")
async def hello(ctx):
    await ctx.send(f"Merhaba {ctx.author.mention}!")


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        await ctx.send("Bilinmeyen komut. `!help` yazın.")


if __name__ == "__main__":
    bot.run(TOKEN)
'''
