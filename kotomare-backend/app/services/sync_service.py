"""
Servicio de sincronización para scraping y almacenamiento en base de datos.
Este servicio es ejecutado por el SuperAdmin para actualizar el contenido.
"""

from datetime import datetime
from typing import Dict, List, Optional
from app.extensions import db
from app.models import Anime, Episode, HomeSection, HomeSectionAnime
from app.scrapers import get_scraper
from app.services.image_service import get_anime_images


class SyncService:
    """Servicio para sincronizar datos desde scrapers a la base de datos"""

    @staticmethod
    def _enrich_with_external_images(anime: 'Anime', title: str) -> bool:
        """
        Enriquece un anime con imágenes de APIs externas (AniList/MAL).

        Args:
            anime: Objeto Anime a actualizar
            title: Título para buscar

        Returns:
            True si se encontraron imágenes, False si no
        """
        try:
            external_data = get_anime_images(title, prefer='anilist')

            if external_data:
                # Actualizar imágenes
                if external_data.get('cover_image'):
                    anime.cover_image = external_data['cover_image']

                if external_data.get('banner_image'):
                    anime.banner_image = external_data['banner_image']

                # Actualizar metadata si no existe
                if not anime.synopsis and external_data.get('synopsis'):
                    # Limpiar HTML de la sinopsis de AniList
                    import re
                    synopsis = external_data['synopsis']
                    synopsis = re.sub(r'<[^>]+>', '', synopsis)  # Remover HTML
                    synopsis = re.sub(r'\n+', '\n', synopsis)  # Limpiar saltos
                    anime.synopsis = synopsis[:2000]  # Limitar longitud

                if not anime.genres and external_data.get('genres'):
                    anime.genres = external_data['genres']

                # Guardar referencia a la fuente de imágenes
                if anime.sources is None:
                    anime.sources = {}
                sources_copy = dict(anime.sources)
                sources_copy['_images'] = {
                    'source': external_data['source'],
                    'source_id': external_data['source_id'],
                    'last_updated': datetime.utcnow().isoformat()
                }
                anime.sources = sources_copy

                return True

        except Exception as e:
            print(f"Error enriqueciendo anime '{title}': {e}")

        return False

    @staticmethod
    def sync_recent_episodes(source: str = 'animeflv', limit: int = 20) -> Dict:
        """
        Sincroniza los episodios recientes desde una fuente.
        Crea los animes si no existen.
        """
        scraper = get_scraper(source)
        if not scraper:
            return {'success': False, 'error': f'Fuente {source} no disponible'}

        try:
            episodes_data = scraper.get_recent_episodes(limit=limit)
            created_episodes = 0
            updated_animes = 0
            created_animes = 0

            for ep_data in episodes_data:
                # Buscar o crear el anime
                anime_slug = Anime.generate_slug(ep_data['anime_title'])
                anime = Anime.query.filter_by(slug=anime_slug).first()

                if not anime:
                    # Crear nuevo anime
                    anime = Anime(
                        title=ep_data['anime_title'],
                        slug=anime_slug,
                        cover_image=ep_data.get('thumbnail'),
                    )
                    anime.add_source(source, {
                        'id': ep_data['anime_id'],
                        'title': ep_data['anime_title'],
                    })
                    db.session.add(anime)
                    db.session.flush()  # Para obtener el ID
                    created_animes += 1
                else:
                    # Actualizar imagen si no tiene
                    if not anime.cover_image and ep_data.get('thumbnail'):
                        anime.cover_image = ep_data['thumbnail']

                    # Asegurar que tiene la fuente
                    if not anime.has_source(source):
                        anime.add_source(source, {
                            'id': ep_data['anime_id'],
                            'title': ep_data['anime_title'],
                        })
                    updated_animes += 1

                # Buscar o crear el episodio
                existing_ep = Episode.query.filter_by(
                    anime_id=anime.id,
                    number=ep_data['episode_number'],
                    source=source
                ).first()

                if not existing_ep:
                    episode = Episode(
                        anime_id=anime.id,
                        number=ep_data['episode_number'],
                        thumbnail=ep_data.get('thumbnail'),
                        source=source,
                        source_id=ep_data.get('id'),
                        source_url=ep_data.get('url'),
                        created_at=datetime.utcnow()
                    )
                    db.session.add(episode)
                    created_episodes += 1

            db.session.commit()

            return {
                'success': True,
                'created_episodes': created_episodes,
                'created_animes': created_animes,
                'updated_animes': updated_animes,
                'total_scraped': len(episodes_data)
            }

        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    @staticmethod
    def sync_popular_animes(source: str = 'animeflv', limit: int = 20, order: str = 'default') -> Dict:
        """
        Sincroniza los animes en emisión desde una fuente.
        Los añade a la sección 'popular' del home.

        Args:
            source: Fuente de datos
            limit: Número de animes
            order: 'default' (actualizado recientemente) o 'rating' (mejor calificados)
        """
        scraper = get_scraper(source)
        if not scraper:
            return {'success': False, 'error': f'Fuente {source} no disponible'}

        try:
            animes_data = scraper.get_popular_animes(limit=limit, order=order)
            created = 0
            updated = 0

            # Obtener o crear la sección 'popular'
            section = HomeSection.query.filter_by(name='popular').first()
            if not section:
                section = HomeSection(
                    name='popular',
                    title='En Emisión',
                    subtitle='Animes que se están emitiendo actualmente',
                    order=1,
                    section_type='anime'
                )
                db.session.add(section)
                db.session.flush()

            # Limpiar sección anterior
            HomeSectionAnime.query.filter_by(section_id=section.id).delete()

            for idx, anime_data in enumerate(animes_data):
                anime_slug = Anime.generate_slug(anime_data['title'])
                anime = Anime.query.filter_by(slug=anime_slug).first()

                if not anime:
                    anime = Anime(
                        title=anime_data['title'],
                        slug=anime_slug,
                        cover_image=anime_data.get('cover_image'),
                        type=anime_data.get('type'),
                        status='En emisión'
                    )
                    anime.add_source(source, {
                        'id': anime_data['id'],
                        'url': anime_data.get('url'),
                        'title': anime_data['title'],
                    })
                    db.session.add(anime)
                    db.session.flush()
                    created += 1
                else:
                    # Actualizar datos
                    if anime_data.get('cover_image') and not anime.cover_image:
                        anime.cover_image = anime_data['cover_image']
                    if anime_data.get('type'):
                        anime.type = anime_data['type']
                    anime.status = 'En emisión'

                    if not anime.has_source(source):
                        anime.add_source(source, {
                            'id': anime_data['id'],
                            'url': anime_data.get('url'),
                            'title': anime_data['title'],
                        })
                    updated += 1

                # Añadir a la sección
                section_anime = HomeSectionAnime(
                    section_id=section.id,
                    anime_id=anime.id,
                    order=idx
                )
                db.session.add(section_anime)

            db.session.commit()

            return {
                'success': True,
                'created': created,
                'updated': updated,
                'total_scraped': len(animes_data)
            }

        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    @staticmethod
    def sync_latest_animes(source: str = 'animeflv', limit: int = 24) -> Dict:
        """
        Sincroniza los últimos animes añadidos desde una fuente.
        Los añade a la sección 'latest' del home.
        """
        scraper = get_scraper(source)
        if not scraper:
            return {'success': False, 'error': f'Fuente {source} no disponible'}

        try:
            animes_data = scraper.get_latest_animes(limit=limit)
            created = 0
            updated = 0

            # Obtener o crear la sección 'latest'
            section = HomeSection.query.filter_by(name='latest').first()
            if not section:
                section = HomeSection(
                    name='latest',
                    title='Últimos Agregados',
                    subtitle='Animes recientemente añadidos al catálogo',
                    order=2,
                    section_type='anime'
                )
                db.session.add(section)
                db.session.flush()

            # Limpiar sección anterior
            HomeSectionAnime.query.filter_by(section_id=section.id).delete()

            for idx, anime_data in enumerate(animes_data):
                anime_slug = Anime.generate_slug(anime_data['title'])
                anime = Anime.query.filter_by(slug=anime_slug).first()

                if not anime:
                    anime = Anime(
                        title=anime_data['title'],
                        slug=anime_slug,
                        cover_image=anime_data.get('cover_image'),
                        type=anime_data.get('type'),
                    )
                    anime.add_source(source, {
                        'id': anime_data['id'],
                        'url': anime_data.get('url'),
                        'title': anime_data['title'],
                        'rating': anime_data.get('rating'),
                    })
                    db.session.add(anime)
                    db.session.flush()
                    created += 1
                else:
                    if anime_data.get('cover_image') and not anime.cover_image:
                        anime.cover_image = anime_data['cover_image']
                    if anime_data.get('type'):
                        anime.type = anime_data['type']

                    if not anime.has_source(source):
                        anime.add_source(source, {
                            'id': anime_data['id'],
                            'url': anime_data.get('url'),
                            'title': anime_data['title'],
                            'rating': anime_data.get('rating'),
                        })
                    updated += 1

                # Añadir a la sección
                section_anime = HomeSectionAnime(
                    section_id=section.id,
                    anime_id=anime.id,
                    order=idx
                )
                db.session.add(section_anime)

            db.session.commit()

            return {
                'success': True,
                'created': created,
                'updated': updated,
                'total_scraped': len(animes_data)
            }

        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    @staticmethod
    def sync_featured_animes(source: str = 'animeflv', limit: int = 5, order: str = 'default', enrich_images: bool = True) -> Dict:
        """
        Sincroniza animes destacados para el carrusel.
        Obtiene detalles completos de los primeros animes en emisión.

        Args:
            source: Fuente de datos
            limit: Número de animes para el carrusel
            order: 'default' (actualizado recientemente) o 'rating' (mejor calificados)
            enrich_images: Si True, obtiene imágenes de alta calidad desde AniList/MAL
        """
        scraper = get_scraper(source)
        if not scraper:
            return {'success': False, 'error': f'Fuente {source} no disponible'}

        try:
            animes_data = scraper.get_popular_animes(limit=limit, order=order)
            created = 0
            updated = 0
            enriched = 0

            # Obtener o crear la sección 'featured'
            section = HomeSection.query.filter_by(name='featured').first()
            if not section:
                section = HomeSection(
                    name='featured',
                    title='Destacados',
                    subtitle='Los mejores animes del momento',
                    order=0,
                    section_type='anime',
                    max_items=5
                )
                db.session.add(section)
                db.session.flush()

            # Limpiar sección anterior
            HomeSectionAnime.query.filter_by(section_id=section.id).delete()

            for order_idx, anime_data in enumerate(animes_data):
                anime_slug = Anime.generate_slug(anime_data['title'])
                anime = Anime.query.filter_by(slug=anime_slug).first()

                # Obtener detalles completos del anime
                details = scraper.get_anime_detail(anime_data['id'])

                if not anime:
                    anime = Anime(
                        title=anime_data['title'],
                        slug=anime_slug,
                        cover_image=anime_data.get('cover_image'),
                        type=anime_data.get('type'),
                        status='En emisión'
                    )
                    db.session.add(anime)
                    db.session.flush()
                    created += 1
                else:
                    updated += 1

                # Actualizar con detalles si los obtuvimos
                if details:
                    if details.get('synopsis'):
                        anime.synopsis = details['synopsis']
                    if details.get('genres'):
                        anime.genres = details['genres']
                    if details.get('cover_image') and not anime.cover_image:
                        anime.cover_image = details['cover_image']
                    if details.get('status'):
                        anime.status = details['status']
                    if details.get('type'):
                        anime.type = details['type']

                    anime.add_source(source, {
                        'id': anime_data['id'],
                        'url': anime_data.get('url'),
                        'title': anime_data['title'],
                        'rating': details.get('rating'),
                        'votes': details.get('votes'),
                        'episodes_count': details.get('episodes_count'),
                    })

                # Enriquecer con imágenes externas (AniList/MAL)
                if enrich_images:
                    if SyncService._enrich_with_external_images(anime, anime_data['title']):
                        enriched += 1

                # Añadir a la sección
                section_anime = HomeSectionAnime(
                    section_id=section.id,
                    anime_id=anime.id,
                    order=order_idx
                )
                db.session.add(section_anime)

            db.session.commit()

            return {
                'success': True,
                'created': created,
                'updated': updated,
                'enriched': enriched,
                'total_scraped': len(animes_data)
            }

        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    @staticmethod
    def sync_all(source: str = 'animeflv') -> Dict:
        """
        Sincroniza todo: destacados, episodios recientes, populares y últimos añadidos.
        """
        results = {
            'featured': SyncService.sync_featured_animes(source, limit=5),
            'recent_episodes': SyncService.sync_recent_episodes(source, limit=20),
            'popular': SyncService.sync_popular_animes(source, limit=12),
            'latest': SyncService.sync_latest_animes(source, limit=12),
        }

        all_success = all(r.get('success', False) for r in results.values())

        return {
            'success': all_success,
            'results': results
        }

    @staticmethod
    def sync_directory(
        source: str = 'animeflv',
        max_pages: int = 5,
        genres: List[str] = None,
        year: int = None,
        types: List[str] = None,
        status: List[int] = None,
        order: str = 'rating',
        with_details: bool = False
    ) -> Dict:
        """
        Sincroniza animes del directorio usando filtros.
        Útil para importación masiva controlada.

        Args:
            source: Fuente de datos
            max_pages: Máximo de páginas a procesar (24 animes/página)
            genres: Filtrar por géneros
            year: Filtrar por año
            types: Filtrar por tipo (tv, movie, ova, special)
            status: Filtrar por estado (1=emisión, 2=finalizado, 3=próximo)
            order: Orden (rating, updated, added, title)
            with_details: Si True, obtiene detalles completos (más lento)

        Returns:
            Dict con estadísticas de sincronización
        """
        scraper = get_scraper(source)
        if not scraper:
            return {'success': False, 'error': f'Fuente {source} no disponible'}

        try:
            created = 0
            updated = 0
            total_scraped = 0
            pages_processed = 0

            for page in range(1, max_pages + 1):
                result = scraper.browse(
                    genres=genres,
                    year=year,
                    types=types,
                    status=status,
                    order=order,
                    page=page
                )

                animes_data = result.get('animes', [])
                if not animes_data:
                    break

                for anime_data in animes_data:
                    anime_slug = Anime.generate_slug(anime_data['title'])
                    anime = Anime.query.filter_by(slug=anime_slug).first()

                    # Obtener detalles si se solicita
                    details = None
                    if with_details:
                        details = scraper.get_anime_detail(anime_data['id'])

                    if not anime:
                        anime = Anime(
                            title=anime_data['title'],
                            slug=anime_slug,
                            cover_image=anime_data.get('cover_image'),
                            type=anime_data.get('type'),
                        )
                        db.session.add(anime)
                        db.session.flush()
                        created += 1
                    else:
                        updated += 1

                    # Actualizar datos básicos
                    if anime_data.get('cover_image') and not anime.cover_image:
                        anime.cover_image = anime_data['cover_image']
                    if anime_data.get('type'):
                        anime.type = anime_data['type']
                    if anime_data.get('rating'):
                        # Guardar rating en sources
                        pass

                    # Si tenemos detalles, actualizar más campos
                    if details:
                        if details.get('synopsis'):
                            anime.synopsis = details['synopsis']
                        if details.get('genres'):
                            anime.genres = details['genres']
                        if details.get('status'):
                            anime.status = details['status']

                    # Añadir/actualizar fuente
                    source_info = {
                        'id': anime_data['id'],
                        'url': anime_data.get('url'),
                        'title': anime_data['title'],
                        'rating': anime_data.get('rating'),
                    }
                    if details:
                        source_info.update({
                            'votes': details.get('votes'),
                            'episodes_count': details.get('episodes_count'),
                        })
                    anime.add_source(source, source_info)

                    total_scraped += 1

                pages_processed += 1

                # Commit cada página para no perder progreso
                db.session.commit()

                if not result.get('has_next'):
                    break

            return {
                'success': True,
                'created': created,
                'updated': updated,
                'total_scraped': total_scraped,
                'pages_processed': pages_processed
            }

        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}

    @staticmethod
    def sync_top_rated(source: str = 'animeflv', pages: int = 3) -> Dict:
        """Sincroniza los animes mejor calificados (por defecto 72 animes)"""
        return SyncService.sync_directory(
            source=source,
            max_pages=pages,
            order='rating',
            with_details=True
        )

    @staticmethod
    def sync_by_genre(source: str = 'animeflv', genre: str = 'accion', pages: int = 2) -> Dict:
        """Sincroniza animes de un género específico"""
        return SyncService.sync_directory(
            source=source,
            max_pages=pages,
            genres=[genre],
            order='rating',
            with_details=False
        )

    @staticmethod
    def sync_by_year(source: str = 'animeflv', year: int = 2024, pages: int = 3) -> Dict:
        """Sincroniza animes de un año específico"""
        return SyncService.sync_directory(
            source=source,
            max_pages=pages,
            year=year,
            order='rating',
            with_details=True
        )

    @staticmethod
    def sync_airing(source: str = 'animeflv', pages: int = 3, order: str = 'default') -> Dict:
        """Sincroniza todos los animes en emisión"""
        return SyncService.sync_directory(
            source=source,
            max_pages=pages,
            status=[1],
            order=order,
            with_details=True
        )
