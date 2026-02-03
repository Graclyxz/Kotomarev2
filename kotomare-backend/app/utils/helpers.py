import re
import unicodedata


def slugify(text: str) -> str:
    """
    Convierte un texto a slug URL-friendly.

    Ejemplo: "Shingeki no Kyojin" -> "shingeki-no-kyojin"
    """
    # Normalizar unicode (convertir acentos, etc)
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')

    # Convertir a minúsculas
    text = text.lower()

    # Reemplazar caracteres no alfanuméricos con guiones
    text = re.sub(r'[^a-z0-9]+', '-', text)

    # Eliminar guiones al inicio y final
    text = text.strip('-')

    # Eliminar guiones duplicados
    text = re.sub(r'-+', '-', text)

    return text


def normalize_title(title: str) -> str:
    """
    Normaliza un título para comparación.

    Útil para detectar si dos títulos son el mismo anime
    de diferentes fuentes.
    """
    # Remover caracteres especiales y normalizar
    normalized = unicodedata.normalize('NFKD', title)
    normalized = normalized.encode('ascii', 'ignore').decode('ascii')

    # Convertir a minúsculas
    normalized = normalized.lower()

    # Remover contenido entre paréntesis/corchetes (temporadas, años, etc)
    normalized = re.sub(r'\([^)]*\)', '', normalized)
    normalized = re.sub(r'\[[^\]]*\]', '', normalized)

    # Remover sufijos comunes
    suffixes = [
        'season', 'temporada', 'parte', 'part',
        '2nd', '3rd', '4th', 'nd', 'rd', 'th',
        'ii', 'iii', 'iv', 'v'
    ]
    for suffix in suffixes:
        normalized = re.sub(rf'\b{suffix}\b', '', normalized)

    # Limpiar espacios
    normalized = ' '.join(normalized.split())

    return normalized.strip()


def compare_titles(title1: str, title2: str) -> float:
    """
    Compara dos títulos y retorna un score de similitud (0-1).

    Útil para determinar si dos animes de diferentes fuentes
    son el mismo.
    """
    from difflib import SequenceMatcher

    norm1 = normalize_title(title1)
    norm2 = normalize_title(title2)

    return SequenceMatcher(None, norm1, norm2).ratio()
