#!/usr/bin/env python3
"""
{app_name} - Flask REST API
ARIA tarafından oluşturuldu.

Kurulum:
  pip install -r requirements.txt

Çalıştırma:
  python app.py
"""

import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

# ─── Uygulama Yapılandırması ─────────────────────────────────

app = Flask(__name__)
CORS(app)  # Cross-Origin Resource Sharing

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ─── Routes ──────────────────────────────────────────────────

@app.route('/', methods=['GET'])
def index():
    """Ana endpoint - API bilgisi."""
    return jsonify({
        'status': 'ok',
        'app': '{app_name}',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'endpoints': {
            'GET  /': 'API bilgisi',
            'GET  /health': 'Sağlık kontrolü',
            'POST /api/echo': 'Echo servisi',
            'GET  /api/data': 'Örnek veri',
        }
    })


@app.route('/health', methods=['GET'])
def health():
    """Sağlık kontrolü endpoint'i."""
    return jsonify({'status': 'healthy'}), 200


@app.route('/api/echo', methods=['POST'])
def echo():
    """
    Gönderilen veriyi geri döndürür.
    
    Body:
        {
            "message": "test"
        }
    """
    data = request.get_json(silent=True) or {}
    logger.info(f"Echo request: {data}")
    return jsonify({
        'echo': data,
        'timestamp': datetime.utcnow().isoformat()
    })


@app.route('/api/data', methods=['GET'])
def get_data():
    """Örnek veri endpoint'i."""
    sample_data = [
        {'id': 1, 'name': 'Item 1', 'value': 100},
        {'id': 2, 'name': 'Item 2', 'value': 200},
        {'id': 3, 'name': 'Item 3', 'value': 300},
    ]
    return jsonify({
        'status': 'ok',
        'data': sample_data,
        'count': len(sample_data)
    })


# ─── Error Handlers ──────────────────────────────────────────

@app.errorhandler(404)
def not_found(error):
    """404 hatası."""
    return jsonify({
        'error': 'Not Found',
        'message': 'İstenen kaynak bulunamadı.'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """500 hatası."""
    logger.error(f"Internal error: {error}")
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'Sunucu hatası oluştu.'
    }), 500


@app.errorhandler(400)
def bad_request(error):
    """400 hatası."""
    return jsonify({
        'error': 'Bad Request',
        'message': 'Geçersiz istek.'
    }), 400


# ─── Ana Çalıştırma ──────────────────────────────────────────

if __name__ == '__main__':
    port = {port}
    logger.info(f"{app_name} başlatılıyor... Port: {port}")
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )
