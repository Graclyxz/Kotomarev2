from flask import Blueprint, jsonify

bp = Blueprint('health', __name__)


@bp.route('/')
def index():
    return jsonify({
        'name': 'Kotomare API',
        'version': '1.0.0',
        'status': 'running'
    })


@bp.route('/api/health')
def health():
    return jsonify({'status': 'ok'})
