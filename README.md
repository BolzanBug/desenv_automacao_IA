# Sistema Integrado de Gestão de Afiliados — Pollen Parque Científico e Tecnológico

> **API RESTful Corporativa** para mapeamento, triagem, geração automatizada de minutas contratuais, acompanhamento nominal dos 5 signatários oficiais, gestão contábil/financeira (boletos, PIX e baixas), controle de espaços físicos e métricas executivas do ecossistema do **Pollen Parque**.

---

## 🏗️ 1. Arquitetura Tecnológica e Versões

A stack do backend foi auditada, corrigida e padronizada em JavaScript moderno (ES Modules puro), eliminando dependências legadas e gargalos de concorrência:

| Componente | Tecnologia | Versão Homologada | Função na Arquitetura |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | `>= 20.x` (Homologado em **v22.22.x**) | Execução assíncrona orientada a eventos |
| **Framework HTTP** | Express.js | `^4.21.2` | Roteamento RESTful, middlewares e uploads |
| **ORM** | Sequelize | `^6.37.5` | Mapeamento Objeto-Relacional com chaves UUID |
| **Banco de Dados** | PostgreSQL | **16-alpine** | Persistência relacional em 3ª Forma Normal (3FN) |
| **Engine UUID** | `uuid-ossp` | Nativo do PostgreSQL | Geração segura de identificadores UUIDv4 |
| **Containers** | Docker & Compose | Compose spec `3.8` | Orquestração de containers para dev e prod |
| **Suíte de Testes** | Node Test Runner | Nativo (`node:test`, `node:assert`) | Bateria de testes unitários e de integração |

---

## 📂 2. Estrutura de Arquivos na Raiz (`/back`)

Todos os arquivos de infraestrutura, configuração, dependências e código fonte estão centralizados estritamente dentro da raiz da pasta `back`:

```
back/
├── Dockerfile                   # Build conteinerizado otimizado da API Express
├── docker-compose.yml           # Orquestração do PostgreSQL 16 e da API Express
├── .dockerignore                # Regras de exclusão do build Docker
├── .env.example                 # Modelo canônico documentado das variáveis de ambiente
├── .env                         # Variáveis de ambiente ativas
├── package.json                 # Manifesto de dependências e scripts NPM
├── README.md                    # Documentação técnica integral da aplicação
├── schema.sql                   # Definição DDL relacional em 3FN e sementes iniciais
├── src/
│   ├── config/
│   │   └── database.js          # Conexão Sequelize exclusiva com PostgreSQL 16
│   ├── controllers/             # Controladores com padrão empresarial { message, data }
│   │   ├── empresaController.js
│   │   ├── assinaturaController.js
│   │   ├── financeiroController.js
│   │   ├── documentoController.js
│   │   ├── espacoController.js
│   │   ├── comunicacaoController.js
│   │   ├── dashboardController.js
│   │   └── publicController.js
│   ├── models/                  # Modelos Sequelize desacoplados (PascalCase + Model.js)
│   │   ├── EmpresaModel.js
│   │   ├── ContratoMinutaModel.js
│   │   ├── AssinaturaContratoModel.js
│   │   ├── FaturaFinanceiraModel.js
│   │   ├── DocumentoAnexoModel.js
│   │   ├── EspacoFisicoModel.js
│   │   ├── ComunicacaoHistoricoModel.js
│   │   └── AuditoriaLogModel.js
│   ├── routes/                  # Injeção modular montada em /api/v1, /api e /
│   │   ├── index.js
│   │   ├── empresaRoute.js
│   │   ├── assinaturaRoute.js
│   │   ├── financeiroRoute.js
│   │   ├── documentoRoute.js
│   │   ├── espacoRoute.js
│   │   ├── comunicacaoRoute.js
│   │   ├── dashboardRoute.js
│   │   └── publicRoute.js
│   ├── utils/
│   │   └── contractGenerator.js # Gerador oficial de termos sem preenchimento manual "X"
│   └── server.js                # Bootstrap Express, healthcheck e escuta HTTP
├── tests/                       # Bateria de testes automatizados QA
│   ├── apiContracts.test.js
│   ├── businessRules.test.js
│   ├── contractGenerator.test.js
│   ├── modelsValidation.test.js
│   ├── schemaValidation.test.js
│   └── serverHealth.test.js
└── uploads/                     # Armazenamento de arquivos e certidões
```

---

## 🐳 3. Passo a Passo EXATO: Como Rodar com Docker

O ecossistema Docker está 100% configurado na raiz do diretório `back`.

### Opção A: Subir Tudo via Docker (PostgreSQL 16 + API Express)
Ideal para homologação e execução completa conteinerizada sem depender de runtime local:

1. **Abra o terminal na pasta `back`**:
   ```bash
   cd /home/crs/orquestrador-ia-crs/back
   ```

2. **Garanta que o arquivo `.env` existe** (se não existir, copie do `.env.example`):
   ```bash
   cp -n .env.example .env
   ```

3. **Construa e inicie os containers em segundo plano**:
   ```bash
   docker compose up --build -d
   ```

4. **Verifique o status dos serviços**:
   ```bash
   docker compose ps
   ```
   *Ambos os containers (`pollen_postgres` com status `healthy` e `pollen_api` rodando) estarão operacionais.*

5. **Testar o Health Check da API**:
   ```bash
   curl http://localhost:3001/health
   ```
   *Resposta esperada:*
   ```json
   {
     "status": "ONLINE",
     "system": "Sistema Integrado de Gestão de Afiliados — Pollen Parque",
     "timestamp": "..."
   }
   ```

6. **Para acompanhar os logs em tempo real**:
   ```bash
   docker compose logs -f
   ```

7. **Para pausar ou derrubar os containers**:
   ```bash
   docker compose down
   ```
   *(Caso deseje apagar os volumes de dados persistentes do banco: `docker compose down -v`)*

---

### Opção B: Subir Apenas o Banco PostgreSQL no Docker e Rodar a API Localmente
Ideal para desenvolvimento ágil com auto-reload e debugging:

1. **Subir exclusivamente o container do PostgreSQL**:
   ```bash
   docker compose up -d postgres
   ```
   *O PostgreSQL inicializará na porta 5432 executando automaticamente o script `schema.sql` com tabelas, índices e seeds.*

2. **Executar a API localmente no terminal**:
   ```bash
   npm run dev
   ```

---

## 💻 4. Passo a Passo EXATO: Como Rodar Localmente (Bare Metal)

Se você preferir rodar a aplicação diretamente no sistema operacional:

### 1. Pré-requisitos
- **Node.js**: versão 20.x ou 22.x instalada (`node -v`).
- **NPM**: versão 10.x ou superior (`npm -v`).
- **PostgreSQL 16**: rodando localmente na porta 5432 (ou via container Docker `docker compose up -d postgres`).

### 2. Configurar Variáveis de Ambiente
Crie o arquivo `.env` a partir do `.env.example`:
```bash
cp .env.example .env
```

### 3. Instalar Dependências
Instale todos os pacotes definidos no `package.json`:
```bash
npm install
```

### 4. Inicializar o Banco de Dados PostgreSQL
Crie o banco de dados `pollen_afiliados` e execute o script `schema.sql`:
```bash
psql -U postgres -h localhost -d pollen_afiliados -f schema.sql
```
*(Ou utilize o comando rápido do Docker para subir o banco já inicializado: `docker compose up -d postgres`)*

### 5. Iniciar o Servidor

- **Modo Desenvolvimento (com auto-reload nativo):**
  ```bash
  npm run dev
  ```

- **Modo Produção:**
  ```bash
  npm start
  ```

A API estará acessível em: `http://localhost:3001`

---

## 🧪 5. Executar os Testes Automatizados

A suíte de testes de controle de qualidade (QA) foi construída sobre o test runner nativo do Node.js:

```bash
npm test
```

### Baterias de Teste Inclusas:
1. `tests/apiContracts.test.js`: Validação estrutural de todos os contratos, atores e Histórias de Usuário.
2. `tests/businessRules.test.js`: Validação das regras de transição (5 assinaturas, vigência de 12 meses, alerta de 60 dias, empresas internacionais).
3. `tests/contractGenerator.test.js`: Validação do gerador automático de termos de adesão e substituição de variáveis.
4. `tests/modelsValidation.test.js`: Validação da convenção de nomes, convenção snake_case, propriedades e relacionamentos declarados nos models.
5. `tests/schemaValidation.test.js`: Validação do script DDL `schema.sql` (UUIDv4, triggers de timestamp, 8 tabelas e integridade referencial).
6. `tests/serverHealth.test.js`: Validação de integridade do Dockerfile, docker-compose.yml, rotas nos 3 prefixos e inicialização do servidor.

---

## ⚙️ 6. Variáveis de Ambiente

As configurações são lidas do arquivo `.env` na raiz:

| Variável | Tipo | Obrigatória? | Padrão | Descrição |
| :--- | :--- | :---: | :--- | :--- |
| `PORT` | Inteiro | Não | `3001` | Porta TCP na qual o servidor Express escuta conexões HTTP. |
| `NODE_ENV` | String | Não | `development` | Ambiente de execução (`development`, `production`, `test`). |
| `DATABASE_URL` | String | **Sim** (ou `DB_*`) | `postgres://postgres:postgres@localhost:5432/pollen_afiliados` | URI de conexão oficial do PostgreSQL. |
| `DB_DIALECT` | String | Não | `postgres` | Dialeto do banco (PostgreSQL obrigatório). |
| `DB_HOST` | String | Não | `localhost` | Host do banco (usado caso `DATABASE_URL` não seja informada). |
| `DB_PORT` | Inteiro | Não | `5432` | Porta do PostgreSQL. |
| `DB_USER` | String | Não | `postgres` | Usuário do PostgreSQL. |
| `DB_PASSWORD` | String | Não | `postgres` | Senha do PostgreSQL. |
| `DB_NAME` | String | Não | `pollen_afiliados` | Nome da base de dados relacional. |
| `CORS_ORIGIN` | String | Não | `http://localhost:3000` | Origens permitidas para requisições cross-origin (Next.js frontend). |
| `UPLOAD_DIR` | String | Não | `./uploads` | Diretório em disco para guarda de certidões e editais enviados via multipart. |

---

## 🛣️ 7. Mapa de Endpoints da API RESTful

A API expõe rotas acessíveis com os prefixos `/api/v1`, `/api` e diretamente na raiz `/`:

### 🏢 Empresas e Afiliadas (`/companies`)
- `GET /api/v1/companies` — Lista empresas paginadas com filtros por `status`, `tipo` e busca textual (`search`).
- `POST /api/v1/companies` — Cadastra uma nova empresa e instancia automaticamente o checklist de 5 assinaturas.
- `GET /api/v1/companies/:id` — Visão 360° da empresa com carregamento de contratos, assinaturas, faturas, documentos e espaços.
- `PUT /api/v1/companies/:id` — Atualiza dados cadastrais da empresa.
- `PATCH /api/v1/companies/:id/status` — Altera formalmente o status da empresa com registro em log de auditoria.
- `DELETE /api/v1/companies/:id` — Remove o registro da empresa do ecossistema.
- `POST /api/v1/companies/:id/contract/generate` — Gera a minuta contratual oficial preenchida e altera status para `MINUTA_GERADA`.

### ✍️ Checklist de Assinaturas (`/companies/:id/signatures`)
- `GET /api/v1/companies/:id/signatures` — Retorna o status individual dos 5 signatários do convênio.
- `PUT /api/v1/companies/:id/signatures/:tipo` — Registra a assinatura de um signatário individual.
  - *Se os 5 signatários confirmarem, a empresa transiciona automaticamente para `AGUARDANDO_PAGAMENTO`.*

### 💰 Módulo Financeiro e Contábil (`/financial`)
- `GET /api/v1/financial/invoices` — Lista faturas com filtros opcionais por empresa e status (`PENDENTE`, `PAGO`, `ATRASADO`).
- `POST /api/v1/financial/invoices` — Emite nova fatura com chave PIX e payload Copia-e-Cola.
- `GET /api/v1/financial/companies/:id` — Extrato financeiro consolidado de uma empresa.
- `PATCH /api/v1/financial/invoices/:id/payment` — Registra a baixa contábil manual.
  - *Ao confirmar pagamento de empresa em `AGUARDANDO_PAGAMENTO`, o status muda para `ATIVO` com vigência de 12 meses.*

### 📄 Documentos e Certidões (`/companies/:id/documents`)
- `GET /api/v1/companies/:id/documents` — Lista as certidões e comprovantes enviados pela empresa.
- `POST /api/v1/companies/:id/documents` — Upload multipart/form-data de certidões e comprovantes.
- `PATCH /api/v1/documents/:docId/status` — Homologação do documento (`APROVADO` ou `REJEITADO` com justificativa).
- `DELETE /api/v1/documents/:docId` — Exclui um documento anexado.

### 🏢 Gestão de Espaços Físicos (`/spaces`)
- `GET /api/v1/spaces` — Consulta inventário de salas privativas, coworking e laboratórios com percentual de ocupação.
- `POST /api/v1/spaces` — Cadastra um novo espaço físico.
- `PUT /api/v1/spaces/:id` — Atualiza atributos do espaço ou vincula empresa locatária (`OCUPADO`).
- `DELETE /api/v1/spaces/:id` — Exclui o espaço físico.

### ✉️ Comunicação Institucional (`/communications`)
- `GET /api/v1/communications/emails` — Consulta histórico auditável de mensagens e e-mails disparados.
- `POST /api/v1/communications/emails` — Dispara comunicação individual ou em lote filtrada por status de empresas.

### 📊 Dashboard e Indicadores Executivos (`/dashboard`)
- `GET /api/v1/dashboard/metrics` — Retorna consolidação em tempo real:
  - Total de afiliados ativos, em processo e inadimplentes
  - Faturamento pendente e realizado
  - Alertas de vigências expirando nos próximos 60 dias
  - Taxa de ocupação de espaços físicos
  - Metas de expansão do parque

### 🌐 Autoatendimento Público (`/public`)
- `POST /api/v1/public/register` — Formulário de autoatendimento para pré-inscrição de novas candidatas ao edital (sem autenticação).

---

## 🔒 8. Regras de Negócio Implementadas

1. **Protocolo de 5 Assinaturas Obrigatórias:**
   - 1. Representante Legal da Empresa
   - 2. Diretoria de Inovação Pollen (Institucional 1)
   - 3. Coordenação de Parcerias (Institucional 2)
   - 4. Procuradoria Jurídica (Institucional 3)
   - 5. Reitoria em Exercício
   - O sistema bloqueia a etapa financeira até que todos os 5 signatários tenham homologado o termo.

2. **Ativação e Vigência Automática:**
   - A confirmação contábil do pagamento de anuidade de uma empresa em `AGUARDANDO_PAGAMENTO` transiciona seu estado imediatamente para `ATIVO` e calcula a vigência para exatamente 12 meses a partir da data atual.

3. **Empresas Internacionais:**
   - Dispensam CNPJ nacional, sendo validadas pelo `identificador_internacional` e país de origem, com cláusula específica gerada na minuta contratual.

4. **Empresas em Alteração Contratual:**
   - Contam com cláusula de tolerância de 60 (sessenta) dias adicionada na minuta contratual gerada.

---

## 👨‍💻 9. Responsabilidade Técnica e Manutenção

- **Engenharia e Arquitetura:** Equipe de Engenharia Pollen Parque
- **Licença:** ISC
- **Repositório:** `orquestrador-ia-crs/back`

