"""
Rutas de administración.
Por ahora son públicas para desarrollo. Luego se añadirá autenticación de SuperAdmin.
"""

from flask import Blueprint, request, jsonify
from app.services.sync_service import SyncService
from app.models import Anime, Episode, HomeSection, HomeSectionAnime
from app.extensions import db
from app.scrapers import get_scraper

bp = Blueprint('admin', __name__)


# ============== SYNC ENDPOINTS ==============

@bp.route('/sync/all', methods=['POST'])
def sync_all():
    """Sincroniza todo el contenido del home"""
    source = request.args.get('source', 'animeflv')
    result = SyncService.sync_all(source)
    return jsonify(result)


@bp.route('/sync/featured', methods=['POST'])
def sync_featured():
    """Sincroniza los animes destacados (carrusel)"""
    source = request.args.get('source', 'animeflv')
    limit = request.args.get('limit', 5, type=int)
    order = request.args.get('order', 'default')  # default o rating
    enrich = request.args.get('enrich', 'true').lower() == 'true'  # Imágenes de AniList/MAL
    result = SyncService.sync_featured_animes(source, limit, order, enrich)
    return jsonify(result)


@bp.route('/sync/episodes', methods=['POST'])
def sync_episodes():
    """Sincroniza los episodios recientes"""
    source = request.args.get('source', 'animeflv')
    limit = request.args.get('limit', 20, type=int)
    result = SyncService.sync_recent_episodes(source, limit)
    return jsonify(result)


@bp.route('/sync/popular', methods=['POST'])
def sync_popular():
    """Sincroniza los animes en emisión"""
    source = request.args.get('source', 'animeflv')
    limit = request.args.get('limit', 12, type=int)
    order = request.args.get('order', 'default')  # default o rating
    result = SyncService.sync_popular_animes(source, limit, order)
    return jsonify(result)


@bp.route('/sync/latest', methods=['POST'])
def sync_latest():
    """Sincroniza los últimos animes añadidos"""
    source = request.args.get('source', 'animeflv')
    limit = request.args.get('limit', 12, type=int)
    result = SyncService.sync_latest_animes(source, limit)
    return jsonify(result)


@bp.route('/sync/directory', methods=['POST'])
def sync_directory():
    """
    Sincroniza animes del directorio con filtros.

    Query params:
        source: Fuente (default: animeflv)
        pages: Número de páginas (default: 5, max: 20)
        genres: Géneros separados por coma (ej: accion,aventura)
        year: Año (ej: 2024)
        types: Tipos separados por coma (ej: tv,movie)
        status: Estados separados por coma (1=emisión,2=finalizado,3=próximo)
        order: Orden (rating, updated, added, title)
        with_details: Si incluir detalles completos (default: false)
    """
    source = request.args.get('source', 'animeflv')
    pages = min(request.args.get('pages', 5, type=int), 20)  # Max 20 páginas

    # Parsear filtros
    genres = request.args.get('genres', '').split(',') if request.args.get('genres') else None
    genres = [g.strip() for g in genres] if genres else None

    year = request.args.get('year', type=int)

    types = request.args.get('types', '').split(',') if request.args.get('types') else None
    types = [t.strip() for t in types] if types else None

    status_str = request.args.get('status', '')
    status = [int(s.strip()) for s in status_str.split(',') if s.strip().isdigit()] if status_str else None

    order = request.args.get('order', 'rating')
    with_details = request.args.get('with_details', 'false').lower() == 'true'

    result = SyncService.sync_directory(
        source=source,
        max_pages=pages,
        genres=genres,
        year=year,
        types=types,
        status=status,
        order=order,
        with_details=with_details
    )
    return jsonify(result)


@bp.route('/sync/top-rated', methods=['POST'])
def sync_top_rated():
    """Sincroniza los animes mejor calificados"""
    source = request.args.get('source', 'animeflv')
    pages = min(request.args.get('pages', 3, type=int), 10)
    result = SyncService.sync_top_rated(source, pages)
    return jsonify(result)


@bp.route('/sync/airing', methods=['POST'])
def sync_airing():
    """Sincroniza todos los animes en emisión"""
    source = request.args.get('source', 'animeflv')
    pages = min(request.args.get('pages', 3, type=int), 10)
    order = request.args.get('order', 'default')  # default o rating
    result = SyncService.sync_airing(source, pages, order)
    return jsonify(result)


@bp.route('/sync/by-year', methods=['POST'])
def sync_by_year():
    """Sincroniza animes de un año específico"""
    source = request.args.get('source', 'animeflv')
    year = request.args.get('year', 2024, type=int)
    pages = min(request.args.get('pages', 3, type=int), 10)
    result = SyncService.sync_by_year(source, year, pages)
    return jsonify(result)


@bp.route('/sync/by-genre', methods=['POST'])
def sync_by_genre():
    """Sincroniza animes de un género específico"""
    source = request.args.get('source', 'animeflv')
    genre = request.args.get('genre', 'accion')
    pages = min(request.args.get('pages', 2, type=int), 10)
    result = SyncService.sync_by_genre(source, genre, pages)
    return jsonify(result)


# ============== BROWSE PREVIEW (sin guardar) ==============

@bp.route('/browse', methods=['GET'])
def browse_preview():
    """
    Navega el directorio sin guardar (preview).
    Útil para ver qué se va a sincronizar.
    """
    source = request.args.get('source', 'animeflv')
    page = request.args.get('page', 1, type=int)

    # Parsear filtros
    query = request.args.get('q')
    genres = request.args.get('genres', '').split(',') if request.args.get('genres') else None
    genres = [g.strip() for g in genres] if genres else None

    year = request.args.get('year', type=int)

    types = request.args.get('types', '').split(',') if request.args.get('types') else None
    types = [t.strip() for t in types] if types else None

    status_str = request.args.get('status', '')
    status = [int(s.strip()) for s in status_str.split(',') if s.strip().isdigit()] if status_str else None

    order = request.args.get('order', 'default')

    scraper = get_scraper(source)
    if not scraper:
        return jsonify({'error': f'Fuente {source} no disponible'}), 400

    result = scraper.browse(
        query=query,
        genres=genres,
        year=year,
        types=types,
        status=status,
        order=order,
        page=page
    )

    return jsonify(result)


@bp.route('/filters', methods=['GET'])
def get_filters():
    """Obtiene los filtros disponibles para el directorio"""
    source = request.args.get('source', 'animeflv')
    scraper = get_scraper(source)

    if not scraper:
        return jsonify({'error': f'Fuente {source} no disponible'}), 400

    return jsonify({
        'source': source,
        'genres': scraper.GENRES,
        'types': scraper.TYPES,
        'status': scraper.STATUS,
        'order': scraper.ORDER,
        'years': list(range(2026, 1989, -1))  # 2026 a 1990
    })


# ============== STATS & MANAGEMENT ==============

@bp.route('/stats', methods=['GET'])
def get_stats():
    """Obtiene estadísticas de la base de datos"""
    # Contar por tipo
    type_counts = db.session.query(
        Anime.type, db.func.count(Anime.id)
    ).group_by(Anime.type).all()

    # Contar por estado
    status_counts = db.session.query(
        Anime.status, db.func.count(Anime.id)
    ).group_by(Anime.status).all()

    return jsonify({
        'total_animes': Anime.query.count(),
        'total_episodes': Episode.query.count(),
        'home_sections': HomeSection.query.count(),
        'by_type': {t or 'unknown': c for t, c in type_counts},
        'by_status': {s or 'unknown': c for s, c in status_counts},
        'sections': [s.to_dict() for s in HomeSection.query.order_by(HomeSection.order).all()]
    })


@bp.route('/clear-db', methods=['POST'])
def clear_database():
    """Limpia la base de datos (solo para desarrollo)"""
    try:
        HomeSectionAnime.query.delete()
        HomeSection.query.delete()
        Episode.query.delete()
        # No borramos Anime para mantener favoritos y watchlists
        db.session.commit()
        return jsonify({'success': True, 'message': 'Base de datos limpiada'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/clear-all', methods=['POST'])
def clear_all():
    """Limpia TODA la base de datos incluyendo animes (cuidado!)"""
    try:
        HomeSectionAnime.query.delete()
        HomeSection.query.delete()
        Episode.query.delete()
        Anime.query.delete()
        db.session.commit()
        return jsonify({'success': True, 'message': 'Base de datos completamente limpiada'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
