from flask import Blueprint, request, jsonify
from src.models.release_test_data_model import ReleaseTestDataModel
from datetime import datetime

release_test_data_bp = Blueprint('release_test_data', __name__)
test_data_model = ReleaseTestDataModel()

@release_test_data_bp.route('/releases/<release_id>/test-data', methods=['GET'])
def get_release_test_data(release_id):
    """Busca todos os dados de teste para uma release"""
    try:
        test_data_list = test_data_model.get_release_test_data(release_id)
        
        return jsonify({
            'success': True,
            'data': test_data_list
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_data_bp.route('/releases/<release_id>/test-data/user/<user_id>', methods=['GET'])
def get_user_test_data(release_id, user_id):
    """Busca dados de teste de um usuário específico para uma release"""
    try:
        test_data = test_data_model.get_user_test_data(release_id, user_id)
        
        return jsonify({
            'success': True,
            'data': test_data
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_data_bp.route('/releases/<release_id>/test-data/user/<user_id>', methods=['POST', 'PUT'])
def create_or_update_user_test_data(release_id, user_id):
    """Cria ou atualiza dados de teste para um usuário específico"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data:
            return jsonify({
                'success': False,
                'error': 'Dados não fornecidos'
            }), 400
        
        # Adicionar timestamps se necessário
        if data.get('status') == 'em_andamento' and not data.get('data_inicio_teste'):
            data['data_inicio_teste'] = datetime.now().isoformat()
        
        if data.get('status') == 'finalizado' and not data.get('data_fim_teste'):
            data['data_fim_teste'] = datetime.now().isoformat()
        
        test_data_id = test_data_model.create_or_update_test_data(release_id, user_id, data)
        
        if test_data_id:
            return jsonify({
                'success': True,
                'data': {'test_data_id': test_data_id}
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao salvar dados de teste'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_data_bp.route('/releases/<release_id>/test-data/summary', methods=['GET'])
def get_test_data_summary(release_id):
    """Gera resumo dos dados de teste para uma release"""
    try:
        summary = test_data_model.get_test_data_summary(release_id)
        
        if summary is not None:
            return jsonify({
                'success': True,
                'data': summary
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao gerar resumo'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_data_bp.route('/releases/<release_id>/test-data/<test_data_id>', methods=['DELETE'])
def delete_test_data(release_id, test_data_id):
    """Deleta dados de teste específicos"""
    try:
        success = test_data_model.delete_test_data(test_data_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Dados de teste deletados com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao deletar dados de teste'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_data_bp.route('/releases/<release_id>/test-data', methods=['DELETE'])
def delete_all_release_test_data(release_id):
    """Deleta todos os dados de teste de uma release"""
    try:
        success = test_data_model.delete_release_test_data(release_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Todos os dados de teste da release foram deletados'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao deletar dados de teste da release'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_data_bp.route('/releases/<release_id>/test-data/bulk', methods=['POST'])
def bulk_create_test_data(release_id):
    """Cria dados de teste em lote para múltiplos usuários"""
    try:
        data = request.get_json()
        
        if not data or not isinstance(data, list):
            return jsonify({
                'success': False,
                'error': 'Dados devem ser uma lista de objetos'
            }), 400
        
        results = []
        errors = []
        
        for item in data:
            user_id = item.get('user_id')
            if not user_id:
                errors.append('user_id é obrigatório para cada item')
                continue
            
            try:
                test_data_id = test_data_model.create_or_update_test_data(release_id, user_id, item)
                if test_data_id:
                    results.append({
                        'user_id': user_id,
                        'test_data_id': test_data_id,
                        'success': True
                    })
                else:
                    errors.append(f'Erro ao salvar dados para usuário {user_id}')
            except Exception as e:
                errors.append(f'Erro para usuário {user_id}: {str(e)}')
        
        return jsonify({
            'success': len(errors) == 0,
            'data': {
                'results': results,
                'errors': errors,
                'total_processed': len(data),
                'successful': len(results),
                'failed': len(errors)
            }
        }), 200 if len(errors) == 0 else 207  # 207 Multi-Status
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@release_test_data_bp.route('/test-data/init-table', methods=['POST'])
def init_test_data_table():
    """Inicializa a tabela ReleaseTestData"""
    try:
        success = test_data_model.create_table()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Tabela ReleaseTestData criada com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao criar tabela ReleaseTestData'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

