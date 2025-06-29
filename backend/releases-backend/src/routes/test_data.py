from flask import Blueprint, request, jsonify
from src.models.dynamodb_models import TestDataModel
from datetime import datetime
import uuid

test_data_bp = Blueprint('test_data', __name__)
test_data_model = TestDataModel()

@test_data_bp.route('/releases/<release_id>/test-data', methods=['GET'])
def get_release_test_data(release_id):
    """Busca todos os dados de teste de uma release"""
    try:
        test_data = test_data_model.get_release_test_data(release_id)
        return jsonify({
            'success': True,
            'data': test_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/<user_id>', methods=['POST', 'PUT'])
def create_or_update_user_test_data(release_id, user_id):
    """Cria ou atualiza dados de teste de um usuário para uma release"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('username'):
            return jsonify({
                'success': False,
                'error': 'Username é obrigatório'
            }), 400
        
        # Verificar se já existe um registro para este usuário/release
        existing_data = test_data_model.get_user_test_data(release_id, user_id)
        
        # Controle de concorrência - verificar timestamp de última modificação
        if existing_data and data.get('last_modified_at'):
            existing_timestamp = existing_data.get('last_modified_at')
            new_timestamp = data.get('last_modified_at')
            
            if existing_timestamp and existing_timestamp > new_timestamp:
                return jsonify({
                    'success': False,
                    'error': 'Dados foram modificados por outro usuário. Atualize a página e tente novamente.',
                    'conflict': True
                }), 409
        
        # Adicionar metadados de auditoria
        current_time = datetime.now().isoformat()
        data['last_modified_at'] = current_time
        data['last_modified_by'] = data.get('username')
        
        if existing_data:
            # Atualizar registro existente
            success = test_data_model.update_test_data(
                existing_data['test_data_id'], 
                data
            )
            message = 'Dados atualizados com sucesso'
        else:
            # Criar novo registro
            test_data_id = test_data_model.create_test_data(release_id, user_id, data)
            success = test_data_id is not None
            message = 'Dados criados com sucesso'
        
        if success:
            # Log de auditoria
            test_data_model.log_audit_event(
                release_id, 
                user_id, 
                'update' if existing_data else 'create',
                data.get('username'),
                data
            )
            
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao salvar dados'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/<test_data_id>', methods=['DELETE'])
def delete_test_data(release_id, test_data_id):
    """Deleta dados de teste"""
    try:
        # Buscar dados antes de deletar para log de auditoria
        test_data = test_data_model.get_test_data_by_id(test_data_id)
        
        success = test_data_model.delete_test_data(test_data_id)
        
        if success:
            # Log de auditoria
            if test_data:
                test_data_model.log_audit_event(
                    release_id,
                    test_data.get('user_id'),
                    'delete',
                    test_data.get('username'),
                    test_data
                )
            
            return jsonify({
                'success': True,
                'message': 'Dados deletados com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao deletar dados'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/summary', methods=['GET'])
def get_test_data_summary(release_id):
    """Busca resumo dos dados de teste de uma release"""
    try:
        summary = test_data_model.get_test_data_summary(release_id)
        return jsonify({
            'success': True,
            'data': summary
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/validate', methods=['POST'])
def validate_test_data(release_id):
    """Valida dados de teste antes de salvar"""
    try:
        data = request.get_json()
        
        validation_errors = []
        
        # Validações básicas
        if not data.get('username'):
            validation_errors.append('Username é obrigatório')
        
        if not data.get('status'):
            validation_errors.append('Status é obrigatório')
        
        # Validar status
        valid_statuses = ['pendente', 'em_andamento', 'finalizado', 'com_problemas', 'bloqueado']
        if data.get('status') and data['status'] not in valid_statuses:
            validation_errors.append(f'Status deve ser um dos seguintes: {", ".join(valid_statuses)}')
        
        # Validar campos numéricos
        if data.get('bugs_reportados') is not None:
            try:
                bugs = int(data['bugs_reportados'])
                if bugs < 0:
                    validation_errors.append('Número de bugs deve ser maior ou igual a zero')
            except (ValueError, TypeError):
                validation_errors.append('Número de bugs deve ser um número inteiro')
        
        if data.get('tempo_teste_horas') is not None:
            try:
                tempo = float(data['tempo_teste_horas'])
                if tempo < 0:
                    validation_errors.append('Tempo de teste deve ser maior ou igual a zero')
            except (ValueError, TypeError):
                validation_errors.append('Tempo de teste deve ser um número')
        
        # Validar tamanho dos campos de texto
        if data.get('detalhe_entrega') and len(data['detalhe_entrega']) > 1000:
            validation_errors.append('Detalhe da entrega não pode ter mais de 1000 caracteres')
        
        if data.get('observacoes') and len(data['observacoes']) > 500:
            validation_errors.append('Observações não podem ter mais de 500 caracteres')
        
        if validation_errors:
            return jsonify({
                'success': False,
                'errors': validation_errors
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Dados válidos'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/audit', methods=['GET'])
def get_audit_log(release_id):
    """Busca log de auditoria de uma release"""
    try:
        user_id = request.args.get('user_id')
        limit = int(request.args.get('limit', 50))
        
        audit_log = test_data_model.get_audit_log(release_id, user_id, limit)
        
        return jsonify({
            'success': True,
            'data': audit_log
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/conflicts', methods=['GET'])
def check_conflicts(release_id):
    """Verifica conflitos de edição simultânea"""
    try:
        # Buscar dados de teste recentes (últimos 5 minutos)
        recent_updates = test_data_model.get_recent_updates(release_id, minutes=5)
        
        # Agrupar por usuário para identificar edições simultâneas
        conflicts = []
        user_updates = {}
        
        for update in recent_updates:
            user = update.get('last_modified_by')
            if user:
                if user not in user_updates:
                    user_updates[user] = []
                user_updates[user].append(update)
        
        # Identificar possíveis conflitos
        for user, updates in user_updates.items():
            if len(updates) > 1:
                conflicts.append({
                    'user': user,
                    'updates_count': len(updates),
                    'last_update': max(updates, key=lambda x: x.get('last_modified_at', ''))
                })
        
        return jsonify({
            'success': True,
            'data': {
                'conflicts': conflicts,
                'active_editors': len(user_updates),
                'total_recent_updates': len(recent_updates)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/lock', methods=['POST'])
def lock_test_data(release_id):
    """Bloqueia dados de teste para edição exclusiva"""
    try:
        data = request.get_json()
        test_data_id = data.get('test_data_id')
        user_id = data.get('user_id')
        
        if not test_data_id or not user_id:
            return jsonify({
                'success': False,
                'error': 'test_data_id e user_id são obrigatórios'
            }), 400
        
        # Verificar se já está bloqueado
        lock_info = test_data_model.get_lock_info(test_data_id)
        
        if lock_info and lock_info.get('locked_by') != user_id:
            # Verificar se o lock ainda é válido (5 minutos)
            lock_time = datetime.fromisoformat(lock_info.get('locked_at'))
            if datetime.now() - lock_time < timedelta(minutes=5):
                return jsonify({
                    'success': False,
                    'error': f'Dados bloqueados para edição por {lock_info.get("locked_by")}',
                    'locked_by': lock_info.get('locked_by'),
                    'locked_at': lock_info.get('locked_at')
                }), 423  # Locked
        
        # Criar ou atualizar lock
        success = test_data_model.create_lock(test_data_id, user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Dados bloqueados para edição'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao bloquear dados'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_data_bp.route('/releases/<release_id>/test-data/unlock', methods=['POST'])
def unlock_test_data(release_id):
    """Desbloqueia dados de teste"""
    try:
        data = request.get_json()
        test_data_id = data.get('test_data_id')
        user_id = data.get('user_id')
        
        if not test_data_id or not user_id:
            return jsonify({
                'success': False,
                'error': 'test_data_id e user_id são obrigatórios'
            }), 400
        
        success = test_data_model.remove_lock(test_data_id, user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Dados desbloqueados'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao desbloquear dados'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

