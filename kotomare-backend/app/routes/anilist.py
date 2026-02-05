"""
Rutas directas a AniList API.
Todos los datos se obtienen en tiempo real desde AniList.
No se guarda nada en la base de datos.
"""

from flask import Blueprint, request, jsonify
from app.services.anilist_service import AniListService

bp = Blueprint('anilist', __name__)


# ============== HOME ENDPOINTS ==============

@bp.route('/trending', methods=['GET'])
def get_trending():
    """
    Obtiene animes en tendencia directamente de AniList.
    Query params:
        limit: Número de resultados (default: 10, max: 25)
    """
    limit = min(request.args.get('limit', 10, type=int), 25)

    animes = AniListService.get_trending(per_page=limit)

    return jsonify({
        'animes': animes,
        'count': len(animes),
        'source': 'anilist'
    })


@bp.route('/popular', methods=['GET'])
def get_popular():
    """
    Obtiene animes más populares de AniList.
    Query params:
        page: Página (default: 1)
        limit: Resultados por página (default: 12, max: 25)
    """
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 12, type=int), 25)

    animes = AniListService.get_popular(page=page, per_page=limit)

    return jsonify({
        'animes': animes,
        'count': len(animes),
        'page': page,
        'source': 'anilist'
    })


@bp.route('/seasonal', methods=['GET'])
def get_seasonal():
    """
    Obtiene animes de la temporada actual o especificada.
    Query params:
        season: WINTER, SPRING, SUMMER, FALL (default: temporada actual)
        year: Año (default: año actual)
        page: Página (default: 1)
        limit: Resultados por página (default: 12, max: 25)
    """
    season = request.args.get('season')
    year = request.args.get('year', type=int)
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 12, type=int), 25)

    animes = AniListService.get_seasonal(season=season, year=year, page=page, per_page=limit)

    return jsonify({
        'animes': animes,
        'count': len(animes),
        'season': season,
        'year': year,
        'page': page,
        'source': 'anilist'
    })


@bp.route('/airing', methods=['GET'])
def get_airing():
    """
    Obtiene animes actualmente en emisión.
    Query params:
        page: Página (default: 1)
        limit: Resultados por página (default: 12, max: 25)
    """
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 12, type=int), 25)

    animes = AniListService.get_airing(page=page, per_page=limit)

    return jsonify({
        'animes': animes,
        'count': len(animes),
        'page': page,
        'source': 'anilist'
    })


# ============== DETALLE DE ANIME ==============

@bp.route('/anime/<int:anilist_id>', methods=['GET'])
def get_anime(anilist_id):
    """
    Obtiene información básica de un anime por su ID de AniList.
    """
    anime = AniListService.get_anime_by_id(anilist_id, full=False)

    if not anime:
        return jsonify({'error': 'Anime no encontrado en AniList'}), 404

    return jsonify({
        'anime': anime,
        'source': 'anilist'
    })


@bp.route('/anime/<int:anilist_id>/full', methods=['GET'])
def get_anime_full(anilist_id):
    """
    Obtiene información completa de un anime (personajes, staff, relaciones, etc.)
    """
    anime = AniListService.get_anime_by_id(anilist_id, full=True)

    if not anime:
        return jsonify({'error': 'Anime no encontrado en AniList'}), 404

    return jsonify({
        'anime': anime,
        'source': 'anilist'
    })


# ============== LAZY LOADING (PERSONAJES Y STAFF) ==============

@bp.route('/anime/<int:anilist_id>/characters', methods=['GET'])
def get_anime_characters(anilist_id):
    """
    Obtiene personajes de un anime con paginación (lazy loading).
    Query params:
        page: Página (default: 1)
        limit: Resultados por página (default: 25, max: 25)
    """
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 25, type=int), 25)

    result = AniListService.get_characters(anilist_id, page=page, per_page=limit)

    return jsonify({
        **result,
        'anilist_id': anilist_id,
        'source': 'anilist'
    })


@bp.route('/anime/<int:anilist_id>/voice-actors', methods=['GET'])
def get_anime_voice_actors(anilist_id):
    """
    Obtiene actores de voz de un anime filtrados por idioma con paginación.
    Query params:
        language: Idioma (default: JAPANESE). Valores: JAPANESE, ENGLISH, KOREAN, SPANISH, PORTUGUESE, FRENCH, GERMAN, ITALIAN
        page: Página (default: 1)
        limit: Resultados por página (default: 15, max: 25)
    """
    language = request.args.get('language', 'JAPANESE').upper()
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 15, type=int), 25)

    result = AniListService.get_voice_actors(anilist_id, language=language, page=page, per_page=limit)

    return jsonify({
        **result,
        'anilist_id': anilist_id,
        'source': 'anilist'
    })


@bp.route('/anime/<int:anilist_id>/staff', methods=['GET'])
def get_anime_staff(anilist_id):
    """
    Obtiene staff de un anime con paginación (lazy loading).
    Query params:
        page: Página (default: 1)
        limit: Resultados por página (default: 25, max: 25)
    """
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 25, type=int), 25)

    result = AniListService.get_staff(anilist_id, page=page, per_page=limit)

    return jsonify({
        **result,
        'anilist_id': anilist_id,
        'source': 'anilist'
    })


# ============== BÚSQUEDA ==============

@bp.route('/search', methods=['GET'])
def search():
    """
    Busca animes en AniList por texto.
    Query params:
        q: Texto de búsqueda (requerido, min 2 caracteres)
        page: Página (default: 1)
        limit: Resultados por página (default: 20, max: 25)
    """
    query = request.args.get('q', '').strip()

    if not query or len(query) < 2:
        return jsonify({'error': 'La búsqueda debe tener al menos 2 caracteres'}), 400

    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 20, type=int), 25)

    animes = AniListService.search(query, page=page, per_page=limit)

    return jsonify({
        'animes': animes,
        'count': len(animes),
        'query': query,
        'page': page,
        'source': 'anilist'
    })


# ============== BROWSE ==============

@bp.route('/browse', methods=['GET'])
def browse():
    """
    Explora el catálogo de AniList con filtros avanzados.
    Query params:
        q: Búsqueda por título (opcional)
        genres: Géneros separados por coma (ej: Action,Adventure)
        tags: Tags separados por coma (ej: Isekai,Reincarnation)
        year: Año de temporada
        season: WINTER, SPRING, SUMMER, FALL
        format: TV, TV_SHORT, MOVIE, OVA, ONA, SPECIAL, MUSIC
        status: RELEASING, FINISHED, NOT_YET_RELEASED, HIATUS, CANCELLED
        source: ORIGINAL, MANGA, LIGHT_NOVEL, VISUAL_NOVEL, VIDEO_GAME, etc.
        country: JP, KR, CN, TW
        sort: POPULARITY_DESC, SCORE_DESC, TRENDING_DESC, FAVOURITES_DESC,
              START_DATE_DESC, START_DATE, TITLE_ROMAJI, EPISODES_DESC, etc.
        page: Página (default: 1)
        limit: Resultados por página (default: 24, max: 48)
    """
    # Obtener parámetros
    search_query = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    limit = min(request.args.get('limit', 24, type=int), 48)

    # Parsear géneros
    genres = request.args.get('genres', '').split(',') if request.args.get('genres') else None
    genres = [g.strip() for g in genres if g.strip()] if genres else None

    # Parsear tags
    tags = request.args.get('tags', '').split(',') if request.args.get('tags') else None
    tags = [t.strip() for t in tags if t.strip()] if tags else None

    year = request.args.get('year', type=int)
    season = request.args.get('season')
    format_type = request.args.get('format')
    status = request.args.get('status')
    source = request.args.get('source')
    country = request.args.get('country')
    sort = request.args.get('sort', 'POPULARITY_DESC')

    result = AniListService.browse(
        search=search_query if search_query else None,
        genres=genres,
        tags=tags,
        year=year,
        season=season,
        format_type=format_type,
        status=status,
        source=source,
        country=country,
        sort=sort,
        page=page,
        per_page=limit
    )

    result['source'] = 'anilist'
    return jsonify(result)


# ============== FILTROS ==============

@bp.route('/filters', methods=['GET'])
def get_filters():
    """
    Obtiene los filtros disponibles para browse.
    """
    return jsonify(AniListService.get_filters())
