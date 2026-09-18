# Manual de Rotas da API — Pollen Parque Gestão de Afiliados

**Versão da API:** v1  
**Base URL:** `http://localhost:3001/api/v1` (ou `/api`)  
**Padrão de Resposta:** Todas as respostas de sucesso seguem a estrutura `{ message: string, data: any }`.

---

## 1. Módulo de Empresas e Afiliadas (`/companies`)

### 1.1. `GET /api/v1/companies`
- **Descrição:** Lista as empresas cadastradas no sistema com suporte a paginação e filtros.
- **Query Params:**
  - `status` (opcional): `EM_ANALISE`, `MINUTA_GERADA`, `EM_ASSINATURA`, `AGUARDANDO_PAGAMENTO`, `ATIVO`, `INADIMPLENTE`, `VENCIDO`, `SUSPENSO`, `DESLIGADO`
  - `tipo` (opcional): `STARTUP`, `PME`, `GRANDE_PORTE`, `INTERNACIONAL`
  - `search` (opcional): busca por razão social, nome fantasia, CNPJ ou representante legal.
  - `page` (default 1): página de resultados.
  - `limit` (default 20): quantidade por página.
- **Regra de Negócio:** Permite a visualização em grade ou tabela filtrada de todas as empresas do ecossistema.

### 1.2. `POST /api/v1/companies`
- **Descrição:** Cadastro manual de uma nova empresa pela equipe do programa.
- **Payload:**
  ```json
  {
    "razao_social": "Inovatech Sistemas Ltda",
    "nome_fantasia": "Inovatech",
    "cnpj": "12.345.678/0001-99",
    "tipo": "STARTUP",
    "email_contato": "contato@inovatech.com",
    "telefone": "(49) 99999-8888",
    "representante_nome": "Juliana Silveira",
    "representante_cpf": "111.222.333-44"
  }
  ```
- **Regra de Negócio:** Gera automaticamente o registro na tabela `empresas` com status `EM_ANALISE` e instancia os 5 registros de checklist em `assinaturas_contrato`.

### 1.3. `GET /api/v1/companies/:id`
- **Descrição:** Visão 360° da empresa com carregamento automático dos relacionamentos (contratos, assinaturas, faturas, documentos e espaços físicos).

### 1.4. `PUT /api/v1/companies/:id`
- **Descrição:** Atualização dos dados cadastrais da empresa.

### 1.5. `PATCH /api/v1/companies/:id/status`
- **Descrição:** Transição formal de status da empresa (ex: de `SUSPENSO` para `ATIVO` ou para `DESLIGADO`), registrando log de auditoria.

### 1.6. `POST /api/v1/companies/:id/contract/generate`
- **Aliases:** `POST /api/v1/empresas/:id/contract/generate`
- **Descrição:** Gera a minuta oficial preenchida do contrato.
  - **Empresas Não-Residentes (`residente: false`):** Preenche o modelo oficial DOCX (`src/templates/modelo_minuta_afiliados.docx`) com todas as variáveis da empresa, do representante legal, da anuidade e datas, convertendo para PDF via LibreOffice (com fallback seguro para DOCX se o motor estiver indisponível). O arquivo é registrado automaticamente na tabela `documentos_anexos` com status `APROVADO`.
  - **Empresas Residentes (`residente: true`):** Mantém a geração do contrato estruturado em Markdown.
- **Retorno:**
  ```json
  {
    "message": "Minuta contratual gerada com sucesso a partir dos dados da empresa",
    "data": {
      "id": "e0e2d5a3-...",
      "empresaId": "...",
      "numeroTermo": "TERMO-EXTERNO/2026/...",
      "titulo": "Contrato de Afiliação Não Residente — EMPRESA LTDA",
      "conteudoGerado": "[PDF GERADO] /uploads/contratos/contrato_uuid.pdf",
      "valorAnuidade": "3600.00",
      "status": "GERADO"
    }
  }
  ```

### 1.7. `POST /api/v1/companies/nao-residente`
- **Aliases:** `POST /api/v1/empresas/nao-residente`, `POST /api/v1/public/nao-residente`
- **Descrição:** Cadastro público de autoatendimento para empresas não-residentes (substituição do formulário PDF `dasd.pdf`), dispensando autenticação.
- **Payload (16 campos, aceita camelCase ou snake_case):**
  ```json
  {
    "razaoSocial": "Empresa Inovadora Ltda",
    "nomeFantasia": "InovaTech",
    "cnpj": "12.345.678/0001-90",
    "emailContato": "contato@empresa.com",
    "emailCobranca": "financeiro@empresa.com",
    "telefone": "(49) 99999-0000",
    "site": "https://empresa.com",
    "anoFundacao": 2022,
    "areaAtuacao": "Biotecnologia",
    "enderecoCompleto": "Rua das Flores, 123, Sala 4",
    "cidade": "Chapecó",
    "estado": "SC",
    "cep": "89800-000",
    "representanteNome": "Maria Santos",
    "representanteCpf": "123.456.789-00",
    "representanteCargo": "Sócia-Diretora",
    "representanteEndereco": "Rua Central, 456, Chapecó-SC",
    "representanteEmail": "maria@empresa.com",
    "representanteTelefone": "(49) 98888-0000"
  }
  ```
- **Regra de Negócio:** Grava com `residente: false`, `tipo: EXTERNA`, `status: EM_ANALISE` e instancia automaticamente o checklist dos 5 signatários oficiais em `assinaturas_contrato`.

---

## 2. Módulo de Assinaturas (`/companies/:id/signatures`)

### 2.1. `GET /api/v1/companies/:id/signatures`
- **Descrição:** Retorna o status de cada um dos 5 signatários oficiais do convênio:
  1. `REPRESENTANTE_LEGAL`
  2. `INSTITUCIONAL_1` (Diretoria Pollen)
  3. `INSTITUCIONAL_2` (Coordenação de Parcerias)
  4. `INSTITUCIONAL_3` (Procuradoria Jurídica)
  5. `REITOR` (Reitor em Exercício)

### 2.2. `PUT /api/v1/companies/:id/signatures/:tipo`
- **Descrição:** Registra a assinatura de um signatário individual.
- **Regra de Negócio:** Se todos os 5 signatários completarem a assinatura, o sistema atualiza automaticamente o status da empresa para `AGUARDANDO_PAGAMENTO`.

---

## 3. Módulo Financeiro e Contábil (`/financial`)

### 3.1. `GET /api/v1/financial/invoices`
- **Descrição:** Lista as faturas contábeis com filtro opcional por `empresa_id` ou `status` (`PENDENTE`, `PAGO`, `ATRASADO`). Substitui a planilha com marcação laranja.

### 3.2. `POST /api/v1/financial/invoices`
- **Descrição:** Emissão/lançamento de nova fatura com suporte a boleto e PIX Copia-e-Cola.

### 3.3. `PATCH /api/v1/financial/invoices/:id/payment`
- **Descrição:** Realiza a baixa contábil manual informando valor pago, data de pagamento e operador responsável.
- **Regra de Negócio:** Se a empresa estava em `AGUARDANDO_PAGAMENTO`, a confirmação de baixa atualiza a empresa para `ATIVO` e calcula vigência de 12 meses.

---

## 4. Módulo de Documentos e Certidões (`/companies/:id/documents`)

### 4.1. `GET /api/v1/companies/:id/documents`
- **Descrição:** Lista certidões e arquivos do edital submetidos pela empresa.

### 4.2. `POST /api/v1/companies/:id/documents`
- **Descrição:** Upload de arquivo (multipart/form-data) vinculado à empresa.

### 4.3. `PATCH /api/v1/documents/:docId/status`
- **Descrição:** Homologação (`APROVADO` ou `REJEITADO` com justificativa) do documento da empresa.

---

## 5. Módulo de Espaços Físicos (`/spaces`)

### 5.1. `GET /api/v1/spaces`
- **Descrição:** Retorna o inventário de salas privativas, estações de coworking e laboratórios com percentual de ocupação.

### 5.2. `POST /api/v1/spaces` e `PUT /api/v1/spaces/:id`
- **Descrição:** Criação e alocação de espaços físicos para as empresas afiliadas.

---

## 6. Módulo de Comunicações (`/communications`)

### 6.1. `POST /api/v1/communications/emails`
- **Descrição:** Disparo de mensagens individuais ou em lote (filtrando por status da empresa), armazenando histórico auditável.

---

## 7. Módulo de Dashboard (`/dashboard/metrics`)

### 7.1. `GET /api/v1/dashboard/metrics`
- **Descrição:** Retorna os indicadores de saúde da carteira de afiliados: total de ativos, empresas em processo, faturamento em aberto, alertas de vencimento em 60/30 dias e taxa de ocupação dos espaços físicos.

---

## 8. Módulo Público de Autoatendimento (`/public/register`)

### 8.1. `POST /api/v1/public/register`
- **Descrição:** Endpoint aberto (sem necessidade de login prévio) para que empresas candidatas submetam a proposta cadastral diretamente na base de dados do Pollen Parque.

