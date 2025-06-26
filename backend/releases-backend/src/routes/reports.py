from flask import Blueprint, request, jsonify
from src.models.dynamodb_models import ReleaseModel, SquadModel
from datetime import datetime, timedelta

reports_bp = Blueprint('reports', __name__)
release_model = ReleaseModel()
squad_model = SquadModel()

@reports_bp.route('/reports/squads-not-testing', methods=['GET'])
def squads_not_testing():
    """Relatório de squads que não estão testando"""
    try:
        # Buscar todas as releases ativas
        releases = release_model.list_releases()
        active_releases = [r for r in releases if r.get('sla_active', False)]
        
        # Buscar todas as squads
        all_squads = squad_model.list_squads()
        active_squads = [s for s in all_squads if s.get('ativo', True)]
        
        # Identificar squads que estão participando de releases ativas
        testing_squads = set()
        for release in active_releases:
            squads_participantes = release.get('squads_participantes', [])
            testing_squads.update(squads_participantes)
        
        # Squads que não estão testando
        not_testing_squads = []
        for squad in active_squads:
            squad_name = squad.get('squad_name')
            if squad_name not in testing_squads:
                not_testing_squads.append({
                    'squad_id': squad.get('squad_id'),
                    'squad_name': squad_name,
                    'responsavel': squad.get('responsavel'),
                    'modulos': squad.get('modulos', []),
                    'last_activity': squad.get('updated_at')
                })
        
        return jsonify({
            'success': True,
            'data': {
                'squads_not_testing': not_testing_squads,
                'total_squads': len(active_squads),
                'testing_squads': len(testing_squads),
                'not_testing_squads': len(not_testing_squads),
                'percentage_not_testing': round((len(not_testing_squads) / len(active_squads)) * 100, 2) if active_squads else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reports_bp.route('/reports/sla-status', methods=['GET'])
def sla_status_report():
    """Relatório de status de SLA de todas as releases"""
    try:
        releases = release_model.list_releases()
        
        sla_report = {
            'active_slas': [],
            'expired_slas': [],
            'stopped_slas': [],
            'summary': {
                'total_releases': len(releases),
                'active_count': 0,
                'expired_count': 0,
                'stopped_count': 0
            }
        }
        
        for release in releases:
            release_id = release.get('release_id')
            sla_status = release_model.check_sla_status(release_id)
            
            release_info = {
                'release_id': release_id,
                'release_name': release.get('release_name'),
                'ambiente': release.get('ambiente'),
                'sla_start_time': release.get('sla_start_time'),
                'sla_duration_hours': release.get('sla_duration_hours'),
                'status': release.get('status'),
                'sla_status': sla_status
            }
            
            if sla_status == 'active':
                sla_report['active_slas'].append(release_info)
                sla_report['summary']['active_count'] += 1
            elif sla_status == 'expired':
                sla_report['expired_slas'].append(release_info)
                sla_report['summary']['expired_count'] += 1
            else:
                sla_report['stopped_slas'].append(release_info)
                sla_report['summary']['stopped_count'] += 1
        
        return jsonify({
            'success': True,
            'data': sla_report
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reports_bp.route('/reports/release-status', methods=['GET'])
def release_status_report():
    """Relatório de status das releases"""
    try:
        releases = release_model.list_releases()
        
        status_count = {
            'concluído': 0,
            'em andamento': 0,
            'bloqueado': 0,
            'concluido com bugs': 0,
            'outros': 0
        }
        
        status_details = {
            'concluído': [],
            'em andamento': [],
            'bloqueado': [],
            'concluido com bugs': [],
            'outros': []
        }
        
        for release in releases:
            status = release.get('status', 'outros')
            
            release_info = {
                'release_id': release.get('release_id'),
                'release_name': release.get('release_name'),
                'ambiente': release.get('ambiente'),
                'created_at': release.get('created_at'),
                'updated_at': release.get('updated_at')
            }
            
            if status in status_count:
                status_count[status] += 1
                status_details[status].append(release_info)
            else:
                status_count['outros'] += 1
                status_details['outros'].append(release_info)
        
        return jsonify({
            'success': True,
            'data': {
                'summary': status_count,
                'details': status_details,
                'total_releases': len(releases)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reports_bp.route('/reports/productivity', methods=['GET'])
def productivity_report():
    """Relatório de produtividade por período"""
    try:
        # Parâmetros de data (opcional)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        releases = release_model.list_releases()
        
        # Filtrar por data se fornecido
        if start_date and end_date:
            try:
                start_dt = datetime.fromisoformat(start_date)
                end_dt = datetime.fromisoformat(end_date)
                
                filtered_releases = []
                for release in releases:
                    created_at = datetime.fromisoformat(release.get('created_at', ''))
                    if start_dt <= created_at <= end_dt:
                        filtered_releases.append(release)
                
                releases = filtered_releases
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Formato de data inválido. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
                }), 400
        
        # Calcular métricas de produtividade
        total_releases = len(releases)
        completed_releases = len([r for r in releases if r.get('status') == 'concluído'])
        avg_completion_time = 0
        
        if completed_releases > 0:
            completion_times = []
            for release in releases:
                if release.get('status') == 'concluído':
                    created_at = datetime.fromisoformat(release.get('created_at', ''))
                    updated_at = datetime.fromisoformat(release.get('updated_at', ''))
                    completion_time = (updated_at - created_at).total_seconds() / 3600  # em horas
                    completion_times.append(completion_time)
            
            avg_completion_time = sum(completion_times) / len(completion_times)
        
        return jsonify({
            'success': True,
            'data': {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'metrics': {
                    'total_releases': total_releases,
                    'completed_releases': completed_releases,
                    'completion_rate': round((completed_releases / total_releases) * 100, 2) if total_releases > 0 else 0,
                    'avg_completion_time_hours': round(avg_completion_time, 2)
                },
                'releases': releases
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@reports_bp.route('/reports/dashboard', methods=['GET'])
def dashboard_summary():
    """Resumo para dashboard principal"""
    try:
        releases = release_model.list_releases()
        squads = squad_model.list_squads()
        
        # Contar releases por status
        status_count = {}
        active_slas = 0
        expired_slas = 0
        
        for release in releases:
            status = release.get('status', 'outros')
            status_count[status] = status_count.get(status, 0) + 1
            
            # Verificar SLA
            sla_status = release_model.check_sla_status(release.get('release_id'))
            if sla_status == 'active':
                active_slas += 1
            elif sla_status == 'expired':
                expired_slas += 1
        
        # Contar squads ativas
        active_squads = len([s for s in squads if s.get('ativo', True)])
        
        return jsonify({
            'success': True,
            'data': {
                'releases': {
                    'total': len(releases),
                    'by_status': status_count
                },
                'sla': {
                    'active': active_slas,
                    'expired': expired_slas
                },
                'squads': {
                    'total': len(squads),
                    'active': active_squads
                },
                'last_updated': datetime.now().isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

