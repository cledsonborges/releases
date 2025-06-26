from flask import Blueprint, request, jsonify
from src.models import Delivery, db, Squad, Release

delivery_bp = Blueprint('delivery', __name__)

@delivery_bp.route('/deliveries', methods=['GET'])
def get_deliveries():
    """Listar todas as entregas"""
    deliveries = Delivery.query.all()
    return jsonify([delivery.to_dict() for delivery in deliveries])

@delivery_bp.route('/deliveries/<int:delivery_id>', methods=['GET'])
def get_delivery(delivery_id):
    """Obter detalhes de uma entrega específica"""
    delivery = Delivery.query.get_or_404(delivery_id)
    return jsonify(delivery.to_dict())

@delivery_bp.route('/deliveries', methods=['POST'])
def create_delivery():
    """Criar uma nova entrega"""
    data = request.get_json()
    
    if not data or not data.get('release_id') or not data.get('squad_id') or not data.get('module'):
        return jsonify({'error': 'release_id, squad_id and module are required'}), 400
    
    # Verificar se release e squad existem
    release = Release.query.get(data['release_id'])
    squad = Squad.query.get(data['squad_id'])
    
    if not release:
        return jsonify({'error': 'Release not found'}), 404
    if not squad:
        return jsonify({'error': 'Squad not found'}), 404
    
    delivery = Delivery(
        release_id=data['release_id'],
        squad_id=data['squad_id'],
        module=data['module'],
        detail=data.get('detail'),
        responsible=data.get('responsible'),
        status=data.get('status', 'Em andamento')
    )
    
    try:
        db.session.add(delivery)
        db.session.commit()
        return jsonify(delivery.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@delivery_bp.route('/deliveries/<int:delivery_id>', methods=['PUT'])
def update_delivery(delivery_id):
    """Atualizar uma entrega existente"""
    delivery = Delivery.query.get_or_404(delivery_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'release_id' in data:
        release = Release.query.get(data['release_id'])
        if not release:
            return jsonify({'error': 'Release not found'}), 404
        delivery.release_id = data['release_id']
    
    if 'squad_id' in data:
        squad = Squad.query.get(data['squad_id'])
        if not squad:
            return jsonify({'error': 'Squad not found'}), 404
        delivery.squad_id = data['squad_id']
    
    if 'module' in data:
        delivery.module = data['module']
    if 'detail' in data:
        delivery.detail = data['detail']
    if 'responsible' in data:
        delivery.responsible = data['responsible']
    if 'status' in data:
        delivery.status = data['status']
    
    try:
        db.session.commit()
        return jsonify(delivery.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@delivery_bp.route('/deliveries/<int:delivery_id>', methods=['DELETE'])
def delete_delivery(delivery_id):
    """Excluir uma entrega"""
    delivery = Delivery.query.get_or_404(delivery_id)
    
    try:
        db.session.delete(delivery)
        db.session.commit()
        return jsonify({'message': 'Delivery deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

