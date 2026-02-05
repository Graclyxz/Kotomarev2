"""
Rutas de administración.
Utilidades para gestión de la base de datos local.
"""

from flask import Blueprint, request, jsonify
from app.models import Anime
from app.extensions import db

bp = Blueprint('admin', __name__)


# ============== ESTADÍSTICAS ==============

@bp.route('/stats', methods=['GET'])
def get_stats():
    """Obtiene estadísticas de la base de datos local"""
    total_animes = Anime.query.count()

    # Contar por fuente de streaming
    sources_count = {}
    total_episodes = 0

    animes = Anime.query.all()
    for anime in animes:
        if anime.streaming_sources:
            for source_name, source_data in anime.streaming_sources.items():
                sources_count[source_name] = sources_count.get(source_name, 0) + 1
                total_episodes += source_data.get('episodes_count', 0)

    return jsonify({
        'total_animes': total_animes,
        'total_episodes_indexed': total_episodes,
        'sources_breakdown': sources_count,
        'storage': 'local'
    })


# ============== GESTIÓN DE ANIMES ==============

@bp.route('/anime/<int:anime_id>', methods=['DELETE'])
def delete_anime(anime_id):
    """Elimina un anime de la BD por su ID interno"""
    anime = Anime.query.get(anime_id)

    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    try:
        title = anime.title
        anilist_id = anime.anilist_id
        db.session.delete(anime)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Anime "{title}" eliminado',
            'anilist_id': anilist_id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/anime/anilist/<int:anilist_id>', methods=['DELETE'])
def delete_anime_by_anilist_id(anilist_id):
    """Elimina un anime de la BD por su ID de AniList"""
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    try:
        title = anime.title
        db.session.delete(anime)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Anime "{title}" eliminado',
            'anilist_id': anilist_id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/anime/<int:anilist_id>/source/<source_name>', methods=['DELETE'])
def remove_streaming_source(anilist_id, source_name):
    """Elimina una fuente de streaming de un anime"""
    anime = Anime.query.filter_by(anilist_id=anilist_id).first()

    if not anime:
        return jsonify({'error': 'Anime no encontrado'}), 404

    if not anime.streaming_sources or source_name not in anime.streaming_sources:
        return jsonify({'error': f'Fuente {source_name} no encontrada'}), 404

    try:
        sources_copy = dict(anime.streaming_sources)
        del sources_copy[source_name]
        anime.streaming_sources = sources_copy if sources_copy else None
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Fuente {source_name} eliminada de "{anime.title}"',
            'remaining_sources': list(anime.streaming_sources.keys()) if anime.streaming_sources else []
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ============== LIMPIAR BD ==============

@bp.route('/clear-db', methods=['POST'])
def clear_database():
    """
    Limpia la base de datos (solo animes).
    CUIDADO: Esta operación es destructiva.

    Query params:
        confirm: true (requerido)
    """
    confirm = request.args.get('confirm', 'false').lower() == 'true'

    if not confirm:
        return jsonify({
            'error': 'Debes confirmar con ?confirm=true',
            'warning': 'Esta operación eliminará TODOS los animes de la BD'
        }), 400

    try:
        count = Anime.query.count()
        Anime.query.delete()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Base de datos limpiada. {count} animes eliminados.'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ============== LISTAR ==============

@bp.route('/animes', methods=['GET'])
def list_all_animes():
    """Lista todos los animes en la BD con sus fuentes"""
    animes = Anime.query.order_by(Anime.updated_at.desc()).all()

    return jsonify({
        'animes': [{
            'id': a.id,
            'anilist_id': a.anilist_id,
            'title': a.title,
            'slug': a.slug,
            'sources': list(a.streaming_sources.keys()) if a.streaming_sources else [],
            'created_at': a.created_at.isoformat() if a.created_at else None,
            'updated_at': a.updated_at.isoformat() if a.updated_at else None
        } for a in animes],
        'count': len(animes)
    })
