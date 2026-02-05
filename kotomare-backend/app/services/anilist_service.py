"""
Servicio para obtener datos de anime desde AniList GraphQL API.
AniList es la fuente principal de datos (información completa).
AnimeFLV solo se usa para obtener los links de video/streaming.
"""

import requests
import time
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
from concurrent.futures import ThreadPoolExecutor, as_completed


class AniListService:
    """Servicio completo para interactuar con AniList GraphQL API"""

    BASE_URL = "https://graphql.anilist.co"

    # Rate limiting: ~90 requests/min
    _last_request_time = 0
    _rate_limit_delay = 0.7  # 700ms entre requests (~85 req/min)

    # Fragmento GraphQL para datos básicos
    MEDIA_FRAGMENT = """
    fragment MediaFragment on Media {
        id
        idMal
        title {
            romaji
            english
            native
        }
        coverImage {
            extraLarge
            large
            medium
        }
        bannerImage
        description(asHtml: false)
        format
        status
        episodes
        duration
        season
        seasonYear
        startDate { year month day }
        endDate { year month day }
        averageScore
        popularity
        trending
        favourites
        genres
        tags { name rank }
        synonyms
        source
        countryOfOrigin
        isAdult
        nextAiringEpisode {
            airingAt
            episode
        }
        trailer { id site }
    }
    """

    # Fragmento extendido con personajes, staff, relaciones
    MEDIA_FULL_FRAGMENT = """
    fragment MediaFullFragment on Media {
        id
        idMal
        title {
            romaji
            english
            native
        }
        coverImage {
            extraLarge
            large
            medium
        }
        bannerImage
        description(asHtml: false)
        format
        status
        episodes
        duration
        season
        seasonYear
        startDate { year month day }
        endDate { year month day }
        averageScore
        popularity
        trending
        favourites
        genres
        tags { name rank }
        synonyms
        source
        countryOfOrigin
        isAdult
        nextAiringEpisode {
            airingAt
            episode
        }
        trailer { id site }
        characters(sort: [ROLE, FAVOURITES_DESC], page: 1, perPage: 16) {
            pageInfo {
                total
                hasNextPage
            }
            edges {
                role
                voiceActors {
                    id
                    name { full }
                    image { medium }
                    language
                }
                node {
                    id
                    name { full }
                    image { medium }
                }
            }
        }
        staff(sort: [RELEVANCE], page: 1, perPage: 18) {
            pageInfo {
                total
                hasNextPage
            }
            edges {
                role
                node {
                    id
                    name { full }
                    image { medium }
                }
            }
        }
        studios {
            nodes {
                id
                name
                isAnimationStudio
            }
        }
        relations {
            edges {
                relationType
                node {
                    id
                    title { romaji english }
                    format
                    type
                    coverImage { medium }
                }
            }
        }
        recommendations(sort: [RATING_DESC], perPage: 12) {
            nodes {
                mediaRecommendation {
                    id
                    title { romaji english }
                    coverImage { medium }
                    format
                    averageScore
                }
            }
        }
    }
    """

    @classmethod
    def _rate_limit(cls):
        """Aplica rate limiting para respetar límites de AniList"""
        current_time = time.time()
        elapsed = current_time - cls._last_request_time
        if elapsed < cls._rate_limit_delay:
            time.sleep(cls._rate_limit_delay - elapsed)
        cls._last_request_time = time.time()

    @classmethod
    def _execute_query(cls, query: str, variables: Dict = None) -> Optional[Dict]:
        """Ejecuta una query GraphQL en AniList"""
        cls._rate_limit()

        try:
            response = requests.post(
                cls.BASE_URL,
                json={'query': query, 'variables': variables or {}},
                headers={'Content-Type': 'application/json'},
                timeout=15
            )

            if response.status_code == 200:
                data = response.json()
                if 'errors' in data:
                    print(f"[AniList] GraphQL errors: {data['errors']}")
                    return None
                return data.get('data')
            elif response.status_code == 429:
                print("[AniList] Rate limited, waiting 60s...")
                time.sleep(60)
                return cls._execute_query(query, variables)
            else:
                print(f"[AniList] Error {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"[AniList] Request error: {e}")
            return None

    @classmethod
    def get_trending(cls, page: int = 1, per_page: int = 10) -> List[Dict]:
        """Obtiene animes en tendencia"""
        query = f"""
        {cls.MEDIA_FRAGMENT}
        query ($page: Int, $perPage: Int) {{
            Page(page: $page, perPage: $perPage) {{
                media(type: ANIME, sort: TRENDING_DESC) {{
                    ...MediaFragment
                }}
            }}
        }}
        """
        data = cls._execute_query(query, {'page': page, 'perPage': per_page})
        if not data:
            return []

        medias = data.get('Page', {}).get('media', [])
        return [cls.transform_to_anime_dict(m) for m in medias]

    @classmethod
    def get_popular(cls, page: int = 1, per_page: int = 12) -> List[Dict]:
        """Obtiene animes más populares"""
        query = f"""
        {cls.MEDIA_FRAGMENT}
        query ($page: Int, $perPage: Int) {{
            Page(page: $page, perPage: $perPage) {{
                media(type: ANIME, sort: POPULARITY_DESC) {{
                    ...MediaFragment
                }}
            }}
        }}
        """
        data = cls._execute_query(query, {'page': page, 'perPage': per_page})
        if not data:
            return []

        medias = data.get('Page', {}).get('media', [])
        return [cls.transform_to_anime_dict(m) for m in medias]

    @classmethod
    def get_seasonal(cls, season: str = None, year: int = None, page: int = 1, per_page: int = 12) -> List[Dict]:
        """Obtiene animes de una temporada"""
        if not season or not year:
            now = datetime.now()
            year = year or now.year
            month = now.month
            if month in [1, 2, 3]:
                season = 'WINTER'
            elif month in [4, 5, 6]:
                season = 'SPRING'
            elif month in [7, 8, 9]:
                season = 'SUMMER'
            else:
                season = 'FALL'

        query = f"""
        {cls.MEDIA_FRAGMENT}
        query ($season: MediaSeason, $seasonYear: Int, $page: Int, $perPage: Int) {{
            Page(page: $page, perPage: $perPage) {{
                media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC) {{
                    ...MediaFragment
                }}
            }}
        }}
        """
        data = cls._execute_query(query, {
            'season': season, 'seasonYear': year, 'page': page, 'perPage': per_page
        })
        if not data:
            return []

        medias = data.get('Page', {}).get('media', [])
        return [cls.transform_to_anime_dict(m) for m in medias]

    @classmethod
    def get_airing(cls, page: int = 1, per_page: int = 12) -> List[Dict]:
        """Obtiene animes actualmente en emisión"""
        query = f"""
        {cls.MEDIA_FRAGMENT}
        query ($page: Int, $perPage: Int) {{
            Page(page: $page, perPage: $perPage) {{
                media(type: ANIME, status: RELEASING, sort: [POPULARITY_DESC]) {{
                    ...MediaFragment
                }}
            }}
        }}
        """
        data = cls._execute_query(query, {'page': page, 'perPage': per_page})
        if not data:
            return []

        medias = data.get('Page', {}).get('media', [])
        return [cls.transform_to_anime_dict(m) for m in medias]

    @classmethod
    def get_anime_by_id(cls, anilist_id: int, full: bool = False) -> Optional[Dict]:
        """Obtiene un anime por su ID de AniList"""
        fragment = cls.MEDIA_FULL_FRAGMENT if full else cls.MEDIA_FRAGMENT
        fragment_name = 'MediaFullFragment' if full else 'MediaFragment'

        query = f"""
        {fragment}
        query ($id: Int) {{
            Media(id: $id, type: ANIME) {{
                ...{fragment_name}
            }}
        }}
        """
        data = cls._execute_query(query, {'id': anilist_id})
        if not data or not data.get('Media'):
            return None

        media = data['Media']
        result = cls.transform_to_anime_dict(media, include_full=full)

        # Agregar info de paginación para lazy loading
        if full:
            result['_pagination'] = {
                'characters': {
                    'total': media.get('characters', {}).get('pageInfo', {}).get('total', 0),
                    'has_next': media.get('characters', {}).get('pageInfo', {}).get('hasNextPage', False),
                    'loaded': len(result.get('characters', []))
                },
                'staff': {
                    'total': media.get('staff', {}).get('pageInfo', {}).get('total', 0),
                    'has_next': media.get('staff', {}).get('pageInfo', {}).get('hasNextPage', False),
                    'loaded': len(result.get('staff', []))
                }
            }

        return result

    @classmethod
    def get_characters(cls, anilist_id: int, page: int = 1, per_page: int = 25) -> Dict:
        """Obtiene personajes de un anime con paginación (para lazy loading)"""
        query = """
        query ($id: Int, $page: Int, $perPage: Int) {
            Media(id: $id, type: ANIME) {
                characters(sort: [ROLE, FAVOURITES_DESC], page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    edges {
                        role
                        voiceActors {
                            id
                            name { full }
                            image { medium }
                            language
                        }
                        node {
                            id
                            name { full }
                            image { medium }
                        }
                    }
                }
            }
        }
        """
        data = cls._execute_query(query, {'id': anilist_id, 'page': page, 'perPage': per_page})
        if not data or not data.get('Media'):
            return {'characters': [], 'page': page, 'total': 0, 'has_next': False}

        chars_data = data['Media'].get('characters', {})
        page_info = chars_data.get('pageInfo', {})

        characters = []
        for edge in chars_data.get('edges', []):
            char = {
                'id': edge.get('node', {}).get('id'),
                'name': edge.get('node', {}).get('name', {}).get('full'),
                'image': edge.get('node', {}).get('image', {}).get('medium'),
                'role': edge.get('role'),
                'voice_actors': []
            }
            for va in edge.get('voiceActors', []):
                char['voice_actors'].append({
                    'id': va.get('id'),
                    'name': va.get('name', {}).get('full'),
                    'image': va.get('image', {}).get('medium'),
                    'language': va.get('language')
                })
            characters.append(char)

        return {
            'characters': characters,
            'page': page_info.get('currentPage', page),
            'total': page_info.get('total', 0),
            'total_pages': page_info.get('lastPage', 1),
            'has_next': page_info.get('hasNextPage', False)
        }

    @classmethod
    def get_voice_actors(cls, anilist_id: int, language: str = 'JAPANESE', page: int = 1, per_page: int = 18) -> Dict:
        """Obtiene actores de voz de un anime filtrados por idioma con paginación"""
        query = """
        query ($id: Int, $page: Int, $perPage: Int, $language: StaffLanguage) {
            Media(id: $id, type: ANIME) {
                characters(sort: [ROLE, FAVOURITES_DESC], page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    edges {
                        role
                        voiceActors(language: $language) {
                            id
                            name { full }
                            image { medium }
                            language
                        }
                        node {
                            id
                            name { full }
                            image { medium }
                        }
                    }
                }
            }
        }
        """
        data = cls._execute_query(query, {
            'id': anilist_id,
            'page': page,
            'perPage': per_page,
            'language': language
        })
        if not data or not data.get('Media'):
            return {'voice_actors': [], 'page': page, 'total': 0, 'has_next': False}

        chars_data = data['Media'].get('characters', {})
        page_info = chars_data.get('pageInfo', {})

        # Extraer actores de voz únicos
        voice_actors_map = {}
        for edge in chars_data.get('edges', []):
            char_name = edge.get('node', {}).get('name', {}).get('full', '')
            char_image = edge.get('node', {}).get('image', {}).get('medium')
            char_role = edge.get('role')

            for va in edge.get('voiceActors', []):
                va_id = va.get('id')
                if va_id not in voice_actors_map:
                    voice_actors_map[va_id] = {
                        'id': va_id,
                        'name': va.get('name', {}).get('full'),
                        'image': va.get('image', {}).get('medium'),
                        'language': va.get('language'),
                        'characters': []
                    }
                voice_actors_map[va_id]['characters'].append({
                    'name': char_name,
                    'image': char_image,
                    'role': char_role
                })

        voice_actors = list(voice_actors_map.values())
        # Ordenar por cantidad de personajes
        voice_actors.sort(key=lambda x: len(x['characters']), reverse=True)

        return {
            'voice_actors': voice_actors,
            'language': language,
            'page': page_info.get('currentPage', page),
            'total': page_info.get('total', 0),
            'total_pages': page_info.get('lastPage', 1),
            'has_next': page_info.get('hasNextPage', False)
        }

    @classmethod
    def get_staff(cls, anilist_id: int, page: int = 1, per_page: int = 18) -> Dict:
        """Obtiene staff de un anime con paginación (para lazy loading)"""
        query = """
        query ($id: Int, $page: Int, $perPage: Int) {
            Media(id: $id, type: ANIME) {
                staff(sort: [RELEVANCE], page: $page, perPage: $perPage) {
                    pageInfo {
                        total
                        currentPage
                        lastPage
                        hasNextPage
                    }
                    edges {
                        role
                        node {
                            id
                            name { full }
                            image { medium }
                        }
                    }
                }
            }
        }
        """
        data = cls._execute_query(query, {'id': anilist_id, 'page': page, 'perPage': per_page})
        if not data or not data.get('Media'):
            return {'staff': [], 'page': page, 'total': 0, 'has_next': False}

        staff_data = data['Media'].get('staff', {})
        page_info = staff_data.get('pageInfo', {})

        staff = []
        for edge in staff_data.get('edges', []):
            staff.append({
                'id': edge.get('node', {}).get('id'),
                'name': edge.get('node', {}).get('name', {}).get('full'),
                'image': edge.get('node', {}).get('image', {}).get('medium'),
                'role': edge.get('role')
            })

        return {
            'staff': staff,
            'page': page_info.get('currentPage', page),
            'total': page_info.get('total', 0),
            'total_pages': page_info.get('lastPage', 1),
            'has_next': page_info.get('hasNextPage', False)
        }

    @classmethod
    def search(cls, query_text: str, page: int = 1, per_page: int = 20) -> List[Dict]:
        """Busca animes por texto"""
        query = f"""
        {cls.MEDIA_FRAGMENT}
        query ($search: String, $page: Int, $perPage: Int) {{
            Page(page: $page, perPage: $perPage) {{
                media(type: ANIME, search: $search, sort: SEARCH_MATCH) {{
                    ...MediaFragment
                }}
            }}
        }}
        """
        data = cls._execute_query(query, {
            'search': query_text, 'page': page, 'perPage': per_page
        })
        if not data:
            return []

        medias = data.get('Page', {}).get('media', [])
        return [cls.transform_to_anime_dict(m) for m in medias]

    @classmethod
    def browse(cls, search: str = None, genres: List[str] = None, tags: List[str] = None,
               year: int = None, season: str = None, format_type: str = None,
               status: str = None, source: str = None, country: str = None,
               sort: str = 'POPULARITY_DESC', page: int = 1, per_page: int = 24) -> Dict:
        """Navega el catálogo con filtros avanzados de AniList"""

        filters = ['type: ANIME']
        variables: Dict[str, Any] = {'page': page, 'perPage': per_page}

        # Búsqueda por texto
        if search:
            filters.append('search: $search')
            variables['search'] = search

        # Géneros (incluir)
        if genres:
            filters.append('genre_in: $genres')
            variables['genres'] = genres

        # Tags (más específicos que géneros)
        if tags:
            filters.append('tag_in: $tags')
            variables['tags'] = tags

        # Año
        if year:
            filters.append('seasonYear: $year')
            variables['year'] = year

        # Temporada
        if season:
            filters.append('season: $season')
            variables['season'] = season

        # Formato (TV, MOVIE, OVA, etc.)
        if format_type:
            filters.append('format: $format')
            variables['format'] = format_type

        # Estado (RELEASING, FINISHED, etc.)
        if status:
            filters.append('status: $status')
            variables['status'] = status

        # Fuente original (MANGA, LIGHT_NOVEL, ORIGINAL, etc.)
        if source:
            filters.append('source: $source')
            variables['source'] = source

        # País de origen
        if country:
            filters.append('countryOfOrigin: $country')
            variables['country'] = country

        # Ordenamiento
        sort_value = sort if sort else 'POPULARITY_DESC'
        filters.append(f'sort: {sort_value}')

        filter_str = ', '.join(filters)

        # Construir tipos de variables
        var_types = ['$page: Int', '$perPage: Int']
        if search:
            var_types.append('$search: String')
        if genres:
            var_types.append('$genres: [String]')
        if tags:
            var_types.append('$tags: [String]')
        if year:
            var_types.append('$year: Int')
        if season:
            var_types.append('$season: MediaSeason')
        if format_type:
            var_types.append('$format: MediaFormat')
        if status:
            var_types.append('$status: MediaStatus')
        if source:
            var_types.append('$source: MediaSource')
        if country:
            var_types.append('$country: CountryCode')

        var_str = ', '.join(var_types)

        query = f"""
        {cls.MEDIA_FRAGMENT}
        query ({var_str}) {{
            Page(page: $page, perPage: $perPage) {{
                pageInfo {{
                    total
                    currentPage
                    lastPage
                    hasNextPage
                    perPage
                }}
                media({filter_str}) {{
                    ...MediaFragment
                }}
            }}
        }}
        """
        data = cls._execute_query(query, variables)
        if not data:
            return {'animes': [], 'page': page, 'total_pages': 0, 'has_next': False, 'total': 0}

        page_data = data.get('Page', {})
        page_info = page_data.get('pageInfo', {})
        medias = page_data.get('media', [])

        return {
            'animes': [cls.transform_to_anime_dict(m) for m in medias],
            'page': page_info.get('currentPage', page),
            'total': page_info.get('total', 0),
            'total_pages': page_info.get('lastPage', 1),
            'has_next': page_info.get('hasNextPage', False),
            'per_page': page_info.get('perPage', per_page)
        }

    @classmethod
    def get_filters(cls) -> Dict:
        """Retorna los filtros disponibles para browse (datos de AniList)"""
        return {
            # Géneros principales de AniList
            'genres': [
                'Action', 'Adventure', 'Comedy', 'Drama', 'Ecchi', 'Fantasy',
                'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery', 'Psychological',
                'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
            ],

            # Tags populares de AniList (más específicos que géneros)
            'tags': [
                # Temática
                'Isekai', 'Reincarnation', 'Time Travel', 'Post-Apocalyptic', 'Dystopian',
                'School', 'College', 'Military', 'Workplace', 'Historical',
                # Elementos
                'Demons', 'Dragons', 'Vampires', 'Zombies', 'Aliens', 'Ghosts',
                'Magic', 'Super Power', 'Martial Arts', 'Guns', 'Swordplay',
                # Demografía/Tipo
                'Shounen', 'Seinen', 'Shoujo', 'Josei', 'Kids',
                # Romance
                'Love Triangle', 'Harem', 'Reverse Harem', 'Yuri', 'Yaoi',
                # Tono
                'Gore', 'Parody', 'Satire', 'Tragedy', 'Survival',
                # Setting
                'Urban Fantasy', 'Space', 'Video Games', 'Virtual World', 'CGDCT',
                # Otros populares
                'Idol', 'Music', 'Cooking', 'Detective', 'Revenge'
            ],

            # Formatos de anime
            'formats': [
                {'value': 'TV', 'label': 'Serie TV'},
                {'value': 'TV_SHORT', 'label': 'TV Corto'},
                {'value': 'MOVIE', 'label': 'Película'},
                {'value': 'SPECIAL', 'label': 'Especial'},
                {'value': 'OVA', 'label': 'OVA'},
                {'value': 'ONA', 'label': 'ONA'},
                {'value': 'MUSIC', 'label': 'Video Musical'}
            ],

            # Estados
            'statuses': [
                {'value': 'RELEASING', 'label': 'En emisión'},
                {'value': 'FINISHED', 'label': 'Finalizado'},
                {'value': 'NOT_YET_RELEASED', 'label': 'Próximamente'},
                {'value': 'HIATUS', 'label': 'En pausa'},
                {'value': 'CANCELLED', 'label': 'Cancelado'}
            ],

            # Temporadas
            'seasons': [
                {'value': 'WINTER', 'label': 'Invierno (Ene-Mar)'},
                {'value': 'SPRING', 'label': 'Primavera (Abr-Jun)'},
                {'value': 'SUMMER', 'label': 'Verano (Jul-Sep)'},
                {'value': 'FALL', 'label': 'Otoño (Oct-Dic)'}
            ],

            # Fuente original
            'sources': [
                {'value': 'ORIGINAL', 'label': 'Original'},
                {'value': 'MANGA', 'label': 'Manga'},
                {'value': 'LIGHT_NOVEL', 'label': 'Light Novel'},
                {'value': 'VISUAL_NOVEL', 'label': 'Visual Novel'},
                {'value': 'VIDEO_GAME', 'label': 'Videojuego'},
                {'value': 'WEB_NOVEL', 'label': 'Web Novel'},
                {'value': 'NOVEL', 'label': 'Novela'},
                {'value': 'OTHER', 'label': 'Otro'}
            ],

            # País de origen
            'countries': [
                {'value': 'JP', 'label': 'Japón'},
                {'value': 'KR', 'label': 'Corea del Sur'},
                {'value': 'CN', 'label': 'China'},
                {'value': 'TW', 'label': 'Taiwán'}
            ],

            # Opciones de ordenamiento
            'sorts': [
                {'value': 'POPULARITY_DESC', 'label': 'Más popular'},
                {'value': 'SCORE_DESC', 'label': 'Mejor puntuación'},
                {'value': 'TRENDING_DESC', 'label': 'Tendencia'},
                {'value': 'FAVOURITES_DESC', 'label': 'Más favoritos'},
                {'value': 'START_DATE_DESC', 'label': 'Más reciente'},
                {'value': 'START_DATE', 'label': 'Más antiguo'},
                {'value': 'TITLE_ROMAJI', 'label': 'Título A-Z'},
                {'value': 'TITLE_ROMAJI_DESC', 'label': 'Título Z-A'},
                {'value': 'EPISODES_DESC', 'label': 'Más episodios'},
                {'value': 'UPDATED_AT_DESC', 'label': 'Actualizado recientemente'}
            ],

            # Años disponibles
            'years': list(range(datetime.now().year + 1, 1940, -1))
        }

    @classmethod
    def transform_to_anime_dict(cls, media: Dict, include_full: bool = False) -> Dict:
        """
        Transforma datos de AniList al formato del modelo Anime.
        Usa JSONs agrupados por categoría.
        """
        if not media:
            return {}

        # Extraer títulos
        title_data = media.get('title', {})
        title_romaji = title_data.get('romaji', '')
        title_english = title_data.get('english')
        title_native = title_data.get('native')

        # Título principal (preferir japonés/romaji)
        main_title = title_romaji or title_english

        # Generar slug
        slug = title_romaji.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s_]+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')

        # Procesar fechas
        start_date = None
        if media.get('startDate'):
            sd = media['startDate']
            if sd.get('year') and sd.get('month') and sd.get('day'):
                start_date = f"{sd['year']}-{sd['month']:02d}-{sd['day']:02d}"

        end_date = None
        if media.get('endDate'):
            ed = media['endDate']
            if ed.get('year') and ed.get('month') and ed.get('day'):
                end_date = f"{ed['year']}-{ed['month']:02d}-{ed['day']:02d}"

        # Próximo episodio
        next_airing = media.get('nextAiringEpisode')

        # Cover image principal
        cover_images = media.get('coverImage', {})
        cover_image = cover_images.get('extraLarge') or cover_images.get('large')

        # Trailer
        trailer = media.get('trailer') or {}

        # Tags (solo los más relevantes)
        tags = []
        for tag in media.get('tags', [])[:10]:
            tags.append({'name': tag.get('name'), 'rank': tag.get('rank')})

        # Resultado con JSONs agrupados
        result = {
            # Identificadores
            'anilist_id': media.get('id'),
            'mal_id': media.get('idMal'),
            'slug': slug,

            # Datos principales
            'title': main_title,
            'synopsis': media.get('description'),
            'cover_image': cover_image,
            'banner_image': media.get('bannerImage'),

            # Filtros
            'status': media.get('status'),
            'format': media.get('format'),
            'season': media.get('season'),
            'season_year': media.get('seasonYear'),
            'genres': media.get('genres', []),

            # Ordenamiento
            'average_score': media.get('averageScore'),
            'popularity': media.get('popularity'),
            'trending': media.get('trending'),
            'episodes_count': media.get('episodes'),

            # Airing
            'next_airing_episode': next_airing.get('episode') if next_airing else None,
            'next_airing_at': next_airing.get('airingAt') if next_airing else None,

            # === JSONs AGRUPADOS ===

            # Títulos
            'titles': {
                'romaji': title_romaji,
                'english': title_english,
                'native': title_native,
                'synonyms': media.get('synonyms', [])
            },

            # Imágenes adicionales
            'images': {
                'cover_large': cover_images.get('large'),
                'cover_medium': cover_images.get('medium'),
            },

            # Metadata
            'metadata': {
                'source': media.get('source'),
                'duration': media.get('duration'),
                'favourites': media.get('favourites'),
                'is_adult': media.get('isAdult', False),
                'country': media.get('countryOfOrigin'),
                'start_date': start_date,
                'end_date': end_date,
                'trailer_id': trailer.get('id'),
                'trailer_site': trailer.get('site'),
            },

            # Tags
            'tags': tags,
        }

        # Contenido enriquecido (solo si se solicita full)
        if include_full:
            # Personajes
            characters = []
            for edge in media.get('characters', {}).get('edges', []):
                char = {
                    'id': edge.get('node', {}).get('id'),
                    'name': edge.get('node', {}).get('name', {}).get('full'),
                    'image': edge.get('node', {}).get('image', {}).get('medium'),
                    'role': edge.get('role'),
                    'voice_actors': []
                }
                for va in edge.get('voiceActors', []):
                    char['voice_actors'].append({
                        'id': va.get('id'),
                        'name': va.get('name', {}).get('full'),
                        'image': va.get('image', {}).get('medium'),
                        'language': va.get('language')
                    })
                characters.append(char)
            result['characters'] = characters

            # Staff
            staff = []
            for edge in media.get('staff', {}).get('edges', []):
                staff.append({
                    'id': edge.get('node', {}).get('id'),
                    'name': edge.get('node', {}).get('name', {}).get('full'),
                    'image': edge.get('node', {}).get('image', {}).get('medium'),
                    'role': edge.get('role')
                })
            result['staff'] = staff

            # Estudios
            studios = []
            for node in media.get('studios', {}).get('nodes', []):
                studios.append({
                    'id': node.get('id'),
                    'name': node.get('name'),
                    'is_animation_studio': node.get('isAnimationStudio', False)
                })
            result['studios'] = studios

            # Relaciones
            relations = []
            for edge in media.get('relations', {}).get('edges', []):
                node = edge.get('node', {})
                relations.append({
                    'id': node.get('id'),
                    'title': node.get('title', {}).get('english') or node.get('title', {}).get('romaji'),
                    'format': node.get('format'),
                    'type': node.get('type'),
                    'relation_type': edge.get('relationType'),
                    'cover_image': node.get('coverImage', {}).get('medium')
                })
            result['relations'] = relations

            # Recomendaciones
            recommendations = []
            for node in media.get('recommendations', {}).get('nodes', []):
                rec = node.get('mediaRecommendation')
                if rec:
                    recommendations.append({
                        'id': rec.get('id'),
                        'title': rec.get('title', {}).get('english') or rec.get('title', {}).get('romaji'),
                        'cover_image': rec.get('coverImage', {}).get('medium'),
                        'format': rec.get('format'),
                        'average_score': rec.get('averageScore')
                    })
            result['recommendations'] = recommendations

        return result


def get_anilist_service() -> AniListService:
    """Retorna instancia del servicio AniList"""
    return AniListService
