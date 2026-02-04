"""
Servicio para obtener imágenes de anime desde APIs externas.
Esto permite tener imágenes consistentes sin importar la fuente de scraping.
"""

import requests
import time
from typing import Optional, Dict
from functools import lru_cache


class ImageService:
    """Servicio para obtener imágenes de anime desde APIs externas"""

    # APIs disponibles
    JIKAN_BASE = "https://api.jikan.moe/v4"
    ANILIST_BASE = "https://graphql.anilist.co"

    # Rate limiting para Jikan (3 requests por segundo)
    _last_request_time = 0
    _rate_limit_delay = 0.35  # 350ms entre requests

    @classmethod
    def _rate_limit(cls):
        """Aplica rate limiting para no sobrecargar las APIs"""
        current_time = time.time()
        elapsed = current_time - cls._last_request_time
        if elapsed < cls._rate_limit_delay:
            time.sleep(cls._rate_limit_delay - elapsed)
        cls._last_request_time = time.time()

    @classmethod
    @lru_cache(maxsize=1000)
    def search_jikan(cls, title: str) -> Optional[Dict]:
        """
        Busca un anime en Jikan (MyAnimeList) y retorna sus imágenes.

        Args:
            title: Título del anime a buscar

        Returns:
            Dict con mal_id, title, images, synopsis, etc. o None
        """
        cls._rate_limit()

        try:
            # Limpiar título para mejor búsqueda
            clean_title = cls._clean_title(title)

            response = requests.get(
                f"{cls.JIKAN_BASE}/anime",
                params={
                    'q': clean_title,
                    'limit': 1,
                    'sfw': True
                },
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                if data.get('data') and len(data['data']) > 0:
                    anime = data['data'][0]
                    return {
                        'mal_id': anime.get('mal_id'),
                        'title': anime.get('title'),
                        'title_english': anime.get('title_english'),
                        'title_japanese': anime.get('title_japanese'),
                        'images': {
                            'jpg': {
                                'small': anime.get('images', {}).get('jpg', {}).get('small_image_url'),
                                'medium': anime.get('images', {}).get('jpg', {}).get('image_url'),
                                'large': anime.get('images', {}).get('jpg', {}).get('large_image_url'),
                            },
                            'webp': {
                                'small': anime.get('images', {}).get('webp', {}).get('small_image_url'),
                                'medium': anime.get('images', {}).get('webp', {}).get('image_url'),
                                'large': anime.get('images', {}).get('webp', {}).get('large_image_url'),
                            }
                        },
                        'synopsis': anime.get('synopsis'),
                        'score': anime.get('score'),
                        'episodes': anime.get('episodes'),
                        'status': anime.get('status'),
                        'genres': [g.get('name') for g in anime.get('genres', [])],
                        'year': anime.get('year'),
                    }

            return None

        except Exception as e:
            print(f"Error buscando en Jikan: {e}")
            return None

    @classmethod
    def search_anilist(cls, title: str) -> Optional[Dict]:
        """
        Busca un anime en AniList y retorna sus imágenes.

        Args:
            title: Título del anime a buscar

        Returns:
            Dict con id, title, coverImage, bannerImage, etc. o None
        """
        query = '''
        query ($search: String) {
            Media(search: $search, type: ANIME) {
                id
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
                description
                averageScore
                episodes
                status
                genres
                seasonYear
            }
        }
        '''

        try:
            response = requests.post(
                cls.ANILIST_BASE,
                json={
                    'query': query,
                    'variables': {'search': cls._clean_title(title)}
                },
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                media = data.get('data', {}).get('Media')
                if media:
                    return {
                        'anilist_id': media.get('id'),
                        'title': media.get('title', {}).get('romaji'),
                        'title_english': media.get('title', {}).get('english'),
                        'title_japanese': media.get('title', {}).get('native'),
                        'images': {
                            'cover': {
                                'extraLarge': media.get('coverImage', {}).get('extraLarge'),
                                'large': media.get('coverImage', {}).get('large'),
                                'medium': media.get('coverImage', {}).get('medium'),
                            },
                            'banner': media.get('bannerImage'),
                        },
                        'synopsis': media.get('description'),
                        'score': media.get('averageScore'),
                        'episodes': media.get('episodes'),
                        'status': media.get('status'),
                        'genres': media.get('genres', []),
                        'year': media.get('seasonYear'),
                    }

            return None

        except Exception as e:
            print(f"Error buscando en AniList: {e}")
            return None

    @classmethod
    def get_anime_images(cls, title: str, prefer: str = 'jikan') -> Optional[Dict]:
        """
        Obtiene imágenes de un anime, intentando primero la fuente preferida.

        Args:
            title: Título del anime
            prefer: 'jikan' o 'anilist'

        Returns:
            Dict con cover_image, banner_image, y metadata adicional
        """
        result = None

        if prefer == 'jikan':
            result = cls.search_jikan(title)
            if not result:
                result = cls.search_anilist(title)
        else:
            result = cls.search_anilist(title)
            if not result:
                result = cls.search_jikan(title)

        if not result:
            return None

        # Normalizar el resultado
        if 'mal_id' in result:
            # Es de Jikan
            return {
                'source': 'mal',
                'source_id': result['mal_id'],
                'cover_image': result['images']['jpg']['large'] or result['images']['jpg']['medium'],
                'cover_image_small': result['images']['jpg']['small'],
                'banner_image': None,  # MAL no tiene banners
                'title': result['title'],
                'title_english': result.get('title_english'),
                'synopsis': result.get('synopsis'),
                'score': result.get('score'),
                'genres': result.get('genres', []),
                'year': result.get('year'),
            }
        else:
            # Es de AniList
            return {
                'source': 'anilist',
                'source_id': result['anilist_id'],
                'cover_image': result['images']['cover']['extraLarge'] or result['images']['cover']['large'],
                'cover_image_small': result['images']['cover']['medium'],
                'banner_image': result['images']['banner'],
                'title': result['title'],
                'title_english': result.get('title_english'),
                'synopsis': result.get('synopsis'),
                'score': result.get('score') / 10 if result.get('score') else None,  # AniList usa 0-100
                'genres': result.get('genres', []),
                'year': result.get('year'),
            }

    @staticmethod
    def _clean_title(title: str) -> str:
        """Limpia el título para mejor búsqueda"""
        import re

        # Remover temporadas comunes
        title = re.sub(r'\s*(Season|Temporada)\s*\d+', '', title, flags=re.IGNORECASE)
        title = re.sub(r'\s*\d+(st|nd|rd|th)\s*Season', '', title, flags=re.IGNORECASE)
        title = re.sub(r'\s*S\d+$', '', title)

        # Remover años entre paréntesis
        title = re.sub(r'\s*\(\d{4}\)\s*', '', title)

        # Remover caracteres especiales al final
        title = re.sub(r'\s*[-:]\s*$', '', title)

        return title.strip()


# Función de conveniencia
def get_anime_images(title: str, prefer: str = 'anilist') -> Optional[Dict]:
    """
    Función de conveniencia para obtener imágenes de anime.

    Recomiendo usar 'anilist' como preferencia porque:
    - Tiene imágenes de banner
    - Es más rápido (GraphQL)
    - Sin rate limiting estricto
    """
    return ImageService.get_anime_images(title, prefer)
