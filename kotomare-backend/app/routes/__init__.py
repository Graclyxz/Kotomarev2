from flask import Blueprint

# Importar blueprints
from app.routes.health import bp as health_bp
from app.routes.auth import bp as auth_bp
from app.routes.anime import bp as anime_bp
from app.routes.user import bp as user_bp


def register_routes(app):
    """Registra todas las rutas en la app"""
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(anime_bp, url_prefix='/api/anime')
    app.register_blueprint(user_bp, url_prefix='/api/user')
