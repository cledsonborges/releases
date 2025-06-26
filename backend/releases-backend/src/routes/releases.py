from flask import Blueprint, request, jsonify
from src.models.dynamodb_models import ReleaseModel
from src.services.gemini_service import GeminiService
from src.services.qr_service import QRCodeService
from datetime import datetime, timedelta

releases_bp = Blueprint('releases', __name__)
release_model = ReleaseModel()
gemini_service = GeminiService()
qr_service = QRCodeService()

@releases_bp.route('/releases', methods=['GET'])
def list_releases():
    """Lista todas as releases"""
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

@releases_bp.route('/releases', methods=['POST'])
def create_release():
    """Cria uma nova release"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data.get('release_name'):
            return jsonify({
                'success': False,
                'error': 'Nome da release é obrigatório'
            }), 400
        
        # Gerar QR codes se URLs foram fornecidas
        if data.get('url_homolog'):
            data['qrcode_homolog'] = qr_service.generate_qr_code(data['url_homolog'])
        
        if data.get('url_alpha'):
            data['qrcode_alpha'] = qr_service.generate_qr_code(data['url_alpha'])
        
        release_id = release_model.create_release(data)
        
        if release_id:
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

@releases_bp.route('/releases/<release_id>', methods=['GET'])
def get_release(release_id):
    """Busca uma release específica"""
    try:
        release = release_model.get_release(release_id)
        
        if release:
            # Verificar status do SLA
            sla_status = release_model.check_sla_status(release_id)
            release['sla_status'] = sla_status
            
            return jsonify({
                'success': True,
                'data': release
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@releases_bp.route('/releases/<release_id>', methods=['PUT'])
def update_release(release_id):
    """Atualiza uma release"""
    try:
        data = request.get_json()
        
        # Verificar se SLA ainda está ativo
        sla_status = release_model.check_sla_status(release_id)
        if sla_status == 'expired':
            return jsonify({
                'success': False,
                'error': 'SLA vencido. Não é possível editar esta release.'
            }), 403
        
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

@releases_bp.route('/releases/<release_id>', methods=['DELETE'])
def delete_release(release_id):
    """Deleta uma release"""
    try:
        success = release_model.delete_release(release_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Release deletada com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao deletar release'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@releases_bp.route('/releases/<release_id>/sla/start', methods=['POST'])
def start_sla(release_id):
    """Inicia o SLA de uma release"""
    try:
        data = request.get_json()
        duration_hours = data.get('duration_hours', 24)
        
        update_data = {
            'sla_start_time': datetime.now().isoformat(),
            'sla_duration_hours': duration_hours,
            'sla_active': True
        }
        
        success = release_model.update_release(release_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'SLA iniciado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao iniciar SLA'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@releases_bp.route('/releases/<release_id>/sla/stop', methods=['POST'])
def stop_sla(release_id):
    """Para o SLA de uma release"""
    try:
        update_data = {
            'sla_active': False,
            'sla_end_time': datetime.now().isoformat()
        }
        
        success = release_model.update_release(release_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'SLA parado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao parar SLA'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@releases_bp.route('/releases/<release_id>/sla/extend', methods=['POST'])
def extend_sla(release_id):
    """Estende o SLA de uma release"""
    try:
        data = request.get_json()
        additional_hours = data.get('additional_hours', 0)
        
        if additional_hours <= 0:
            return jsonify({
                'success': False,
                'error': 'Horas adicionais devem ser maior que zero'
            }), 400
        
        release = release_model.get_release(release_id)
        if not release:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
        
        current_duration = float(release.get('sla_duration_hours', 24))
        new_duration = current_duration + additional_hours
        
        update_data = {
            'sla_duration_hours': new_duration,
            'sla_active': True  # Reativar se estava vencido
        }
        
        success = release_model.update_release(release_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'SLA estendido em {additional_hours} horas'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao estender SLA'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@releases_bp.route('/releases/<release_id>/release-notes', methods=['POST'])
def generate_release_notes(release_id):
    """Gera release notes usando Gemini AI"""
    try:
        release = release_model.get_release(release_id)
        
        if not release:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
        
        release_notes = gemini_service.generate_release_notes(release)
        
        # Salvar as release notes na release
        update_data = {'release_notes': release_notes}
        release_model.update_release(release_id, update_data)
        
        return jsonify({
            'success': True,
            'data': {'release_notes': release_notes}
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@releases_bp.route('/releases/<release_id>/status', methods=['PUT'])
def update_release_status(release_id):
    """Atualiza status de entrega (para Time de Qualidade)"""
    try:
        data = request.get_json()
        
        # Verificar se SLA ainda está ativo
        sla_status = release_model.check_sla_status(release_id)
        if sla_status == 'expired':
            return jsonify({
                'success': False,
                'error': 'SLA vencido. Não é possível editar esta release.'
            }), 403
        
        allowed_fields = ['status', 'detalhe_entrega', 'responsavel', 'modulo', 'bugs_reportados']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({
                'success': False,
                'error': 'Nenhum campo válido para atualização'
            }), 400
        
        success = release_model.update_release(release_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Status atualizado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Erro ao atualizar status'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@releases_bp.route('/releases/<release_id>/sla/status', methods=['GET'])
def check_sla_status(release_id):
    """Verifica o status do SLA"""
    try:
        sla_status = release_model.check_sla_status(release_id)
        
        if sla_status is None:
            return jsonify({
                'success': False,
                'error': 'Release não encontrada'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {'sla_status': sla_status}
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

