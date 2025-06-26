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
    
    # Relacionamento com deliveries
    deliveries = db.relationship('Delivery', backref='release', lazy=True, cascade='all, delete-orphan')
    
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

