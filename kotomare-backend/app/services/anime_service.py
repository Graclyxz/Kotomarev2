from typing import List, Dict, Optional
from app.extensions import db
from app.models import Anime
from app.scrapers import get_scraper, get_available_sources


class AnimeService:
    """Servicio para gestionar búsqueda y obtención de animes"""

    @staticmethod
    def search(query: str, sources: List[str] = None) -> List[Dict]:
        """
        Busca animes en la base de datos y en las fuentes externas.

        Flujo:
        1. Buscar en la base de datos local
        2. Si no hay suficientes resultados, buscar en fuentes externas
        3. Guardar nuevos animes encontrados en la DB
        4. Retornar resultados combinados
        """
        if sources is None:
            sources = get_available_sources()

        results = []
        found_slugs = set()

        # 1. Buscar en la base de datos local
        db_animes = Anime.query.filter(
            Anime.title.ilike(f'%{query}%')
        ).limit(20).all()

        for anime in db_animes:
            results.append(anime.to_dict())
            found_slugs.add(anime.slug)

        # 2. Buscar en fuentes externas si no tenemos suficientes resultados
        if len(results) < 10:
            for source_name in sources:
                scraper = get_scraper(source_name)
                if not scraper:
                    continue

                try:
                    external_results = scraper.search(query)

                    for item in external_results:
                        # Verificar si ya existe en la DB
                        slug = Anime.generate_slug(item['title'])

                        if slug in found_slugs:
                            # Ya lo tenemos, actualizar la fuente si es necesario
                            existing = Anime.query.filter_by(slug=slug).first()
                            if existing and not existing.has_source(source_name):
                                existing.add_source(source_name, item)
                                db.session.commit()
                            continue

                        # Verificar si existe en DB por slug
                        existing = Anime.query.filter_by(slug=slug).first()
                        if existing:
                            if not existing.has_source(source_name):
                                existing.add_source(source_name, item)
                                db.session.commit()
                            results.append(existing.to_dict())
                            found_slugs.add(slug)
                            continue

                        # Crear nuevo anime
                        anime = AnimeService._create_anime_from_source(
                            item, source_name, slug
                        )
                        if anime:
                            results.append(anime.to_dict())
                            found_slugs.add(slug)

                except Exception as e:
                    print(f"Error buscando en {source_name}: {e}")
                    continue

        return results

    @staticmethod
    def _create_anime_from_source(data: Dict, source_name: str, slug: str) -> Optional[Anime]:
        """Crea un nuevo anime a partir de datos de una fuente externa"""
        try:
            anime = Anime(
                title=data.get('title', ''),
                slug=slug,
                cover_image=data.get('cover_image'),
                type=data.get('type'),
                status=data.get('status'),
                genres=data.get('genres', [])
            )
            anime.add_source(source_name, data)

            db.session.add(anime)
            db.session.commit()

            return anime
        except Exception as e:
            db.session.rollback()
            print(f"Error creando anime: {e}")
            return None

    @staticmethod
    def get_anime_detail(slug: str, source: str = None) -> Optional[Dict]:
        """Obtiene el detalle completo de un anime, actualizando si es necesario"""
        anime = Anime.query.filter_by(slug=slug).first()

        if not anime:
            return None

        # Si se especifica una fuente y tenemos datos de esa fuente
        if source and anime.has_source(source):
            source_data = anime.get_source(source)
            scraper = get_scraper(source)

            if scraper and source_data.get('id'):
                try:
                    detail = scraper.get_anime_detail(source_data['id'])
                    if detail:
                        # Actualizar datos del anime
                        if detail.get('synopsis') and not anime.synopsis:
                            anime.synopsis = detail['synopsis']
                        if detail.get('genres'):
                            anime.genres = detail['genres']
                        if detail.get('status'):
                            anime.status = detail['status']

                        anime.add_source(source, detail)
                        db.session.commit()
                except Exception as e:
                    print(f"Error actualizando detalle: {e}")

        return anime.to_dict()

    @staticmethod
    def get_episodes(anime: Anime, source: str = 'animeflv') -> List[Dict]:
        """Obtiene los episodios de un anime desde una fuente"""
        if not anime.has_source(source):
            return []

        source_data = anime.get_source(source)
        scraper = get_scraper(source)

        if not scraper or not source_data.get('id'):
            return []

        try:
            return scraper.get_episodes(source_data['id'])
        except Exception as e:
            print(f"Error obteniendo episodios: {e}")
            return []

    @staticmethod
    def get_episode_videos(anime: Anime, episode_number: int, source: str = 'animeflv') -> List[Dict]:
        """Obtiene los videos de un episodio"""
        if not anime.has_source(source):
            return []

        source_data = anime.get_source(source)
        scraper = get_scraper(source)

        if not scraper or not source_data.get('id'):
            return []

        try:
            return scraper.get_video_sources(source_data['id'], episode_number)
        except Exception as e:
            print(f"Error obteniendo videos: {e}")
            return []
