# Documentação do Esquema do Banco de Dados

Esta documentação descreve o esquema inferido para as entidades `Releases` e `Squads` com base nas respostas das APIs fornecidas. O objetivo é apresentar uma visão clara da estrutura dos dados para aprovação do DBA.

## 1. Entidade: `Releases`

Representa uma versão de software ou conjunto de funcionalidades que está sendo liberado. Cada release pode ter várias squads participantes e informações de SLA.

### Campos:

| Nome do Campo        | Tipo de Dados | Descrição                                            | Observações                                     |
| :------------------- | :------------ | :--------------------------------------------------- | :---------------------------------------------- |
| `release_id`         | String (UUID) | Identificador único da release.                      | Chave primária.                                 |
| `release_name`       | String        | Nome da release (ex: `[iOS]-R115`, `[Android]-R112`). |                                                 |
| `ambiente`           | String        | Ambiente da release (ex: `homolog`).                 |                                                 |
| `created_at`         | String        | Timestamp de criação do registro da release.         | Formato ISO 8601 (ex: `YYYY-MM-DDTHH:MM:SS.ffffff`). |
| `updated_at`         | String        | Timestamp da última atualização do registro.         | Formato ISO 8601.                               |
| `descricao`          | String        | Descrição detalhada da release.                      | Pode ser vazio.                                 |
| `entregas`           | Array         | Lista de entregas associadas à release.              | Atualmente vazio nos exemplos.                  |
| `liberado_em`        | String        | Data e hora em que a release foi liberada.           | Formato ISO 8601.                               |
| `link_plano_testes`  | String        | Link para o plano de testes da release.              | Pode ser nulo.                                  |
| `qrcode_alpha`       | String        | QR Code para o ambiente Alpha.                       | Pode ser nulo.                                  |
| `qrcode_homolog`     | String        | QR Code para o ambiente de Homologação.              | Pode ser nulo.                                  |
| `release_exclusiva`  | Booleano      | Indica se a release é exclusiva.                     | `true` ou `false`.                              |
| `responsavel`        | String        | Nome do responsável pela release.                    |                                                 |
| `sla_active`         | Booleano      | Indica se o SLA está ativo para esta release.        | `true` ou `false`.                              |
| `sla_duration_hours` | String        | Duração do SLA em horas.                             | Convertido para inteiro para cálculos.          |
| `sla_start_time`     | String        | Timestamp de início do SLA.                          | Formato ISO 8601.                               |
| `squad`              | String        | Nome da squad principal associada à release.         |                                                 |
| `squads_participantes` | Array de Objetos | Lista de squads que participam da release.           | Ver sub-entidade `Squads Participantes` abaixo. |
| `status`             | String        | Status atual da release (ex: `em andamento`, `concluído`). |                                                 |
| `versao_alpha`       | String        | Versão Alpha da release.                             | Pode ser nulo.                                  |
| `versao_firebase`    | String        | Versão Firebase da release.                          |                                                 |
| `versao_homolog`     | String        | Versão de Homologação da release.                    |                                                 |

### Sub-entidade: `Squads Participantes` (dentro de `Releases`)

Representa as squads que estão envolvidas em uma release específica.

| Nome do Campo | Tipo de Dados | Descrição                                    |
| :------------ | :------------ | :------------------------------------------- |
| `nome`        | String        | Nome da squad participante.                  |
| `responsavel` | String        | Nome do responsável pela squad na release.   |
| `squad_id`    | String (UUID) | Identificador único da squad participante.   |
| `status`      | String        | Status da participação da squad na release (ex: `Concluído`, `Em andamento`, `Não iniciado`, `Concluído com bugs`). |

## 2. Entidade: `Squads`

Representa as equipes (squads) de desenvolvimento ou teste.

### Campos:

| Nome do Campo | Tipo de Dados | Descrição                               |
| :------------ | :------------ | :-------------------------------------- |
| `squad_id`    | String (UUID) | Identificador único da squad.           | Chave primária.                         |
| `nome`        | String        | Nome da squad.                          |
| `responsavel` | String        | Nome do responsável pela squad.         |
| `created_at`  | String        | Timestamp de criação do registro da squad. | Formato ISO 8601.                       |
| `updated_at`  | String        | Timestamp da última atualização do registro. | Formato ISO 8601.                       |

## 3. Relacionamentos Inferidos

- **`Releases` para `Squads Participantes`**: Um relacionamento um-para-muitos, onde uma `Release` pode ter múltiplas `Squads Participantes` aninhadas. O `squad_id` dentro de `Squads Participantes` pode ser considerado uma chave estrangeira referenciando o `squad_id` da entidade `Squads`.

## 4. Considerações para o DBA

- **Tipos de Dados**: Os tipos de dados são inferidos do JSON. Para um banco de dados relacional, `String (UUID)` pode ser mapeado para `VARCHAR(36)` ou tipo `UUID` nativo, `String` para `VARCHAR` com comprimento adequado, `Booleano` para `BOOLEAN` ou `TINYINT(1)`, e `Array` para `JSONB` (se o banco de dados suportar JSON) ou tabelas separadas para normalização.
- **Normalização**: A estrutura atual de `squads_participantes` aninhada em `Releases` sugere uma desnormalização. Para um banco de dados relacional, seria ideal criar uma tabela `ReleaseSquads` com chaves estrangeiras para `Releases` e `Squads`, e campos adicionais como `status` e `responsavel` específicos daquela participação.
- **Índices**: Sugere-se a criação de índices em `release_id`, `squad_id`, `release_name`, `created_at`, `updated_at` e `sla_start_time` para otimização de consultas.
- **Validação de Dados**: Implementar validações para garantir a integridade dos dados, como formatos de data/hora, valores booleanos e a unicidade de IDs.
- **SLA**: O cálculo do SLA é feito no frontend. Se houver necessidade de persistir o status do SLA no banco de dados, um campo `sla_status` (ou similar) pode ser adicionado à tabela de `Releases` ou `ReleaseSquads`.

Esta documentação serve como ponto de partida para a discussão e aprovação do esquema do banco de dados. Estou à disposição para quaisquer esclarecimentos ou ajustes necessários.

