from flask import Blueprint

# Importar blueprints
from app.routes.health import bp as health_bp
from app.routes.auth import bp as auth_bp
from app.routes.anime import bp as anime_bp
from app.routes.user import bp as user_bp
from app.routes.admin import bp as admin_bp
from app.routes.anilist import bp as anilist_bp
from app.routes.scrape import bp as scrape_bp


def register_routes(app):
    """
    Registra todas las rutas en la app.

    Endpoints:
        /api/anilist  - Datos en tiempo real desde AniList (catálogo principal)
        /api/scrape   - Scraping bajo demanda (vinculación y videos)
        /api/anime    - Animes guardados en la BD local
        /api/auth     - Autenticación
        /api/user     - Perfil de usuario (favoritos, watchlist)
        /api/admin    - Administración (deprecated, será simplificado)
    """
    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(anilist_bp, url_prefix='/api/anilist')
    app.register_blueprint(scrape_bp, url_prefix='/api/scrape')
    app.register_blueprint(anime_bp, url_prefix='/api/anime')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
