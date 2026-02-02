from flask import Blueprint, jsonify

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return jsonify({'message': 'Kotomare API funcionando!'})

@bp.route('/api/health')
def health():
    return jsonify({'status': 'ok'})
