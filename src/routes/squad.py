from flask import Blueprint, request, jsonify
from src.models import Squad, db

squad_bp = Blueprint('squad', __name__)

@squad_bp.route('/squads', methods=['GET'])
def get_squads():
    """Listar todos os squads"""
    squads = Squad.query.all()
    return jsonify([squad.to_dict() for squad in squads])

@squad_bp.route('/squads/<int:squad_id>', methods=['GET'])
def get_squad(squad_id):
    """Obter detalhes de um squad específico"""
    squad = Squad.query.get_or_404(squad_id)
    return jsonify(squad.to_dict())

@squad_bp.route('/squads', methods=['POST'])
def create_squad():
    """Criar um novo squad"""
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    squad = Squad(
        name=data['name'],
        description=data.get('description')
    )
    
    try:
        db.session.add(squad)
        db.session.commit()
        return jsonify(squad.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@squad_bp.route('/squads/<int:squad_id>', methods=['PUT'])
def update_squad(squad_id):
    """Atualizar um squad existente"""
    squad = Squad.query.get_or_404(squad_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'name' in data:
        squad.name = data['name']
    if 'description' in data:
        squad.description = data['description']
    
    try:
        db.session.commit()
        return jsonify(squad.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@squad_bp.route('/squads/<int:squad_id>', methods=['DELETE'])
def delete_squad(squad_id):
    """Excluir um squad"""
    squad = Squad.query.get_or_404(squad_id)
    
    try:
        db.session.delete(squad)
        db.session.commit()
        return jsonify({'message': 'Squad deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

