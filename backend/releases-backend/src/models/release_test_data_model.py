import boto3
from datetime import datetime
from decimal import Decimal
import uuid
from src.config import get_dynamodb_resource, get_dynamodb_client

class ReleaseTestDataModel:
    """Modelo para gerenciar dados de teste por usuário em releases"""
    
    def __init__(self):
        self.dynamodb = get_dynamodb_resource()
        self.client = get_dynamodb_client()
        self.table_name = 'ReleaseTestData'
        self.table = self.dynamodb.Table(self.table_name)
    
    def create_table(self):
        """Cria a tabela ReleaseTestData no DynamoDB"""
        try:
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': 'test_data_id',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'test_data_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'release_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'user_id',
                        'AttributeType': 'S'
                    }
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'ReleaseIndex',
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
                        'IndexName': 'UserReleaseIndex',
                        'KeySchema': [
                            {
                                'AttributeName': 'user_id',
                                'KeyType': 'HASH'
                            },
                            {
                                'AttributeName': 'release_id',
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
            print(f"Erro ao criar tabela ReleaseTestData: {e}")
            return False
    
    def create_or_update_test_data(self, release_id, user_id, test_data):
        """Cria ou atualiza dados de teste para um usuário específico"""
        try:
            # Verificar se já existe um registro para este usuário e release
            existing_data = self.get_user_test_data(release_id, user_id)
            
            current_time = datetime.now().isoformat()
            
            if existing_data:
                # Atualizar registro existente
                test_data_id = existing_data['test_data_id']
                
                update_expression = "SET updated_at = :updated_at"
                expression_values = {':updated_at': current_time}
                
                for key, value in test_data.items():
                    if key not in ['test_data_id', 'release_id', 'user_id', 'created_at']:
                        update_expression += f", {key} = :{key}"
                        expression_values[f":{key}"] = value
                
                self.table.update_item(
                    Key={'test_data_id': test_data_id},
                    UpdateExpression=update_expression,
                    ExpressionAttributeValues=expression_values
                )
                return test_data_id
            else:
                # Criar novo registro
                test_data_id = str(uuid.uuid4())
                
                item = {
                    'test_data_id': test_data_id,
                    'release_id': release_id,
                    'user_id': user_id,
                    'username': test_data.get('username', ''),
                    'status': test_data.get('status', 'pendente'),
                    'modulo': test_data.get('modulo', ''),
                    'responsavel': test_data.get('responsavel', ''),
                    'detalhe_entrega': test_data.get('detalhe_entrega', ''),
                    'bugs_reportados': Decimal(str(test_data.get('bugs_reportados', 0))),
                    'tempo_teste_horas': Decimal(str(test_data.get('tempo_teste_horas', 0))),
                    'observacoes': test_data.get('observacoes', ''),
                    'data_inicio_teste': test_data.get('data_inicio_teste'),
                    'data_fim_teste': test_data.get('data_fim_teste'),
                    'ambiente': test_data.get('ambiente', ''),
                    'created_at': current_time,
                    'updated_at': current_time
                }
                
                self.table.put_item(Item=item)
                return test_data_id
                
        except Exception as e:
            print(f"Erro ao criar/atualizar dados de teste: {e}")
            return None
    
    def get_user_test_data(self, release_id, user_id):
        """Busca dados de teste de um usuário específico para uma release"""
        try:
            response = self.table.query(
                IndexName='UserReleaseIndex',
                KeyConditionExpression='user_id = :user_id AND release_id = :release_id',
                ExpressionAttributeValues={
                    ':user_id': user_id,
                    ':release_id': release_id
                }
            )
            items = response.get('Items', [])
            return items[0] if items else None
        except Exception as e:
            print(f"Erro ao buscar dados de teste do usuário: {e}")
            return None
    
    def get_release_test_data(self, release_id):
        """Busca todos os dados de teste para uma release"""
        try:
            response = self.table.query(
                IndexName='ReleaseIndex',
                KeyConditionExpression='release_id = :release_id',
                ExpressionAttributeValues={
                    ':release_id': release_id
                }
            )
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao buscar dados de teste da release: {e}")
            return []
    
    def delete_test_data(self, test_data_id):
        """Deleta dados de teste"""
        try:
            self.table.delete_item(Key={'test_data_id': test_data_id})
            return True
        except Exception as e:
            print(f"Erro ao deletar dados de teste: {e}")
            return False
    
    def delete_release_test_data(self, release_id):
        """Deleta todos os dados de teste de uma release"""
        try:
            # Buscar todos os dados da release
            test_data_list = self.get_release_test_data(release_id)
            
            # Deletar cada item
            for test_data in test_data_list:
                self.table.delete_item(Key={'test_data_id': test_data['test_data_id']})
            
            return True
        except Exception as e:
            print(f"Erro ao deletar dados de teste da release: {e}")
            return False
    
    def get_test_data_summary(self, release_id):
        """Gera resumo dos dados de teste para uma release"""
        try:
            test_data_list = self.get_release_test_data(release_id)
            
            summary = {
                'total_testers': len(test_data_list),
                'status_count': {},
                'total_bugs': 0,
                'total_test_hours': 0,
                'modules_tested': set(),
                'testers_by_status': {}
            }
            
            for data in test_data_list:
                status = data.get('status', 'pendente')
                summary['status_count'][status] = summary['status_count'].get(status, 0) + 1
                summary['total_bugs'] += int(data.get('bugs_reportados', 0))
                summary['total_test_hours'] += float(data.get('tempo_teste_horas', 0))
                
                if data.get('modulo'):
                    summary['modules_tested'].add(data['modulo'])
                
                if status not in summary['testers_by_status']:
                    summary['testers_by_status'][status] = []
                summary['testers_by_status'][status].append({
                    'username': data.get('username', ''),
                    'responsavel': data.get('responsavel', ''),
                    'modulo': data.get('modulo', '')
                })
            
            summary['modules_tested'] = list(summary['modules_tested'])
            
            return summary
        except Exception as e:
            print(f"Erro ao gerar resumo dos dados de teste: {e}")
            return None

