from flask import Blueprint, request, jsonify
from src.models import Release, db, Delivery

release_bp = Blueprint('release', __name__)

@release_bp.route('/releases', methods=['GET'])
def get_releases():
    """Listar todas as releases"""
    releases = Release.query.all()
    return jsonify([release.to_dict() for release in releases])

@release_bp.route('/releases/<int:release_id>', methods=['GET'])
def get_release(release_id):
    """Obter detalhes de uma release específica"""
    release = Release.query.get_or_404(release_id)
    return jsonify(release.to_dict())

@release_bp.route('/releases', methods=['POST'])
def create_release():
    """Criar uma nova release"""
    data = request.get_json()
    
    if not data or not data.get('version') or not data.get('release_number'):
        return jsonify({'error': 'Version and release_number are required'}), 400
    
    release = Release(
        version=data['version'],
        release_number=data['release_number'],
        firebase_version=data.get('firebase_version'),
        release_notes=data.get('release_notes'),
        platform=data.get('platform', 'Android')
    )
    
    try:
        db.session.add(release)
        db.session.commit()
        return jsonify(release.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@release_bp.route('/releases/<int:release_id>', methods=['PUT'])
def update_release(release_id):
    """Atualizar uma release existente"""
    release = Release.query.get_or_404(release_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'version' in data:
        release.version = data['version']
    if 'release_number' in data:
        release.release_number = data['release_number']
    if 'firebase_version' in data:
        release.firebase_version = data['firebase_version']
    if 'release_notes' in data:
        release.release_notes = data['release_notes']
    if 'platform' in data:
        release.platform = data['platform']
    
    try:
        db.session.commit()
        return jsonify(release.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@release_bp.route('/releases/<int:release_id>', methods=['DELETE'])
def delete_release(release_id):
    """Excluir uma release"""
    release = Release.query.get_or_404(release_id)
    
    try:
        db.session.delete(release)
        db.session.commit()
        return jsonify({'message': 'Release deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@release_bp.route('/releases/<int:release_id>/deliveries', methods=['GET'])
def get_release_deliveries(release_id):
    """Listar entregas de uma release específica"""
    release = Release.query.get_or_404(release_id)
    deliveries = Delivery.query.filter_by(release_id=release_id).all()
    return jsonify([delivery.to_dict() for delivery in deliveries])

