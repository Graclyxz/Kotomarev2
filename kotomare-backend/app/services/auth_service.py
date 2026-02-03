from typing import Optional, Tuple
from app.extensions import db
from app.models import User


class AuthService:
    """Servicio de autenticación"""

    @staticmethod
    def register(username: str, email: str, password: str) -> Tuple[Optional[User], Optional[str]]:
        """
        Registra un nuevo usuario.

        Returns:
            Tuple de (User, None) si es exitoso
            Tuple de (None, error_message) si falla
        """
        # Validaciones
        if len(username) < 3:
            return None, "El nombre de usuario debe tener al menos 3 caracteres"

        if len(password) < 6:
            return None, "La contraseña debe tener al menos 6 caracteres"

        if '@' not in email:
            return None, "Email inválido"

        # Verificar si ya existe
        if User.query.filter_by(username=username).first():
            return None, "El nombre de usuario ya existe"

        if User.query.filter_by(email=email).first():
            return None, "El email ya está registrado"

        # Crear usuario
        try:
            user = User(username=username, email=email)
            user.set_password(password)

            db.session.add(user)
            db.session.commit()

            return user, None
        except Exception as e:
            db.session.rollback()
            return None, f"Error al crear usuario: {str(e)}"

    @staticmethod
    def authenticate(email: str, password: str) -> Tuple[Optional[User], Optional[str]]:
        """
        Autentica un usuario.

        Returns:
            Tuple de (User, None) si es exitoso
            Tuple de (None, error_message) si falla
        """
        user = User.query.filter_by(email=email).first()

        if not user:
            return None, "Credenciales inválidas"

        if not user.check_password(password):
            return None, "Credenciales inválidas"

        return user, None

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """Obtiene un usuario por su ID"""
        return User.query.get(user_id)

    @staticmethod
    def update_settings(user: User, settings: dict) -> User:
        """Actualiza la configuración de un usuario"""
        current = user.settings or {}
        current.update(settings)
        user.settings = current
        db.session.commit()
        return user
