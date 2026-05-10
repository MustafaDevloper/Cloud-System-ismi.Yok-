"""
plugins/hesap_makinesi.py
==========================
Örnek ARIA plugin'i: Basit hesap makinesi.

Özellikler:
  - Toplama, çıkarma, çarpma, bölme
  - Güvenli eval (ast.literal_eval)
  - Matematiksel ifade değerlendirme

Kullanım:
  "hesapla 5 + 3"
  "hesapla 10 * 2"
  "hesapla (15 + 5) / 2"
"""

import ast
import operator
import re
from typing import Any

from core.logger import get_logger

log = get_logger(__name__)

# ─── Güvenli Operatörler ─────────────────────────────────────
SAFE_OPERATORS = {
    ast.Add     : operator.add,
    ast.Sub     : operator.sub,
    ast.Mult    : operator.mul,
    ast.Div     : operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod     : operator.mod,
    ast.Pow     : operator.pow,
    ast.USub    : operator.neg,
    ast.UAdd    : operator.pos,
}


def safe_eval(expr: str) -> float:
    """
    Matematiksel ifadeyi güvenli şekilde değerlendir.
    Yalnızca sayılar ve temel operatörler desteklenir.

    Args:
        expr: Matematiksel ifade (örn. "5 + 3 * 2").

    Returns:
        Sonuç (float).

    Raises:
        ValueError: Geçersiz ifade veya desteklenmeyen operatör.
    """
    # Boşlukları temizle
    expr = expr.strip()

    # Güvenlik: yalnızca sayı, operatör ve parantez
    if not re.match(r'^[\d\s\+\-\*\/\(\)\.\%\*\*]+$', expr):
        raise ValueError("Geçersiz karakter içeriyor. Yalnızca sayı ve operatör kullanın.")

    try:
        node = ast.parse(expr, mode='eval').body
        return _eval_node(node)
    except Exception as exc:
        raise ValueError(f"İfade değerlendirilemedi: {exc}")


def _eval_node(node: ast.AST) -> float:
    """AST node'unu özyinelemeli olarak değerlendir."""
    if isinstance(node, ast.Constant):  # Python 3.8+
        return float(node.value)
    elif isinstance(node, ast.Num):     # Python 3.7 uyumluluğu
        return float(node.n)
    elif isinstance(node, ast.BinOp):
        left  = _eval_node(node.left)
        right = _eval_node(node.right)
        op    = SAFE_OPERATORS.get(type(node.op))
        if op is None:
            raise ValueError(f"Desteklenmeyen operatör: {type(node.op).__name__}")
        return op(left, right)
    elif isinstance(node, ast.UnaryOp):
        operand = _eval_node(node.operand)
        op      = SAFE_OPERATORS.get(type(node.op))
        if op is None:
            raise ValueError(f"Desteklenmeyen unary operatör: {type(node.op).__name__}")
        return op(operand)
    else:
        raise ValueError(f"Desteklenmeyen node tipi: {type(node).__name__}")


# ─── Action Handler ──────────────────────────────────────────

def _calculator_action(intent: dict, raw: str) -> dict:
    """
    Hesap makinesi action handler'ı.

    Args:
        intent: Parser'dan gelen intent dict'i.
        raw   : Ham kullanıcı girdisi.

    Returns:
        Result dict.
    """
    # "hesapla" kelimesinden sonraki kısmı al
    expr = raw.lower().replace("hesapla", "").strip()
    if not expr:
        return {"output": "Hesaplanacak ifadeyi belirtin. Örn: hesapla 5 + 3"}

    try:
        result = safe_eval(expr)
        # Tam sayı ise .0 gösterme
        if result == int(result):
            result = int(result)
        log.info(f"Hesaplama: '{expr}' = {result}")
        return {"output": f"📊 {expr} = {result}"}
    except ValueError as exc:
        log.warning(f"Hesaplama hatası: {exc}")
        return {"error": f"Hesaplama hatası: {exc}"}
    except ZeroDivisionError:
        return {"error": "Sıfıra bölme hatası!"}


# ─── Plugin Kayıt ────────────────────────────────────────────

def register(brain: Any, actions: Any) -> None:
    """
    Plugin'i ARIA sistemine kaydet.

    Args:
        brain  : Brain örneği.
        actions: ActionEngine örneği.
    """
    # Yeni komut ekle
    brain.register_command({
        "id"      : "calculator",
        "keywords": ["hesapla", "hesap", "toplam", "çarp", "böl", "çıkar"],
        "action"  : "calculator",
        "priority": 3,
    })

    # Action handler'ı kaydet
    actions.register("calculator", _calculator_action)

    log.info("Plugin kaydedildi: hesap_makinesi")
