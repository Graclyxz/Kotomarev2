"""
Modelo Anime simplificado.
Solo almacena datos básicos cuando el usuario hace scraping de una fuente.
Los datos completos del anime se obtienen en tiempo real desde AniList.
"""

from datetime import datetime
from app.extensions import db


class Anime(db.Model):
    """
    Modelo minimalista para almacenar animes con fuentes de streaming.

    Flujo:
    1. Usuario navega catálogo → datos desde AniList API (tiempo real)
    2. Usuario elige fuente de streaming → scraping + guardado aquí
    3. Futuro: servir desde BD local si existe, sino desde AniList
    """
    __tablename__ = 'animes'

    id = db.Column(db.Integer, primary_key=True)

    # Identificador único de AniList
    anilist_id = db.Column(db.Integer, unique=True, nullable=False, index=True)

    # Datos básicos para identificación
    title = db.Column(db.String(500), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    cover_image = db.Column(db.String(500))

    # Fuentes de streaming con episodios scrapeados
    streaming_sources = db.Column(db.JSON, default=dict)
    # Estructura:
    # {
    #     "animeflv": {
    #         "id": "shingeki-no-kyojin",
    #         "url": "https://www3.animeflv.net/anime/shingeki-no-kyojin",
    #         "episodes_count": 25,
    #         "episodes": [
    #             {"number": 1, "id": "shingeki-no-kyojin-1"},
    #             {"number": 2, "id": "shingeki-no-kyojin-2"},
    #             ...
    #         ],
    #         "linked_at": "2024-01-15T10:30:00"
    #     },
    #     "jkanime": {
    #         "id": "shingeki-no-kyojin-tv",
    #         "url": "https://jkanime.net/shingeki-no-kyojin-tv/",
    #         "episodes_count": 25,
    #         "episodes": [...],
    #         "linked_at": "2024-01-15T10:35:00"
    #     }
    # }

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    favorites = db.relationship('Favorite', backref='anime', lazy='dynamic', cascade='all, delete-orphan')
    watchlist_entries = db.relationship('Watchlist', backref='anime', lazy='dynamic', cascade='all, delete-orphan')

    # ============== MÉTODOS STREAMING ==============

    def add_streaming_source(self, source_name: str, source_data: dict):
        """
        Añade o actualiza una fuente de streaming con sus episodios.

        Args:
            source_name: Nombre de la fuente (animeflv, jkanime, etc.)
            source_data: Datos de la fuente incluyendo episodios
        """
        if self.streaming_sources is None:
            self.streaming_sources = {}

        sources_copy = dict(self.streaming_sources)
        sources_copy[source_name] = {
            **source_data,
            'linked_at': datetime.utcnow().isoformat()
        }
        self.streaming_sources = sources_copy

    def get_streaming_source(self, source_name: str) -> dict:
        """Obtiene datos de una fuente de streaming"""
        if self.streaming_sources:
            return self.streaming_sources.get(source_name)
        return None

    def has_streaming_source(self, source_name: str) -> bool:
        """Verifica si tiene una fuente de streaming"""
        return bool(self.streaming_sources and source_name in self.streaming_sources)

    def get_episodes(self, source_name: str) -> list:
        """Obtiene la lista de episodios de una fuente"""
        source = self.get_streaming_source(source_name)
        if source:
            return source.get('episodes', [])
        return []

    def get_episode(self, source_name: str, episode_number: int) -> dict:
        """Obtiene un episodio específico de una fuente"""
        episodes = self.get_episodes(source_name)
        for ep in episodes:
            if ep.get('number') == episode_number:
                return ep
        return None

    # ============== SERIALIZACIÓN ==============

    def to_dict(self) -> dict:
        """Serializa el anime a diccionario"""
        return {
            'id': self.id,
            'anilist_id': self.anilist_id,
            'title': self.title,
            'slug': self.slug,
            'cover_image': self.cover_image,
            'streaming_sources': list(self.streaming_sources.keys()) if self.streaming_sources else [],
            'has_streaming': bool(self.streaming_sources),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_dict_with_episodes(self, source_name: str = None) -> dict:
        """
        Serializa con episodios de una fuente específica.
        Si no se especifica fuente, incluye todas.
        """
        data = self.to_dict()

        if source_name:
            source = self.get_streaming_source(source_name)
            if source:
                data['source'] = source_name
                data['episodes'] = source.get('episodes', [])
                data['episodes_count'] = source.get('episodes_count', 0)
        else:
            data['sources_detail'] = self.streaming_sources or {}

        return data

    # ============== MÉTODOS DE CLASE ==============

    @staticmethod
    def generate_slug(title: str) -> str:
        """Genera un slug URL-friendly a partir del título"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s_]+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')

    @classmethod
    def create_from_anilist(cls, anilist_id: int, title: str, cover_image: str = None) -> 'Anime':
        """
        Crea un anime desde datos básicos de AniList.
        Se usa cuando el usuario hace scraping por primera vez.
        """
        return cls(
            anilist_id=anilist_id,
            title=title,
            slug=cls.generate_slug(title),
            cover_image=cover_image
        )

    @classmethod
    def get_or_create(cls, anilist_id: int, title: str, cover_image: str = None) -> 'Anime':
        """
        Obtiene un anime existente o crea uno nuevo.
        Útil para el flujo de scraping.
        """
        anime = cls.query.filter_by(anilist_id=anilist_id).first()
        if not anime:
            anime = cls.create_from_anilist(anilist_id, title, cover_image)
        return anime

    def __repr__(self):
        sources = list(self.streaming_sources.keys()) if self.streaming_sources else []
        return f'<Anime {self.title} (AniList: {self.anilist_id}, Sources: {sources})>'
