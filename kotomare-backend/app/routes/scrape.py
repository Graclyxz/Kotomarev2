"""
Rutas de scraping bajo demanda.
Solo se hace scraping cuando el usuario quiere ver episodios.
Los datos scrapeados se guardan en la BD para uso futuro.
"""

from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Anime
from app.scrapers.animeflv import AnimeFLVScraper

bp = Blueprint('scrape', __name__)

# Instancias de scrapers
scrapers = {
    'animeflv': AnimeFLVScraper()
}


# ============== FUENTES DISPONIBLES ==============

@bp.route('/sources', methods=['GET'])
def get_available_sources():
    """
    Retorna las fuentes de streaming disponibles para scraping.
    """
    return jsonify({
        'sources': [
            {
                'id': 'animeflv',
                'name': 'AnimeFLV',
                'url': 'https://www3.animeflv.net',
                'available': True
            }
            # Aquí se pueden agregar más fuentes en el futuro
            # {'id': 'jkanime', 'name': 'JKAnime', 'url': '...', 'available': False}
        ]
    })


# ============== ANIMEFLV ==============

@bp.route('/animeflv/search', methods=['GET'])
def animeflv_search():
    """
    Busca animes en AnimeFLV por título.
    Útil para vincular un anime de AniList con AnimeFLV.

    Query params:
        q: Título a buscar (requerido)
    """
    query = request.args.get('q', '').strip()

    if not query or len(query) < 2:
        return jsonify({'error': 'La búsqueda debe tener al menos 2 caracteres'}), 400

    scraper = scrapers['animeflv']
    results = scraper.search(query)

    return jsonify({
        'results': results,
        'count': len(results),
        'source': 'animeflv'
    })


@bp.route('/animeflv/anime/<anime_id>', methods=['GET'])
def animeflv_get_anime(anime_id):
    """
    Obtiene el detalle de un anime de AnimeFLV.
    No guarda en la BD, solo retorna los datos.

    Args:
        anime_id: ID del anime en AnimeFLV (ej: shingeki-no-kyojin)
    """
    scraper = scrapers['animeflv']
    detail = scraper.get_anime_detail(anime_id)

    if not detail:
        return jsonify({'error': 'Anime no encontrado en AnimeFLV'}), 404

    return jsonify({
        'anime': detail,
        'source': 'animeflv'
    })


@bp.route('/animeflv/link', methods=['POST'])
def animeflv_link():
    """
    Vincula un anime de AniList con AnimeFLV y guarda en la BD.
    Este es el endpoint principal que se llama cuando el usuario
    quiere ver los capítulos de un anime.

    Body JSON:
        anilist_id: int - ID del anime en AniList (requerido)
        title: str - Título del anime (requerido)
        cover_image: str - URL de la imagen (opcional)
        animeflv_id: str - ID del anime en AnimeFLV (requerido)
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Se requiere JSON body'}), 400

    anilist_id = data.get('anilist_id')
    title = data.get('title')
    cover_image = data.get('cover_image')
    animeflv_id = data.get('animeflv_id')

    if not anilist_id or not title or not animeflv_id:
        return jsonify({
            'error': 'Se requieren: anilist_id, title, animeflv_id'
        }), 400

    # Verificar si el anime ya existe en la BD
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if anime and anime.has_streaming_source('animeflv'):
        # Ya existe y ya está vinculado
        return jsonify({
            'message': 'Anime ya vinculado con AnimeFLV',
            'anime': anime.to_dict_with_episodes('animeflv'),
            'source': 'animeflv'
        })

    # Obtener episodios de AnimeFLV
    scraper = scrapers['animeflv']
    detail = scraper.get_anime_detail(animeflv_id)

    if not detail:
        return jsonify({'error': 'No se pudo obtener datos de AnimeFLV'}), 404

    episodes = scraper.get_episodes(animeflv_id)

    # Crear o actualizar anime en la BD
    if not anime:
        anime = Anime.create_from_anilist(anilist_id, title, cover_image)
        db.session.add(anime)

    # Agregar fuente de streaming con episodios
    anime.add_streaming_source('animeflv', {
        'id': animeflv_id,
        'url': detail.get('url'),
        'episodes_count': len(episodes),
        'episodes': [{'number': ep['number'], 'id': ep['id']} for ep in episodes]
    })

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error guardando en BD: {str(e)}'}), 500

    return jsonify({
        'message': 'Anime vinculado exitosamente',
        'anime': anime.to_dict_with_episodes('animeflv'),
        'episodes_count': len(episodes),
        'source': 'animeflv'
    })


@bp.route('/animeflv/<animeflv_id>/episodes', methods=['GET'])
def animeflv_get_episodes(animeflv_id):
    """
    Obtiene los episodios de un anime de AnimeFLV.
    No guarda en la BD, solo retorna los datos.
    Útil para preview antes de vincular.

    Args:
        animeflv_id: ID del anime en AnimeFLV
    """
    scraper = scrapers['animeflv']
    episodes = scraper.get_episodes(animeflv_id)

    if not episodes:
        return jsonify({
            'episodes': [],
            'count': 0,
            'source': 'animeflv',
            'message': 'No se encontraron episodios'
        })

    return jsonify({
        'episodes': episodes,
        'count': len(episodes),
        'source': 'animeflv'
    })


@bp.route('/animeflv/<animeflv_id>/<int:episode>/servers', methods=['GET'])
def animeflv_get_servers(animeflv_id, episode):
    """
    Obtiene los servidores de video de un episodio.

    Args:
        animeflv_id: ID del anime en AnimeFLV
        episode: Número del episodio
    """
    scraper = scrapers['animeflv']
    servers = scraper.get_video_sources(animeflv_id, episode)

    if not servers:
        return jsonify({
            'servers': [],
            'count': 0,
            'source': 'animeflv',
            'message': 'No se encontraron servidores'
        })

    return jsonify({
        'anime_id': animeflv_id,
        'episode': episode,
        'servers': servers,
        'count': len(servers),
        'source': 'animeflv'
    })


# ============== ENDPOINTS CON BD ==============

@bp.route('/anime/<int:anilist_id>/episodes', methods=['GET'])
def get_anime_episodes(anilist_id):
    """
    Obtiene los episodios de un anime desde la BD.
    Retorna episodios de todas las fuentes vinculadas.

    Args:
        anilist_id: ID del anime en AniList
    """
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({
            'error': 'Anime no encontrado en la BD',
            'message': 'Primero debes vincular el anime con una fuente de streaming'
        }), 404

    if not anime.streaming_sources:
        return jsonify({
            'error': 'No hay fuentes vinculadas',
            'message': 'El anime existe pero no tiene fuentes de streaming'
        }), 404

    return jsonify({
        'anime_id': anime.id,
        'anilist_id': anilist_id,
        'title': anime.title,
        'sources': anime.streaming_sources,
        'available_sources': list(anime.streaming_sources.keys())
    })


@bp.route('/anime/<int:anilist_id>/episode/<int:episode>/servers', methods=['GET'])
def get_episode_servers(anilist_id, episode):
    """
    Obtiene los servidores de video de un episodio.
    Usa la fuente especificada o la primera disponible.

    Query params:
        source: Fuente de streaming (default: primera disponible)
    """
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado en la BD'}), 404

    source = request.args.get('source')

    if not source:
        # Usar la primera fuente disponible
        if anime.streaming_sources:
            source = list(anime.streaming_sources.keys())[0]
        else:
            return jsonify({'error': 'No hay fuentes vinculadas'}), 404

    source_data = anime.get_streaming_source(source)
    if not source_data:
        return jsonify({'error': f'Fuente {source} no encontrada'}), 404

    # Obtener ID del anime en la fuente
    source_anime_id = source_data.get('id')

    if source not in scrapers:
        return jsonify({'error': f'Scraper para {source} no disponible'}), 400

    # Obtener servidores de video
    scraper = scrapers[source]
    servers = scraper.get_video_sources(source_anime_id, episode)

    return jsonify({
        'anime_id': anime.id,
        'anilist_id': anilist_id,
        'episode': episode,
        'source': source,
        'servers': servers,
        'count': len(servers)
    })


# ============== RECIENTES ==============

@bp.route('/animeflv/recent', methods=['GET'])
def animeflv_recent_episodes():
    """
    Obtiene los episodios más recientes de AnimeFLV.
    Query params:
        limit: Número de episodios (default: 20, max: 50)
    """
    limit = min(request.args.get('limit', 20, type=int), 50)

    scraper = scrapers['animeflv']
    episodes = scraper.get_recent_episodes(limit=limit)

    return jsonify({
        'episodes': episodes,
        'count': len(episodes),
        'source': 'animeflv'
    })
