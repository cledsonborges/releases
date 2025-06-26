#!/usr/bin/env python3
"""
Script para inicializar as tabelas do DynamoDB
"""

from models.dynamodb_models import ReleaseModel, SquadModel, UserModel

def init_tables():
    """Inicializa todas as tabelas necessárias no DynamoDB"""
    print("Inicializando tabelas do DynamoDB...")
    
    # Criar tabela de Releases
    print("Criando tabela Releases...")
    release_model = ReleaseModel()
    if release_model.create_table():
        print("✓ Tabela Releases criada com sucesso")
    else:
        print("✗ Erro ao criar tabela Releases")
    
    # Criar tabela de Squads
    print("Criando tabela Squads...")
    squad_model = SquadModel()
    if squad_model.create_table():
        print("✓ Tabela Squads criada com sucesso")
    else:
        print("✗ Erro ao criar tabela Squads")
    
    # Criar tabela de Users
    print("Criando tabela Users...")
    user_model = UserModel()
    if user_model.create_table():
        print("✓ Tabela Users criada com sucesso")
    else:
        print("✗ Erro ao criar tabela Users")
    
    print("Inicialização concluída!")

def create_default_admin():
    """Cria um usuário administrador padrão"""
    print("Criando usuário administrador padrão...")
    user_model = UserModel()
    
    admin_data = {
        'username': 'admin',
        'email': 'admin@releases.com',
        'role': 'admin',
        'ativo': True
    }
    
    user_id = user_model.create_user(admin_data)
    if user_id:
        print(f"✓ Usuário administrador criado com ID: {user_id}")
    else:
        print("✗ Erro ao criar usuário administrador")

if __name__ == "__main__":
    init_tables()
    create_default_admin()

