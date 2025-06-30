import boto3
import time
from src.config import get_dynamodb_resource, get_dynamodb_client

class DatabaseManager:
    """Classe para gerenciar operações de banco de dados DynamoDB"""
    
    def __init__(self):
        self.dynamodb = get_dynamodb_resource()
        self.client = get_dynamodb_client()
    
    def drop_old_tables(self):
        """Remove todas as tabelas antigas do sistema"""
        old_tables = [
            'Releases',
            'Squads', 
            'Users',
            'ReleaseTestData'
        ]
        
        results = {}
        
        for table_name in old_tables:
            try:
                # Verificar se a tabela existe
                table = self.dynamodb.Table(table_name)
                table.load()
                
                # Deletar a tabela
                table.delete()
                
                # Aguardar a tabela ser deletada
                print(f"Aguardando deleção da tabela {table_name}...")
                table.wait_until_not_exists()
                
                results[table_name] = "Deletada com sucesso"
                print(f"Tabela {table_name} deletada com sucesso!")
                
            except self.client.exceptions.ResourceNotFoundException:
                results[table_name] = "Tabela não encontrada (já deletada ou nunca existiu)"
                print(f"Tabela {table_name} não encontrada")
                
            except Exception as e:
                results[table_name] = f"Erro ao deletar: {str(e)}"
                print(f"Erro ao deletar tabela {table_name}: {str(e)}")
        
        return results
    
    def create_simplified_tables(self):
        """Cria as novas tabelas simplificadas"""
        from src.models.simplified_models import SimplifiedReleaseModel, SquadStatusModel
        
        results = {}
        
        try:
            # Criar tabela SimplifiedReleases
            release_model = SimplifiedReleaseModel()
            results['SimplifiedReleases'] = release_model.create_table()
            
            # Aguardar criação
            if results['SimplifiedReleases']:
                print("Aguardando criação da tabela SimplifiedReleases...")
                release_model.table.wait_until_exists()
                print("Tabela SimplifiedReleases criada com sucesso!")
            
            # Criar tabela SquadStatus
            squad_status_model = SquadStatusModel()
            results['SquadStatus'] = squad_status_model.create_table()
            
            # Aguardar criação
            if results['SquadStatus']:
                print("Aguardando criação da tabela SquadStatus...")
                squad_status_model.table.wait_until_exists()
                print("Tabela SquadStatus criada com sucesso!")
                
        except Exception as e:
            results['error'] = f"Erro ao criar tabelas: {str(e)}"
            print(f"Erro ao criar tabelas: {str(e)}")
        
        return results
    
    def migrate_data_from_old_to_new(self):
        """Migra dados das tabelas antigas para as novas (se necessário)"""
        try:
            # Verificar se existem dados nas tabelas antigas
            old_releases_table = self.dynamodb.Table('Releases')
            
            try:
                old_releases_table.load()
                response = old_releases_table.scan(Limit=10)
                old_releases = response.get('Items', [])
                
                if old_releases:
                    print(f"Encontradas {len(old_releases)} releases antigas para migrar...")
                    
                    from src.models.simplified_models import SimplifiedReleaseModel, SquadStatusModel
                    release_model = SimplifiedReleaseModel()
                    squad_status_model = SquadStatusModel()
                    
                    migrated_count = 0
                    
                    for old_release in old_releases:
                        # Criar release simplificada
                        simplified_data = {
                            'release_name': old_release.get('release_name', ''),
                            'squad': old_release.get('squad', ''),
                            'responsavel': old_release.get('responsavel', ''),
                            'status': old_release.get('status', 'em_andamento')
                        }
                        
                        new_release_id = release_model.create_release(simplified_data)
                        
                        if new_release_id:
                            # Criar status inicial para a squad
                            squad_status_data = {
                                'release_id': new_release_id,
                                'squad': simplified_data['squad'],
                                'responsavel': simplified_data['responsavel'],
                                'status': simplified_data['status']
                            }
                            squad_status_model.create_squad_status(squad_status_data)
                            migrated_count += 1
                    
                    return {
                        'success': True,
                        'migrated_releases': migrated_count,
                        'message': f'{migrated_count} releases migradas com sucesso'
                    }
                else:
                    return {
                        'success': True,
                        'migrated_releases': 0,
                        'message': 'Nenhuma release antiga encontrada para migrar'
                    }
                    
            except self.client.exceptions.ResourceNotFoundException:
                return {
                    'success': True,
                    'migrated_releases': 0,
                    'message': 'Tabela antiga não encontrada - nada para migrar'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Erro durante migração: {str(e)}'
            }
    
    def reset_database_complete(self):
        """Reset completo do banco de dados - remove tabelas antigas e cria novas"""
        print("Iniciando reset completo do banco de dados...")
        
        results = {
            'drop_results': {},
            'create_results': {},
            'migration_results': {}
        }
        
        # 1. Tentar migrar dados antes de deletar (opcional)
        print("Tentando migrar dados existentes...")
        results['migration_results'] = self.migrate_data_from_old_to_new()
        
        # 2. Deletar tabelas antigas
        print("Deletando tabelas antigas...")
        results['drop_results'] = self.drop_old_tables()
        
        # 3. Aguardar um pouco para garantir que as tabelas foram deletadas
        print("Aguardando 10 segundos para garantir deleção completa...")
        time.sleep(10)
        
        # 4. Criar novas tabelas
        print("Criando novas tabelas simplificadas...")
        results['create_results'] = self.create_simplified_tables()
        
        print("Reset completo do banco de dados finalizado!")
        return results
    
    def list_all_tables(self):
        """Lista todas as tabelas existentes no DynamoDB"""
        try:
            response = self.client.list_tables()
            return {
                'success': True,
                'tables': response.get('TableNames', [])
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

