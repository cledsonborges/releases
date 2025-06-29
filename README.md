# Sistema de Gestão de Releases

Sistema completo para gerenciamento de releases, controle de SLA e acompanhamento de squads desenvolvido por **Cledson Alves**.

## 🚀 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- Login simples com nome de usuário
- Controle de acesso (Admin/Time de Qualidade)
- Interface moderna com design corporativo Itaú

### 📊 Dashboard Principal
- Resumo do sistema com métricas em tempo real
- Navegação intuitiva para diferentes ambientes
- Status de conectividade da API
- Cards de acesso rápido para funcionalidades

### ⚙️ Painel Administrativo
- Criação de novas releases
- Gerenciamento de squads
- Inicialização do banco de dados
- Monitoramento do status do sistema

### 🎯 Gerenciamento de Releases
- CRUD completo de releases
- **Suporte a múltiplas squads por release**
- Controle de SLA (iniciar, parar, estender)
- Suporte a múltiplos ambientes (Homolog, Alpha, Produção)
- Geração automática de QR codes
- Release notes com IA (Gemini)
### 📈 Sistema de Relatórios
- Métricas de performance
- Acompanhamento de SLAs
- Relatórios por squad
- Dashboards visuais

## 🛠 Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **DynamoDB**: Banco de dados NoSQL (AWS)
- **Gemini AI**: Geração de release notes
- **QR Code**: Geração de códigos QR
- **CORS**: Suporte a requisições cross-origin
- **Suporte a múltiplas squads**: Modelagem de dados e rotas atualizadas para permitir múltiplas squads por release.

### Frontend
- **Angular 18**: Framework frontend moderno
- **TypeScript**: Linguagem tipada
- **SCSS**: Pré-processador CSS
- **Design Responsivo**: Compatível com mobile e desktop
- **Filtros Aprimorados**: Filtro de status ajustado (apenas 'Em Andamento' e 'Concluído'), novo filtro por Release e remoção dos botões de exportação.

### Integração
- **API REST**: Comunicação entre frontend e backend
- **AWS SDK**: Integração com serviços AWS
- **HTTP Client**: Requisições assíncronas

## 🎨 Design e UX

### Cores Corporativas Itaú
- **Primária**: #133134 (Verde escuro)
- **Secundária**: #A7CE2E (Verde claro)
- **Acentos**: Tons complementares para status e alertas

### Interface
- Design moderno e profissional
- Navegação intuitiva
- Feedback visual para ações do usuário
- Responsividade para diferentes dispositivos

## 📁 Estrutura do Projeto

```
releases-system/
├── backend/
│   └── releases-backend/
│       ├── src/
│       │   ├── main.py              # Aplicação principal
│       │   ├── config.py            # Configurações
│       │   ├── init_db.py           # Inicialização do BD
│       │   ├── models/
│       │   │   └── dynamodb_models.py
│       │   ├── routes/
│       │   │   ├── releases.py      # Rotas de releases
│       │   │   ├── squads.py        # Rotas de squads
│       │   │   └── reports.py       # Rotas de relatórios
│       │   └── services/
│       │       ├── gemini_service.py # Integração Gemini AI
│       │       └── qr_service.py     # Geração QR codes
│       ├── .env                     # Variáveis de ambiente
│       └── requirements.txt         # Dependências Python
└── frontend/
    └── releases-frontend/
        ├── src/
        │   ├── app/
        │   │   ├── components/
        │   │   │   ├── login/       # Componente de login
        │   │   │   ├── dashboard/   # Dashboard principal
        │   │   │   ├── admin-panel/ # Painel administrativo
        │   │   │   ├── release-detail/ # Detalhes da release
        │   │   │   └── reports/     # Relatórios
        │   │   ├── services/
        │   │   │   ├── api.service.ts    # Serviço da API
        │   │   │   └── auth.service.ts   # Serviço de autenticação
        │   │   ├── app.routes.ts    # Configuração de rotas
        │   │   └── app.config.ts    # Configuração do app
        │   └── styles.scss          # Estilos globais
        └── package.json             # Dependências Node.js
```

## 🚀 Como Executar

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- Credenciais AWS configuradas
- API Key do Gemini AI

### Backend
```bash
cd backend/releases-backend
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

### Frontend
```bash
cd frontend/releases-frontend
npm install
ng serve --host 0.0.0.0 --port 4200
```

### Acessos
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1

# Gemini AI
GEMINI_API_KEY=sua_gemini_api_key

# Flask
FLASK_ENV=development
FLASK_DEBUG=True
```

## 📋 Funcionalidades Detalhadas

### 1. Autenticação
- Login simples com validação
- Controle de perfis (Admin/Qualidade)
- Redirecionamento automático
- Logout seguro

### 2. Dashboard
- Resumo de releases ativas
- Métricas de SLA
- Status do sistema
- Navegação rápida

### 3. Gerenciamento de Releases
- Criação com formulário completo
- **Seleção de múltiplas squads por release**
- Edição de releases existentes
- Controle de status
- Gerenciamento de SLA
- Geração de QR codes
- Release notes automáticas
- **Filtros aprimorados por status (Em Andamento, Concluído) e por Release**
- **Remoção dos botões de exportação**

### 4. Controle de SLA
- Iniciar/parar cronômetro
- Extensão de prazo
- Alertas de vencimento
- Histórico de alterações

### 5. Relatórios
- Métricas por período
- Performance por squad
- Status de releases
- Exportação de dados

## 🔒 Segurança

- Validação de entrada em todas as rotas
- Sanitização de dados
- Controle de acesso por perfil
- Logs de auditoria
- Configuração segura de CORS

## 📱 Responsividade

- Design adaptável para mobile
- Touch-friendly na interface
- Navegação otimizada
- Performance em dispositivos móveis

## 🎯 Próximas Funcionalidades

- [ ] Notificações em tempo real
- [ ] Integração com Slack/Teams
- [ ] Histórico detalhado de alterações
- [ ] Backup automático
- [ ] Métricas avançadas
- [ ] Integração com CI/CD

## 👨‍💻 Desenvolvedor

**Cledson Alves**
- Sistema desenvolvido seguindo as melhores práticas
- Arquitetura escalável e maintível
- Código limpo e documentado
- Testes de integração realizados

## 📄 Licença

Sistema proprietário desenvolvido para uso interno.

---

**Status**: ✅ Completo e Funcional
**Versão**: 1.0.0
**Data**: Junho 2025

