from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Release(db.Model):
    __tablename__ = 'releases'
    
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(20), nullable=False)  # e.g., '2.58.0'
    release_number = db.Column(db.Integer, nullable=False)  # e.g., 113
    firebase_version = db.Column(db.String(20), nullable=True)  # e.g., '2.58.99'
    release_notes = db.Column(db.Text, nullable=True)
    platform = db.Column(db.String(20), nullable=False, default='Android')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'release_number': self.release_number,
            'firebase_version': self.firebase_version,
            'release_notes': self.release_notes,
            'platform': self.platform,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Squad(db.Model):
    __tablename__ = 'squads'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # e.g., '02 - SQUAD CORRETORA ACOMPANHAMENTO DE RV'
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Delivery(db.Model):
    __tablename__ = 'deliveries'
    
    id = db.Column(db.Integer, primary_key=True)
    release_id = db.Column(db.Integer, db.ForeignKey('releases.id'), nullable=False)
    squad_id = db.Column(db.Integer, db.ForeignKey('squads.id'), nullable=False)
    module = db.Column(db.String(200), nullable=False)  # e.g., 'ionCorretoraAcompanhamento-2.3.2'
    detail = db.Column(db.Text, nullable=True)  # e.g., 'Ajuste de crash ao clicar duas vezes na aba bolsa'
    responsible = db.Column(db.String(100), nullable=True)  # e.g., 'Edilson Cordeiro'
    status = db.Column(db.String(50), nullable=False, default='Em andamento')  # 'Finalizado', 'Em andamento'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    release = db.relationship('Release', backref='deliveries')
    squad = db.relationship('Squad', backref='deliveries')
    
    def to_dict(self):
        return {
            'id': self.id,
            'release_id': self.release_id,
            'squad_id': self.squad_id,
            'squad_name': self.squad.name if self.squad else None,
            'module': self.module,
            'detail': self.detail,
            'responsible': self.responsible,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

