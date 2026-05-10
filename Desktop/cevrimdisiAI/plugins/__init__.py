"""
plugins/__init__.py
===================
ARIA plugin sistemi paketi.

Plugin'ler otomatik olarak main.py tarafından yüklenir.
Her plugin dosyası bir register() fonksiyonu içermelidir.

Örnek plugin yapısı:
    def register(brain, actions):
        # Yeni komut ekle
        brain.register_command({
            "id": "my_command",
            "keywords": ["özel komut"],
            "action": "my_action",
            "priority": 5
        })
        
        # Yeni action handler ekle
        def my_handler(intent, raw):
            return {"output": "Özel komut çalıştı!"}
        
        actions.register("my_action", my_handler)
"""

__all__ = []
