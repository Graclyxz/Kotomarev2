from app.scrapers.base import BaseScraper
from app.scrapers.animeflv import AnimeFLVScraper

# Registro de scrapers disponibles
SCRAPERS = {
    'animeflv': AnimeFLVScraper,
    # 'jkanime': JKAnimeScraper,  # TODO: Implementar
}


def get_scraper(source_name):
    """Obtiene una instancia del scraper por nombre"""
    scraper_class = SCRAPERS.get(source_name)
    if scraper_class:
        return scraper_class()
    return None


def get_available_sources():
    """Retorna la lista de fuentes disponibles"""
    return list(SCRAPERS.keys())
