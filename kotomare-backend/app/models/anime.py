"""
Modelo Anime simplificado.
Almacena datos basicos del anime para relaciones con favoritos y watchlist.
Los datos completos se obtienen en tiempo real desde AniList.
"""

from datetime import datetime
from app.extensions import db


class Anime(db.Model):
    """
    Modelo minimalista para almacenar animes.
    Usado como referencia para favoritos y watchlist.
    """
    __tablename__ = 'animes'

    id = db.Column(db.Integer, primary_key=True)

    # Identificador unico de AniList
    anilist_id = db.Column(db.Integer, unique=True, nullable=False, index=True)

    # Datos basicos para identificacion
    title = db.Column(db.String(500), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    cover_image = db.Column(db.String(500))

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    favorites = db.relationship('Favorite', backref='anime', lazy='dynamic', cascade='all, delete-orphan')
    watchlist_entries = db.relationship('Watchlist', backref='anime', lazy='dynamic', cascade='all, delete-orphan')

    # ============== SERIALIZACION ==============

    def to_dict(self, **kwargs) -> dict:
        """Serializa el anime a diccionario"""
        return {
            'id': self.id,
            'anilist_id': self.anilist_id,
            'title': self.title,
            'slug': self.slug,
            'cover_image': self.cover_image,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    # ============== METODOS DE CLASE ==============

    @staticmethod
    def generate_slug(title: str) -> str:
        """Genera un slug URL-friendly a partir del titulo"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'[\s_]+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        return slug.strip('-')

    @classmethod
    def create_from_anilist(cls, anilist_id: int, title: str, cover_image: str = None) -> 'Anime':
        """Crea un anime desde datos basicos de AniList."""
        return cls(
            anilist_id=anilist_id,
            title=title,
            slug=cls.generate_slug(title),
            cover_image=cover_image
        )

    @classmethod
    def get_or_create(cls, anilist_id: int, title: str, cover_image: str = None) -> 'Anime':
        """Obtiene un anime existente o crea uno nuevo."""
        anime = cls.query.filter_by(anilist_id=anilist_id).first()
        if not anime:
            anime = cls.create_from_anilist(anilist_id, title, cover_image)
        return anime

    def __repr__(self):
        return f'<Anime {self.title} (AniList: {self.anilist_id})>'
