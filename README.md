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
- Criação de novas releases com campos atualizados (remoção de `status` e `responsavel`, adição de `link_plano_testes`, `qrcode_alpha`, `qrcode_homolog`, `release_exclusiva`)
- Gerenciamento de squads
- Inicialização do banco de dados
- Monitoramento do status do sistema

### 🎯 Gerenciamento de Releases
- CRUD completo de releases
- Controle de SLA (iniciar, parar, estender)
- Suporte a múltiplos ambientes (Homolog, Alpha, Produção)
- Geração automática de QR codes
- Release notes com IA (Gemini)

### ✅ Gerenciamento Simplificado de Status
- **Persistência Garantida**: Todas as alterações de status são salvas imediatamente no DynamoDB.
- **Estrutura Simples**: Foco nos campos essenciais: Squad, Responsável e Status.
- **Escalabilidade**: Suporte a múltiplas squads por release.
- **Interface Intuitiva**: Edição inline com feedback visual.
- **Validação**: Controle de permissões e validação de dados.

### 📈 Sistema de Relatórios
- Métricas de performance
- Acompanhamento de SLAs
- Relatórios por squad
- Dashboards visuais
- **Novo Relatório de Squads**: Identifica squads que não testaram em releases ou que venceram o SLA de 24 horas (status 'Não iniciado' ou 'Em andamento').
- **Filtros Avançados**: Adicionados filtros por `Squad` e por `Release` para refinar a visualização dos relatórios.

## 🛠 Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **DynamoDB**: Banco de dados NoSQL (AWS)
- **Gemini AI**: Geração de release notes
- **QR Code**: Geração de códigos QR
- **CORS**: Suporte a requisições cross-origin

### Frontend
- **Angular 18**: Framework frontend moderno
- **TypeScript**: Linguagem tipada
- **SCSS**: Pré-processador CSS
- **Design Responsivo**: Compatível com mobile e desktop

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
│       │   │   ├── dynamodb_models.py
│       │   │   └── simplified_models.py # NOVOS modelos simplificados
│       │   ├── routes/
│       │   │   ├── releases.py      # Rotas de releases
│       │   │   ├── squads.py        # Rotas de squads
│       │   │   ├── reports.py       # Rotas de relatórios
│       │   │   ├── simplified_releases.py # NOVAS rotas simplificadas
│       │   │   └── database_management.py # NOVAS rotas de gerenciamento de BD
│       │   ├── services/
│       │   │   ├── gemini_service.py # Integração Gemini AI
│       │   │   └── qr_service.py     # Geração QR codes
│       │   └── utils/
│       │       └── database_management.py # NOVO utilitário de gerenciamento de BD
│       ├── .env                     # Variáveis de ambiente
│       └── requirements.txt         # Dependências Python
└── frontend/
    └── releases-frontend/
        ├── src/
        │   ├── app/
        │   │   ├── components/
        │   │   │   ├── login/       # Componente de login
│       │   │   │   ├── dashboard/   # Dashboard principal
│       │   │   │   ├── admin-panel/ # Painel administrativo
│       │   │   │   ├── release-detail/ # Detalhes da release (antigo)
│       │   │   │   ├── simplified-release-detail/ # NOVO Detalhes da release simplificada
│       │   │   │   ├── simplified-releases-list/ # NOVO Lista de releases simplificadas
│       │   │   │   └── reports/     # Relatórios
│       │   │   ├── services/
│       │   │   │   ├── api.service.ts    # Serviço da API (atualizado)
│       │   │   │   └── auth.service.ts   # Serviço de autenticação
│       │   │   ├── app.routes.ts    # Configuração de rotas
│       │   │   └── app.config.ts    # Configuração do app
│       │   └── styles.scss          # Estilos globais
│       └── package.json             # Dependências Node.js
```

## 🚀 Como Executar

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- Credenciais AWS configuradas
- API Key do Gemini AI

### Backend
```bash
# No diretório do seu projeto backend
cd backend/releases-backend

# Instalar dependências
source venv/bin/activate
pip install -r requirements.txt

# Executar a aplicação
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
- Criação com formulário completo e campos atualizados
- Edição de releases existentes
- Controle de status
- Gerenciamento de SLA
- Geração de QR codes
- Release notes automáticas

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
- **Relatório de Squads que Não Testaram/Venceram SLA**: Novo relatório detalhado com filtros por squad e release.

## 🚀 Como Usar a Nova Estrutura Simplificada

### 1. Deploy do Backend Atualizado

Faça o deploy do backend com as novas funcionalidades (já está na branch `simplified-status-solution`):

```bash
# No diretório do seu projeto backend
cd backend/releases-backend

# Fazer deploy para AWS/Vercel (conforme sua configuração atual)
# Exemplo para Vercel:
vercel --prod
```

### 2. Executar Reset Completo do Banco (RECOMENDADO)

Para garantir que tudo funcione corretamente com a nova estrutura, execute o reset completo do banco de dados. Isso irá migrar dados existentes, deletar tabelas antigas e criar as novas tabelas simplificadas:

```bash
POST https://sua-api.vercel.app/api/reset-database
```

### 3. Atualizar Frontend

No frontend, você precisará:

#### 3.1. Atualizar as Rotas do Angular

Adicione as novas rotas no `app.routes.ts` (localizado em `frontend/releases-frontend/src/app/app.routes.ts`):

```typescript
import { SimplifiedReleaseDetailComponent } from './components/simplified-release-detail/simplified-release-detail';
import { SimplifiedReleasesListComponent } from './components/simplified-releases-list/simplified-releases-list';

export const routes: Routes = [
  // ... suas rotas existentes
  
  // Novas rotas simplificadas
  { 
    path: 'simplified-releases', 
    component: SimplifiedReleasesListComponent 
  },
  { 
    path: 'simplified-release/:id', 
    component: SimplifiedReleaseDetailComponent 
  },
  
  // ... outras rotas
];
```

#### 3.2. Atualizar Navegação

Adicione links para as novas páginas no seu menu/navegação (ex: `frontend/releases-frontend/src/app/app.component.html` ou onde seu menu estiver):

```html
<a routerLink="/simplified-releases">Releases Simplificadas</a>
```

### 4. Testar a Nova Funcionalidade

#### 4.1. Acessar Lista de Releases
```
https://seu-frontend.com/simplified-releases
```

#### 4.2. Inicializar Banco (se necessário)
Na página, clique em "Inicializar BD" se as tabelas não existirem ou se você não executou o `reset-database` via API.

#### 4.3. Criar Release de Teste
1. Clique em "Nova Release"
2. Preencha os dados básicos
3. Teste a edição inline dos status (Squad, Responsável, Status)

#### 4.4. Verificar Persistência
1. Altere um status
2. Atualize a página (F5)
3. Verifique se a alteração foi mantida

## 🔧 Novos Endpoints Disponíveis

### Gerenciamento de Banco
- `GET /api/database-status` - Verifica status das tabelas e fornece recomendações
- `POST /api/reset-database` - **RECOMENDADO** - Executa o reset completo do banco (migra, deleta antigas, cria novas)
- `POST /api/drop-old-tables` - Deleta apenas tabelas antigas
- `POST /api/create-simplified-tables` - Cria apenas tabelas novas
- `POST /api/migrate-data` - Migra dados das tabelas antigas para as novas
- `GET /api/list-tables` - Lista todas as tabelas existentes no DynamoDB

### Releases Simplificadas
- `GET /api/simplified-releases` - Lista todas as releases simplificadas
- `POST /api/simplified-releases` - Cria uma nova release simplificada
- `GET /api/simplified-releases/{id}` - Busca uma release simplificada específica
- `PUT /api/simplified-releases/{id}` - Atualiza uma release simplificada

### Status de Squads
- `POST /api/simplified-releases/{id}/squad-status` - Cria um novo status de squad para uma release
- `PUT /api/squad-status/{id}` - Atualiza o status de um squad
- `GET /api/simplified-releases/{id}/squad-status` - Lista todos os status de squads de uma release

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
**Data**: Julho 2025


