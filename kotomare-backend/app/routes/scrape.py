"""
Rutas de scraping bajo demanda.
Solo se hace scraping cuando el usuario quiere ver datos.
Los datos se retornan directamente sin guardar en BD.
"""

from flask import Blueprint, request, jsonify
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
        ]
    })


# ============== ANIMEFLV ==============

@bp.route('/animeflv/search', methods=['GET'])
def animeflv_search():
    """
    Busca animes en AnimeFLV por titulo.

    Query params:
        q: Titulo a buscar (requerido)
    """
    query = request.args.get('q', '').strip()

    if not query or len(query) < 2:
        return jsonify({'error': 'La busqueda debe tener al menos 2 caracteres'}), 400

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


@bp.route('/animeflv/<animeflv_id>/episodes', methods=['GET'])
def animeflv_get_episodes(animeflv_id):
    """
    Obtiene los episodios de un anime de AnimeFLV.

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
        episode: Numero del episodio
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


# ============== RECIENTES ==============

@bp.route('/animeflv/recent', methods=['GET'])
def animeflv_recent_episodes():
    """
    Obtiene los episodios mas recientes de AnimeFLV.
    Query params:
        limit: Numero de episodios (default: 20, max: 50)
    """
    limit = min(request.args.get('limit', 20, type=int), 50)

    scraper = scrapers['animeflv']
    episodes = scraper.get_recent_episodes(limit=limit)

    return jsonify({
        'episodes': episodes,
        'count': len(episodes),
        'source': 'animeflv'
    })
