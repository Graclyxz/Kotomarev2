"""
Rutas para animes guardados en la BD local.
Solo muestra animes que han sido vinculados con fuentes de streaming.
Para navegar el catálogo completo, usar las rutas de AniList (/api/anilist).
"""

from flask import Blueprint, request, jsonify
from app.models import Anime

bp = Blueprint('anime', __name__)


# ============== ANIMES LOCALES ==============

@bp.route('/saved', methods=['GET'])
def get_saved_animes():
    """
    Obtiene todos los animes guardados en la BD.
    Estos son animes que ya tienen fuentes de streaming vinculadas.

    Query params:
        page: Página (default: 1)
        per_page: Resultados por página (default: 24, max: 48)
        search: Búsqueda por título (opcional)
    """
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 24, type=int), 48)
    search = request.args.get('search', '').strip()

    query = Anime.query

    if search:
        query = query.filter(Anime.title.ilike(f'%{search}%'))

    # Ordenar por actualización más reciente
    query = query.order_by(Anime.updated_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'animes': [a.to_dict() for a in pagination.items],
        'count': len(pagination.items),
        'page': page,
        'total_pages': pagination.pages,
        'total': pagination.total,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    })


@bp.route('/<int:anilist_id>', methods=['GET'])
def get_anime_by_anilist_id(anilist_id):
    """
    Obtiene un anime de la BD por su ID de AniList.

    Args:
        anilist_id: ID del anime en AniList
    """
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({
            'error': 'Anime no encontrado en la BD local',
            'message': 'El anime no ha sido vinculado con ninguna fuente de streaming',
            'hint': 'Usa /api/anilist/anime/{anilist_id} para obtener datos de AniList'
        }), 404

    return jsonify({
        'anime': anime.to_dict(),
        'source': 'local'
    })


@bp.route('/slug/<slug>', methods=['GET'])
def get_anime_by_slug(slug):
    """
    Obtiene un anime de la BD por su slug.

    Args:
        slug: Slug del anime (ej: shingeki-no-kyojin)
    """
    anime = Anime.query.filter_by(slug=slug).first()

    if not anime:
        return jsonify({
            'error': 'Anime no encontrado en la BD local'
        }), 404

    return jsonify({
        'anime': anime.to_dict(),
        'source': 'local'
    })


@bp.route('/<int:anilist_id>/sources', methods=['GET'])
def get_anime_sources(anilist_id):
    """
    Obtiene las fuentes de streaming de un anime.

    Args:
        anilist_id: ID del anime en AniList
    """
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado en la BD'}), 404

    if not anime.streaming_sources:
        return jsonify({
            'sources': [],
            'message': 'No hay fuentes vinculadas'
        })

    sources_detail = []
    for name, data in anime.streaming_sources.items():
        sources_detail.append({
            'name': name,
            'id': data.get('id'),
            'url': data.get('url'),
            'episodes_count': data.get('episodes_count', 0),
            'linked_at': data.get('linked_at')
        })

    return jsonify({
        'anime_id': anime.id,
        'anilist_id': anilist_id,
        'sources': sources_detail,
        'count': len(sources_detail)
    })


@bp.route('/<int:anilist_id>/episodes/<source>', methods=['GET'])
def get_anime_episodes(anilist_id, source):
    """
    Obtiene los episodios de un anime de una fuente específica.

    Args:
        anilist_id: ID del anime en AniList
        source: Nombre de la fuente (ej: animeflv)
    """
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado en la BD'}), 404

    source_data = anime.get_streaming_source(source)

    if not source_data:
        return jsonify({'error': f'Fuente {source} no encontrada para este anime'}), 404

    return jsonify({
        'anime_id': anime.id,
        'anilist_id': anilist_id,
        'source': source,
        'source_id': source_data.get('id'),
        'episodes': source_data.get('episodes', []),
        'episodes_count': source_data.get('episodes_count', 0)
    })


# ============== ESTADÍSTICAS ==============

@bp.route('/stats', methods=['GET'])
def get_stats():
    """
    Obtiene estadísticas de la BD local.
    """
    total_animes = Anime.query.count()

    # Contar por fuente de streaming
    sources_count = {}
    animes_with_sources = Anime.query.filter(Anime.streaming_sources != None).all()

    for anime in animes_with_sources:
        if anime.streaming_sources:
            for source in anime.streaming_sources.keys():
                sources_count[source] = sources_count.get(source, 0) + 1

    return jsonify({
        'total_animes': total_animes,
        'animes_with_streaming': len(animes_with_sources),
        'sources_breakdown': sources_count
    })


# ============== CHECK ==============

@bp.route('/check/<int:anilist_id>', methods=['GET'])
def check_anime(anilist_id):
    """
    Verifica si un anime está en la BD y qué fuentes tiene.
    Útil para el frontend para saber si mostrar botón de vincular
    o si ya tiene episodios disponibles.

    Args:
        anilist_id: ID del anime en AniList
    """
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({
            'exists': False,
            'has_streaming': False,
            'sources': []
        })

    return jsonify({
        'exists': True,
        'has_streaming': bool(anime.streaming_sources),
        'sources': list(anime.streaming_sources.keys()) if anime.streaming_sources else [],
        'anime': anime.to_dict()
    })
