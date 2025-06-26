from flask import Blueprint, request, jsonify
from src.models.dynamodb_models import SquadModel

squads_bp = Blueprint('squads', __name__)
squad_model = SquadModel()

@squads_bp.route('/squads', methods=['GET'])
def list_squads():
    """Lista todas as squads"""
    try:
        squads = squad_model.list_squads()
        return jsonify({
            'success': True,
            'data': squads
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@squads_bp.route('/squads', methods=['POST'])
def create_squad():
    """Cria uma nova squad"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('squad_name'):
            return jsonify({
                'success': False,
                'error': 'Nome da squad é obrigatório'
            }), 400
        
        squad_id = squad_model.create_squad(data)
        
        if squad_id:
            return jsonify({
                'success': True,
                'data': {'squad_id': squad_id}
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar squad'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@squads_bp.route('/squads/<squad_id>', methods=['GET'])
def get_squad(squad_id):
    """Busca uma squad específica"""
    try:
        squad = squad_model.get_squad(squad_id)
        
        if squad:
            return jsonify({
                'success': True,
                'data': squad
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Squad não encontrada'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@squads_bp.route('/squads/<squad_id>', methods=['PUT'])
def update_squad(squad_id):
    """Atualiza uma squad"""
    try:
        data = request.get_json()
        
        success = squad_model.update_squad(squad_id, data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Squad atualizada com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao atualizar squad'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@squads_bp.route('/squads/<squad_id>', methods=['DELETE'])
def delete_squad(squad_id):
    """Deleta uma squad"""
    try:
        success = squad_model.delete_squad(squad_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Squad deletada com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao deletar squad'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@squads_bp.route('/squads/bulk', methods=['POST'])
def create_squads_bulk():
    """Cria múltiplas squads a partir de um JSON"""
    try:
        data = request.get_json()
        
        if not isinstance(data, list):
            return jsonify({
                'success': False,
                'error': 'Dados devem ser uma lista de squads'
            }), 400
        
        created_squads = []
        errors = []
        
        for squad_data in data:
            try:
                if not squad_data.get('squad_name'):
                    errors.append(f"Squad sem nome: {squad_data}")
                    continue
                
                squad_id = squad_model.create_squad(squad_data)
                if squad_id:
                    created_squads.append({
                        'squad_id': squad_id,
                        'squad_name': squad_data['squad_name']
                    })
                else:
                    errors.append(f"Erro ao criar squad: {squad_data['squad_name']}")
                    
            except Exception as e:
                errors.append(f"Erro ao processar squad {squad_data.get('squad_name', 'sem nome')}: {str(e)}")
        
        return jsonify({
            'success': True,
            'data': {
                'created_squads': created_squads,
                'errors': errors,
                'total_created': len(created_squads),
                'total_errors': len(errors)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@squads_bp.route('/squads/active', methods=['GET'])
def list_active_squads():
    """Lista apenas squads ativas"""
    try:
        all_squads = squad_model.list_squads()
        active_squads = [squad for squad in all_squads if squad.get('ativo', True)]
        
        return jsonify({
            'success': True,
            'data': active_squads
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@squads_bp.route('/squads/modules', methods=['GET'])
def list_all_modules():
    """Lista todos os módulos de todas as squads"""
    try:
        squads = squad_model.list_squads()
        all_modules = set()
        
        for squad in squads:
            modules = squad.get('modulos', [])
            all_modules.update(modules)
        
        return jsonify({
            'success': True,
            'data': list(all_modules)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

