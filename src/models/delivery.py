from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

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

