import boto3
from datetime import datetime
import uuid
from src.config import get_dynamodb_resource, get_dynamodb_client

class DynamoDBModel:
    """Classe base para modelos DynamoDB"""
    
    def __init__(self):
        self.dynamodb = get_dynamodb_resource()
        self.client = get_dynamodb_client()

class ReleaseTestStatusModel(DynamoDBModel):
    """Modelo para gerenciar status de testes de releases por squad"""
    
    def __init__(self):
        super().__init__()
        self.table_name = 'ReleaseTestStatus'
        self.table = self.dynamodb.Table(self.table_name)
    
    def create_table(self):
        """Cria a tabela ReleaseTestStatus no DynamoDB"""
        try:
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': 'test_status_id',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'test_status_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'release_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'squad_name',
                        'AttributeType': 'S'
                    }
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'release-index',
                        'KeySchema': [
                            {
                                'AttributeName': 'release_id',
                                'KeyType': 'HASH'
                            }
                        ],
                        'Projection': {
                            'ProjectionType': 'ALL'
                        }
                    },
                    {
                        'IndexName': 'release-squad-index',
                        'KeySchema': [
                            {
                                'AttributeName': 'release_id',
                                'KeyType': 'HASH'
                            },
                            {
                                'AttributeName': 'squad_name',
                                'KeyType': 'RANGE'
                            }
                        ],
                        'Projection': {
                            'ProjectionType': 'ALL'
                        }
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            return True
        except Exception as e:
            print(f"Erro ao criar tabela ReleaseTestStatus: {e}")
            return False
    
    def create_or_update_test_status(self, test_status_data):
        """Cria ou atualiza um status de teste"""
        release_id = test_status_data.get('release_id')
        squad_name = test_status_data.get('squad_name')
        
        # Verificar se já existe um registro para esta release e squad
        existing_status = self.get_test_status_by_release_and_squad(release_id, squad_name)
        
        if existing_status:
            # Atualizar registro existente
            return self.update_test_status(existing_status['test_status_id'], test_status_data)
        else:
            # Criar novo registro
            test_status_id = str(uuid.uuid4())
            current_time = datetime.now().isoformat()
            
            item = {
                'test_status_id': test_status_id,
                'release_id': release_id,
                'squad_name': squad_name,
                'responsavel': test_status_data.get('responsavel'),
                'status': test_status_data.get('status', 'nao_iniciado'),
                'observacoes': test_status_data.get('observacoes', ''),
                'created_at': current_time,
                'updated_at': current_time
            }
            
            try:
                self.table.put_item(Item=item)
                return test_status_id
            except Exception as e:
                print(f"Erro ao criar status de teste: {e}")
                return None
    
    def get_test_status_by_release_and_squad(self, release_id, squad_name):
        """Busca status de teste por release e squad"""
        try:
            response = self.table.query(
                IndexName='release-squad-index',
                KeyConditionExpression='release_id = :release_id AND squad_name = :squad_name',
                ExpressionAttributeValues={
                    ':release_id': release_id,
                    ':squad_name': squad_name
                }
            )
            items = response.get('Items', [])
            return items[0] if items else None
        except Exception as e:
            print(f"Erro ao buscar status de teste: {e}")
            return None
    
    def get_test_statuses_by_release(self, release_id):
        """Busca todos os status de testes por release"""
        try:
            response = self.table.query(
                IndexName='release-index',
                KeyConditionExpression='release_id = :release_id',
                ExpressionAttributeValues={':release_id': release_id}
            )
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao buscar status de testes: {e}")
            return []
    
    def update_test_status(self, test_status_id, update_data):
        """Atualiza o status de um teste"""
        try:
            update_expression = "SET updated_at = :updated_at"
            expression_values = {':updated_at': datetime.now().isoformat()}
            
            for key, value in update_data.items():
                if key not in ['test_status_id', 'release_id', 'created_at']:
                    update_expression += f", {key} = :{key}"
                    expression_values[f":{key}"] = value
            
            self.table.update_item(
                Key={'test_status_id': test_status_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return True
        except Exception as e:
            print(f"Erro ao atualizar status de teste: {e}")
            return False
    
    def delete_test_status(self, test_status_id):
        """Deleta um status de teste"""
        try:
            self.table.delete_item(Key={'test_status_id': test_status_id})
            return True
        except Exception as e:
            print(f"Erro ao deletar status de teste: {e}")
            return False
    
    def get_test_status_summary(self, release_id):
        """Retorna um resumo dos status de testes de uma release"""
        try:
            test_statuses = self.get_test_statuses_by_release(release_id)
            
            summary = {
                'total_squads': len(test_statuses),
                'status_count': {},
                'squads_by_status': {}
            }
            
            for status in test_statuses:
                status_value = status.get('status', 'nao_iniciado')
                
                # Contar por status
                if status_value not in summary['status_count']:
                    summary['status_count'][status_value] = 0
                summary['status_count'][status_value] += 1
                
                # Agrupar squads por status
                if status_value not in summary['squads_by_status']:
                    summary['squads_by_status'][status_value] = []
                summary['squads_by_status'][status_value].append({
                    'squad_name': status.get('squad_name'),
                    'responsavel': status.get('responsavel'),
                    'observacoes': status.get('observacoes', '')
                })
            
            return summary
        except Exception as e:
            print(f"Erro ao gerar resumo de status de testes: {e}")
            return {}

