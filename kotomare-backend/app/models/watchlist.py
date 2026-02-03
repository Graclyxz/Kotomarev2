from datetime import datetime
from app.extensions import db


class Watchlist(db.Model):
    __tablename__ = 'watchlist'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    anime_id = db.Column(db.Integer, db.ForeignKey('animes.id'), nullable=False)
    last_episode = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='watching')  # watching, completed, on_hold, dropped, plan_to_watch
    preferred_source = db.Column(db.String(50), nullable=True)  # Fuente preferida para este anime
    notes = db.Column(db.Text, nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Índice único para evitar duplicados
    __table_args__ = (
        db.UniqueConstraint('user_id', 'anime_id', name='unique_user_anime_watchlist'),
    )

    VALID_STATUSES = ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch']

    def update_progress(self, episode):
        """Actualiza el progreso del anime"""
        self.last_episode = episode
        self.updated_at = datetime.utcnow()
        if self.started_at is None:
            self.started_at = datetime.utcnow()

    def mark_completed(self):
        """Marca el anime como completado"""
        self.status = 'completed'
        self.completed_at = datetime.utcnow()

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'anime_id': self.anime_id,
            'anime': self.anime.to_dict(include_sources=False) if self.anime else None,
            'last_episode': self.last_episode,
            'status': self.status,
            'preferred_source': self.preferred_source,
            'notes': self.notes,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Watchlist user={self.user_id} anime={self.anime_id} status={self.status}>'
