# Sistema Integrado de Gestão de Afiliados — Pollen Parque Científico e Tecnológico

Solução digital completa para o mapeamento, controle e gestão estratégica de empresas afiliadas do **Pollen Parque**. Substitui integralmente as três antigas planilhas do Google Drive (Cadastro, Financeiro/Contábil e Espaços Físicos), minutas manuais com campos marcados com "X" e comunicações descentralizadas.

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- **Node.js**: v20+ ou v22+
- **PostgreSQL**: Local ou via Docker

---

### 2. Inicialização do Banco de Dados PostgreSQL

#### Opção A: Via Docker (Recomendado e Instantâneo)
O projeto conta com um `docker-compose.yml` pré-configurado que sobe o PostgreSQL 16 e executa automaticamente o script `artefatos/schema.sql`:
```bash
npm run docker:up
```
*(Para parar o container quando desejar: `npm run docker:down`)*

#### Opção B: PostgreSQL Local
Se você já possui o PostgreSQL rodando localmente (porta 5432):
```bash
npm run db:setup
```

---

### 3. Como Rodar o Backend (API Node.js/Express)

Em um terminal:
```bash
# Modo Desenvolvimento com auto-reload
npm run dev:backend

# Ou modo Produção
npm run start:backend
```
- A API estará acessível em: `http://localhost:3001`
- Rotas principais: `http://localhost:3001/api/v1/companies`, `/api/v1/dashboard/metrics`, `/api/v1/financial/invoices`

---

### 4. Como Rodar o Frontend (Next.js 15 / React 19 / Tailwind)

Em outro terminal:
```bash
# Modo Desenvolvimento
npm run dev:frontend

# Ou modo Produção (Build já compilado e otimizado)
npm run start:frontend
```
- Acesse no navegador: `http://localhost:3000`

---

### 5. Executar os Testes Automatizados

Para rodar a suíte completa de testes de validação dos contratos, schema, utilitários e páginas:
```bash
npm test
```

---

## 📁 Estrutura do Projeto

```
orquestrador-ia-crs/
├── docker-compose.yml              # Container PostgreSQL pronto para uso
├── package.json                    # Scripts unificados da raiz
├── scripts/
│   ├── run-all-tests.js            # Runner de testes automatizados
│   └── setup-db.js                 # Script de inicialização do PostgreSQL
├── artefatos/
│   ├── api.json                    # Passo 1: 12 User Stories e Contratos de API
│   ├── schema.sql                  # Passo 2: ADR-001 e Schema PostgreSQL em 3FN
│   ├── historico.md                # Passo 6: Memória técnica, rastreabilidade e changelog
│   ├── backend/                    # Passo 3: Backend Node.js/Express
│   │   ├── src/
│   │   │   ├── config/database.js  # Conexão Sequelize resiliente
│   │   │   ├── controllers/        # Controllers de Empresas, Finanças, Minutas, etc.
│   │   │   ├── models/             # Modelos relacionais com chaves UUID
│   │   │   ├── routes/             # Rotas modulares /api/v1
│   │   │   ├── utils/              # Gerador automático de minuta de contrato
│   │   │   └── server.js           # Servidor Express
│   │   ├── uploads/                # Armazenamento de arquivos e certidões
│   │   └── .env                    # Configuração do backend
│   ├── frontend/                   # Passo 4: Frontend Next.js 15 App Router
│   │   ├── src/app/
│   │   │   ├── page.jsx            # Dashboard Executivo com 6 KPIs e alertas
│   │   │   ├── empresas/page.jsx   # Gestão completa com filtros e modais
│   │   │   ├── empresas/nova/      # Cadastro corporativo com validações
│   │   │   ├── empresas/[id]/      # Ficha 360° (Minuta, 5 assinaturas, certidões)
│   │   │   ├── financeiro/page.jsx # Módulo contábil (NF, boletos, PIX e baixa)
│   │   │   ├── comunicacao/page.jsx# Central de e-mails em lote com templates
│   │   │   ├── espacos/page.jsx    # Inventário e ocupação de salas e coworking
│   │   │   └── inscricao/page.jsx  # Link público de autoatendimento
│   │   ├── src/components/         # Componentes reutilizáveis (Badges, Modais, Cards)
│   │   └── .env                    # Configuração do frontend
│   └── testes/                     # Passo 5: Suíte de testes unitários e de integração
```

---

## 🛡️ Principais Funcionalidades

1. **Geração Automática de Contrato:** Elimina a edição manual de minutas preenchidas com "X". As variáveis da empresa são mescladas automaticamente gerando o termo oficial.
2. **Controle dos 5 Assinantes:** Checklist interativo para confirmação de assinaturas: Representante Legal + 3 Institucionais + Reitor em exercício.
3. **Módulo Financeiro Integrado:** Lançamento de NFs, boletos e PIX com confirmação de pagamento em tempo real, sem avisos manuais.
4. **Alerta de Término de Vigência:** Monitoramento dinâmico de anuidades prestes a vencer em 30 e 60 dias.
5. **Comunicação Centralizada:** Disparos de e-mails individuais ou em massa arquivados com histórico auditável.
6. **Gestão de Espaços Físicos:** Controle de ocupação de salas privativas, coworking e laboratórios.

