from abc import ABC, abstractmethod
from typing import List, Dict, Optional


class BaseScraper(ABC):
    """Clase base abstracta para todos los scrapers"""

    name: str = "base"
    base_url: str = ""

    @abstractmethod
    def search(self, query: str) -> List[Dict]:
        """
        Busca animes por nombre.

        Args:
            query: Término de búsqueda

        Returns:
            Lista de diccionarios con información del anime:
            [
                {
                    'id': str,
                    'title': str,
                    'url': str,
                    'cover_image': str,
                    'type': str,
                    'status': str,
                    ...
                }
            ]
        """
        pass

    @abstractmethod
    def get_anime_detail(self, anime_id: str) -> Optional[Dict]:
        """
        Obtiene el detalle completo de un anime.

        Args:
            anime_id: ID del anime en la fuente

        Returns:
            Diccionario con toda la información del anime
        """
        pass

    @abstractmethod
    def get_episodes(self, anime_id: str) -> List[Dict]:
        """
        Obtiene la lista de episodios de un anime.

        Args:
            anime_id: ID del anime en la fuente

        Returns:
            Lista de episodios:
            [
                {
                    'number': int,
                    'url': str,
                    'title': str (opcional),
                    ...
                }
            ]
        """
        pass

    @abstractmethod
    def get_video_sources(self, anime_id: str, episode_number: int) -> List[Dict]:
        """
        Obtiene las fuentes de video de un episodio.

        Args:
            anime_id: ID del anime en la fuente
            episode_number: Número del episodio

        Returns:
            Lista de fuentes de video:
            [
                {
                    'server': str,
                    'url': str,
                    'quality': str (opcional),
                    ...
                }
            ]
        """
        pass

    def _make_request(self, url: str, **kwargs) -> Optional[str]:
        """Hace una petición HTTP y retorna el contenido"""
        import requests

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        try:
            response = requests.get(url, headers=headers, timeout=10, **kwargs)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"Error en request a {url}: {e}")
            return None
