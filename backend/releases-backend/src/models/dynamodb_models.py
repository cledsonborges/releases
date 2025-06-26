import boto3
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
from src.config import get_dynamodb_resource, get_dynamodb_client

class DynamoDBModel:
    """Classe base para modelos DynamoDB"""
    
    def __init__(self):
        self.dynamodb = get_dynamodb_resource()
        self.client = get_dynamodb_client()

class ReleaseModel(DynamoDBModel):
    """Modelo para gerenciar Releases/Regressivos"""
    
    def __init__(self):
        super().__init__()
        self.table_name = 'Releases'
        self.table = self.dynamodb.Table(self.table_name)
    
    def create_table(self):
        """Cria a tabela Releases no DynamoDB"""
        try:
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': 'release_id',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'release_id',
                        'AttributeType': 'S'
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            return True
        except Exception as e:
            print(f"Erro ao criar tabela Releases: {e}")
            return False
    
    def create_release(self, release_data):
        """Cria uma nova release"""
        release_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        item = {
            'release_id': release_id,
            'release_name': release_data.get('release_name'),
            'ambiente': release_data.get('ambiente'),
            'status': release_data.get('status', 'em andamento'),
            'sla_start_time': current_time,
            'sla_duration_hours': Decimal(str(release_data.get('sla_duration_hours', 24))),
            'sla_active': True,
            'liberado_em': current_time,
            'versao_homolog': release_data.get('versao_homolog'),
            'versao_firebase': release_data.get('versao_firebase'),
            'versao_alpha': release_data.get('versao_alpha'),
            'link_plano_testes': release_data.get('link_plano_testes'),
            'qrcode_homolog': release_data.get('qrcode_homolog'),
            'qrcode_alpha': release_data.get('qrcode_alpha'),
            'release_exclusiva': release_data.get('release_exclusiva', False),
            'squads_participantes': release_data.get('squads_participantes', []),
            'entregas': release_data.get('entregas', []),
            'created_at': current_time,
            'updated_at': current_time
        }
        
        try:
            self.table.put_item(Item=item)
            return release_id
        except Exception as e:
            print(f"Erro ao criar release: {e}")
            return None
    
    def get_release(self, release_id):
        """Busca uma release por ID"""
        try:
            response = self.table.get_item(Key={'release_id': release_id})
            return response.get('Item')
        except Exception as e:
            print(f"Erro ao buscar release: {e}")
            return None
    
    def list_releases(self):
        """Lista todas as releases"""
        try:
            response = self.table.scan()
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao listar releases: {e}")
            return []
    
    def update_release(self, release_id, update_data):
        """Atualiza uma release"""
        try:
            # Verificar se SLA ainda está ativo
            release = self.get_release(release_id)
            if not release:
                return False
            
            if not release.get('sla_active', True):
                return False  # SLA vencido, não pode editar
            
            update_expression = "SET updated_at = :updated_at"
            expression_values = {':updated_at': datetime.now().isoformat()}
            
            for key, value in update_data.items():
                if key != 'release_id':
                    update_expression += f", {key} = :{key}"
                    expression_values[f":{key}"] = value
            
            self.table.update_item(
                Key={'release_id': release_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return True
        except Exception as e:
            print(f"Erro ao atualizar release: {e}")
            return False
    
    def delete_release(self, release_id):
        """Deleta uma release"""
        try:
            self.table.delete_item(Key={'release_id': release_id})
            return True
        except Exception as e:
            print(f"Erro ao deletar release: {e}")
            return False
    
    def check_sla_status(self, release_id):
        """Verifica e atualiza o status do SLA"""
        try:
            release = self.get_release(release_id)
            if not release:
                return None
            
            if not release.get('sla_active', True):
                return 'expired'
            
            sla_start = datetime.fromisoformat(release['sla_start_time'])
            sla_duration = float(release['sla_duration_hours'])
            sla_end = sla_start + timedelta(hours=sla_duration)
            
            if datetime.now() > sla_end:
                # SLA vencido, atualizar status
                self.table.update_item(
                    Key={'release_id': release_id},
                    UpdateExpression="SET sla_active = :sla_active, updated_at = :updated_at",
                    ExpressionAttributeValues={
                        ':sla_active': False,
                        ':updated_at': datetime.now().isoformat()
                    }
                )
                return 'expired'
            
            return 'active'
        except Exception as e:
            print(f"Erro ao verificar SLA: {e}")
            return None

class SquadModel(DynamoDBModel):
    """Modelo para gerenciar Squads"""
    
    def __init__(self):
        super().__init__()
        self.table_name = 'Squads'
        self.table = self.dynamodb.Table(self.table_name)
    
    def create_table(self):
        """Cria a tabela Squads no DynamoDB"""
        try:
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': 'squad_id',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'squad_id',
                        'AttributeType': 'S'
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            return True
        except Exception as e:
            print(f"Erro ao criar tabela Squads: {e}")
            return False
    
    def create_squad(self, squad_data):
        """Cria uma nova squad"""
        squad_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        item = {
            'squad_id': squad_id,
            'squad_name': squad_data.get('squad_name'),
            'modulos': squad_data.get('modulos', []),
            'responsavel': squad_data.get('responsavel'),
            'ativo': squad_data.get('ativo', True),
            'created_at': current_time,
            'updated_at': current_time
        }
        
        try:
            self.table.put_item(Item=item)
            return squad_id
        except Exception as e:
            print(f"Erro ao criar squad: {e}")
            return None
    
    def get_squad(self, squad_id):
        """Busca uma squad por ID"""
        try:
            response = self.table.get_item(Key={'squad_id': squad_id})
            return response.get('Item')
        except Exception as e:
            print(f"Erro ao buscar squad: {e}")
            return None
    
    def list_squads(self):
        """Lista todas as squads"""
        try:
            response = self.table.scan()
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao listar squads: {e}")
            return []
    
    def update_squad(self, squad_id, update_data):
        """Atualiza uma squad"""
        try:
            update_expression = "SET updated_at = :updated_at"
            expression_values = {':updated_at': datetime.now().isoformat()}
            
            for key, value in update_data.items():
                if key != 'squad_id':
                    update_expression += f", {key} = :{key}"
                    expression_values[f":{key}"] = value
            
            self.table.update_item(
                Key={'squad_id': squad_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return True
        except Exception as e:
            print(f"Erro ao atualizar squad: {e}")
            return False
    
    def delete_squad(self, squad_id):
        """Deleta uma squad"""
        try:
            self.table.delete_item(Key={'squad_id': squad_id})
            return True
        except Exception as e:
            print(f"Erro ao deletar squad: {e}")
            return False

class UserModel(DynamoDBModel):
    """Modelo para gerenciar Usuários"""
    
    def __init__(self):
        super().__init__()
        self.table_name = 'Users'
        self.table = self.dynamodb.Table(self.table_name)
    
    def create_table(self):
        """Cria a tabela Users no DynamoDB"""
        try:
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': 'user_id',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'user_id',
                        'AttributeType': 'S'
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            return True
        except Exception as e:
            print(f"Erro ao criar tabela Users: {e}")
            return False
    
    def create_user(self, user_data):
        """Cria um novo usuário"""
        user_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        item = {
            'user_id': user_id,
            'username': user_data.get('username'),
            'email': user_data.get('email'),
            'role': user_data.get('role', 'quality_team'),  # 'admin' ou 'quality_team'
            'ativo': user_data.get('ativo', True),
            'created_at': current_time,
            'updated_at': current_time
        }
        
        try:
            self.table.put_item(Item=item)
            return user_id
        except Exception as e:
            print(f"Erro ao criar usuário: {e}")
            return None
    
    def get_user(self, user_id):
        """Busca um usuário por ID"""
        try:
            response = self.table.get_item(Key={'user_id': user_id})
            return response.get('Item')
        except Exception as e:
            print(f"Erro ao buscar usuário: {e}")
            return None
    
    def get_user_by_username(self, username):
        """Busca um usuário por username"""
        try:
            response = self.table.scan(
                FilterExpression='username = :username',
                ExpressionAttributeValues={':username': username}
            )
            items = response.get('Items', [])
            return items[0] if items else None
        except Exception as e:
            print(f"Erro ao buscar usuário por username: {e}")
            return None
    
    def list_users(self):
        """Lista todos os usuários"""
        try:
            response = self.table.scan()
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao listar usuários: {e}")
            return []

