from flask import Blueprint, jsonify
from src.utils.database_management import DatabaseManager

database_management_bp = Blueprint('database_management', __name__)

# Instanciar o gerenciador de banco
db_manager = DatabaseManager()

@database_management_bp.route('/drop-old-tables', methods=['POST'])
def drop_old_tables():
    """Endpoint para deletar tabelas antigas"""
    try:
        results = db_manager.drop_old_tables()
        
        return jsonify({
            'success': True,
            'message': 'Operação de deleção de tabelas antigas concluída',
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao deletar tabelas antigas: {str(e)}'
        }), 500

@database_management_bp.route('/create-simplified-tables', methods=['POST'])
def create_simplified_tables():
    """Endpoint para criar tabelas simplificadas"""
    try:
        results = db_manager.create_simplified_tables()
        
        return jsonify({
            'success': True,
            'message': 'Tabelas simplificadas criadas com sucesso',
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao criar tabelas simplificadas: {str(e)}'
        }), 500

@database_management_bp.route('/migrate-data', methods=['POST'])
def migrate_data():
    """Endpoint para migrar dados das tabelas antigas para as novas"""
    try:
        results = db_manager.migrate_data_from_old_to_new()
        
        return jsonify({
            'success': results.get('success', True),
            'message': results.get('message', 'Migração concluída'),
            'migrated_releases': results.get('migrated_releases', 0),
            'error': results.get('error')
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro durante migração: {str(e)}'
        }), 500

@database_management_bp.route('/reset-database', methods=['POST'])
def reset_database():
    """Endpoint para reset completo do banco de dados"""
    try:
        results = db_manager.reset_database_complete()
        
        return jsonify({
            'success': True,
            'message': 'Reset completo do banco de dados realizado com sucesso',
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro durante reset do banco de dados: {str(e)}'
        }), 500

@database_management_bp.route('/list-tables', methods=['GET'])
def list_tables():
    """Endpoint para listar todas as tabelas existentes"""
    try:
        results = db_manager.list_all_tables()
        
        if results['success']:
            return jsonify({
                'success': True,
                'tables': results['tables'],
                'total_tables': len(results['tables'])
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': results['error']
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao listar tabelas: {str(e)}'
        }), 500

@database_management_bp.route('/database-status', methods=['GET'])
def database_status():
    """Endpoint para verificar o status do banco de dados"""
    try:
        # Listar todas as tabelas
        tables_result = db_manager.list_all_tables()
        
        if not tables_result['success']:
            return jsonify({
                'success': False,
                'error': tables_result['error']
            }), 500
        
        tables = tables_result['tables']
        
        # Verificar quais tabelas existem
        old_tables = ['Releases', 'Squads', 'Users', 'ReleaseTestData']
        new_tables = ['SimplifiedReleases', 'SquadStatus']
        
        old_tables_exist = [table for table in old_tables if table in tables]
        new_tables_exist = [table for table in new_tables if table in tables]
        
        status = {
            'all_tables': tables,
            'old_tables_exist': old_tables_exist,
            'new_tables_exist': new_tables_exist,
            'migration_needed': len(old_tables_exist) > 0 and len(new_tables_exist) == 0,
            'ready_for_simplified_system': len(new_tables_exist) == 2,
            'mixed_state': len(old_tables_exist) > 0 and len(new_tables_exist) > 0
        }
        
        return jsonify({
            'success': True,
            'status': status,
            'recommendations': get_recommendations(status)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao verificar status do banco: {str(e)}'
        }), 500

def get_recommendations(status):
    """Gera recomendações baseadas no status do banco"""
    recommendations = []
    
    if status['ready_for_simplified_system']:
        recommendations.append("✅ Sistema simplificado pronto para uso!")
        
    elif status['migration_needed']:
        recommendations.append("🔄 Migração necessária: Execute /reset-database para migrar para o sistema simplificado")
        
    elif status['mixed_state']:
        recommendations.append("⚠️ Estado misto detectado: Recomenda-se executar /reset-database para limpar e recriar")
        
    elif len(status['old_tables_exist']) == 0 and len(status['new_tables_exist']) == 0:
        recommendations.append("🆕 Nenhuma tabela encontrada: Execute /create-simplified-tables para inicializar")
        
    else:
        recommendations.append("❓ Estado não reconhecido: Verifique manualmente as tabelas")
    
    return recommendations

