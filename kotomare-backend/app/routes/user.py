from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Anime, Favorite, Watchlist

bp = Blueprint('user', __name__)


# ==================== SETTINGS ====================

@bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    """Obtiene la configuración del usuario"""
    user = User.query.get(int(get_jwt_identity()))
    return jsonify({'settings': user.settings})


@bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    """Actualiza la configuración del usuario"""
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400

    # Actualizar settings (merge con existentes)
    current_settings = user.settings or {}
    current_settings.update(data)
    user.settings = current_settings

    db.session.commit()

    return jsonify({
        'message': 'Configuración actualizada',
        'settings': user.settings
    })


# ==================== FAVORITES ====================

@bp.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    """Obtiene los favoritos del usuario"""
    user_id = int(get_jwt_identity())
    favorites = Favorite.query.filter_by(user_id=user_id).all()

    return jsonify({
        'favorites': [f.to_dict() for f in favorites],
        'count': len(favorites)
    })


@bp.route('/favorites/<int:anime_id>', methods=['POST'])
@jwt_required()
def add_favorite(anime_id):
    """Añade un anime a favoritos"""
    user_id = int(get_jwt_identity())

    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    existing = Favorite.query.filter_by(user_id=user_id, anime_id=anime_id).first()
    if existing:
        return jsonify({'error': 'El anime ya está en favoritos'}), 409

    favorite = Favorite(user_id=user_id, anime_id=anime_id)
    db.session.add(favorite)
    db.session.commit()

    return jsonify({
        'message': 'Anime añadido a favoritos',
        'favorite': favorite.to_dict()
    }), 201


@bp.route('/favorites/<int:anime_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(anime_id):
    """Elimina un anime de favoritos"""
    user_id = int(get_jwt_identity())

    favorite = Favorite.query.filter_by(user_id=user_id, anime_id=anime_id).first()
    if not favorite:
        return jsonify({'error': 'El anime no está en favoritos'}), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({'message': 'Anime eliminado de favoritos'})


# ==================== WATCHLIST ====================

@bp.route('/watchlist', methods=['GET'])
@jwt_required()
def get_watchlist():
    """Obtiene la watchlist del usuario"""
    user_id = int(get_jwt_identity())
    status = request.args.get('status')  # Filtrar por status opcional

    query = Watchlist.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)

    entries = query.all()

    return jsonify({
        'watchlist': [e.to_dict() for e in entries],
        'count': len(entries)
    })


@bp.route('/watchlist/<int:anime_id>', methods=['POST'])
@jwt_required()
def add_to_watchlist(anime_id):
    """Añade un anime a la watchlist"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    anime = Anime.query.get(anime_id)
    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    existing = Watchlist.query.filter_by(user_id=user_id, anime_id=anime_id).first()
    if existing:
        return jsonify({'error': 'El anime ya está en la watchlist'}), 409

    status = data.get('status', 'plan_to_watch')
    if status not in Watchlist.VALID_STATUSES:
        return jsonify({'error': f'Status inválido. Válidos: {Watchlist.VALID_STATUSES}'}), 400

    entry = Watchlist(
        user_id=user_id,
        anime_id=anime_id,
        status=status,
        preferred_source=data.get('preferred_source')
    )
    db.session.add(entry)
    db.session.commit()

    return jsonify({
        'message': 'Anime añadido a la watchlist',
        'entry': entry.to_dict()
    }), 201


@bp.route('/watchlist/<int:anime_id>', methods=['PUT'])
@jwt_required()
def update_watchlist_entry(anime_id):
    """Actualiza una entrada de la watchlist"""
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400

    entry = Watchlist.query.filter_by(user_id=user_id, anime_id=anime_id).first()
    if not entry:
        return jsonify({'error': 'El anime no está en la watchlist'}), 404

    if 'status' in data:
        if data['status'] not in Watchlist.VALID_STATUSES:
            return jsonify({'error': f'Status inválido. Válidos: {Watchlist.VALID_STATUSES}'}), 400
        entry.status = data['status']
        if data['status'] == 'completed':
            entry.mark_completed()

    if 'last_episode' in data:
        entry.update_progress(data['last_episode'])

    if 'preferred_source' in data:
        entry.preferred_source = data['preferred_source']

    if 'notes' in data:
        entry.notes = data['notes']

    db.session.commit()

    return jsonify({
        'message': 'Watchlist actualizada',
        'entry': entry.to_dict()
    })


@bp.route('/watchlist/<int:anime_id>', methods=['DELETE'])
@jwt_required()
def remove_from_watchlist(anime_id):
    """Elimina un anime de la watchlist"""
    user_id = get_jwt_identity()

    entry = Watchlist.query.filter_by(user_id=user_id, anime_id=anime_id).first()
    if not entry:
        return jsonify({'error': 'El anime no está en la watchlist'}), 404

    db.session.delete(entry)
    db.session.commit()

    return jsonify({'message': 'Anime eliminado de la watchlist'})
