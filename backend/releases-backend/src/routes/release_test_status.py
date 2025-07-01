from flask import Blueprint, request, jsonify
from src.models.release_test_status_model import ReleaseTestStatusModel
from src.models.dynamodb_models import ReleaseModel

release_test_status_bp = Blueprint('release_test_status', __name__)

# Instanciar modelos
test_status_model = ReleaseTestStatusModel()
release_model = ReleaseModel()

@release_test_status_bp.route('/releases/<release_id>/test-status', methods=['GET'])
def get_release_test_statuses(release_id):
    """Lista todos os status de testes de uma release"""
    try:
        # Verificar se a release existe
        release = release_model.get_release(release_id)
        if not release:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
        
        test_statuses = test_status_model.get_test_statuses_by_release(release_id)
        
        return jsonify({
            'success': True,
            'data': {
                'release_id': release_id,
                'release_name': release.get('release_name', ''),
                'ambiente': release.get('ambiente', ''),
                'versao_firebase': release.get('versao_firebase', ''),
                'liberado_em': release.get('liberado_em', ''),
                'link_plano_testes': release.get('link_plano_testes', ''),
                'qrcode_alpha': release.get('qrcode_alpha', ''),
                'qrcode_homolog': release.get('qrcode_homolog', ''),
                'release_exclusiva': release.get('release_exclusiva', False),
                'test_statuses': test_statuses
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_status_bp.route('/releases/<release_id>/test-status', methods=['POST'])
def create_or_update_test_status(release_id):
    """Cria ou atualiza o status de teste de uma squad para uma release"""
    try:
        data = request.get_json()
        
        # Verificar se a release existe
        release = release_model.get_release(release_id)
        if not release:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
        
        # Validar dados obrigatórios
        required_fields = ['squad_name', 'responsavel', 'status']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Campo {field} é obrigatório'
                }), 400
        
        # Validar status
        valid_statuses = ['nao_iniciado', 'em_andamento', 'concluido', 'concluido_com_bugs']
        if data.get('status') not in valid_statuses:
            return jsonify({
                'success': False,
                'error': f'Status deve ser um dos seguintes: {", ".join(valid_statuses)}'
            }), 400
        
        data['release_id'] = release_id
        
        test_status_id = test_status_model.create_or_update_test_status(data)
        
        if test_status_id:
            return jsonify({
                'success': True,
                'data': {'test_status_id': test_status_id},
                'message': 'Status de teste atualizado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar/atualizar status de teste'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_status_bp.route('/releases/<release_id>/test-status/<squad_name>', methods=['GET'])
def get_squad_test_status(release_id, squad_name):
    """Busca o status de teste de uma squad específica em uma release"""
    try:
        test_status = test_status_model.get_test_status_by_release_and_squad(release_id, squad_name)
        
        if not test_status:
            return jsonify({
                'success': False,
                'error': 'Status de teste não encontrado para esta squad'
            }), 404
        
        return jsonify({
            'success': True,
            'data': test_status
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_status_bp.route('/test-status/<test_status_id>', methods=['PUT'])
def update_test_status(test_status_id):
    """Atualiza um status de teste específico"""
    try:
        data = request.get_json()
        
        # Validar status se fornecido
        if 'status' in data:
            valid_statuses = ['nao_iniciado', 'em_andamento', 'concluido', 'concluido_com_bugs']
            if data.get('status') not in valid_statuses:
                return jsonify({
                    'success': False,
                    'error': f'Status deve ser um dos seguintes: {", ".join(valid_statuses)}'
                }), 400
        
        success = test_status_model.update_test_status(test_status_id, data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Status de teste atualizado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao atualizar status de teste'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_status_bp.route('/test-status/<test_status_id>', methods=['DELETE'])
def delete_test_status(test_status_id):
    """Deleta um status de teste"""
    try:
        success = test_status_model.delete_test_status(test_status_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Status de teste deletado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao deletar status de teste'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_status_bp.route('/releases/<release_id>/test-status/summary', methods=['GET'])
def get_test_status_summary(release_id):
    """Retorna um resumo dos status de testes de uma release"""
    try:
        # Verificar se a release existe
        release = release_model.get_release(release_id)
        if not release:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
        
        summary = test_status_model.get_test_status_summary(release_id)
        
        return jsonify({
            'success': True,
            'data': {
                'release_id': release_id,
                'release_name': release.get('release_name', ''),
                'summary': summary
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_status_bp.route('/init-test-status-db', methods=['POST'])
def init_test_status_database():
    """Inicializa a tabela de status de testes no DynamoDB"""
    try:
        result = test_status_model.create_table()
        
        if result:
            return jsonify({
                'success': True,
                'message': 'Tabela ReleaseTestStatus criada com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar tabela ReleaseTestStatus'
            }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao inicializar banco de dados: {str(e)}'
        }), 500

