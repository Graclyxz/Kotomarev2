from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)

    # Configuración
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    # Habilitar CORS para el frontend
    CORS(app, origins=['http://localhost:3000'])

    # Registrar rutas
    from app.routes import main
    app.register_blueprint(main.bp)

    return app
