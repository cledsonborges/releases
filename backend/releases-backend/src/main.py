import os
import sys

from flask import Flask, jsonify
from flask_cors import CORS
from src.config import Config

# Importar blueprints
from src.routes.releases import releases_bp
from src.routes.squads import squads_bp
from src.routes.reports import reports_bp
from src.routes.release_test_data import release_test_data_bp
from src.routes.simplified_releases import simplified_releases_bp
from src.routes.database_management import database_management_bp

app = Flask(__name__)

# Configurações
app.config["SECRET_KEY"] = Config.SECRET_KEY

# Configurar CORS para permitir requisições do frontend
CORS(app, origins="*")

# Registrar blueprints
app.register_blueprint(releases_bp, url_prefix="/api")
app.register_blueprint(squads_bp, url_prefix="/api")
app.register_blueprint(reports_bp, url_prefix="/api")
app.register_blueprint(release_test_data_bp, url_prefix="/api")
app.register_blueprint(simplified_releases_bp, url_prefix="/api")
app.register_blueprint(database_management_bp, url_prefix="/api")

# Rota de health check
@app.route("/api/health", methods=["GET"])
def health_check():
    """Endpoint para verificar se a API está funcionando"""
    return (
        jsonify({
            "success": True,
            "message": "API está funcionando",
            "version": "1.0.0",
        }),
        200,
    )

# Rota para inicializar tabelas DynamoDB
@app.route("/api/init-db", methods=["POST"])
def init_database():
    """Endpoint para inicializar as tabelas do DynamoDB"""
    try:
        from src.models.dynamodb_models import ReleaseModel, SquadModel, UserModel
        from src.models.release_test_data_model import ReleaseTestDataModel

        # Criar tabelas
        release_model = ReleaseModel()
        squad_model = SquadModel()
        user_model = UserModel()
        test_data_model = ReleaseTestDataModel()

        results = {
            "releases_table": release_model.create_table(),
            "squads_table": squad_model.create_table(),
            "users_table": user_model.create_table(),
            "test_data_table": test_data_model.create_table(),
        }

        # Criar usuário admin padrão
        admin_data = {
            "username": "admin",
            "email": "admin@releases.com",
            "role": "admin",
            "ativo": True,
        }
        admin_id = user_model.create_user(admin_data)

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Banco de dados inicializado com sucesso",
                    "results": results,
                    "admin_user_id": admin_id,
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify({"success": False, "error": f"Erro ao inicializar banco de dados: {str(e)}"}),
            500,
        )

# Rota para autenticação simples (mock)
@app.route("/api/auth/login", methods=["POST"])
def login():
    """Endpoint de login simples (mock para desenvolvimento)"""
    from flask import request

    try:
        data = request.get_json()
        username = data.get("username")

        if not username:
            return jsonify({"success": False, "error": "Username é obrigatório"}), 400

        # Mock de autenticação - em produção, implementar autenticação real
        user_data = {
            "user_id": "mock-user-id",
            "username": username,
            "role": "admin" if username == "admin" else "quality_team",
            "email": f"{username}@releases.com",
        }

        return (
            jsonify({"success": True, "data": {"user": user_data, "token": "mock-jwt-token"}}),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Tratamento de erros
@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "Endpoint não encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "error": "Erro interno do servidor"}), 500


