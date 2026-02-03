from datetime import datetime
from app.extensions import db


class Anime(db.Model):
    __tablename__ = 'animes'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    synopsis = db.Column(db.Text, nullable=True)
    cover_image = db.Column(db.String(500), nullable=True)
    banner_image = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(50), nullable=True)  # emision, finalizado
    type = db.Column(db.String(50), nullable=True)    # TV, OVA, Película, Especial
    genres = db.Column(db.JSON, default=list)          # ["acción", "aventura"]

    # JSON con toda la información de cada fuente
    # Estructura:
    # {
    #   "animeflv": {
    #     "id": "12345",
    #     "url": "https://www3.animeflv.net/anime/...",
    #     "title": "Título en AnimeFLV",
    #     "episodes_count": 24,
    #     "rating": 4.5,
    #     "votes": 1234,
    #     "other_titles": ["Título alternativo"],
    #     "last_scraped": "2024-01-01T00:00:00"
    #   },
    #   "jkanime": {
    #     "id": "67890",
    #     "url": "https://jkanime.net/...",
    #     "title": "Título en JKAnime",
    #     ...
    #   }
    # }
    sources = db.Column(db.JSON, default=dict)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    favorites = db.relationship('Favorite', backref='anime', lazy='dynamic', cascade='all, delete-orphan')
    watchlist_entries = db.relationship('Watchlist', backref='anime', lazy='dynamic', cascade='all, delete-orphan')

    def add_source(self, source_name, source_data):
        """Añade o actualiza una fuente al anime"""
        if self.sources is None:
            self.sources = {}
        sources_copy = dict(self.sources)
        sources_copy[source_name] = {
            **source_data,
            'last_scraped': datetime.utcnow().isoformat()
        }
        self.sources = sources_copy

    def get_source(self, source_name):
        """Obtiene los datos de una fuente específica"""
        if self.sources:
            return self.sources.get(source_name)
        return None

    def has_source(self, source_name):
        """Verifica si el anime tiene una fuente específica"""
        return self.sources and source_name in self.sources

    def to_dict(self, include_sources=True):
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'synopsis': self.synopsis,
            'cover_image': self.cover_image,
            'banner_image': self.banner_image,
            'status': self.status,
            'type': self.type,
            'genres': self.genres or [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        if include_sources:
            data['sources'] = self.sources or {}
        return data

    @staticmethod
    def generate_slug(title):
        """Genera un slug a partir del título"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s_]+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')

    def __repr__(self):
        return f'<Anime {self.title}>'
