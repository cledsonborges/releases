# Release Management Backend

Sistema de gerenciamento de releases e squads desenvolvido com Flask.

## Estrutura do Projeto

```
release-management-backend/
├── src/
│   ├── models/
│   │   └── __init__.py          # Modelos SQLAlchemy (Release, Squad, Delivery)
│   ├── routes/
│   │   ├── release.py           # Rotas para releases
│   │   ├── squad.py             # Rotas para squads
│   │   └── delivery.py          # Rotas para entregas
│   ├── database/
│   │   └── app.db               # Banco de dados SQLite
│   └── main.py                  # Aplicação principal Flask
├── venv/                        # Ambiente virtual Python
├── populate_db.py               # Script para popular o banco com dados iniciais
└── requirements.txt             # Dependências Python
```

## Instalação e Execução

1. Ativar o ambiente virtual:
```bash
source venv/bin/activate
```

2. Instalar dependências:
```bash
pip install -r requirements.txt
```

3. Popular o banco de dados:
```bash
python populate_db.py
```

4. Executar a aplicação:
```bash
python src/main.py
```

A API estará disponível em `http://localhost:5000`

## Endpoints da API

### Releases
- `GET /api/releases` - Listar todas as releases
- `GET /api/releases/{id}` - Obter release específica
- `POST /api/releases` - Criar nova release
- `PUT /api/releases/{id}` - Atualizar release
- `DELETE /api/releases/{id}` - Excluir release
- `GET /api/releases/{id}/deliveries` - Listar entregas de uma release

### Squads
- `GET /api/squads` - Listar todos os squads
- `GET /api/squads/{id}` - Obter squad específico
- `POST /api/squads` - Criar novo squad
- `PUT /api/squads/{id}` - Atualizar squad
- `DELETE /api/squads/{id}` - Excluir squad

### Deliveries
- `GET /api/deliveries` - Listar todas as entregas
- `GET /api/deliveries/{id}` - Obter entrega específica
- `POST /api/deliveries` - Criar nova entrega
- `PUT /api/deliveries/{id}` - Atualizar entrega
- `DELETE /api/deliveries/{id}` - Excluir entrega

## Tecnologias Utilizadas

- Flask - Framework web Python
- SQLAlchemy - ORM para banco de dados
- SQLite - Banco de dados
- Flask-CORS - Suporte a CORS para integração com frontend

