import re
import json
from typing import List, Dict, Optional
from urllib.parse import urlencode
from bs4 import BeautifulSoup
from app.scrapers.base import BaseScraper


class AnimeFLVScraper(BaseScraper):
    """Scraper para AnimeFLV"""

    name = "animeflv"
    base_url = "https://www3.animeflv.net"

    # Constantes de filtros disponibles
    GENRES = {
        'accion': 'Acción',
        'artes-marciales': 'Artes Marciales',
        'aventura': 'Aventura',
        'carreras': 'Carreras',
        'ciencia-ficcion': 'Ciencia Ficción',
        'comedia': 'Comedia',
        'demencia': 'Demencia',
        'demonios': 'Demonios',
        'deportes': 'Deportes',
        'drama': 'Drama',
        'ecchi': 'Ecchi',
        'escolares': 'Escolares',
        'espacial': 'Espacial',
        'fantasia': 'Fantasía',
        'harem': 'Harem',
        'historico': 'Histórico',
        'infantil': 'Infantil',
        'josei': 'Josei',
        'juegos': 'Juegos',
        'magia': 'Magia',
        'mecha': 'Mecha',
        'militar': 'Militar',
        'misterio': 'Misterio',
        'musica': 'Música',
        'parodia': 'Parodia',
        'policia': 'Policía',
        'psicologico': 'Psicológico',
        'recuentos-de-la-vida': 'Recuentos de la vida',
        'romance': 'Romance',
        'samurai': 'Samurai',
        'seinen': 'Seinen',
        'shoujo': 'Shoujo',
        'shounen': 'Shounen',
        'sobrenatural': 'Sobrenatural',
        'superpoderes': 'Superpoderes',
        'suspenso': 'Suspenso',
        'terror': 'Terror',
        'vampiros': 'Vampiros',
        'yaoi': 'Yaoi',
        'yuri': 'Yuri',
    }

    TYPES = {
        'tv': 'TV',
        'movie': 'Película',
        'special': 'Especial',
        'ova': 'OVA',
    }

    STATUS = {
        1: 'En emisión',
        2: 'Finalizado',
        3: 'Próximamente',
    }

    ORDER = {
        'default': 'Por defecto',
        'updated': 'Actualizado recientemente',
        'added': 'Agregado recientemente',
        'title': 'Título A-Z',
        'rating': 'Calificación',
    }

    def browse(
        self,
        query: str = None,
        genres: List[str] = None,
        year: int = None,
        types: List[str] = None,
        status: List[int] = None,
        order: str = 'default',
        page: int = 1
    ) -> Dict:
        """
        Navega el directorio de AnimeFLV con filtros.

        Args:
            query: Búsqueda por texto
            genres: Lista de géneros (ej: ['accion', 'aventura'])
            year: Año de emisión (ej: 2024)
            types: Lista de tipos (ej: ['tv', 'movie'])
            status: Lista de estados (1=emisión, 2=finalizado, 3=próximamente)
            order: Orden ('default', 'updated', 'added', 'title', 'rating')
            page: Número de página

        Returns:
            Dict con 'animes', 'page', 'has_next', 'total_pages'
        """
        # Construir parámetros de URL
        params = []

        if query:
            params.append(('q', query))

        if genres:
            for genre in genres:
                params.append(('genre[]', genre))

        if year:
            params.append(('year', str(year)))

        if types:
            for t in types:
                params.append(('type[]', t))

        if status:
            for s in status:
                params.append(('status[]', str(s)))

        if order and order != 'default':
            params.append(('order', order))

        params.append(('page', str(page)))

        # Construir URL
        query_string = urlencode(params)
        url = f"{self.base_url}/browse?{query_string}"

        html = self._make_request(url)

        if not html:
            return {'animes': [], 'page': page, 'has_next': False, 'total_pages': 0}

        soup = BeautifulSoup(html, 'html.parser')
        animes = self._parse_anime_list(soup)

        # Detectar paginación
        pagination = soup.find('ul', class_='pagination')
        has_next = False
        total_pages = page

        if pagination:
            # Buscar el último número de página
            page_links = pagination.find_all('a')
            for link in page_links:
                try:
                    page_num = int(link.text.strip())
                    if page_num > total_pages:
                        total_pages = page_num
                except ValueError:
                    continue

            # Ver si hay página siguiente
            next_link = pagination.find('li', class_='active')
            if next_link and next_link.find_next_sibling('li'):
                has_next = True

        return {
            'animes': animes,
            'page': page,
            'has_next': has_next,
            'total_pages': total_pages,
            'count': len(animes)
        }

    def _parse_anime_list(self, soup: BeautifulSoup) -> List[Dict]:
        """Parsea la lista de animes de una página de browse"""
        results = []

        anime_list = soup.find('ul', class_='ListAnimes')
        if not anime_list:
            return []

        for item in anime_list.find_all('li'):
            try:
                article = item.find('article', class_='Anime')
                if not article:
                    continue

                # Extraer datos
                link = article.find('a')
                if not link:
                    continue

                href = link.get('href', '')
                anime_id = href.split('/')[-1] if href else ''

                # Imagen
                img = article.find('img')
                cover_image = img.get('src', '') if img else ''
                if cover_image and not cover_image.startswith('http'):
                    cover_image = f"{self.base_url}{cover_image}"

                # Título
                title_elem = article.find('h3', class_='Title')
                title = title_elem.text.strip() if title_elem else ''

                # Tipo (TV, OVA, etc)
                type_elem = article.find('span', class_='Type')
                anime_type = type_elem.text.strip() if type_elem else ''

                # Rating si existe
                rating_elem = article.find('span', class_='Vts')
                rating = rating_elem.text.strip() if rating_elem else None

                # Descripción corta
                desc_elem = article.find('div', class_='Description')
                description = ''
                if desc_elem:
                    desc_p = desc_elem.find('p')
                    description = desc_p.text.strip() if desc_p else ''

                # Seguidores
                followers = None
                followers_elem = article.find('span', class_='fa-users')
                if followers_elem and followers_elem.parent:
                    followers_text = followers_elem.parent.text.strip()
                    try:
                        followers = int(followers_text.replace(',', '').split()[0])
                    except (ValueError, IndexError):
                        pass

                results.append({
                    'id': anime_id,
                    'title': title,
                    'url': f"{self.base_url}{href}",
                    'cover_image': cover_image,
                    'type': anime_type,
                    'rating': rating,
                    'description': description,
                    'followers': followers
                })

            except Exception as e:
                print(f"Error parseando anime: {e}")
                continue

        return results

    def search(self, query: str) -> List[Dict]:
        """Busca animes en AnimeFLV"""
        result = self.browse(query=query)
        return result.get('animes', [])

    def get_anime_detail(self, anime_id: str) -> Optional[Dict]:
        """Obtiene el detalle de un anime"""
        url = f"{self.base_url}/anime/{anime_id}"
        html = self._make_request(url)

        if not html:
            return None

        soup = BeautifulSoup(html, 'html.parser')

        try:
            # Contenedor principal
            container = soup.find('div', class_='Ficha')
            if not container:
                container = soup.find('div', class_='Body')

            # Título
            title_elem = soup.find('h1', class_='Title')
            title = title_elem.text.strip() if title_elem else ''

            # Títulos alternativos
            alt_titles = []
            alt_elem = soup.find('span', class_='TxtAlt')
            if alt_elem:
                alt_titles = [t.strip() for t in alt_elem.text.split(',')]

            # Sinopsis
            synopsis_elem = soup.find('div', class_='Description')
            synopsis = ''
            if synopsis_elem:
                synopsis_p = synopsis_elem.find('p')
                synopsis = synopsis_p.text.strip() if synopsis_p else synopsis_elem.text.strip()

            # Imagen de portada
            cover_elem = soup.find('div', class_='Image')
            cover_image = ''
            if cover_elem:
                img = cover_elem.find('img')
                if img:
                    cover_image = img.get('src', '')
                    if cover_image and not cover_image.startswith('http'):
                        cover_image = f"{self.base_url}{cover_image}"

            # Información adicional (tipo, estado, etc)
            info = {}
            nav_elem = soup.find('nav', class_='Nvgnrs')
            if nav_elem:
                for span in nav_elem.find_all('span'):
                    text = span.text.strip()
                    if text:
                        if 'Tipo:' in text:
                            info['type'] = text.replace('Tipo:', '').strip()
                        elif any(status in text for status in ['En emision', 'Finalizado', 'Proximamente']):
                            info['status'] = text

            # Géneros
            genres = []
            genres_elem = soup.find('nav', class_='Nvgnrs')
            if genres_elem:
                for a in genres_elem.find_all('a'):
                    genre = a.text.strip()
                    if genre and genre not in ['Anime', '']:
                        genres.append(genre)

            # Rating y votos
            rating = None
            votes = None
            rating_elem = soup.find('span', id='votes_prmd')
            if rating_elem:
                rating = rating_elem.text.strip()
            votes_elem = soup.find('span', id='votes_nmbr')
            if votes_elem:
                votes = votes_elem.text.strip()

            # Número de episodios (extraer del script si está disponible)
            episodes_count = 0
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'var episodes' in script.string:
                    match = re.search(r'var episodes = \[(.*?)\]', script.string, re.DOTALL)
                    if match:
                        episodes_data = match.group(1)
                        episodes_count = len(re.findall(r'\[', episodes_data))

            return {
                'id': anime_id,
                'title': title,
                'alt_titles': alt_titles,
                'url': url,
                'cover_image': cover_image,
                'synopsis': synopsis,
                'type': info.get('type', ''),
                'status': info.get('status', ''),
                'genres': genres,
                'rating': rating,
                'votes': votes,
                'episodes_count': episodes_count
            }

        except Exception as e:
            print(f"Error obteniendo detalle de {anime_id}: {e}")
            return None

    def get_episodes(self, anime_id: str) -> List[Dict]:
        """Obtiene la lista de episodios"""
        url = f"{self.base_url}/anime/{anime_id}"
        html = self._make_request(url)

        if not html:
            return []

        episodes = []

        try:
            # Los episodios están en un script con formato: var episodes = [[ep, id], ...]
            match = re.search(r'var episodes = \[(.*?)\];', html, re.DOTALL)
            if match:
                episodes_raw = match.group(1)
                # Parsear cada episodio [numero, id]
                episode_matches = re.findall(r'\[(\d+),(\d+)\]', episodes_raw)

                for ep_num, ep_id in episode_matches:
                    episodes.append({
                        'number': int(ep_num),
                        'id': ep_id,
                        'url': f"{self.base_url}/ver/{anime_id}-{ep_num}"
                    })

            # Ordenar por número de episodio
            episodes.sort(key=lambda x: x['number'])

        except Exception as e:
            print(f"Error obteniendo episodios de {anime_id}: {e}")

        return episodes

    def get_video_sources(self, anime_id: str, episode_number: int) -> List[Dict]:
        """Obtiene las fuentes de video de un episodio"""
        url = f"{self.base_url}/ver/{anime_id}-{episode_number}"
        html = self._make_request(url)

        if not html:
            return []

        sources = []

        try:
            # Los videos están en un script con formato: var videos = {...}
            match = re.search(r'var videos = ({.*?});', html, re.DOTALL)
            if match:
                videos_json = match.group(1)
                videos_data = json.loads(videos_json)

                # SUB (subtitulado)
                if 'SUB' in videos_data:
                    for server in videos_data['SUB']:
                        sources.append({
                            'server': server.get('title', 'Unknown'),
                            'url': server.get('code', ''),
                            'type': 'SUB',
                            'ads': server.get('ads', 0)
                        })

        except json.JSONDecodeError as e:
            print(f"Error parseando JSON de videos: {e}")
        except Exception as e:
            print(f"Error obteniendo videos de {anime_id} ep {episode_number}: {e}")

        return sources

    def get_recent_episodes(self, limit: int = 20) -> List[Dict]:
        """Obtiene los episodios recientes desde la página principal"""
        html = self._make_request(self.base_url)

        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        episodes = []

        try:
            # Los episodios recientes están en ListEpisodios
            episodes_list = soup.find('ul', class_='ListEpisodios')
            if not episodes_list:
                return []

            for item in episodes_list.find_all('li')[:limit]:
                try:
                    link = item.find('a')
                    if not link:
                        continue

                    href = link.get('href', '')

                    # Imagen del episodio
                    img_container = item.find('span', class_='Image')
                    img = img_container.find('img') if img_container else None
                    thumbnail = img.get('src', '') if img else ''
                    if thumbnail and not thumbnail.startswith('http'):
                        thumbnail = f"{self.base_url}{thumbnail}"

                    # Información del episodio
                    capi = item.find('span', class_='Capi')
                    ep_text = capi.text.strip() if capi else ''
                    ep_number = 0
                    if 'Episodio' in ep_text:
                        try:
                            ep_number = int(ep_text.replace('Episodio', '').strip())
                        except ValueError:
                            pass

                    # Título del anime
                    title_elem = item.find('strong', class_='Title')
                    anime_title = title_elem.text.strip() if title_elem else ''

                    # Extraer anime_id del href (formato: /ver/anime-id-episodio)
                    parts = href.split('/')[-1].rsplit('-', 1)
                    anime_id = parts[0] if len(parts) > 1 else ''

                    episodes.append({
                        'id': f"{anime_id}-{ep_number}",
                        'anime_id': anime_id,
                        'anime_title': anime_title,
                        'episode_number': ep_number,
                        'thumbnail': thumbnail,
                        'url': f"{self.base_url}{href}"
                    })

                except Exception as e:
                    print(f"Error parseando episodio reciente: {e}")
                    continue

        except Exception as e:
            print(f"Error obteniendo episodios recientes: {e}")

        return episodes

    def get_popular_animes(self, limit: int = 24, order: str = 'default') -> List[Dict]:
        """
        Obtiene los animes en emisión.

        Args:
            limit: Número máximo de animes
            order: 'default' (actualizado), 'rating' (calificación)
        """
        result = self.browse(status=[1], order=order, page=1)
        return result.get('animes', [])[:limit]

    def get_latest_animes(self, page: int = 1, limit: int = 24) -> List[Dict]:
        """Obtiene los últimos animes añadidos"""
        result = self.browse(order='added', page=page)
        return result.get('animes', [])[:limit]

    def get_airing_animes(self, page: int = 1, order: str = 'default') -> Dict:
        """Obtiene animes en emisión con paginación"""
        return self.browse(status=[1], order=order, page=page)

    def get_top_rated_airing(self, limit: int = 24) -> List[Dict]:
        """Obtiene los animes en emisión mejor calificados"""
        result = self.browse(status=[1], order='rating', page=1)
        return result.get('animes', [])[:limit]

    def get_finished_animes(self, page: int = 1) -> Dict:
        """Obtiene animes finalizados con paginación"""
        return self.browse(status=[2], order='rating', page=page)

    def get_animes_by_genre(self, genre: str, page: int = 1) -> Dict:
        """Obtiene animes por género"""
        return self.browse(genres=[genre], order='rating', page=page)

    def get_animes_by_year(self, year: int, page: int = 1) -> Dict:
        """Obtiene animes por año"""
        return self.browse(year=year, order='rating', page=page)

    def get_top_rated(self, limit: int = 24) -> List[Dict]:
        """Obtiene los animes mejor calificados"""
        result = self.browse(order='rating', page=1)
        return result.get('animes', [])[:limit]

    def get_directory_page(self, page: int = 1) -> Dict:
        """Obtiene una página del directorio completo"""
        return self.browse(page=page)

    def get_all_animes_generator(self, max_pages: int = None):
        """
        Generador que itera por todas las páginas del directorio.
        Útil para sincronización masiva.

        Args:
            max_pages: Límite de páginas (None = todas)

        Yields:
            Dict con información de cada página
        """
        page = 1
        while True:
            result = self.browse(page=page)

            if not result.get('animes'):
                break

            yield result

            if not result.get('has_next'):
                break

            if max_pages and page >= max_pages:
                break

            page += 1
