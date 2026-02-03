from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Anime, User
from app.services.anime_service import AnimeService

bp = Blueprint('anime', __name__)


@bp.route('/search', methods=['GET'])
@jwt_required(optional=True)
def search():
    """Busca animes por nombre"""
    query = request.args.get('q', '').strip()

    if not query or len(query) < 3:
        return jsonify({'error': 'La búsqueda debe tener al menos 3 caracteres'}), 400

    # Obtener fuentes activas del usuario (o usar todas por defecto)
    user_id = get_jwt_identity()
    sources = None

    if user_id:
        user = User.query.get(user_id)
        if user and user.settings:
            sources = user.settings.get('sources')

    results = AnimeService.search(query, sources=sources)

    return jsonify({
        'query': query,
        'results': results,
        'count': len(results)
    })


@bp.route('/<slug>', methods=['GET'])
def get_anime(slug):
    """Obtiene el detalle de un anime por su slug"""
    anime = Anime.query.filter_by(slug=slug).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    return jsonify({'anime': anime.to_dict()})


@bp.route('/<slug>/episodes', methods=['GET'])
def get_episodes(slug):
    """Obtiene los episodios de un anime"""
    source = request.args.get('source', 'animeflv')

    anime = Anime.query.filter_by(slug=slug).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    episodes = AnimeService.get_episodes(anime, source=source)

    return jsonify({
        'anime_id': anime.id,
        'source': source,
        'episodes': episodes
    })


@bp.route('/<slug>/episode/<int:episode_number>', methods=['GET'])
def get_episode_videos(slug, episode_number):
    """Obtiene los videos de un episodio específico"""
    source = request.args.get('source', 'animeflv')

    anime = Anime.query.filter_by(slug=slug).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    videos = AnimeService.get_episode_videos(anime, episode_number, source=source)

    return jsonify({
        'anime_id': anime.id,
        'episode': episode_number,
        'source': source,
        'videos': videos
    })
