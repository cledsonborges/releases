import boto3
from datetime import datetime
import uuid
from src.config import get_dynamodb_resource, get_dynamodb_client

class DynamoDBModel:
    """Classe base para modelos DynamoDB"""
    
    def __init__(self):
        self.dynamodb = get_dynamodb_resource()
        self.client = get_dynamodb_client()

class SimplifiedReleaseModel(DynamoDBModel):
    """Modelo simplificado para gerenciar Releases com apenas Squad, Responsável e Status"""
    
    def __init__(self):
        super().__init__()
        self.table_name = 'SimplifiedReleases'
        self.table = self.dynamodb.Table(self.table_name)
    
    def create_table(self):
        """Cria a tabela SimplifiedReleases no DynamoDB"""
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
            print(f"Erro ao criar tabela SimplifiedReleases: {e}")
            return False
    
    def create_release(self, release_data):
        """Cria uma nova release simplificada"""
        release_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        item = {
            'release_id': release_id,
            'release_name': release_data.get('release_name'),
            'squad': release_data.get('squad'),
            'responsavel': release_data.get('responsavel'),
            'status': release_data.get('status', 'em_andamento'),
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

class SquadStatusModel(DynamoDBModel):
    """Modelo para gerenciar status de squads por release"""
    
    def __init__(self):
        super().__init__()
        self.table_name = 'SquadStatus'
        self.table = self.dynamodb.Table(self.table_name)
    
    def create_table(self):
        """Cria a tabela SquadStatus no DynamoDB"""
        try:
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': 'squad_status_id',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'squad_status_id',
                        'AttributeType': 'S'
                    },
                    {
                        'AttributeName': 'release_id',
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
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            return True
        except Exception as e:
            print(f"Erro ao criar tabela SquadStatus: {e}")
            return False
    
    def create_squad_status(self, squad_status_data):
        """Cria um novo status de squad"""
        squad_status_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        item = {
            'squad_status_id': squad_status_id,
            'release_id': squad_status_data.get('release_id'),
            'squad': squad_status_data.get('squad'),
            'responsavel': squad_status_data.get('responsavel'),
            'status': squad_status_data.get('status', 'em_andamento'),
            'created_at': current_time,
            'updated_at': current_time
        }
        
        try:
            self.table.put_item(Item=item)
            return squad_status_id
        except Exception as e:
            print(f"Erro ao criar status de squad: {e}")
            return None
    
    def get_squad_status_by_release(self, release_id):
        """Busca todos os status de squads por release"""
        try:
            response = self.table.query(
                IndexName='release-index',
                KeyConditionExpression='release_id = :release_id',
                ExpressionAttributeValues={':release_id': release_id}
            )
            return response.get('Items', [])
        except Exception as e:
            print(f"Erro ao buscar status de squads: {e}")
            return []
    
    def update_squad_status(self, squad_status_id, update_data):
        """Atualiza o status de um squad"""
        try:
            update_expression = "SET updated_at = :updated_at"
            expression_values = {':updated_at': datetime.now().isoformat()}
            
            for key, value in update_data.items():
                if key not in ['squad_status_id', 'release_id']:
                    update_expression += f", {key} = :{key}"
                    expression_values[f":{key}"] = value
            
            self.table.update_item(
                Key={'squad_status_id': squad_status_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return True
        except Exception as e:
            print(f"Erro ao atualizar status de squad: {e}")
            return False
    
    def delete_squad_status(self, squad_status_id):
        """Deleta um status de squad"""
        try:
            self.table.delete_item(Key={'squad_status_id': squad_status_id})
            return True
        except Exception as e:
            print(f"Erro ao deletar status de squad: {e}")
            return False

