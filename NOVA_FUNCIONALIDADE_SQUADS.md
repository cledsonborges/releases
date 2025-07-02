# Nova Funcionalidade: Gerenciamento de Squads Participantes

## Resumo das Alterações

Foi criada uma nova página Angular para gerenciar os status dos squads participantes nas releases, permitindo que os usuários visualizem e atualizem o status de cada squad de forma responsiva e intuitiva.

## Arquivos Criados/Modificados

### Frontend (Angular)
1. **Novo Componente**: `frontend/releases-frontend/src/app/components/squads-participantes/squads-participantes.ts`
   - Componente principal com interface responsiva
   - Tabela para visualização e edição de squads
   - Filtros por status e squad
   - Funcionalidade de edição inline
   - Toast de feedback para operações

2. **Rotas Atualizadas**: `frontend/releases-frontend/src/app/app.routes.ts`
   - Adicionada nova rota: `/squads-participantes`

### Backend (Python/Flask)
3. **API Atualizada**: `backend/releases-backend/src/routes/releases.py`
   - Ajustados os status válidos para: 'Não iniciado', 'Em andamento', 'Concluído', 'Concluído com bugs'

## Como Acessar

1. Navegue para: `https://seu-dominio.com/squads-participantes`
2. A página mostrará todas as releases com seus squads participantes
3. Clique em uma release para expandir e ver os squads
4. Use os filtros para encontrar squads específicos
5. Clique no ícone de edição (✏️) para editar um squad
6. Altere o responsável e/ou status
7. Clique em salvar (💾) para confirmar as alterações

## Funcionalidades

### Interface Principal
- **Lista de Releases**: Visualização em cards expansíveis
- **Informações da Release**: Nome, ambiente, versão, quantidade de squads
- **Filtros**: Por status e por squad específica

### Tabela de Squads
- **Colunas**: Squad | Responsável | Status | Ações
- **Status Disponíveis**:
  - Não iniciado
  - Em andamento
  - Concluído
  - Concluído com bugs

### Funcionalidades de Edição
- **Edição Inline**: Clique no ícone de edição para habilitar campos
- **Validação**: Campo responsável é obrigatório
- **Feedback Visual**: Toast de sucesso/erro após operações
- **Cancelamento**: Possibilidade de cancelar edições

### Design Responsivo
- **Desktop**: Layout completo com todas as funcionalidades
- **Mobile**: Interface adaptada para telas menores
- **Acessibilidade**: Botões com tooltips e feedback visual

## API Endpoints Utilizados

### Listar Releases
```
GET /api/releases
```

### Atualizar Status de Squad
```
PUT /api/releases/{release_id}/squads/{squad_nome}/status
```

**Body:**
```json
{
  "responsavel": "Nome do Responsável",
  "status": "Em andamento"
}
```

## Tecnologias Utilizadas

- **Frontend**: Angular 20, Angular Material, TypeScript
- **Backend**: Python, Flask, DynamoDB
- **Estilo**: CSS3 com design moderno e responsivo

## Próximos Passos

1. Testar a funcionalidade em ambiente de desenvolvimento
2. Validar com usuários finais
3. Fazer deploy em produção
4. Considerar adicionar notificações por email para mudanças de status
5. Implementar histórico de alterações

## Branch

As alterações foram commitadas na branch: `feature/squads-participantes-management`

Para fazer merge:
1. Criar Pull Request no GitHub
2. Revisar código
3. Fazer merge para a branch principal
4. Deploy em produção

