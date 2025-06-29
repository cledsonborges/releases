import boto3
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
from src.config import get_dynamodb_resource, get_dynamodb_client

class TestDataModel:
    """Modelo para gerenciar dados de teste de releases"""
    
    def __init__(self):
        self.dynamodb = get_dynamodb_resource()
        self.client = get_dynamodb_client()
        self.table_name = 'TestData'
        self.audit_table_name = 'TestDataAudit'
        self.locks_table_name = 'TestDataLocks'
        self.table = self.dynamodb.Table(self.table_name)
        self.audit_table = self.dynamodb.Table(self.audit_table_name)
        self.locks_table = self.dynamodb.Table(self.locks_table_name)
    
    def create_tables(self):
        """Cria as tabelas necessárias no DynamoDB"""
        try:
            # Tabela principal de dados de teste
            self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {'AttributeName': 'test_data_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'test_data_id', 'AttributeType': 'S'},
                    {'AttributeName': 'release_id', 'AttributeType': 'S'},
                    {'AttributeName': 'user_id', 'AttributeType': 'S'}
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'ReleaseIndex',
                        'KeySchema': [
                            {'AttributeName': 'release_id', 'KeyType': 'HASH'},
                            {'AttributeName': 'user_id', 'KeyType': 'RANGE'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'}
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            
            # Tabela de auditoria
            self.dynamodb.create_table(
                TableName=self.audit_table_name,
                KeySchema=[
                    {'AttributeName': 'audit_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'audit_id', 'AttributeType': 'S'},
                    {'AttributeName': 'release_id', 'AttributeType': 'S'},
                    {'AttributeName': 'timestamp', 'AttributeType': 'S'}
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'ReleaseAuditIndex',
                        'KeySchema': [
                            {'AttributeName': 'release_id', 'KeyType': 'HASH'},
                            {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'}
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            
            # Tabela de locks
            self.dynamodb.create_table(
                TableName=self.locks_table_name,
                KeySchema=[
                    {'AttributeName': 'test_data_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'test_data_id', 'AttributeType': 'S'}
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            
            return True
        except Exception as e:
            print(f"Erro ao criar tabelas: {e}")
            return False
    
    def create_test_data(self, release_id, user_id, data):
        """Cria novos dados de teste"""
        test_data_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        item = {
            'test_data_id': test_data_id,
            'release_id': release_id,
            'user_id': user_id,
            'username': data.get('username'),
            'squad_name': data.get('squad_name', ''),
            'modulo': data.get('modulo', ''),
            'detalhe_entrega': data.get('detalhe_entrega', ''),
            'responsavel': data.get('responsavel', data.get('username')),
            'status': data.get('status', 'pendente'),
            'bugs_reportados': Decimal(str(data.get('bugs_reportados', 0))),
            'tempo_teste_horas': Decimal(str(data.get('tempo_teste_horas', 0))),
            'observacoes': data.get('observacoes', ''),
            'ambiente': data.get('ambiente', ''),
            'created_at': current_time,
            'updated_at': current_time,
            'last_modified_at': data.get('last_modified_at', current_time),
            'last_modified_by': data.get('last_modified_by', data.get('username'))
        }
        
        try:
            self.table.put_item(Item=item)
            return test_data_id
        except Exception as e:
            print(f"Erro ao criar dados de teste: {e}")
            return None
    
    def get_test_data_by_id(self, test_data_id):
        """Busca dados de teste por ID"""
        try:
            response = self.table.get_item(Key={'test_data_id': test_data_id})
            return response.get('Item')
        except Exception as e:
            print(f"Erro ao buscar dados de teste: {e}")
            return None
    
    def get_user_test_data(self, release_id, user_id):
        """Busca dados de teste de um usuário específico para uma release"""
        try:
            response = self.table.query(
                IndexName='ReleaseIndex',
                KeyConditionExpression='release_id = :release_id AND user_id = :user_id',
                ExpressionAttributeValues={
                    ':release_id': release_id,
                    ':user_id': user_id
                }
            )
            items = response.get('Items', [])
            return items[0] if items else None
        except Exception as e:
            print(f"Erro ao buscar dados de usuário: {e}")
            return None
    
    def get_release_test_data(self, release_id):
        """Busca todos os dados de teste de uma release"""
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
            print(f"Erro ao buscar dados da release: {e}")
            return []
    
    def update_test_data(self, test_data_id, data):
        """Atualiza dados de teste"""
        current_time = datetime.now().isoformat()
        
        # Construir expressão de atualização dinamicamente
        update_expression = "SET updated_at = :updated_at"
        expression_values = {':updated_at': current_time}
        
        # Campos que podem ser atualizados
        updatable_fields = [
            'modulo', 'detalhe_entrega', 'responsavel', 'status',
            'bugs_reportados', 'tempo_teste_horas', 'observacoes',
            'last_modified_at', 'last_modified_by', 'squad_name'
        ]
        
        for field in updatable_fields:
            if field in data:
                update_expression += f", {field} = :{field}"
                value = data[field]
                
                # Converter números para Decimal
                if field in ['bugs_reportados', 'tempo_teste_horas'] and value is not None:
                    value = Decimal(str(value))
                
                expression_values[f':{field}'] = value
        
        try:
            self.table.update_item(
                Key={'test_data_id': test_data_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return True
        except Exception as e:
            print(f"Erro ao atualizar dados de teste: {e}")
            return False
    
    def delete_test_data(self, test_data_id):
        """Deleta dados de teste"""
        try:
            self.table.delete_item(Key={'test_data_id': test_data_id})
            return True
        except Exception as e:
            print(f"Erro ao deletar dados de teste: {e}")
            return False
    
    def get_test_data_summary(self, release_id):
        """Gera resumo dos dados de teste de uma release"""
        try:
            test_data = self.get_release_test_data(release_id)
            
            summary = {
                'total_entries': len(test_data),
                'status_count': {},
                'total_bugs': 0,
                'total_test_hours': 0,
                'squads_count': 0,
                'completion_rate': 0
            }
            
            squads = set()
            completed_count = 0
            
            for data in test_data:
                # Contar por status
                status = data.get('status', 'pendente')
                summary['status_count'][status] = summary['status_count'].get(status, 0) + 1
                
                # Somar bugs e horas
                summary['total_bugs'] += int(data.get('bugs_reportados', 0))
                summary['total_test_hours'] += float(data.get('tempo_teste_horas', 0))
                
                # Contar squads únicas
                squad = data.get('squad_name') or data.get('responsavel')
                if squad:
                    squads.add(squad)
                
                # Contar finalizados
                if status == 'finalizado':
                    completed_count += 1
            
            summary['squads_count'] = len(squads)
            summary['completion_rate'] = (completed_count / len(test_data) * 100) if test_data else 0
            
            return summary
        except Exception as e:
            print(f"Erro ao gerar resumo: {e}")
            return {}
    
    def log_audit_event(self, release_id, user_id, action, username, data):
        """Registra evento de auditoria"""
        audit_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        audit_item = {
            'audit_id': audit_id,
            'release_id': release_id,
            'user_id': user_id,
            'username': username,
            'action': action,  # create, update, delete
            'timestamp': current_time,
            'data_snapshot': data,
            'ip_address': '',  # Pode ser obtido do request
            'user_agent': ''   # Pode ser obtido do request
        }
        
        try:
            self.audit_table.put_item(Item=audit_item)
            return True
        except Exception as e:
            print(f"Erro ao registrar auditoria: {e}")
            return False
    
    def get_audit_log(self, release_id, user_id=None, limit=50):
        """Busca log de auditoria"""
        try:
            if user_id:
                # Buscar apenas para um usuário específico
                response = self.audit_table.query(
                    IndexName='ReleaseAuditIndex',
                    KeyConditionExpression='release_id = :release_id',
                    FilterExpression='user_id = :user_id',
                    ExpressionAttributeValues={
                        ':release_id': release_id,
                        ':user_id': user_id
                    },
                    ScanIndexForward=False,  # Ordem decrescente por timestamp
                    Limit=limit
                )
            else:
                # Buscar todos os eventos da release
                response = self.audit_table.query(
                    IndexName='ReleaseAuditIndex',
                    KeyConditionExpression='release_id = :release_id',
                    ExpressionAttributeValues={
                        ':release_id': release_id
                    },
                    ScanIndexForward=False,  # Ordem decrescente por timestamp
                    Limit=limit
                )
            
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao buscar log de auditoria: {e}")
            return []
    
    def get_recent_updates(self, release_id, minutes=5):
        """Busca atualizações recentes para detectar edições simultâneas"""
        try:
            cutoff_time = (datetime.now() - timedelta(minutes=minutes)).isoformat()
            
            response = self.table.query(
                IndexName='ReleaseIndex',
                KeyConditionExpression='release_id = :release_id',
                FilterExpression='last_modified_at > :cutoff_time',
                ExpressionAttributeValues={
                    ':release_id': release_id,
                    ':cutoff_time': cutoff_time
                }
            )
            
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao buscar atualizações recentes: {e}")
            return []
    
    def create_lock(self, test_data_id, user_id):
        """Cria um lock para edição exclusiva"""
        current_time = datetime.now().isoformat()
        
        lock_item = {
            'test_data_id': test_data_id,
            'locked_by': user_id,
            'locked_at': current_time,
            'expires_at': (datetime.now() + timedelta(minutes=5)).isoformat()
        }
        
        try:
            self.locks_table.put_item(Item=lock_item)
            return True
        except Exception as e:
            print(f"Erro ao criar lock: {e}")
            return False
    
    def get_lock_info(self, test_data_id):
        """Busca informações de lock"""
        try:
            response = self.locks_table.get_item(Key={'test_data_id': test_data_id})
            lock_info = response.get('Item')
            
            if lock_info:
                # Verificar se o lock ainda é válido
                expires_at = datetime.fromisoformat(lock_info.get('expires_at'))
                if datetime.now() > expires_at:
                    # Lock expirado, remover
                    self.locks_table.delete_item(Key={'test_data_id': test_data_id})
                    return None
            
            return lock_info
        except Exception as e:
            print(f"Erro ao buscar lock: {e}")
            return None
    
    def remove_lock(self, test_data_id, user_id):
        """Remove um lock"""
        try:
            # Verificar se o usuário é o dono do lock
            lock_info = self.get_lock_info(test_data_id)
            if lock_info and lock_info.get('locked_by') == user_id:
                self.locks_table.delete_item(Key={'test_data_id': test_data_id})
                return True
            return False
        except Exception as e:
            print(f"Erro ao remover lock: {e}")
            return False

