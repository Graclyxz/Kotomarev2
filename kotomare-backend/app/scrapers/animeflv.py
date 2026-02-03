import re
import json
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from app.scrapers.base import BaseScraper


class AnimeFLVScraper(BaseScraper):
    """Scraper para AnimeFLV"""

    name = "animeflv"
    base_url = "https://www3.animeflv.net"

    def search(self, query: str) -> List[Dict]:
        """Busca animes en AnimeFLV"""
        url = f"{self.base_url}/browse?q={query}"
        html = self._make_request(url)

        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        results = []

        # Los resultados están en una lista con clase "ListAnimes"
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

                results.append({
                    'id': anime_id,
                    'title': title,
                    'url': f"{self.base_url}{href}",
                    'cover_image': cover_image,
                    'type': anime_type,
                    'rating': rating
                })

            except Exception as e:
                print(f"Error parseando anime: {e}")
                continue

        return results

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
