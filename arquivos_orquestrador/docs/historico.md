# Memória Técnica e Changelog do Projeto — Pollen Parque Gestão de Afiliados

**Versão da Entrega:** 1.0.0-GA  
**Data:** 16 de Setembro de 2026  
**Responsável:** Tech Lead & Arquiteto de Software  
**Esteira SDLC:** Orquestrador Autônomo de Software com IA (CRS + LTS)  
**Documento Fonte:** `transcricao.pdf` (Reunião Técnica de Levantamento Pollen Parque)

---

## 1. Sumário Executivo e Contexto do Projeto

O **Pollen Parque Científico e Tecnológico** operava historicamente sua gestão de afiliados de forma fragmentada, apoiando-se em:
1. **Três planilhas do Google Drive:** Cadastro geral de empresas, controle contábil com preenchimento de cores (parte laranja preenchida pela contabilidade) e inventário de espaços físicos.
2. **Minutas contratuais em Word/PDF com campos manuais marcados com "X":** Risco elevado de erros materiais, divergência de cláusulas e retrabalho manual constante.
3. **Fluxos descentralizados:** Contato inicial no WhatsApp, envio de certidões por e-mail paralelo (caixa `NITO1`) e falta de rastreabilidade no trâmite de 5 assinaturas na Procuradoria Jurídica.

Com a base atual de **22 afiliados ativos**, **23 a 30 em processo de entrada** e projeção de expansão acelerada para **50 a 60 empresas**, a operação manual tornou-se inviável.

O presente ciclo SDLC entregou uma **solução digital integrada de ponta a ponta**, automatizando desde a captação por link de autoatendimento até a baixa contábil e monitoramento de renovação de vigências.

---

## 2. Rastreabilidade do Pipeline SDLC (6 Passos Executados)

```
[Passo 1: Analista de Requisitos]
       ⬇ (api.json com 10 User Stories & Contratos REST)
[Passo 2: Arquiteto de Software]
       ⬇ (schema.sql 3FN, ADR-001, Documentação das Tabelas)
[Passo 3: Desenvolvedor Backend]
       ⬇ (Express ES Modules, Sequelize Models, Controllers, Utils de Minuta)
[Passo 4: Desenvolvedor Frontend]
       ⬇ (Next.js 15 App Router, Tailwind CSS, Telas Corporativas, Axios)
[Passo 5: Engenheiro de QA]
       ⬇ (24 Testes Automatizados 100% aprovados em Node.js puro)
[Passo 6: Tech Lead]
       ⬇ (Memória Técnica, Changelog e Rastreabilidade em docs/historico.md)
```

---

## 3. Changelog de Componentes e APIs Desenvolvidas

### 3.1. Artefatos de Requisitos e Arquitetura
- `backend/docs/api.json`: Contratos detalhados de 10 User Stories, 4 atores do ecossistema e 16 rotas RESTful.
- `backend/schema.sql`: Script DDL PostgreSQL 16 com extensão `uuid-ossp`, triggers PL/pgSQL para `updated_at`, constraints de integridade referencial `ON DELETE CASCADE` e carga inicial de sementes (seeds) representativa do contexto do parque.
- `backend/docs/ADR-001-arquitetura.md`: Registro formal de decisões estruturais (adoção do PostgreSQL, UUIDv4, normalização 3FN e tratamento de empresas internacionais).
- `backend/docs/tabela_*.md`: Guias de modelagem e regras de negócio para as 8 tabelas centrais do sistema.

### 3.2. Backend Node.js / Express (ES Modules)
- `backend/src/server.js`: Servidor Express com suporte a CORS, parser JSON, tratamento global de erros e inicialização resiliente.
- `backend/src/config/database.js`: Conexão Sequelize resiliente (PostgreSQL prioritário com fallback transparente para SQLite).
- `backend/src/models/`:
  - `Empresa.js`: Entidade cadastral mestre com flags de alteração contratual e tipagem.
  - `ContratoMinuta.js`: Histórico de versões dos termos gerados automaticamente.
  - `AssinaturaContrato.js`: Checklist nominal dos 5 signatários com constraint única.
  - `FaturaFinanceira.js`: Controle contábil de NFs, boletos e PIX Copia-e-Cola.
  - `DocumentoAnexo.js`: Guarda e homologação de certidões do edital.
  - `EspacoFisico.js`: Inventário de salas privativas, coworking e laboratórios.
  - `ComunicacaoHistorico.js`: Histórico de envios de e-mails em lote e individuais.
  - `AuditoriaLog.js`: Registro imutável de transações.
- `backend/src/utils/contractGenerator.js`: Motor de mesclagem que compõe o texto jurídico oficial do Pollen Parque sem marcadores "X".
- `backend/src/controllers/`: 8 controladores no padrão assíncrono `{ message, data }`.
- `backend/src/routes/`: Roteamento modular desacoplado agregado em `Routes(app)`.

### 3.3. Frontend Next.js 15 (App Router + Tailwind CSS)
- `frontend/src/app/page.jsx`: Dashboard Executivo com 6 KPIs estratégicos, banner dinâmico de alerta para anuidades com vencimento < 60 dias e listagem recente.
- `frontend/src/app/empresas/page.jsx`: Painel com busca textual, filtros combinados (status e categoria), modais de alteração rápida de status e exclusão com feedback visual.
- `frontend/src/app/empresas/nova/page.jsx`: Formulário corporativo com validação em tempo real e campos condicionais para empresas nacionais (CNPJ) e internacionais (Tax ID).
- `frontend/src/app/empresas/[id]/page.jsx`: Ficha 360° da Afiliada contendo visualizador de minuta em tempo real, checklist interativo dos 5 signatários, upload de certidões e extrato de faturas.
- `frontend/src/app/financeiro/page.jsx`: Módulo contábil que substitui a aba laranja da planilha antiga, com lançamento de NFs, boletos, chaves PIX e modal de baixa manual.
- `frontend/src/app/comunicacao/page.jsx`: Central de disparos de e-mails (em massa por status ou individual) com templates de cobrança, aviso de edital e histórico.
- `frontend/src/app/espacos/page.jsx`: Módulo físico com controle de ocupação de salas privativas, coworking e laboratórios.
- `frontend/src/app/inscricao/page.jsx`: Link público de autoatendimento para empresa preencher diretamente seus dados.
- `frontend/src/components/`: Biblioteca de componentes reutilizáveis (`Navbar`, `Sidebar`, `Modal`, `Badge`, `StatCard`, `LoadingSpinner`, `EmptyState`).

---

## 4. Matriz de Erros Prevenidos (Code Review Cruzado e QA)

| Origem do Risco | Falha Potencial Prevenida | Ação de Mitigação Implementada |
| :--- | :--- | :--- |
| **Negócio / Minutas** | Erros de preenchimento manual nos campos com "X" da minuta padrão. | O módulo `contractGenerator.js` injeta dados reais do banco e valida ausência de placeholders residuais. |
| **Segurança / IDOR** | Enumeração sequencial de propostas ou links de autoatendimento. | Adoção estrita de chaves primárias UUIDv4 em todas as tabelas. |
| **Integração Jurídica** | Liberação prematura de faturamento antes do término das 5 assinaturas. | Bloqueio automático de transição de status: a empresa só avança para `AGUARDANDO_PAGAMENTO` quando os 5 signatários confirmarem. |
| **Contabilidade** | Perda de controle sobre quem confirmou recebimento de pagamentos. | A tabela `faturas_financeiras` armazena obrigatoriamente `operador_baixa`, `data_pagamento` e `forma_pagamento`. |
| **Internacionalização** | Bloqueio de empresas estrangeiras por validação rígida de CNPJ. | Modelagem condicional: empresas internacionais utilizam `identificador_internacional` e o formulário adapta os campos dinamicamente. |
| **Infraestrutura** | Falha de inicialização em ambientes onde o PostgreSQL não está ativo. | O `database.js` possui mecanismo de fallback automático com SQLite em arquivo local. |

---

## 5. Resultados da Suíte de Testes Automatizados (Passo 5)

Execução realizada via `npm test` (`node --test`):

```
> node --test backend/tests/*.test.js frontend/tests/*.test.js

✔ Bateria de Testes QA: Validação dos Contratos de API (Passo 1) (4.65ms)
✔ Bateria de Testes QA: Regras de Negócio e Transições de Estado (3.89ms)
✔ Bateria de Testes QA: Gerador de Minutas Contratuais (12.82ms)
✔ Bateria de Testes QA: Validação do Schema SQL (Passo 2) (3.52ms)
✔ Bateria de Testes QA: Componentes do Frontend (Passo 5) (4.07ms)
✔ Bateria de Testes QA: Validação das Rotas Next.js App Router (Passo 5) (7.24ms)

ℹ tests 24
ℹ suites 6
ℹ pass 24
ℹ fail 0
ℹ duration_ms 66.44ms
```

**Taxa de Aprovação:** 100% (24/24 testes aprovados).

---

## 6. Lições Aprendidas e Próximos Passos de Evolução

1. **Integração com Assinador Gov.br / ICP-Brasil:**
   - Atualmente, o checklist das 5 assinaturas opera com confirmação digital interna no sistema. A evolução futura recomendada é integrar com o serviço de assinatura eletrônica avançada do Gov.br ou Clicksign/DocuSign via API.
2. **Webhooks Bancários para Conciliação Instantânea:**
   - Com o suporte nativo adicionado para payload PIX Copia-e-Cola na tabela `faturas_financeiras`, a integração com o webhook do banco liquidará automaticamente a anuidade sem necessidade de baixa manual contábil.
3. **Módulo de Métricas ESG e Impacto Regional:**
   - Conforme a meta de 60 empresas for atingida, expandir o Dashboard Executivo para incluir indicadores de geração de empregos e faturamento das afiliadas instaladas no parque.

