from datetime import datetime
from app.extensions import db


class Favorite(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    anime_id = db.Column(db.Integer, db.ForeignKey('animes.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Índice único para evitar duplicados
    __table_args__ = (
        db.UniqueConstraint('user_id', 'anime_id', name='unique_user_anime_favorite'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'anime_id': self.anime_id,
            'anime': self.anime.to_dict(include_sources=False) if self.anime else None,
            'added_at': self.added_at.isoformat()
        }

    def __repr__(self):
        return f'<Favorite user={self.user_id} anime={self.anime_id}>'
