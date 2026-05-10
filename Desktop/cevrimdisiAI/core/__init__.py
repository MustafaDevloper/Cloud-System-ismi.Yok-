"""
core/__init__.py
================
ARIA çekirdek modülleri paketi.

Tüm core modülleri buradan import edilebilir:
    from core import Brain, CommandParser, ActionEngine, ...
"""

from core.brain     import Brain
from core.parser    import CommandParser
from core.actions   import ActionEngine
from core.memory    import MemorySystem
from core.security  import SecurityManager, SecurityError
from core.terminal  import TerminalManager, TerminalResult
from core.templates import TemplateEngine
from core.logger    import setup_logger, get_logger

__all__ = [
    "Brain",
    "CommandParser",
    "ActionEngine",
    "MemorySystem",
    "SecurityManager",
    "SecurityError",
    "TerminalManager",
    "TerminalResult",
    "TemplateEngine",
    "setup_logger",
    "get_logger",
]

__version__ = "1.0.0"
__author__  = "ARIA System"
