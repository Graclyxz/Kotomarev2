import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()


def create_app(config_name: str = None):
    """Factory de la aplicación Flask"""

    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)

    # Cargar configuración
    from app.config import config
    app.config.from_object(config[config_name])

    # Inicializar extensiones
    from app.extensions import db, jwt, cors
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'])

    # Registrar rutas
    from app.routes import register_routes
    register_routes(app)

    # Crear tablas de la base de datos
    with app.app_context():
        db.create_all()

    return app
