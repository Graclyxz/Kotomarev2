from datetime import datetime
from app.extensions import db


class Episode(db.Model):
    """Modelo para almacenar episodios de anime"""
    __tablename__ = 'episodes'

    id = db.Column(db.Integer, primary_key=True)
    anime_id = db.Column(db.Integer, db.ForeignKey('animes.id'), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=True)
    thumbnail = db.Column(db.String(500), nullable=True)

    # De qué fuente viene este episodio
    source = db.Column(db.String(50), default='animeflv')
    source_id = db.Column(db.String(100), nullable=True)  # ID en la fuente
    source_url = db.Column(db.String(500), nullable=True)

    # Fecha de emisión/agregado
    aired_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relación con Anime
    anime = db.relationship('Anime', backref=db.backref('episodes', lazy='dynamic', cascade='all, delete-orphan'))

    # Constraint para evitar duplicados
    __table_args__ = (
        db.UniqueConstraint('anime_id', 'number', 'source', name='unique_episode_per_source'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'anime_id': self.anime_id,
            'anime_slug': self.anime.slug if self.anime else None,
            'anime_title': self.anime.title if self.anime else None,
            'anime_cover': self.anime.cover_image if self.anime else None,
            'number': self.number,
            'title': self.title,
            'thumbnail': self.thumbnail,
            'source': self.source,
            'source_url': self.source_url,
            'aired_at': self.aired_at.isoformat() if self.aired_at else None,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Episode {self.anime.title if self.anime else "?"} - Ep {self.number}>'


class HomeSection(db.Model):
    """Modelo para gestionar qué animes mostrar en cada sección del home"""
    __tablename__ = 'home_sections'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)  # 'featured', 'popular', 'recent'
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(500), nullable=True)
    order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

    # Configuración de la sección
    max_items = db.Column(db.Integer, default=12)
    section_type = db.Column(db.String(50), default='anime')  # 'anime', 'episode'

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'title': self.title,
            'subtitle': self.subtitle,
            'order': self.order,
            'is_active': self.is_active,
            'max_items': self.max_items,
            'section_type': self.section_type,
        }


class HomeSectionAnime(db.Model):
    """Relación entre secciones del home y animes"""
    __tablename__ = 'home_section_animes'

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey('home_sections.id'), nullable=False)
    anime_id = db.Column(db.Integer, db.ForeignKey('animes.id'), nullable=False)
    order = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    section = db.relationship('HomeSection', backref=db.backref('anime_entries', lazy='dynamic', cascade='all, delete-orphan'))
    anime = db.relationship('Anime', backref=db.backref('home_sections', lazy='dynamic'))

    __table_args__ = (
        db.UniqueConstraint('section_id', 'anime_id', name='unique_anime_per_section'),
    )
