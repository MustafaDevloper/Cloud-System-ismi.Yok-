"""
core/templates.py
=================
Template yönetim motoru.

Özellikler:
  - templates/ klasöründen şablon dosyaları okur
  - Placeholder ({title}, {author} vb.) değiştirme
  - Şablon listesi ve meta veri desteği
  - Yeni şablon kaydetme
"""

import json
from pathlib import Path
from typing import Any, Optional

from core.logger import get_logger

log = get_logger(__name__)


class TemplateEngine:
    """
    Dosya şablonlarını yükleyip placeholder'ları dolduran motor.

    Her şablon 'templates/<isim>/' klasöründe tutulur.
    Klasörde bir 'meta.json' ve bir veya daha fazla şablon dosyası bulunur.

    meta.json örneği:
    {
        "name"       : "basic_html",
        "description": "Temel HTML5 şablonu",
        "files"      : ["index.html"],
        "placeholders": ["title", "author"]
    }
    """

    def __init__(self, templates_dir: Path) -> None:
        """
        Args:
            templates_dir: 'templates/' klasörünün tam yolu.
        """
        self.templates_dir = templates_dir
        templates_dir.mkdir(parents=True, exist_ok=True)
        log.info(f"TemplateEngine başlatıldı: {templates_dir}")

    # ─── Listeleme ────────────────────────────────────────────

    def list_templates(self) -> list[dict[str, str]]:
        """
        Mevcut tüm şablonları listele.

        Returns:
            [{"name": ..., "description": ..., "files": ...}, ...]
        """
        result = []
        for meta_file in sorted(self.templates_dir.glob("*/meta.json")):
            try:
                with open(meta_file, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                result.append({
                    "name"       : meta.get("name", meta_file.parent.name),
                    "description": meta.get("description", "—"),
                    "files"      : ", ".join(meta.get("files", [])),
                })
            except Exception as exc:
                log.warning(f"meta.json okunamadı: {meta_file} | {exc}")
        return result

    # ─── Şablon Yükleme ──────────────────────────────────────

    def load(
        self,
        template_name: str,
        placeholders: Optional[dict[str, str]] = None,
    ) -> dict[str, str]:
        """
        Şablonu yükle ve placeholder'ları doldur.

        Args:
            template_name: Şablon klasör adı (örn. 'basic_html').
            placeholders : {placeholder_adi: deger} eşlemesi.

        Returns:
            {dosya_adi: icerik} sözlüğü.

        Raises:
            FileNotFoundError: Şablon bulunamazsa.
        """
        template_dir = self.templates_dir / template_name
        if not template_dir.is_dir():
            raise FileNotFoundError(f"Şablon bulunamadı: '{template_name}'")

        meta_file = template_dir / "meta.json"
        if not meta_file.exists():
            raise FileNotFoundError(f"meta.json eksik: {meta_file}")

        with open(meta_file, "r", encoding="utf-8") as f:
            meta: dict = json.load(f)

        files_to_load: list[str] = meta.get("files", [])
        result: dict[str, str]   = {}
        ph = placeholders or {}

        for filename in files_to_load:
            file_path = template_dir / filename
            if not file_path.exists():
                log.warning(f"Şablon dosyası eksik: {file_path}")
                continue
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            # Placeholder ikame
            content = self._fill_placeholders(content, ph)
            result[filename] = content

        log.info(f"Şablon yüklendi: '{template_name}' ({len(result)} dosya)")
        return result

    # ─── Yardımcılar ─────────────────────────────────────────

    @staticmethod
    def _fill_placeholders(content: str, placeholders: dict[str, str]) -> str:
        """
        {key} biçimindeki placeholder'ları değerlerle değiştir.

        Args:
            content     : Şablon içeriği.
            placeholders: Anahtar-değer eşlemesi.

        Returns:
            Doldurulmuş içerik.
        """
        for key, value in placeholders.items():
            content = content.replace(f"{{{key}}}", value)
        return content

    # ─── Şablon Kaydet ───────────────────────────────────────

    def save_template(
        self,
        name: str,
        description: str,
        files: dict[str, str],
    ) -> None:
        """
        Yeni şablon kaydet.

        Args:
            name       : Şablon adı (klasör adı olur).
            description: Açıklama.
            files      : {dosya_adi: icerik} sözlüğü.
        """
        template_dir = self.templates_dir / name
        template_dir.mkdir(parents=True, exist_ok=True)

        for filename, content in files.items():
            (template_dir / filename).write_text(content, encoding="utf-8")

        meta = {
            "name"       : name,
            "description": description,
            "files"      : list(files.keys()),
            "placeholders": [],
        }
        with open(template_dir / "meta.json", "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        log.info(f"Yeni şablon kaydedildi: '{name}'")

    def get_meta(self, template_name: str) -> Optional[dict]:
        """Şablon meta verilerini döndür."""
        meta_file = self.templates_dir / template_name / "meta.json"
        if not meta_file.exists():
            return None
        with open(meta_file, "r", encoding="utf-8") as f:
            return json.load(f)
