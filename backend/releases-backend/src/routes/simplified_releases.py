from flask import Blueprint, request, jsonify
from src.models.simplified_models import SimplifiedReleaseModel, SquadStatusModel

simplified_releases_bp = Blueprint('simplified_releases', __name__)

# Instanciar modelos
release_model = SimplifiedReleaseModel()
squad_status_model = SquadStatusModel()

@simplified_releases_bp.route('/simplified-releases', methods=['GET'])
def get_simplified_releases():
    """Lista todas as releases simplificadas"""
    try:
        releases = release_model.list_releases()
        return jsonify({
            'success': True,
            'data': releases
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simplified_releases_bp.route('/simplified-releases', methods=['POST'])
def create_simplified_release():
    """Cria uma nova release simplificada"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        required_fields = ['release_name', 'squad', 'responsavel']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Campo {field} é obrigatório'
                }), 400
        
        release_id = release_model.create_release(data)
        
        if release_id:
            # Criar status inicial para o squad
            squad_status_data = {
                'release_id': release_id,
                'squad': data.get('squad'),
                'responsavel': data.get('responsavel'),
                'status': data.get('status', 'em_andamento')
            }
            squad_status_model.create_squad_status(squad_status_data)
            
            return jsonify({
                'success': True,
                'data': {'release_id': release_id}
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar release'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simplified_releases_bp.route('/simplified-releases/<release_id>', methods=['GET'])
def get_simplified_release(release_id):
    """Busca uma release específica com seus status de squads"""
    try:
        release = release_model.get_release(release_id)
        
        if not release:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
        
        # Buscar status dos squads para esta release
        squad_statuses = squad_status_model.get_squad_status_by_release(release_id)
        
        release['squad_statuses'] = squad_statuses
        
        return jsonify({
            'success': True,
            'data': release
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simplified_releases_bp.route('/simplified-releases/<release_id>', methods=['PUT'])
def update_simplified_release(release_id):
    """Atualiza uma release simplificada"""
    try:
        data = request.get_json()
        
        success = release_model.update_release(release_id, data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Release atualizada com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao atualizar release'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simplified_releases_bp.route('/simplified-releases/<release_id>/squad-status', methods=['POST'])
def create_squad_status(release_id):
    """Cria um novo status de squad para uma release"""
    try:
        data = request.get_json()
        data['release_id'] = release_id
        
        # Validar dados obrigatórios
        required_fields = ['squad', 'responsavel']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Campo {field} é obrigatório'
                }), 400
        
        squad_status_id = squad_status_model.create_squad_status(data)
        
        if squad_status_id:
            return jsonify({
                'success': True,
                'data': {'squad_status_id': squad_status_id}
            }), 201
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar status de squad'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simplified_releases_bp.route('/squad-status/<squad_status_id>', methods=['PUT'])
def update_squad_status(squad_status_id):
    """Atualiza o status de um squad"""
    try:
        data = request.get_json()
        
        success = squad_status_model.update_squad_status(squad_status_id, data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Status de squad atualizado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao atualizar status de squad'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simplified_releases_bp.route('/simplified-releases/<release_id>/squad-status', methods=['GET'])
def get_squad_statuses_by_release(release_id):
    """Busca todos os status de squads de uma release"""
    try:
        squad_statuses = squad_status_model.get_squad_status_by_release(release_id)
        
        return jsonify({
            'success': True,
            'data': squad_statuses
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simplified_releases_bp.route('/init-simplified-db', methods=['POST'])
def init_simplified_database():
    """Inicializa as tabelas simplificadas do DynamoDB"""
    try:
        results = {
            'simplified_releases_table': release_model.create_table(),
            'squad_status_table': squad_status_model.create_table()
        }
        
        return jsonify({
            'success': True,
            'message': 'Banco de dados simplificado inicializado com sucesso',
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao inicializar banco de dados simplificado: {str(e)}'
        }), 500

