# Release Management Frontend

Interface web para o sistema de gerenciamento de releases e squads desenvolvida com Angular.

## Estrutura do Projeto

```
release-management-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/         # Componente principal do dashboard
│   │   │   ├── release-info/      # Componente de informações da release
│   │   │   └── delivery-table/    # Componente da tabela de entregas
│   │   ├── services/
│   │   │   └── api.service.ts     # Serviço para comunicação com a API
│   │   ├── app.ts                 # Componente raiz da aplicação
│   │   ├── app.config.ts          # Configuração da aplicação
│   │   └── app.routes.ts          # Configuração de rotas
│   ├── styles.scss                # Estilos globais
│   └── index.html                 # Página HTML principal
├── angular.json                   # Configuração do Angular CLI
├── package.json                   # Dependências Node.js
└── tsconfig.json                  # Configuração TypeScript
```

## Instalação e Execução

1. Instalar dependências:
```bash
npm install
```

2. Executar em modo de desenvolvimento:
```bash
ng serve
```

A aplicação estará disponível em `http://localhost:4200`

## Funcionalidades

- **Dashboard Principal**: Visualização geral das releases e entregas
- **Informações da Release**: Exibição de detalhes da release atual, incluindo:
  - Tempo restante para término
  - Release notes
  - Versão e número da release
  - Versão Firebase
- **Tabela de Entregas**: Lista de todas as entregas por squad, incluindo:
  - Nome do squad
  - Módulo da entrega
  - Detalhes da entrega
  - Responsável
  - Status (Finalizado/Em andamento)
  - Ações (Editar)
- **Interface Responsiva**: Adaptável para desktop e mobile
- **Integração com API**: Comunicação em tempo real com o backend Flask

## Componentes

### DashboardComponent
Componente principal que orquestra a exibição de todos os outros componentes.

### ReleaseInfoComponent
Exibe informações detalhadas sobre a release atual, incluindo countdown timer e release notes.

### DeliveryTableComponent
Tabela interativa que lista todas as entregas de uma release específica com funcionalidades de edição.

## Tecnologias Utilizadas

- Angular 18+ - Framework frontend
- Angular Material - Biblioteca de componentes UI
- TypeScript - Linguagem de programação
- SCSS - Pré-processador CSS
- RxJS - Programação reativa para requisições HTTP

## Integração com Backend

O frontend se comunica com o backend Flask através do serviço `ApiService`, que fornece métodos para:
- Gerenciar releases (CRUD)
- Gerenciar squads (CRUD)
- Gerenciar entregas (CRUD)
- Obter entregas por release

## Estilização

A aplicação utiliza uma paleta de cores consistente com o design do íon Itaú:
- Verde escuro (#2c5f5f) para cabeçalhos e elementos principais
- Azul (#1976d2) para links e elementos secundários
- Status coloridos para identificação visual rápida

