import json
import sys
import os

# Adicionar o diretório pai ao path para importar os modelos
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models import Squad, db, Release, Delivery
from flask import Flask

def populate_database():
    """Popula o banco de dados com dados iniciais"""
    
    # Configurar Flask app
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        # Criar tabelas
        db.create_all()
        
        # Ler dados dos squads do JSON
        squads_data = {
            "squads": [
                {"id": 1, "squad": "01 - SQUAD FORMALIZAÇÃO REMOTA", "modules": ["ionFormalizacao", "ionWebViewSdk", "FormalizaçãoRemota", "ionCriptoativos"]},
                {"id": 2, "squad": "02 - SQUAD CORRETORA ACOMPANHAMENTO DE RV", "modules": ["ionCorretoraAcompanhamento", "ionCorretoraCommons", "ionAcompanhamentoPosicaoRendaVariavel", "CorretoraAcompanhamento", "CorretoraCommons", "CorretoraVitrine"]},
                {"id": 3, "squad": "03 - TRANSACIONAL DE RENDA VARIÁVEL", "modules": ["ionCorretoraTransacional", "CorretoraTransacional"]},
                {"id": 4, "squad": "04 - SQUAD FOUNDATION", "modules": ["ionApp"]},
                {"id": 5, "squad": "05 - SQUAD CONTEÚDO E HUMANIZAÇÃO", "modules": ["ionNotificationCentral", "ionCommunications", "ionCentralCampaign", "Conteúdo", "CentraldeNotificacoes"]},
                {"id": 6, "squad": "06 - SQUAD CONTRAT E RESGATE DE FUNDOS CANAIS PF", "modules": ["ionContratacaoResgate"]},
                {"id": 7, "squad": "07 - ACOMPAN. CANAIS INVESTIMENTOS PF", "modules": ["ionAcompanhamento", "ionHome", "FeatureAcompanhamento"]},
                {"id": 8, "squad": "08 - SQUAD VITRINE RF FUNDOS E PREV", "modules": ["ionVitrine", "ionInvestimentosUi"]},
                {"id": 9, "squad": "09 - SQUAD VITRINE RV COE", "modules": ["ionVitrine", "ionInvestimentosUi", "FeatureVitrineComparação"]},
                {"id": 10, "squad": "10 - SQUAD AGREGADOR", "modules": ["ionAgregador"]},
                {"id": 11, "squad": "11 - SQUAD CONTRAT E RESGATE DE TESOURO DIRETO", "modules": ["ionContratacaoResgate", "Contratação"]},
                {"id": 12, "squad": "12 - SQUAD CONEXÃO MERCADO", "modules": ["ionContextualizacao"]},
                {"id": 13, "squad": "13 - SQUAD ASSESSORIA EVERYWHERE (antes Edith)", "modules": ["ionContratacaoAssessoria", "ionRecomendacao", "ionProjection"]},
                {"id": 14, "squad": "14 - SQUAD CONEXÃO CARTEIRA (antes FRIDAY)", "modules": ["ionContratacaoAssessoria", "ionWebViewRender", "ionRecomendacao", "ionProjection"]},
                {"id": 15, "squad": "15 - SQUAD ONBOARDING", "modules": ["ionOnboarding"]},
                {"id": 16, "squad": "16 - SQUAD ALOCAÇÃO E REALOCAÇÃO DE INVEST. (antes VISION)", "modules": ["ionPrefetchVersion", "ionOtimizador"]},
                {"id": 17, "squad": "17 - SQUAD AUTH ION", "modules": ["ionAuthenticator", "ÍonAuthenticator"]},
                {"id": 18, "squad": "18 - CONTRATACAO E RESGATE RENDA FIXA", "modules": ["ionContratacaoResgate", "Contratação"]},
                {"id": 19, "squad": "19 - CONQUISTA ION", "modules": ["ionPixVersion", "ionOpeningAccount"]},
                {"id": 20, "squad": "20 - CONTRATAÇÃO E RESGATE DE TESOURARIA", "modules": ["ionContratacaoResgate", "ionCriptoativos"]},
                {"id": 21, "squad": "21 - SQUAD PLATAFORMA DIGITAL AINVEST", "modules": ["ionGrowthHacking", "ionLandingPage"]},
                {"id": 22, "squad": "22 - SQUAD CONCIERGE DIGITAL (antes STARK)", "modules": ["ionContratacaoAssessoria"]},
                {"id": 23, "squad": "23 - CRYPTO", "modules": ["ionCriptoativos"]},
                {"id": 24, "squad": "24 - SQUAD PERFIL DO CLIENTE", "modules": ["ionGrowthHacking"]},
                {"id": 25, "squad": "25 - TIME ACESSIBILIDADE", "modules": ["ionCriptoativos"]},
                {"id": 26, "squad": "26 - ACOMPAN CANAIS FRONT RENTABILIDADE", "modules": ["ionproftabilit"]},
                {"id": 27, "squad": "27 - TRANS CONTA ÍON", "modules": [""]},
                {"id": 28, "squad": "28 - ESCRITUARAÇÃO ÍON", "modules": ["ionCriptoativos"]}
            ]
        }
        
        # Inserir squads
        for squad_data in squads_data['squads']:
            existing_squad = Squad.query.filter_by(name=squad_data['squad']).first()
            if not existing_squad:
                squad = Squad(
                    name=squad_data['squad'],
                    description=f"Módulos: {', '.join(squad_data['modules'])}"
                )
                db.session.add(squad)
        
        db.session.commit()
        
        # Criar uma release de exemplo
        existing_release = Release.query.filter_by(version='2.58.0').first()
        if not existing_release:
            release = Release(
                version='2.58.0',
                release_number=113,
                firebase_version='2.58.99',
                release_notes='Release Notes | Android\nJá atualizou o seu íon Itaú? Nessa versão, fizemos ajustes e melhorias para deixar sua experiência utilizando o app ainda melhor. Atualize já e venha conferir.',
                platform='Android'
            )
            db.session.add(release)
            db.session.commit()
            
            # Criar algumas entregas de exemplo
            sample_deliveries = [
                {
                    'squad_name': '02 - SQUAD CORRETORA ACOMPANHAMENTO DE RV',
                    'module': 'ionCorretoraAcompanhamento-2.3.2',
                    'detail': 'Ajuste de crash ao clicar duas vezes na aba bolsa',
                    'responsible': 'Edilson Cordeiro',
                    'status': 'Finalizado'
                },
                {
                    'squad_name': '07 - ACOMPAN. CANAIS INVESTIMENTOS PF',
                    'module': 'ionAcompanhamento-v3.3.2',
                    'detail': 'Nada a acrescentar.',
                    'responsible': '',
                    'status': 'Em andamento'
                },
                {
                    'squad_name': '08 - SQUAD VITRINE RF FUNDOS E PREV',
                    'module': 'ionVitrine-1.15.4',
                    'detail': 'nada a destacar',
                    'responsible': 'Mariah Schevenin',
                    'status': 'Finalizado'
                },
                {
                    'squad_name': '09 - SQUAD VITRINE RV COE',
                    'module': 'ionVitrine-1.15.4',
                    'detail': 'nada a destacar',
                    'responsible': 'Mariah Schevenin',
                    'status': 'Finalizado'
                },
                {
                    'squad_name': '15 - SQUAD ONBOARDING',
                    'module': 'ionApp-v2.29.0-alfa',
                    'detail': 'Inclusão do datalog para análise dos dados',
                    'responsible': '',
                    'status': 'Finalizado'
                },
                {
                    'squad_name': '22 - SQUAD CONCIERGE DIGITAL (antes STARK)',
                    'module': 'ionContratacaoAssessoria-v2.9.1-release',
                    'detail': 'Sobe versao da tela de etapas com novo rel e charon id.',
                    'responsible': 'Thiago Sakurai',
                    'status': 'Finalizado'
                }
            ]
            
            for delivery_data in sample_deliveries:
                squad = Squad.query.filter_by(name=delivery_data['squad_name']).first()
                if squad:
                    delivery = Delivery(
                        release_id=release.id,
                        squad_id=squad.id,
                        module=delivery_data['module'],
                        detail=delivery_data['detail'],
                        responsible=delivery_data['responsible'],
                        status=delivery_data['status']
                    )
                    db.session.add(delivery)
        
        db.session.commit()
        print("Banco de dados populado com sucesso!")

if __name__ == '__main__':
    populate_database()

