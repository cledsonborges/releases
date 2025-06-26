import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.config import Config

# Importar blueprints
from src.routes.releases import releases_bp
from src.routes.squads import squads_bp
from src.routes.reports import reports_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Configurações
app.config['SECRET_KEY'] = Config.SECRET_KEY

# Configurar CORS para permitir requisições do frontend
CORS(app, origins="*")

# Registrar blueprints
app.register_blueprint(releases_bp, url_prefix='/api')
app.register_blueprint(squads_bp, url_prefix='/api')
app.register_blueprint(reports_bp, url_prefix='/api')

# Rota de health check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint para verificar se a API está funcionando"""
    return jsonify({
        'success': True,
        'message': 'API está funcionando',
        'version': '1.0.0'
    }), 200

# Rota para inicializar tabelas DynamoDB
@app.route('/api/init-db', methods=['POST'])
def init_database():
    """Endpoint para inicializar as tabelas do DynamoDB"""
    try:
        from src.models.dynamodb_models import ReleaseModel, SquadModel, UserModel
        
        # Criar tabelas
        release_model = ReleaseModel()
        squad_model = SquadModel()
        user_model = UserModel()
        
        results = {
            'releases_table': release_model.create_table(),
            'squads_table': squad_model.create_table(),
            'users_table': user_model.create_table()
        }
        
        # Criar usuário admin padrão
        admin_data = {
            'username': 'admin',
            'email': 'admin@releases.com',
            'role': 'admin',
            'ativo': True
        }
        admin_id = user_model.create_user(admin_data)
        
        return jsonify({
            'success': True,
            'message': 'Banco de dados inicializado com sucesso',
            'results': results,
            'admin_user_id': admin_id
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Erro ao inicializar banco de dados: {str(e)}'
        }), 500

# Rota para autenticação simples (mock)
@app.route('/api/auth/login', methods=['POST'])
def login():
    """Endpoint de login simples (mock para desenvolvimento)"""
    from flask import request
    
    try:
        data = request.get_json()
        username = data.get('username')
        
        if not username:
            return jsonify({
                'success': False,
                'error': 'Username é obrigatório'
            }), 400
        
        # Mock de autenticação - em produção, implementar autenticação real
        user_data = {
            'user_id': 'mock-user-id',
            'username': username,
            'role': 'admin' if username == 'admin' else 'quality_team',
            'email': f'{username}@releases.com'
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_data,
                'token': 'mock-jwt-token'  # Em produção, gerar JWT real
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Servir arquivos estáticos do frontend Angular
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return jsonify({
                'success': True,
                'message': 'API do Sistema de Releases está funcionando',
                'endpoints': [
                    '/api/health',
                    '/api/init-db',
                    '/api/auth/login',
                    '/api/releases',
                    '/api/squads',
                    '/api/reports'
                ]
            }), 200

# Tratamento de erros
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint não encontrado'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Erro interno do servidor'
    }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

